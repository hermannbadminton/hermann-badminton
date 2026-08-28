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
exports.TeamsModule = exports.TeamsController = exports.TeamsService = exports.UpdateTeamDto = exports.CreateTeamDto = void 0;
const common_1 = require("@nestjs/common");
const common_2 = require("@nestjs/common");
const class_validator_1 = require("class-validator");
const supabase_service_1 = require("../supabase/supabase.service");
class CreateTeamDto {
}
exports.CreateTeamDto = CreateTeamDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateTeamDto.prototype, "tournamentId", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)({ message: 'Tên đội/VĐV không được để trống' }),
    __metadata("design:type", String)
], CreateTeamDto.prototype, "name", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateTeamDto.prototype, "groupName", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], CreateTeamDto.prototype, "seed", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateTeamDto.prototype, "avatar", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], CreateTeamDto.prototype, "isQualifiedKnockout", void 0);
class UpdateTeamDto {
}
exports.UpdateTeamDto = UpdateTeamDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateTeamDto.prototype, "name", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateTeamDto.prototype, "groupName", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], UpdateTeamDto.prototype, "seed", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateTeamDto.prototype, "avatar", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], UpdateTeamDto.prototype, "isQualifiedKnockout", void 0);
let TeamsService = class TeamsService {
    constructor(supabaseService) {
        this.supabaseService = supabaseService;
        this.inMemoryTeams = new Map();
    }
    async create(dto) {
        const supabase = this.supabaseService.getClient();
        const dataToSave = {
            tournament_id: dto.tournamentId,
            name: dto.name,
            group_name: dto.groupName || 'Bảng A',
            seed: dto.seed ? Number(dto.seed) : null,
            avatar: dto.avatar || '🏸',
            is_qualified_knockout: dto.isQualifiedKnockout || false,
        };
        if (supabase) {
            try {
                const { data, error } = await supabase
                    .from('teams')
                    .insert(dataToSave)
                    .select()
                    .single();
                if (!error && data) {
                    return {
                        id: data.id,
                        tournamentId: data.tournament_id,
                        name: data.name,
                        groupName: data.group_name,
                        seed: data.seed,
                        avatar: data.avatar,
                        isQualifiedKnockout: data.is_qualified_knockout || false,
                    };
                }
            }
            catch (err) {
                console.warn('Supabase create team error:', err.message);
            }
        }
        const id = `team-${Date.now()}`;
        const newTeam = {
            id,
            tournamentId: dto.tournamentId,
            name: dto.name,
            groupName: dto.groupName || 'Bảng A',
            seed: dto.seed ? Number(dto.seed) : null,
            avatar: dto.avatar || '🏸',
            isQualifiedKnockout: dto.isQualifiedKnockout || false,
        };
        this.inMemoryTeams.set(id, newTeam);
        return newTeam;
    }
    async findAll() {
        const supabase = this.supabaseService.getClient();
        if (supabase) {
            try {
                const { data, error } = await supabase
                    .from('teams')
                    .select('*')
                    .order('created_at', { ascending: true });
                if (!error && data) {
                    return data.map((t) => ({
                        id: t.id,
                        tournamentId: t.tournament_id,
                        name: t.name,
                        groupName: t.group_name,
                        seed: t.seed,
                        avatar: t.avatar,
                        isQualifiedKnockout: t.is_qualified_knockout || false,
                    }));
                }
            }
            catch (err) {
                console.warn('Supabase findAll teams error:', err.message);
            }
        }
        return Array.from(this.inMemoryTeams.values());
    }
    async findByTournament(tournamentId) {
        const supabase = this.supabaseService.getClient();
        if (supabase) {
            try {
                const { data, error } = await supabase
                    .from('teams')
                    .select('*')
                    .eq('tournament_id', tournamentId)
                    .order('created_at', { ascending: true });
                if (!error && data) {
                    return data.map((t) => ({
                        id: t.id,
                        tournamentId: t.tournament_id,
                        name: t.name,
                        groupName: t.group_name,
                        seed: t.seed,
                        avatar: t.avatar,
                        isQualifiedKnockout: t.is_qualified_knockout || false,
                    }));
                }
            }
            catch (err) {
                console.warn('Supabase findByTournament teams error:', err.message);
            }
        }
        return Array.from(this.inMemoryTeams.values()).filter((t) => t.tournamentId === tournamentId);
    }
    async update(id, dto) {
        const supabase = this.supabaseService.getClient();
        if (supabase) {
            try {
                const updateData = {};
                if (dto.name !== undefined)
                    updateData.name = dto.name;
                if (dto.groupName !== undefined)
                    updateData.group_name = dto.groupName;
                if (dto.seed !== undefined)
                    updateData.seed = dto.seed;
                if (dto.avatar !== undefined)
                    updateData.avatar = dto.avatar;
                if (dto.isQualifiedKnockout !== undefined)
                    updateData.is_qualified_knockout = dto.isQualifiedKnockout;
                const { data, error } = await supabase
                    .from('teams')
                    .update(updateData)
                    .eq('id', id)
                    .select()
                    .single();
                if (!error && data) {
                    const updated = {
                        id: data.id,
                        tournamentId: data.tournament_id,
                        name: data.name,
                        groupName: data.group_name,
                        seed: data.seed,
                        avatar: data.avatar,
                        isQualifiedKnockout: data.is_qualified_knockout || false,
                    };
                    this.inMemoryTeams.set(id, updated);
                    return updated;
                }
            }
            catch (err) {
                console.warn('Supabase update team error:', err.message);
            }
        }
        const current = this.inMemoryTeams.get(id);
        const updated = {
            id,
            tournamentId: current?.tournamentId || '',
            name: dto.name ?? current?.name ?? '',
            groupName: dto.groupName ?? current?.groupName,
            seed: dto.seed ?? current?.seed,
            avatar: dto.avatar ?? current?.avatar,
            isQualifiedKnockout: dto.isQualifiedKnockout ?? current?.isQualifiedKnockout ?? false,
        };
        this.inMemoryTeams.set(id, updated);
        return updated;
    }
    async updateKnockoutQualifiers(tournamentId, qualifiedTeamIds) {
        const supabase = this.supabaseService.getClient();
        if (supabase) {
            try {
                const { error: err1 } = await supabase
                    .from('teams')
                    .update({ is_qualified_knockout: false })
                    .eq('tournament_id', String(tournamentId));
                if (err1) {
                    console.warn('Supabase reset qualifiers warning:', err1.message);
                }
                if (qualifiedTeamIds && qualifiedTeamIds.length > 0) {
                    const { error: err2 } = await supabase
                        .from('teams')
                        .update({ is_qualified_knockout: true })
                        .in('id', qualifiedTeamIds);
                    if (err2) {
                        console.warn('Supabase set qualifiers warning:', err2.message);
                    }
                    else {
                        console.log(`✅ Đã cập nhật ${qualifiedTeamIds.length} đội vào nhánh Knockout trong Supabase`);
                    }
                }
            }
            catch (err) {
                console.warn('Supabase updateKnockoutQualifiers error:', err.message);
            }
        }
        for (const [id, team] of this.inMemoryTeams.entries()) {
            if (String(team.tournamentId) === String(tournamentId)) {
                team.isQualifiedKnockout = qualifiedTeamIds.includes(id);
                this.inMemoryTeams.set(id, { ...team });
            }
        }
        return { success: true, qualifiedTeamIds };
    }
    async remove(id) {
        const supabase = this.supabaseService.getClient();
        if (supabase) {
            try {
                const { error } = await supabase.from('teams').delete().eq('id', id);
                if (!error)
                    return { success: true };
            }
            catch (err) {
                console.warn('Supabase remove team error:', err.message);
            }
        }
        this.inMemoryTeams.delete(id);
        return { success: true };
    }
};
exports.TeamsService = TeamsService;
exports.TeamsService = TeamsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [supabase_service_1.SupabaseService])
], TeamsService);
let TeamsController = class TeamsController {
    constructor(teamsService) {
        this.teamsService = teamsService;
    }
    async findAll() {
        return this.teamsService.findAll();
    }
    async create(createTeamDto) {
        return this.teamsService.create(createTeamDto);
    }
    async findByTournament(tournamentId) {
        return this.teamsService.findByTournament(tournamentId);
    }
    async update(id, updateTeamDto) {
        return this.teamsService.update(id, updateTeamDto);
    }
    async updateKnockoutQualifiers(tournamentId, body) {
        return this.teamsService.updateKnockoutQualifiers(tournamentId, body.qualifiedTeamIds || []);
    }
    async remove(id) {
        return this.teamsService.remove(id);
    }
};
exports.TeamsController = TeamsController;
__decorate([
    (0, common_2.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], TeamsController.prototype, "findAll", null);
__decorate([
    (0, common_2.Post)(),
    __param(0, (0, common_2.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [CreateTeamDto]),
    __metadata("design:returntype", Promise)
], TeamsController.prototype, "create", null);
__decorate([
    (0, common_2.Get)('tournament/:tournamentId'),
    __param(0, (0, common_2.Param)('tournamentId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], TeamsController.prototype, "findByTournament", null);
__decorate([
    (0, common_2.Patch)(':id'),
    __param(0, (0, common_2.Param)('id')),
    __param(1, (0, common_2.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, UpdateTeamDto]),
    __metadata("design:returntype", Promise)
], TeamsController.prototype, "update", null);
__decorate([
    (0, common_2.Post)('tournament/:tournamentId/qualify'),
    __param(0, (0, common_2.Param)('tournamentId')),
    __param(1, (0, common_2.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], TeamsController.prototype, "updateKnockoutQualifiers", null);
__decorate([
    (0, common_2.Delete)(':id'),
    __param(0, (0, common_2.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], TeamsController.prototype, "remove", null);
exports.TeamsController = TeamsController = __decorate([
    (0, common_2.Controller)('teams'),
    __metadata("design:paramtypes", [TeamsService])
], TeamsController);
let TeamsModule = class TeamsModule {
};
exports.TeamsModule = TeamsModule;
exports.TeamsModule = TeamsModule = __decorate([
    (0, common_1.Module)({
        controllers: [TeamsController],
        providers: [TeamsService],
        exports: [TeamsService],
    })
], TeamsModule);
//# sourceMappingURL=teams.module.js.map