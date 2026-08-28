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
exports.TournamentSchema = exports.Tournament = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const tournament_status_enum_1 = require("../../../common/enums/tournament-status.enum");
let Tournament = class Tournament {
};
exports.Tournament = Tournament;
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], Tournament.prototype, "name", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 'Đơn Nam' }),
    __metadata("design:type", String)
], Tournament.prototype, "category", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 'GROUP_KNOCKOUT' }),
    __metadata("design:type", String)
], Tournament.prototype, "format", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 2 }),
    __metadata("design:type", Number)
], Tournament.prototype, "groupCount", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 2 }),
    __metadata("design:type", Number)
], Tournament.prototype, "advancingPerGroup", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], Tournament.prototype, "startDate", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], Tournament.prototype, "endDate", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], Tournament.prototype, "location", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: '20.000.000 VNĐ' }),
    __metadata("design:type", String)
], Tournament.prototype, "prizePool", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 'Áp dụng luật cầu lông BWF tiêu chuẩn.' }),
    __metadata("design:type", String)
], Tournament.prototype, "rulesDescription", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 3 }),
    __metadata("design:type", Number)
], Tournament.prototype, "maxSets", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 21 }),
    __metadata("design:type", Number)
], Tournament.prototype, "pointsToWinSet", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 30 }),
    __metadata("design:type", Number)
], Tournament.prototype, "maxPointsCap", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?auto=format&fit=crop&w=1200&q=80' }),
    __metadata("design:type", String)
], Tournament.prototype, "banner", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String, enum: tournament_status_enum_1.TournamentStatus, default: tournament_status_enum_1.TournamentStatus.UPCOMING }),
    __metadata("design:type", String)
], Tournament.prototype, "status", void 0);
exports.Tournament = Tournament = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } })
], Tournament);
exports.TournamentSchema = mongoose_1.SchemaFactory.createForClass(Tournament);
//# sourceMappingURL=tournament.schema.js.map