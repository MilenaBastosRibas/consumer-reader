export class ErrorResponse {
	error_code: string;
	error_description: string;

	constructor(error_code: string, error_description: string) {
		this.error_code = error_code;
		this.error_description = error_description;
	}
}