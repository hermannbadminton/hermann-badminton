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
exports.MatchesModule = exports.MatchesController = exports.MatchesService = exports.UpdateMatchScoreDto = exports.SetScoreDto = void 0;
const common_1 = require("@nestjs/common");
const common_2 = require("@nestjs/common");
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const tournament_status_enum_1 = require("../../common/enums/tournament-status.enum");
const supabase_service_1 = require("../supabase/supabase.service");
class SetScoreDto {
}
exports.SetScoreDto = SetScoreDto;
__decorate([
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(5),
    __metadata("design:type", Number)
], SetScoreDto.prototype, "setNumber", void 0);
__decorate([
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.Max)(35),
    __metadata("design:type", Number)
], SetScoreDto.prototype, "team1Score", void 0);
__decorate([
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.Max)(35),
    __metadata("design:type", Number)
], SetScoreDto.prototype, "team2Score", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SetScoreDto.prototype, "videoUrl", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SetScoreDto.prototype, "winnerTeamId", void 0);
class UpdateMatchScoreDto {
}
exports.UpdateMatchScoreDto = UpdateMatchScoreDto;
__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => SetScoreDto),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Array)
], UpdateMatchScoreDto.prototype, "setScores", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateMatchScoreDto.prototype, "winnerId", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateMatchScoreDto.prototype, "status", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateMatchScoreDto.prototype, "scheduledTime", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateMatchScoreDto.prototype, "court", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateMatchScoreDto.prototype, "videoUrl", void 0);
let MatchesService = class MatchesService {
    constructor(supabaseService) {
        this.supabaseService = supabaseService;
        this.inMemoryMatches = new Map();
    }
    determineSetWinner(set, team1Id, team2Id, pointsToWin = 21, maxPointsCap = 30) {
        const { team1Score, team2Score } = set;
        if (team1Score >= maxPointsCap)
            return team1Id;
        if (team2Score >= maxPointsCap)
            return team2Id;
        if (team1Score >= pointsToWin && team1Score - team2Score >= 2)
            return team1Id;
        if (team2Score >= pointsToWin && team2Score - team1Score >= 2)
            return team2Id;
        return null;
    }
    async updateScore(matchId, dto, tournamentRules = { maxSets: 3, pointsToWinSet: 21, maxPointsCap: 30 }) {
        const supabase = this.supabaseService.getClient();
        let match;
        if (supabase) {
            const { data, error } = await supabase.from('matches').select('*').eq('id', matchId).single();
            if (error || !data)
                throw new common_1.NotFoundException(`Trận đấu #${matchId} không tồn tại`);
            match = {
                id: data.id,
                tournamentId: data.tournament_id,
                stage: data.stage,
                groupName: data.group_name,
                roundNumber: data.round_number,
                matchOrder: data.match_order,
                roundName: data.round_name,
                team1Id: data.team1_id,
                team2Id: data.team2_id,
                winnerId: data.winner_id,
                court: data.court,
                scheduledTime: data.scheduled_time,
                setScores: data.set_scores || [],
                status: data.status,
                nextMatchId: data.next_match_id,
                nextMatchSlot: data.next_match_slot,
            };
            try {
                const { data: tourney } = await supabase.from('tournaments').select('*').eq('id', match.tournamentId).single();
                if (tourney) {
                    tournamentRules = {
                        maxSets: Number(tourney.max_sets || tourney.maxSets || 3),
                        pointsToWinSet: Number(tourney.points_to_win_set || tourney.pointsToWinSet || 21),
                        maxPointsCap: Number(tourney.max_points_cap || tourney.maxPointsCap || 30),
                    };
                }
            }
            catch (err) {
            }
        }
        else {
            const found = this.inMemoryMatches.get(matchId);
            if (!found)
                throw new common_1.NotFoundException(`Trận đấu #${matchId} không tồn tại`);
            match = found;
        }
        if (dto.scheduledTime !== undefined) {
            match.scheduledTime = dto.scheduledTime;
        }
        if (dto.court !== undefined) {
            match.court = dto.court;
        }
        if (dto.videoUrl !== undefined) {
            match.videoUrl = dto.videoUrl;
        }
        if (dto.setScores && dto.setScores.length > 0) {
            const setsToWinMatch = Math.ceil(tournamentRules.maxSets / 2);
            let team1WonSets = 0;
            let team2WonSets = 0;
            const validatedSets = [];
            for (const set of dto.setScores) {
                const winnerId = this.determineSetWinner(set, match.team1Id || '', match.team2Id || '', tournamentRules.pointsToWinSet, tournamentRules.maxPointsCap);
                if (winnerId === match.team1Id)
                    team1WonSets++;
                if (winnerId === match.team2Id)
                    team2WonSets++;
                validatedSets.push({
                    setNumber: set.setNumber,
                    team1Score: Number(set.team1Score) || 0,
                    team2Score: Number(set.team2Score) || 0,
                    winnerTeamId: winnerId || undefined,
                    videoUrl: set.videoUrl ? String(set.videoUrl).trim() : '',
                });
            }
            match.setScores = validatedSets;
            const calculatedWinnerId = team1WonSets > team2WonSets
                ? match.team1Id
                : team2WonSets > team1WonSets
                    ? match.team2Id
                    : null;
            const effectiveWinnerId = dto.winnerId && String(dto.winnerId).trim() !== ''
                ? String(dto.winnerId).trim()
                : calculatedWinnerId;
            const isCompleted = Boolean(effectiveWinnerId) ||
                team1WonSets >= setsToWinMatch ||
                team2WonSets >= setsToWinMatch ||
                (dto.setScores.length === 1 && (team1WonSets === 1 || team2WonSets === 1));
            if (isCompleted && effectiveWinnerId) {
                match.winnerId = effectiveWinnerId;
                match.status = dto.status || tournament_status_enum_1.MatchStatus.COMPLETED;
                if (match.nextMatchId) {
                    if (supabase) {
                        try {
                            const { data: nextMatch, error: nextErr } = await supabase
                                .from('matches')
                                .select('*')
                                .eq('id', match.nextMatchId)
                                .single();
                            if (!nextErr && nextMatch) {
                                const slot = Number(match.nextMatchSlot);
                                let updateSlot = {};
                                if (slot === 1) {
                                    updateSlot = { team1_id: effectiveWinnerId };
                                }
                                else if (slot === 2) {
                                    updateSlot = { team2_id: effectiveWinnerId };
                                }
                                else {
                                    if (!nextMatch.team1_id) {
                                        updateSlot = { team1_id: effectiveWinnerId };
                                    }
                                    else if (!nextMatch.team2_id) {
                                        updateSlot = { team2_id: effectiveWinnerId };
                                    }
                                    else {
                                        updateSlot = { team1_id: effectiveWinnerId };
                                    }
                                }
                                await supabase
                                    .from('matches')
                                    .update(updateSlot)
                                    .eq('id', match.nextMatchId);
                                console.log(`✅ Đã cập nhật đội thắng ${effectiveWinnerId} vào trận kế tiếp ${match.nextMatchId} (Slot ${slot || 1})`);
                            }
                        }
                        catch (nextMatchUpdateError) {
                            console.warn('Lỗi cập nhật trận đấu tiếp theo:', nextMatchUpdateError.message);
                        }
                    }
                    else {
                        const nextMatch = this.inMemoryMatches.get(match.nextMatchId);
                        if (nextMatch) {
                            const slot = Number(match.nextMatchSlot);
                            if (slot === 1) {
                                nextMatch.team1Id = effectiveWinnerId;
                            }
                            else if (slot === 2) {
                                nextMatch.team2Id = effectiveWinnerId;
                            }
                            else {
                                if (!nextMatch.team1Id)
                                    nextMatch.team1Id = effectiveWinnerId;
                                else
                                    nextMatch.team2Id = effectiveWinnerId;
                            }
                            this.inMemoryMatches.set(nextMatch.id, nextMatch);
                        }
                    }
                }
            }
            else {
                match.status = validatedSets.some((s) => s.team1Score > 0 || s.team2Score > 0)
                    ? tournament_status_enum_1.MatchStatus.IN_PROGRESS
                    : (dto.status || match.status || tournament_status_enum_1.MatchStatus.SCHEDULED);
                if (!dto.winnerId) {
                    match.winnerId = null;
                }
            }
        }
        if (supabase) {
            const updateData = {
                set_scores: match.setScores,
                status: match.status,
                winner_id: match.winnerId,
            };
            if (match.scheduledTime !== undefined) {
                updateData.scheduled_time = match.scheduledTime;
            }
            if (match.court !== undefined) {
                updateData.court = match.court;
            }
            const { data, error } = await supabase
                .from('matches')
                .update(updateData)
                .eq('id', matchId)
                .select()
                .single();
            if (error)
                throw new Error(error.message);
            return { message: 'Cập nhật tỷ số thành công', match: data };
        }
        this.inMemoryMatches.set(match.id, match);
        return { message: 'Cập nhật tỷ số thành công', match };
    }
    async getBracketTree(tournamentId) {
        const supabase = this.supabaseService.getClient();
        let allMatches = [];
        if (supabase) {
            const { data, error } = await supabase
                .from('matches')
                .select('*')
                .eq('tournament_id', tournamentId)
                .neq('stage', 'GROUP')
                .order('round_number', { ascending: true })
                .order('match_order', { ascending: true });
            if (error)
                throw new Error(error.message);
            allMatches = (data || []).map((d) => ({
                id: d.id,
                tournamentId: d.tournament_id,
                stage: d.stage,
                groupName: d.group_name,
                roundNumber: d.round_number,
                matchOrder: d.match_order,
                roundName: d.round_name,
                team1Id: d.team1_id,
                team2Id: d.team2_id,
                winnerId: d.winner_id,
                court: d.court,
                scheduledTime: d.scheduled_time,
                setScores: d.set_scores || [],
                status: d.status,
                nextMatchId: d.next_match_id,
                nextMatchSlot: d.next_match_slot,
            }));
        }
        else {
            allMatches = Array.from(this.inMemoryMatches.values()).filter((m) => m.tournamentId === tournamentId && m.stage !== 'GROUP');
        }
        const rounds = {};
        allMatches.forEach((m) => {
            if (!rounds[m.roundNumber])
                rounds[m.roundNumber] = [];
            rounds[m.roundNumber].push(m);
        });
        return { tournamentId, rounds };
    }
    async findAll() {
        const supabase = this.supabaseService.getClient();
        if (supabase) {
            try {
                const { data, error } = await supabase
                    .from('matches')
                    .select('*')
                    .order('round_number', { ascending: true })
                    .order('match_order', { ascending: true });
                if (!error && data) {
                    return data.map((d) => ({
                        id: d.id,
                        tournamentId: d.tournament_id,
                        stage: d.stage,
                        groupName: d.group_name,
                        roundNumber: d.round_number,
                        matchOrder: d.match_order,
                        roundName: d.round_name,
                        team1Id: d.team1_id,
                        team2Id: d.team2_id,
                        winnerId: d.winner_id,
                        court: d.court,
                        scheduledTime: d.scheduled_time,
                        setScores: d.set_scores || [],
                        status: d.status,
                        nextMatchId: d.next_match_id,
                        nextMatchSlot: d.next_match_slot,
                    }));
                }
            }
            catch (err) {
                console.warn('Supabase findAll matches error:', err.message);
            }
        }
        return Array.from(this.inMemoryMatches.values());
    }
    async saveBatch(tournamentId, stage, matchesList) {
        const supabase = this.supabaseService.getClient();
        let tournamentMaxSets = 1;
        if (supabase) {
            try {
                const { data: tourney } = await supabase.from('tournaments').select('*').eq('id', tournamentId).single();
                if (tourney) {
                    tournamentMaxSets = Number(tourney.max_sets || tourney.maxSets || 1);
                }
            }
            catch (err) {
            }
        }
        const isUUID = (str) => typeof str === 'string' &&
            /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);
        const defaultSets = [];
        for (let i = 1; i <= Math.max(1, tournamentMaxSets); i++) {
            defaultSets.push({ setNumber: i, team1Score: 0, team2Score: 0 });
        }
        const formattedRowsForSupabase = matchesList.map((m) => {
            let setScores = m.setScores || m.set_scores;
            if (!Array.isArray(setScores) || setScores.length === 0) {
                setScores = defaultSets;
            }
            const row = {
                tournament_id: String(tournamentId),
                stage: m.stage || stage || 'KNOCKOUT',
                group_name: m.groupName || null,
                round_number: Number(m.roundNumber) || 1,
                match_order: Number(m.matchOrder) || 1,
                round_name: m.roundName || null,
                team1_id: m.team1Id && String(m.team1Id).trim() !== '' ? String(m.team1Id) : null,
                team2_id: m.team2Id && String(m.team2Id).trim() !== '' ? String(m.team2Id) : null,
                winner_id: m.winnerId && String(m.winnerId).trim() !== '' ? String(m.winnerId) : null,
                court: m.court || 'Sân 1',
                scheduled_time: m.scheduledTime || null,
                set_scores: setScores,
                status: m.status || tournament_status_enum_1.MatchStatus.SCHEDULED,
                next_match_slot: m.nextMatchSlot ? Number(m.nextMatchSlot) : null,
            };
            if (m.id && isUUID(m.id)) {
                row.id = m.id;
            }
            if (m.nextMatchId && isUUID(m.nextMatchId)) {
                row.next_match_id = m.nextMatchId;
            }
            return row;
        });
        if (supabase) {
            try {
                const { error: delErr } = await supabase
                    .from('matches')
                    .delete()
                    .eq('tournament_id', String(tournamentId))
                    .eq('stage', stage);
                if (delErr) {
                    console.warn('Supabase delete old matches warning:', delErr.message);
                }
                const { data, error } = await supabase
                    .from('matches')
                    .insert(formattedRowsForSupabase)
                    .select();
                if (error) {
                    console.error('❌ Supabase insert matches error:', error.message);
                }
                else if (data && data.length > 0) {
                    console.log(`✅ Đã lưu thành công ${data.length} trận đấu (${stage}) vào Supabase DB`);
                    return data.map((d) => ({
                        id: String(d.id),
                        tournamentId: String(d.tournament_id),
                        stage: d.stage,
                        groupName: d.group_name,
                        roundNumber: d.round_number,
                        matchOrder: d.match_order,
                        roundName: d.round_name,
                        team1Id: d.team1_id,
                        team2Id: d.team2_id,
                        winnerId: d.winner_id,
                        court: d.court,
                        scheduledTime: d.scheduled_time,
                        setScores: d.set_scores || [],
                        status: d.status,
                        nextMatchId: d.next_match_id,
                        nextMatchSlot: d.next_match_slot,
                    }));
                }
            }
            catch (err) {
                console.error('❌ Supabase saveBatch exception:', err.message);
            }
        }
        const updated = Array.from(this.inMemoryMatches.values()).filter((m) => String(m.tournamentId) !== String(tournamentId) || m.stage !== stage);
        matchesList.forEach((m, idx) => {
            const id = m.id || `m-${Date.now()}-${idx + 1}`;
            updated.push({
                id,
                tournamentId: String(tournamentId),
                stage: m.stage || stage || 'KNOCKOUT',
                groupName: m.groupName || null,
                roundNumber: Number(m.roundNumber) || 1,
                matchOrder: Number(m.matchOrder) || 1,
                roundName: m.roundName || null,
                team1Id: m.team1Id || null,
                team2Id: m.team2Id || null,
                winnerId: m.winnerId || null,
                court: m.court || 'Sân 1',
                scheduledTime: m.scheduledTime || null,
                setScores: m.setScores || [],
                status: m.status || tournament_status_enum_1.MatchStatus.SCHEDULED,
                nextMatchId: m.nextMatchId || null,
                nextMatchSlot: m.nextMatchSlot || null,
            });
        });
        this.inMemoryMatches = new Map(updated.map((m) => [m.id, m]));
        return updated.filter((m) => String(m.tournamentId) === String(tournamentId) && m.stage === stage);
    }
    async findByTournament(tournamentId) {
        const supabase = this.supabaseService.getClient();
        if (supabase) {
            const { data, error } = await supabase
                .from('matches')
                .select('*')
                .eq('tournament_id', tournamentId)
                .order('round_number', { ascending: true })
                .order('match_order', { ascending: true });
            if (error)
                throw new Error(error.message);
            return (data || []).map((d) => ({
                id: d.id,
                tournamentId: d.tournament_id,
                stage: d.stage,
                groupName: d.group_name,
                roundNumber: d.round_number,
                matchOrder: d.match_order,
                roundName: d.round_name,
                team1Id: d.team1_id,
                team2Id: d.team2_id,
                winnerId: d.winner_id,
                court: d.court,
                scheduledTime: d.scheduled_time,
                setScores: d.set_scores || [],
                status: d.status,
                nextMatchId: d.next_match_id,
                nextMatchSlot: d.next_match_slot,
            }));
        }
        return Array.from(this.inMemoryMatches.values()).filter((m) => m.tournamentId === tournamentId);
    }
};
exports.MatchesService = MatchesService;
exports.MatchesService = MatchesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [supabase_service_1.SupabaseService])
], MatchesService);
let MatchesController = class MatchesController {
    constructor(matchesService) {
        this.matchesService = matchesService;
    }
    async findAll() {
        return this.matchesService.findAll();
    }
    async saveBatch(body) {
        return this.matchesService.saveBatch(body.tournamentId, body.stage, body.matches);
    }
    async getMatchesByTournament(tournamentId) {
        return this.matchesService.findByTournament(tournamentId);
    }
    async getBracket(tournamentId) {
        return this.matchesService.getBracketTree(tournamentId);
    }
    async updateScore(id, updateScoreDto) {
        return this.matchesService.updateScore(id, updateScoreDto);
    }
};
exports.MatchesController = MatchesController;
__decorate([
    (0, common_2.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], MatchesController.prototype, "findAll", null);
__decorate([
    (0, common_2.Post)('batch'),
    __param(0, (0, common_2.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], MatchesController.prototype, "saveBatch", null);
__decorate([
    (0, common_2.Get)('tournament/:tournamentId'),
    __param(0, (0, common_2.Param)('tournamentId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], MatchesController.prototype, "getMatchesByTournament", null);
__decorate([
    (0, common_2.Get)('tournament/:tournamentId/bracket'),
    __param(0, (0, common_2.Param)('tournamentId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], MatchesController.prototype, "getBracket", null);
__decorate([
    (0, common_2.Patch)(':id/score'),
    __param(0, (0, common_2.Param)('id')),
    __param(1, (0, common_2.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, UpdateMatchScoreDto]),
    __metadata("design:returntype", Promise)
], MatchesController.prototype, "updateScore", null);
exports.MatchesController = MatchesController = __decorate([
    (0, common_2.Controller)('matches'),
    __metadata("design:paramtypes", [MatchesService])
], MatchesController);
let MatchesModule = class MatchesModule {
};
exports.MatchesModule = MatchesModule;
exports.MatchesModule = MatchesModule = __decorate([
    (0, common_1.Module)({
        controllers: [MatchesController],
        providers: [MatchesService],
        exports: [MatchesService],
    })
], MatchesModule);
//# sourceMappingURL=matches.module.js.map