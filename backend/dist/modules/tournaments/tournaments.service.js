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
var TournamentsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.TournamentsService = void 0;
const common_1 = require("@nestjs/common");
const supabase_service_1 = require("../supabase/supabase.service");
const tournament_status_enum_1 = require("../../common/enums/tournament-status.enum");
let TournamentsService = TournamentsService_1 = class TournamentsService {
    constructor(supabaseService) {
        this.supabaseService = supabaseService;
        this.logger = new common_1.Logger(TournamentsService_1.name);
        this.inMemoryTournaments = new Map();
    }
    mapFromDb(dbItem) {
        return {
            id: dbItem.id,
            name: dbItem.name,
            category: dbItem.category,
            format: dbItem.format,
            groupCount: dbItem.group_count,
            advancingPerGroup: dbItem.advancing_per_group,
            startDate: dbItem.start_date,
            endDate: dbItem.end_date,
            location: dbItem.location,
            prizePool: dbItem.prize_pool,
            rulesDescription: dbItem.rules_description,
            maxSets: dbItem.max_sets,
            pointsToWinSet: dbItem.points_to_win_set,
            maxPointsCap: dbItem.max_points_cap,
            banner: dbItem.banner,
            status: dbItem.status,
            createdAt: dbItem.created_at,
        };
    }
    async create(dto) {
        const supabase = this.supabaseService.getClient();
        const dataToSave = {
            name: dto.name,
            category: dto.category || 'Đơn Nam',
            format: dto.format || 'GROUP_KNOCKOUT',
            group_count: dto.groupCount !== undefined && dto.groupCount !== null ? Number(dto.groupCount) : 2,
            advancing_per_group: dto.advancingPerGroup !== undefined && dto.advancingPerGroup !== null ? Number(dto.advancingPerGroup) : 2,
            start_date: dto.startDate,
            end_date: dto.endDate,
            location: dto.location,
            prize_pool: dto.prizePool || '20.000.000 VNĐ',
            rules_description: dto.rulesDescription || 'Áp dụng luật cầu lông BWF tiêu chuẩn.',
            max_sets: dto.maxSets || 3,
            points_to_win_set: dto.pointsToWinSet || 21,
            max_points_cap: dto.maxPointsCap || 30,
            banner: dto.banner || null,
            status: dto.status || tournament_status_enum_1.TournamentStatus.UPCOMING,
        };
        if (supabase) {
            try {
                const { data, error } = await supabase
                    .from('tournaments')
                    .insert(dataToSave)
                    .select()
                    .single();
                if (error) {
                    this.logger.warn(`⚠️ Supabase error (${error.message}). Sử dụng fallback lưu tạm.`);
                }
                else if (data) {
                    return this.mapFromDb(data);
                }
            }
            catch (err) {
                this.logger.warn(`⚠️ Supabase connection issue: ${err.message}`);
            }
        }
        const id = `t-${Date.now()}`;
        const newTournament = {
            id,
            name: dto.name,
            category: dto.category || 'Đơn Nam',
            format: dto.format || 'GROUP_KNOCKOUT',
            groupCount: dto.groupCount !== undefined && dto.groupCount !== null ? Number(dto.groupCount) : 2,
            advancingPerGroup: dto.advancingPerGroup !== undefined && dto.advancingPerGroup !== null ? Number(dto.advancingPerGroup) : 2,
            startDate: dto.startDate,
            endDate: dto.endDate,
            location: dto.location,
            prizePool: dto.prizePool || '20.000.000 VNĐ',
            rulesDescription: dto.rulesDescription || 'Áp dụng luật cầu lông BWF tiêu chuẩn.',
            maxSets: dto.maxSets || 3,
            pointsToWinSet: dto.pointsToWinSet || 21,
            maxPointsCap: dto.maxPointsCap || 30,
            banner: dto.banner,
            status: dto.status || tournament_status_enum_1.TournamentStatus.UPCOMING,
            createdAt: new Date(),
        };
        this.inMemoryTournaments.set(id, newTournament);
        return newTournament;
    }
    async findAll(status) {
        const supabase = this.supabaseService.getClient();
        if (supabase) {
            try {
                let query = supabase.from('tournaments').select('*').order('created_at', { ascending: false });
                if (status) {
                    query = query.eq('status', status);
                }
                const { data, error } = await query;
                if (!error && data) {
                    return data.map((item) => this.mapFromDb(item));
                }
            }
            catch (err) {
                this.logger.warn(`Supabase findAll error: ${err.message}`);
            }
        }
        const list = Array.from(this.inMemoryTournaments.values());
        if (status) {
            return list.filter((t) => t.status === status);
        }
        return list;
    }
    async findOne(id) {
        const supabase = this.supabaseService.getClient();
        if (supabase) {
            try {
                const { data, error } = await supabase.from('tournaments').select('*').eq('id', id).single();
                if (!error && data)
                    return this.mapFromDb(data);
            }
            catch (err) {
                this.logger.warn(`Supabase findOne error: ${err.message}`);
            }
        }
        const item = this.inMemoryTournaments.get(id);
        if (!item)
            throw new common_1.NotFoundException(`Giải đấu #${id} không tồn tại`);
        return item;
    }
    async update(id, dto) {
        const supabase = this.supabaseService.getClient();
        const dbPayload = {};
        if (dto.name !== undefined)
            dbPayload.name = dto.name;
        if (dto.category !== undefined)
            dbPayload.category = dto.category;
        if (dto.format !== undefined)
            dbPayload.format = dto.format;
        if (dto.groupCount !== undefined)
            dbPayload.group_count = dto.groupCount !== null ? Number(dto.groupCount) : null;
        if (dto.advancingPerGroup !== undefined)
            dbPayload.advancing_per_group = dto.advancingPerGroup !== null ? Number(dto.advancingPerGroup) : null;
        if (dto.startDate !== undefined)
            dbPayload.start_date = dto.startDate;
        if (dto.endDate !== undefined)
            dbPayload.end_date = dto.endDate;
        if (dto.location !== undefined)
            dbPayload.location = dto.location;
        if (dto.prizePool !== undefined)
            dbPayload.prize_pool = dto.prizePool;
        if (dto.rulesDescription !== undefined)
            dbPayload.rules_description = dto.rulesDescription;
        if (dto.maxSets !== undefined)
            dbPayload.max_sets = dto.maxSets;
        if (dto.pointsToWinSet !== undefined)
            dbPayload.points_to_win_set = dto.pointsToWinSet;
        if (dto.maxPointsCap !== undefined)
            dbPayload.max_points_cap = dto.maxPointsCap;
        if (dto.banner !== undefined)
            dbPayload.banner = dto.banner;
        if (dto.status !== undefined)
            dbPayload.status = dto.status;
        if (supabase) {
            try {
                const { data, error } = await supabase
                    .from('tournaments')
                    .update(dbPayload)
                    .eq('id', id)
                    .select()
                    .single();
                if (!error && data)
                    return this.mapFromDb(data);
            }
            catch (err) {
                this.logger.warn(`Supabase update error: ${err.message}`);
            }
        }
        const tournament = await this.findOne(id);
        const updated = { ...tournament, ...dto };
        this.inMemoryTournaments.set(id, updated);
        return updated;
    }
    async remove(id) {
        const supabase = this.supabaseService.getClient();
        if (supabase) {
            try {
                const { error } = await supabase.from('tournaments').delete().eq('id', id);
                if (!error)
                    return { success: true };
            }
            catch (err) {
                this.logger.warn(`Supabase remove error: ${err.message}`);
            }
        }
        await this.findOne(id);
        this.inMemoryTournaments.delete(id);
        return { success: true };
    }
};
exports.TournamentsService = TournamentsService;
exports.TournamentsService = TournamentsService = TournamentsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [supabase_service_1.SupabaseService])
], TournamentsService);
//# sourceMappingURL=tournaments.service.js.map