import { PartialType } from '@nestjs/mapped-types';
import { CreateViewingRecordDto } from './create-viewing-record.dto';

export class UpdateViewingRecordDto extends PartialType(CreateViewingRecordDto) {} 