import { Module } from '@nestjs/common';
import { OcrService } from './ocr.service';
import { OcrController } from './ocr.controller';
import { PlanModule } from '../plan/plan.module';

@Module({ imports: [PlanModule], controllers: [OcrController], providers: [OcrService], exports: [OcrService] })
export class OcrModule {}
