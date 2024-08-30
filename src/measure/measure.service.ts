import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ErrorResponse } from 'src/common/error-response';
import { ImageService } from 'src/services/image.service';
import { Between, Repository } from 'typeorm';
import { GeminiService } from '../services/gemini.service';
import { MeasureEntity } from './measure.entity';
import { MEASURE_TYPES, UploadRequest } from './measure.interfaces';

@Injectable()
export class MeasureService {  
	constructor(
    @InjectRepository(MeasureEntity)
    private measureRepository: Repository<MeasureEntity>,
		private geminiService: GeminiService,
    private imageService: ImageService,
  ) {}

	private async isMeasureDuplicated(request: UploadRequest): Promise<boolean> {
		const newMeasureDate = new Date(request.measure_datetime);
		const startDate = new Date(newMeasureDate.getFullYear(), newMeasureDate.getMonth(), 1);
		const endDate = new Date(newMeasureDate.getFullYear(), newMeasureDate.getMonth() + 1, 1);
		const existingMeasure = await this.measureRepository.findOne({
      where: {
        customer_code: request.customer_code,
        type: request.measure_type,
        measurement_datetime: Between(startDate, endDate),
      },
    });

		return Boolean(existingMeasure);
	}

	async saveMeasure(body: UploadRequest): Promise<MeasureEntity> {
    const isDuplicate = await this.isMeasureDuplicated(body);

    if (isDuplicate) {
      throw new HttpException(
				new ErrorResponse('DOUBLE_REPORT', 'Leitura do mês já realizada'),
        HttpStatus.CONFLICT,
      );
    }

    let measure: MeasureEntity;
    let imageName: string;

    try {
      imageName = await this.imageService.saveImage(body.image);
      measure = new MeasureEntity();
      measure.image_name = imageName;
      measure.customer_code = body.customer_code;
      measure.measurement_datetime = new Date(body.measure_datetime);
      measure.type = body.measure_type;
      measure.measurement_value = await this.geminiService.getMeasureValueByImage(imageName);

      return await this.measureRepository.save(measure);
    } catch (exception) {
      if (imageName) {
        await this.imageService.deleteImage(measure.image_name);
      }

      if (measure.id) {
        await this.measureRepository.delete(measure.id);
      }

      throw exception;
    }
	}

  async confirmMeasure(measureId: string, value: number): Promise<void> {
    await this.measureRepository.update(
      measureId,
      { measurement_value: value, has_confirmed: true }
    );
  }

  async findMeasureById(id: string): Promise<MeasureEntity> {
    return this.measureRepository.findOneBy({ id })
  }

  async filterMeasures(customerCode: string, measureType?: MEASURE_TYPES): Promise<MeasureEntity[]> {
    const queryBuilder = this.measureRepository.createQueryBuilder('measure')
      .where('measure.customer_code = :customerCode', { customerCode });

    if (measureType) {
      queryBuilder.andWhere('measure.type = :measureType', { measureType });
    }

    return queryBuilder.getMany();
  }
}