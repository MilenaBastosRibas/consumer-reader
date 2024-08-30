import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import * as path from 'path';
import { promises as fs } from 'fs';
import { v4 as uuidv4 } from 'uuid';
import { ErrorResponse } from "src/common/error-response";

@Injectable()
export class ImageService {
  private readonly uploadDir = path.join(__dirname, '../../uploads');

  async saveImage(imageBase64: string): Promise<string> {
    const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, '');
    const buffer = Buffer.from(base64Data, 'base64');
    const fileName = `${uuidv4()}.png`;
    const filePath = path.join(this.uploadDir, fileName);

    try {
      await fs.mkdir(this.uploadDir, { recursive: true });
      await fs.writeFile(filePath, buffer);

			return fileName;
    } catch (exception) {
    	console.error(exception);
      throw new HttpException(
        new ErrorResponse('INTERNAL_ERROR', 'Failed to save image'),
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async deleteImage(imageName: string): Promise<void> {
    const filePath = path.join(this.uploadDir, imageName);
    
    try {
      await fs.unlink(filePath);
    } catch (error) {
      console.error(`Failed to delete image file: ${filePath}`, error);
    }
  }

  getImageUrl(imageName: string): string {
    return `http://localhost:3000/public/uploads/${imageName}`;
  }
}