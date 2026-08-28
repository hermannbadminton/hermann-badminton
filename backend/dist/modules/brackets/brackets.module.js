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
exports.BracketsModule = exports.BracketsController = exports.BracketsService = exports.UpdateBracketDto = exports.CreateBracketDto = void 0;
const common_1 = require("@nestjs/common");
const common_2 = require("@nestjs/common");
const class_validator_1 = require("class-validator");
const supabase_service_1 = require("../supabase/supabase.service");
class CreateBracketDto {
}
exports.CreateBracketDto = CreateBracketDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateBracketDto.prototype, "tournamentId", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateBracketDto.prototype, "name", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], CreateBracketDto.prototype, "bracketSize", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], CreateBracketDto.prototype, "totalRounds", void 0);
__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Array)
], CreateBracketDto.prototype, "roundsConfig", void 0);
__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Array)
], CreateBracketDto.prototype, "initialPairs", void 0);
__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Array)
], CreateBracketDto.prototype, "matches", void 0);
__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Array)
], CreateBracketDto.prototype, "matchesData", void 0);
__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Array)
], CreateBracketDto.prototype, "historyLog", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateBracketDto.prototype, "status", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateBracketDto.prototype, "championTeamId", void 0);
__decorate([
    (0, class_validator_1.IsBoolean)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], CreateBracketDto.prototype, "isActive", void 0);
class UpdateBracketDto {
}
exports.UpdateBracketDto = UpdateBracketDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateBracketDto.prototype, "name", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], UpdateBracketDto.prototype, "bracketSize", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], UpdateBracketDto.prototype, "totalRounds", void 0);
__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Array)
], UpdateBracketDto.prototype, "roundsConfig", void 0);
__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Array)
], UpdateBracketDto.prototype, "initialPairs", void 0);
__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Array)
], UpdateBracketDto.prototype, "matches", void 0);
__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Array)
], UpdateBracketDto.prototype, "matchesData", void 0);
__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Array)
], UpdateBracketDto.prototype, "historyLog", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateBracketDto.prototype, "status", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateBracketDto.prototype, "championTeamId", void 0);
__decorate([
    (0, class_validator_1.IsBoolean)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], UpdateBracketDto.prototype, "isActive", void 0);
