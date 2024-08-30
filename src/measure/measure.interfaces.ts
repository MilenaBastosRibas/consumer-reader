export enum MEASURE_TYPES {
	WATER = 'WATER',
	GAS = 'GAS',
}

export interface UploadRequest {
	image: string;
	customer_code: string;
	measure_datetime: string;
	measure_type: MEASURE_TYPES;
}

export interface UploadResponse {
	image_url: string;
	measure_value: number;
	measure_uuid: string;
}

export interface ConfirmRequest {
	measure_uuid: string;
	confirmed_value: number;
}

export interface ConfirmResponse {
	success: true;
}

export interface ListResponse {
	customer_code: string;
	measures: {
		measure_uuid: string;
		measure_datetime: string;
		measure_type: string;
		has_confirmed: boolean;
		image_url: string;
	}[];
}