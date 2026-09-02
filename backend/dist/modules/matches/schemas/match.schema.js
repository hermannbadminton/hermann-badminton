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
exports.MatchSchema = exports.Match = exports.SetScoreSchema = exports.SetScore = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const tournament_status_enum_1 = require("../../../common/enums/tournament-status.enum");
let SetScore = class SetScore {
};
exports.SetScore = SetScore;
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", Number)
], SetScore.prototype, "setNumber", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 0 }),
    __metadata("design:type", Number)
], SetScore.prototype, "team1Score", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 0 }),
    __metadata("design:type", Number)
], SetScore.prototype, "team2Score", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], SetScore.prototype, "winnerTeamId", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], SetScore.prototype, "videoUrl", void 0);
exports.SetScore = SetScore = __decorate([
    (0, mongoose_1.Schema)({ _id: false })
], SetScore);
exports.SetScoreSchema = mongoose_1.SchemaFactory.createForClass(SetScore);
let Match = class Match {
};
exports.Match = Match;
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], Match.prototype, "tournamentId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 'KNOCKOUT' }),
    __metadata("design:type", String)
], Match.prototype, "stage", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], Match.prototype, "groupName", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", Number)
], Match.prototype, "roundNumber", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", Number)
], Match.prototype, "matchOrder", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], Match.prototype, "roundName", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: null }),
    __metadata("design:type", String)
], Match.prototype, "team1Id", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: null }),
    __metadata("design:type", String)
], Match.prototype, "team2Id", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: null }),
    __metadata("design:type", String)
], Match.prototype, "winnerId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 'Sân 1' }),
    __metadata("design:type", String)
], Match.prototype, "court", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], Match.prototype, "scheduledTime", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], Match.prototype, "videoUrl", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [exports.SetScoreSchema], default: [] }),
    __metadata("design:type", Array)
], Match.prototype, "setScores", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String, enum: tournament_status_enum_1.MatchStatus, default: tournament_status_enum_1.MatchStatus.SCHEDULED }),
    __metadata("design:type", String)
], Match.prototype, "status", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: null }),
    __metadata("design:type", String)
], Match.prototype, "nextMatchId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: null }),
    __metadata("design:type", Number)
], Match.prototype, "nextMatchSlot", void 0);
exports.Match = Match = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } })
], Match);
exports.MatchSchema = mongoose_1.SchemaFactory.createForClass(Match);
//# sourceMappingURL=match.schema.js.map