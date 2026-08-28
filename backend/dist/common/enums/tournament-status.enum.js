"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MatchStatus = exports.TournamentStatus = void 0;
var TournamentStatus;
(function (TournamentStatus) {
    TournamentStatus["UPCOMING"] = "UPCOMING";
    TournamentStatus["ONGOING"] = "ONGOING";
    TournamentStatus["COMPLETED"] = "COMPLETED";
})(TournamentStatus || (exports.TournamentStatus = TournamentStatus = {}));
var MatchStatus;
(function (MatchStatus) {
    MatchStatus["SCHEDULED"] = "SCHEDULED";
    MatchStatus["IN_PROGRESS"] = "IN_PROGRESS";
    MatchStatus["COMPLETED"] = "COMPLETED";
    MatchStatus["CANCELLED"] = "CANCELLED";
})(MatchStatus || (exports.MatchStatus = MatchStatus = {}));
//# sourceMappingURL=tournament-status.enum.js.map