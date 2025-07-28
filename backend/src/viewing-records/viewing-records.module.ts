import { Module } from '@nestjs/common';
import { ViewingRecordsService } from './viewing-records.service';
import { ViewingRecordsController } from './viewing-records.controller';

@Module({
  providers: [ViewingRecordsService],
  controllers: [ViewingRecordsController],
  exports: [ViewingRecordsService],
})
export class ViewingRecordsModule {} 