import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MeasureController } from './measure.controller';
import { MeasureEntity } from './measure.entity';
import { MeasureService } from './measure.service';
import { GeminiService } from '../services/gemini.service';
import { ImageService } from 'src/services/image.service';

@Module({
  imports: [TypeOrmModule.forFeature([MeasureEntity])],
  controllers: [MeasureController],
  providers: [MeasureService, GeminiService, ImageService],
})
export class MeasureModule {}