let BracketsService = class BracketsService {
    constructor(supabaseService) {
        this.supabaseService = supabaseService;
        this.inMemoryBrackets = new Map();
    }
    mapFromDb(d) {
        return {
            id: String(d.id),
            tournamentId: String(d.tournament_id),
            name: d.name || 'Sơ Đồ Nhánh Đấu Knockout',
            bracketSize: Number(d.bracket_size) || 8,
            totalRounds: Number(d.total_rounds) || 3,
            roundsConfig: d.rounds_config || [],
            initialPairs: d.initial_pairs || [],
            matches: d.matches_data || d.matches || [],
            historyLog: d.history_log || [],
            status: d.status || 'ACTIVE',
            championTeamId: d.champion_team_id || null,
            isActive: d.is_active !== undefined ? d.is_active : true,
            createdAt: d.created_at,
            updatedAt: d.updated_at,
        };
    }
    async findAll() {
        const supabase = this.supabaseService.getClient();
        if (supabase) {
            try {
                const { data, error } = await supabase
                    .from('brackets')
                    .select('*')
                    .order('created_at', { ascending: false });
                if (!error && data) {
                    return data.map((d) => this.mapFromDb(d));
                }
            }
            catch (err) {
                console.warn('Supabase findAll brackets error:', err.message);
            }
        }
        return Array.from(this.inMemoryBrackets.values());
    }
    async saveBracket(dto) {
        const supabase = this.supabaseService.getClient();
        const matchesArray = dto.matches || dto.matchesData || [];
        const dataToSave = {
            tournament_id: String(dto.tournamentId),
            name: dto.name || 'Sơ Đồ Nhánh Đấu Knockout',
            bracket_size: Number(dto.bracketSize) || 8,
            total_rounds: Number(dto.totalRounds) || 3,
            rounds_config: dto.roundsConfig || [],
            initial_pairs: dto.initialPairs || [],
            matches_data: matchesArray,
            history_log: dto.historyLog || [],
            status: dto.status || 'ACTIVE',
            champion_team_id: dto.championTeamId || null,
            is_active: dto.isActive !== undefined ? dto.isActive : true,
            updated_at: new Date().toISOString(),
        };
        if (supabase) {
            try {
                const { data: existing } = await supabase
                    .from('brackets')
                    .select('*')
                    .eq('tournament_id', String(dto.tournamentId))
                    .limit(1);
                if (existing && existing.length > 0) {
                    const bracketId = existing[0].id;
                    const { data, error } = await supabase
                        .from('brackets')
                        .update(dataToSave)
                        .eq('id', bracketId)
                        .select()
                        .single();
                    if (!error && data) {
                        const mapped = this.mapFromDb(data);
                        this.inMemoryBrackets.set(mapped.id, mapped);
                        console.log(`✅ Đã cập nhật sơ đồ nhánh đấu #${bracketId} kèm ${matchesArray.length} trận trong Supabase DB`);
                        return mapped;
                    }
                    else if (error) {
                        console.warn('Supabase update bracket error:', error.message);
                    }
                }
                else {
                    const { data, error } = await supabase
                        .from('brackets')
                        .insert(dataToSave)
                        .select()
                        .single();
                    if (!error && data) {
                        const mapped = this.mapFromDb(data);
                        this.inMemoryBrackets.set(mapped.id, mapped);
                        console.log(`✅ Đã tạo mới sơ đồ nhánh đấu kèm ${matchesArray.length} trận trong Supabase DB`);
                        return mapped;
                    }
                    else if (error) {
                        console.warn('Supabase insert bracket error:', error.message);
                    }
                }
            }
            catch (err) {
                console.warn('Supabase saveBracket exception:', err.message);
            }
        }
        const existing = Array.from(this.inMemoryBrackets.values()).find((b) => String(b.tournamentId) === String(dto.tournamentId));
        const id = existing?.id || `brk-${Date.now()}`;
        const newBracket = {
            id,
            tournamentId: dto.tournamentId,
            name: dto.name || 'Sơ Đồ Nhánh Đấu Knockout',
            bracketSize: Number(dto.bracketSize) || 8,
            totalRounds: Number(dto.totalRounds) || 3,
            roundsConfig: dto.roundsConfig || [],
            initialPairs: dto.initialPairs || [],
            matches: matchesArray,
            historyLog: dto.historyLog || [],
            status: dto.status || 'ACTIVE',
            championTeamId: dto.championTeamId || null,
            isActive: dto.isActive !== undefined ? dto.isActive : true,
            updatedAt: new Date().toISOString(),
        };
        this.inMemoryBrackets.set(id, newBracket);
        return newBracket;
    }
    async findByTournament(tournamentId) {
        const supabase = this.supabaseService.getClient();
        if (supabase) {
            try {
                const { data, error } = await supabase
                    .from('brackets')
                    .select('*')
                    .eq('tournament_id', String(tournamentId))
                    .order('created_at', { ascending: false })
                    .limit(1);
                if (!error && data && data.length > 0) {
                    const mapped = this.mapFromDb(data[0]);
                    this.inMemoryBrackets.set(mapped.id, mapped);
                    return mapped;
                }
            }
            catch (err) {
                console.warn('Supabase findByTournament bracket error:', err.message);
            }
        }
        const found = Array.from(this.inMemoryBrackets.values()).find((b) => String(b.tournamentId) === String(tournamentId));
        return found || null;
    }
    async updateHistory(tournamentId, historyEntry) {
        const bracket = await this.findByTournament(tournamentId);
        if (!bracket) {
            throw new common_1.NotFoundException(`Không tìm thấy sơ đồ nhánh của giải #${tournamentId}`);
        }
        const updatedHistory = [...(bracket.historyLog || []), historyEntry];
        return this.saveBracket({
            ...bracket,
            historyLog: updatedHistory,
        });
    }
    async remove(id) {
        const supabase = this.supabaseService.getClient();
        if (supabase) {
            try {
                await supabase.from('brackets').delete().eq('id', id);
            }
            catch (err) {
                console.warn('Supabase remove bracket error:', err.message);
            }
        }
        this.inMemoryBrackets.delete(id);
        return { success: true };
    }
};
exports.BracketsService = BracketsService;
exports.BracketsService = BracketsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [supabase_service_1.SupabaseService])
], BracketsService);
let BracketsController = class BracketsController {
    constructor(bracketsService) {
        this.bracketsService = bracketsService;
    }
    async findAll() {
        return this.bracketsService.findAll();
    }
    async findByTournament(tournamentId) {
        return this.bracketsService.findByTournament(tournamentId);
    }
    async save(dto) {
        return this.bracketsService.saveBracket(dto);
    }
    async updateHistory(tournamentId, body) {
        return this.bracketsService.updateHistory(tournamentId, body.historyEntry);
    }
    async remove(id) {
        return this.bracketsService.remove(id);
    }
};
exports.BracketsController = BracketsController;
__decorate([
    (0, common_2.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], BracketsController.prototype, "findAll", null);
__decorate([
    (0, common_2.Get)('tournament/:tournamentId'),
    __param(0, (0, common_2.Param)('tournamentId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], BracketsController.prototype, "findByTournament", null);
__decorate([
    (0, common_2.Post)(),
    __param(0, (0, common_2.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [CreateBracketDto]),
    __metadata("design:returntype", Promise)
], BracketsController.prototype, "save", null);
__decorate([
    (0, common_2.Post)('tournament/:tournamentId/history'),
    __param(0, (0, common_2.Param)('tournamentId')),
    __param(1, (0, common_2.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], BracketsController.prototype, "updateHistory", null);
__decorate([
    (0, common_2.Delete)(':id'),
    __param(0, (0, common_2.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], BracketsController.prototype, "remove", null);
exports.BracketsController = BracketsController = __decorate([
    (0, common_2.Controller)('brackets'),
    __metadata("design:paramtypes", [BracketsService])
], BracketsController);
let BracketsModule = class BracketsModule {
};
exports.BracketsModule = BracketsModule;
exports.BracketsModule = BracketsModule = __decorate([
    (0, common_1.Module)({
        controllers: [BracketsController],
        providers: [BracketsService],
        exports: [BracketsService],
    })
], BracketsModule);
//# sourceMappingURL=brackets.module.js.map