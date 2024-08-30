import { Test, TestingModule } from '@nestjs/testing';
import { MeasureController } from './measure.controller';

describe('UploadController', () => {
  let controller: MeasureController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MeasureController],
    }).compile();

    controller = module.get<MeasureController>(MeasureController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});