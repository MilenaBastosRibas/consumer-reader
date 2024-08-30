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
          },
        },
        {
          text: `
            1. Analise a imagem de forma detalhada e identifique o display que mede o consumo de gás e água, estando sempre em cima ou do lado da unidade de medida em metros cúbicos.
            2. Se a imagem não for interpretada como um medidor de consumo, retorne logo o número 0.
            3. Se a imagem for identificada como um medidor de consumo: identifique agora cada casa numérica do medidor para realizar a leitura completa de consumo, levando em consideração que cada medidor possui no máximo 8 casas numéricas.
            4. Separe a parte inteira da leitura que está destacada com fundo preto ou branco.
            5. Separe a parte decimal da leitura que está destacada na cor vermelha.
            6. Leve em consideração o exemplo de medição de gás: para uma leitura "00000040", deve retornar o número "0.040".
            7. Leve em consideração o exemplo de medição de água: para uma leitura "000019" deve retornar o número "0.19".
            Levando em consideração os passos acima, retorne apenas o valor final somando a parte inteira com a parte decimal.
          `
        },
      ]);
      
      await this.geminiFileManager.deleteFile(uploadedImage.file.name)

      let measurement = parseFloat(result.response.text().replace(/[^0-9.]+/g, ''));

      if (isNaN(measurement)) {
        measurement = 0;
      }

      return measurement;
    } catch (exception) {
      console.error(exception);
      throw new HttpException(
        new ErrorResponse('INTERNAL_ERROR', 'Failed to analyze image'),
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}