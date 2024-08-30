import { GoogleGenerativeAI } from '@google/generative-ai';
import { GoogleAIFileManager } from "@google/generative-ai/server";
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ErrorResponse } from 'src/common/error-response';

@Injectable()
export class GeminiService {
  private readonly gemini: GoogleGenerativeAI;
  private readonly geminiFileManager: GoogleAIFileManager;
  private readonly geminiModel: string;
  
  constructor() {
    const apiKey = process.env.GEMINI_API_KEY;
    
    if (!apiKey) {
      throw new HttpException(
        new ErrorResponse('INTERNAL_ERROR', 'GEMINI_API_KEY is not defined in environment variables'),
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
    
    this.gemini = new GoogleGenerativeAI(apiKey);
    this.geminiFileManager = new GoogleAIFileManager(apiKey);
    this.geminiModel = process.env.GEMINI_MODEL || 'gemini-1.5-flash';
  }
  
  async getMeasureValueByImage(imageName: string): Promise<number> {
    try {
      const model = this.gemini.getGenerativeModel({ model: this.geminiModel });
      const uploadedImage = await this.geminiFileManager.uploadFile(
        `uploads/${imageName}`,
        {
          mimeType: 'image/png',
          displayName: `Measurement of gas or water consumption`,
        },
      );
      const result = await model.generateContent([
        {
          fileData: {
            mimeType: uploadedImage.file.mimeType,
            fileUri: uploadedImage.file.uri
          }
        },
        {
          text: `Identify the numbers on the gas and water consumption meter display in the image.
            If it is an analog display, take into account that it may be necessary to carefully
            interpret which number is currently being marked until it scroll to the next number.
            Report the number interpreted as consumption measurement in integer format.
            Use the value 0 if it not seems to be an image measuring this resources.`
        },
      ]);
      await this.geminiFileManager.deleteFile(uploadedImage.file.name)
      return Number(result.response.text().replace(/\D/g, ''));
    } catch (exception) {
      console.error(exception);
      throw new HttpException(
        new ErrorResponse('INTERNAL_ERROR', 'Failed to analyze image'),
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}