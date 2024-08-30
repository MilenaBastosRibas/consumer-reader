import { Body, Controller, Get, HttpCode, HttpException, HttpStatus, Param, Patch, Post, Query } from '@nestjs/common';
import * as Joi from 'joi';
import { validateController } from 'src/common/controller-validator';
import { ErrorResponse } from 'src/common/error-response';
import { ImageService } from 'src/services/image.service';
import { ConfirmRequest, ConfirmResponse, ListResponse, MEASURE_TYPES, UploadRequest, UploadResponse } from './measure.interfaces';
import { MeasureService } from './measure.service';

@Controller()
export class MeasureController {
  constructor(
    private readonly measureService: MeasureService,
    private readonly imageService: ImageService,
  ) {}

  @Post('upload')
	@HttpCode(HttpStatus.OK)
  async handleUpload(@Body() body: UploadRequest): Promise<UploadResponse> {
    const measureTypes = Object.values(MEASURE_TYPES);
    const schema = {
			image: Joi.string().base64().required(),
			customer_code: Joi.string().required(),
			measure_datetime: Joi.date().iso().required(),
			measure_type: Joi.string().valid(...measureTypes).required(),
		};
		
    validateController(body, schema);

    const measure = await this.measureService.saveMeasure(body);

    return {
      image_url: this.imageService.getImageUrl(measure.image_name),
      measure_uuid: measure.id,
      measure_value: measure.measurement_value,
    };
  }

  @Patch('confirm')
	@HttpCode(HttpStatus.OK)
  async handleConfirm(@Body() body: ConfirmRequest): Promise<ConfirmResponse> {
    const schema = {
      measure_uuid: Joi.string().uuid(),
      confirmed_value: Joi.number().integer().required(),
    };

    validateController(body, schema);

    const measure = await this.measureService.findMeasureById(body.measure_uuid);

    if (!measure) {
      throw new HttpException(
        new ErrorResponse('MEASURE_NOT_FOUND', 'Leitura não encontrada'),
        HttpStatus.NOT_FOUND,
      );
    }

    if (measure.has_confirmed) {
      throw new HttpException(
        new ErrorResponse('CONFIRMATION_DUPLICATE', 'Leitura já confirmada'),
        HttpStatus.CONFLICT,
      );
    }

    await this.measureService.confirmMeasure(measure.id, body.confirmed_value);
    return { success: true };
  }

  @Get(':customer_code/list')
	@HttpCode(HttpStatus.OK)
  async handleList(
    @Param('customer_code') customerCode: string,
    @Query('measure_type') measureType?: string
  ): Promise<ListResponse> {
    measureType = measureType?.toUpperCase();

    if (measureType && !(measureType in MEASURE_TYPES)) {
      throw new HttpException(
        new ErrorResponse('INVALID_TYPE', 'Tipo de medição não permitida'),
        HttpStatus.BAD_REQUEST,
      );
    }

    const measures = await this.measureService.filterMeasures(customerCode, MEASURE_TYPES[measureType]);

    if (!measures.length) {
      throw new HttpException(
        new ErrorResponse('MEASURES_NOT_FOUND', 'Nenhuma leitura encontrada'),
        HttpStatus.NOT_FOUND,
      );
    }

    return {
      customer_code: customerCode,
      measures: measures.map(measure => ({
        measure_uuid: measure.id,
        measure_datetime: measure.measurement_datetime.toISOString(),
        measure_type: measure.type,
        has_confirmed: measure.has_confirmed,
        image_url: this.imageService.getImageUrl(measure.image_name),
      })),
    };
  }
}