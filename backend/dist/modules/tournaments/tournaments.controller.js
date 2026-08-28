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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TournamentsController = void 0;
const common_1 = require("@nestjs/common");
const tournaments_service_1 = require("./tournaments.service");
const create_tournament_dto_1 = require("./dto/create-tournament.dto");
const update_tournament_dto_1 = require("./dto/update-tournament.dto");
const tournament_status_enum_1 = require("../../common/enums/tournament-status.enum");
let TournamentsController = class TournamentsController {
    constructor(tournamentsService) {
        this.tournamentsService = tournamentsService;
    }
    async create(createTournamentDto) {
        return this.tournamentsService.create(createTournamentDto);
    }
    async findAll(status) {
        return this.tournamentsService.findAll(status);
    }
    async findOne(id) {
        return this.tournamentsService.findOne(id);
    }
    async patch(id, updateTournamentDto) {
        return this.tournamentsService.update(id, updateTournamentDto);
    }
    async update(id, updateTournamentDto) {
        return this.tournamentsService.update(id, updateTournamentDto);
    }
    async remove(id) {
        return this.tournamentsService.remove(id);
    }
};
exports.TournamentsController = TournamentsController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_tournament_dto_1.CreateTournamentDto]),
    __metadata("design:returntype", Promise)
], TournamentsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)('status')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], TournamentsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], TournamentsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_tournament_dto_1.UpdateTournamentDto]),
    __metadata("design:returntype", Promise)
], TournamentsController.prototype, "patch", null);
__decorate([
    (0, common_1.Put)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_tournament_dto_1.UpdateTournamentDto]),
    __metadata("design:returntype", Promise)
], TournamentsController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], TournamentsController.prototype, "remove", null);
exports.TournamentsController = TournamentsController = __decorate([
    (0, common_1.Controller)('tournaments'),
    __metadata("design:paramtypes", [tournaments_service_1.TournamentsService])
], TournamentsController);
//# sourceMappingURL=tournaments.controller.js.map