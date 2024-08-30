import { HttpException, HttpStatus } from '@nestjs/common';
import * as Joi from 'joi';
import { ErrorResponse } from './error-response';

export function validateController(body: any, schema: Joi.SchemaMap): void {
	const { error } = Joi.object(schema).validate(body);

	if (error) {
		throw new HttpException(
			new ErrorResponse('INVALID_DATA', error.details[0].message),
			HttpStatus.BAD_REQUEST,
		);
	}
}