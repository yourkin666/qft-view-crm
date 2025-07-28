"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateViewingRecordDto = void 0;
const mapped_types_1 = require("@nestjs/mapped-types");
const create_viewing_record_dto_1 = require("./create-viewing-record.dto");
class UpdateViewingRecordDto extends (0, mapped_types_1.PartialType)(create_viewing_record_dto_1.CreateViewingRecordDto) {
}
exports.UpdateViewingRecordDto = UpdateViewingRecordDto;
//# sourceMappingURL=update-viewing-record.dto.js.map