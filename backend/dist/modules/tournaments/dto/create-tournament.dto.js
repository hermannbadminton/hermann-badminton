"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateTournamentDto = void 0;
const class_validator_1 = require("class-validator");
const tournament_status_enum_1 = require("../../../common/enums/tournament-status.enum");
class CreateTournamentDto {
    constructor() {
        this.category = 'Đơn Nam';
        this.format = 'GROUP_KNOCKOUT';
        this.groupCount = 2;
        this.advancingPerGroup = 2;
        this.maxSets = 3;
        this.pointsToWinSet = 21;
        this.maxPointsCap = 30;
        this.status = tournament_status_enum_1.TournamentStatus.UPCOMING;
    }
}
exports.CreateTournamentDto = CreateTournamentDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)({ message: 'Tên giải đấu không được để trống' }),
    __metadata("design:type", String)
], CreateTournamentDto.prototype, "name", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateTournamentDto.prototype, "category", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateTournamentDto.prototype, "format", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], CreateTournamentDto.prototype, "groupCount", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], CreateTournamentDto.prototype, "advancingPerGroup", void 0);
__decorate([
    (0, class_validator_1.IsDateString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateTournamentDto.prototype, "startDate", void 0);
__decorate([
    (0, class_validator_1.IsDateString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateTournamentDto.prototype, "endDate", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateTournamentDto.prototype, "location", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateTournamentDto.prototype, "prizePool", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateTournamentDto.prototype, "rulesDescription", void 0);
__decorate([
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(5),
    __metadata("design:type", Number)
], CreateTournamentDto.prototype, "maxSets", void 0);
__decorate([
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(11),
    (0, class_validator_1.Max)(30),
    __metadata("design:type", Number)
], CreateTournamentDto.prototype, "pointsToWinSet", void 0);
__decorate([
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(21),
    (0, class_validator_1.Max)(35),
    __metadata("design:type", Number)
], CreateTournamentDto.prototype, "maxPointsCap", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateTournamentDto.prototype, "banner", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(tournament_status_enum_1.TournamentStatus),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateTournamentDto.prototype, "status", void 0);
//# sourceMappingURL=create-tournament.dto.js.map