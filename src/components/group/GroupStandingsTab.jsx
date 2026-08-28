import React, { useState } from 'react';
import { useTournament } from '../../context/TournamentContext';
import {
  Trophy,
  Users,
  ShieldCheck,
  Award,
  Sparkles,
  HelpCircle,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Flame,
  Shuffle,
  ChevronRight,
  GitBranch,
} from 'lucide-react';
import AdvanceKnockoutModal from './AdvanceKnockoutModal';

export default function GroupStandingsTab({
  tournament,
  onSelectMatch,
  isAdmin,
  onSwitchToBracket,
  onSwitchToSchedule,
}) {
  const { teams, matches, getGroupStandings } = useTournament();
  const [isAdvanceModalOpen, setIsAdvanceModalOpen] = useState(false);

  const standings = getGroupStandings(tournament.id);
  const groupNames = Object.keys(standings).sort();

  if (groupNames.length === 0) {
    return (
      <div className="bg-white rounded-3xl border border-slate-200/80 p-12 text-center shadow-sm">
        <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
        <h3 className="text-base font-bold text-slate-700">Chưa có dữ liệu bảng đấu</h3>
        <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
          {isAdmin
            ? 'Vui lòng vào tab Quản Trị -> Bốc thăm chia bảng để tạo bảng đấu cho giải.'
            : 'Ban tổ chức đang chuẩn bị bốc thăm chia bảng thi đấu.'}
        </p>
      </div>
    );
  }

  const isSingleGroup = groupNames.length === 1;

  // Danh sách các đội đủ điều kiện vào vòng trong theo quy tắc
  const qualifiedSummary = [];
  groupNames.forEach((gName) => {
    const groupTeams = standings[gName] || [];
    // Nếu giải chỉ có 1 bảng: lấy 4 đội có điểm cao nhất
    // Nếu nhiều bảng: Bảng 4 đội trở lên lấy 2 đội (Nhất + Nhì), bảng < 4 đội lấy 1 đội (Nhất)
    const advancingCount = isSingleGroup
      ? Math.min(4, groupTeams.length)
      : groupTeams.length >= 4
        ? 2
        : 1;

    groupTeams.slice(0, advancingCount).forEach((item) => {
      qualifiedSummary.push({
        groupName: gName,
        team: item.team,
        rank: item.rank,
        points: item.points,
        won: item.won,
        setDiff: item.setDiff,
      });
    });
  });

  return (
    <div className="space-y-6">
      {/* Modal Tiến Vào Knockout cho Admin */}
      <AdvanceKnockoutModal
        tournament={tournament}
        isOpen={isAdvanceModalOpen}
        onClose={() => setIsAdvanceModalOpen(false)}
        onApplied={() => {
          if (onSwitchToBracket) onSwitchToBracket();
        }}
      />

      {/* 2-COLUMN LAYOUT:
          - CỘT TRÁI (col-span-8): Toàn bộ các Bảng đấu hiển thị theo chiều dọc
          - CỘT PHẢI (col-span-4): Quy tắc vào vòng trong & tóm tắt suất đi tiếp
      */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* ===================== CỘT BÊN TRÁI: CÁC BẢNG ĐẤU THEO CHIỀU DỌC ===================== */}
        <div className="lg:col-span-8 space-y-6">
          {groupNames.map((gName) => {
            const groupTeams = standings[gName] || [];
            // Quy tắc: 1 bảng lấy 4 đội; nhiều bảng: >= 4 đội lấy 2 đội (Nhất + Nhì), < 4 đội lấy 1 đội (Nhất)
            const isFourOrMore = groupTeams.length >= 4;
            const advancingCount = isSingleGroup
              ? Math.min(4, groupTeams.length)
              : isFourOrMore
                ? 2
                : 1;

            // Đếm số trận của bảng này
            const thisGroupMatches = matches.filter(
              (m) => m.tournamentId === tournament.id && m.stage === 'GROUP' && m.groupName === gName
            );
            const completedCount = thisGroupMatches.filter((m) => m.status === 'COMPLETED').length;

            return (
              <div
                key={gName}
                className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden transition-all hover:shadow-md"
              >
                {/* Header Bảng */}
                <div className="px-5 py-4 bg-gradient-to-r from-slate-50 via-white to-slate-50 border-b border-slate-200/80 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div>
                      <h3 className="font-black text-base text-slate-900 flex items-center gap-2">
                        {gName}
                      </h3>
                    </div>
                  </div>

                  {/* Badge Quy tắc riêng cho bảng này */}
                  <div className="flex items-center gap-2">
                    {isSingleGroup ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold bg-emerald-50 text-emerald-800 border border-emerald-300/80 shadow-xs">
                        Lấy 4 đội cao điểm nhất (Top 1 - 4)
                      </span>
                    ) : isFourOrMore ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold bg-emerald-50 text-emerald-800 border border-emerald-300/80 shadow-xs">
                        Lấy 2 đội (Nhất + Nhì)
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold bg-sky-50 text-sky-800 border border-sky-300/80 shadow-xs">
                        Lấy 1 đội (Nhất)
                      </span>
                    )}
                  </div>
                </div>

                {/* Bảng Xếp Hạng của Nhóm */}
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="bg-slate-50/70 text-slate-600 font-extrabold uppercase tracking-wider text-[11px] border-b border-slate-200/70">
                        <th className="py-3 px-3 text-center w-12">Hạng</th>
                        <th className="py-3 px-4">Đội</th>
                        <th className="py-3 px-2.5 text-center" title="Số trận đã đấu">
                          Trận
                        </th>
                        <th className="py-3 px-2.5 text-center text-emerald-700" title="Thắng">
                          Thắng
                        </th>
                        <th className="py-3 px-2.5 text-center text-rose-600" title="Thua">
                          Thua
                        </th>
                        <th className="py-3 px-2.5 text-center text-slate-600" title="Hiệu số Set (Thắng - Thua)">
                          HS Set
                        </th>
                        <th className="py-3 px-2.5 text-center text-slate-600" title="Hiệu số Điểm (Ghi - Mất)">
                          HS Điểm
                        </th>
                        <th className="py-3 px-4 text-center font-black text-slate-900 bg-slate-100/50" title="Tổng điểm">
                          Điểm
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium">
                      {groupTeams.map((row) => {
                        const isQualifying = row.rank <= advancingCount;
                        const isFirst = row.rank === 1;
                        const isSecond = row.rank === 2;
                        const isThird = row.rank === 3;
                        const isFourth = row.rank === 4;

                        return (
                          <tr
                            key={row.team.id}
                            className={`transition-colors ${isQualifying
                                ? 'bg-emerald-50/90 hover:bg-emerald-100/70'
                                : 'hover:bg-slate-50/80'
                              }`}
                          >
                            {/* Hạng Rank */}
                            <td className="py-3 px-3 text-center">
                              <span
                                className={`w-6 h-6 rounded-full inline-flex items-center justify-center text-xs font-black mx-auto shadow-xs ${isFirst
                                    ? 'bg-gradient-to-b from-amber-300 to-amber-500 text-slate-950 font-black ring-1 ring-amber-400'
                                    : isSecond && (isSingleGroup || isFourOrMore)
                                      ? 'bg-gradient-to-b from-slate-200 to-slate-400 text-slate-900 font-black ring-1 ring-slate-300'
                                      : isThird && isSingleGroup
                                        ? 'bg-gradient-to-b from-amber-600 to-amber-700 text-white font-black ring-1 ring-amber-600'
                                        : isFourth && isSingleGroup
                                          ? 'bg-gradient-to-b from-emerald-600 to-emerald-700 text-white font-black ring-1 ring-emerald-600'
                                          : isSecond
                                            ? 'bg-slate-200 text-slate-700'
                                            : 'text-slate-400 bg-slate-100'
                                  }`}
                              >
                                {row.rank}
                              </span>
                            </td>

                            {/* Tên Đội */}
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-2">
                                <p
                                  className={`text-sm truncate ${isQualifying ? 'font-black text-emerald-950' : 'font-bold text-slate-900'
                                    }`}
                                >
                                  {row.team.name}
                                </p>
                              </div>
                            </td>

                            {/* Các chỉ số thống kê */}
                            <td className="py-3 px-2.5 text-center font-mono text-slate-700 font-semibold">
                              {row.played}
                            </td>
                            <td className="py-3 px-2.5 text-center font-mono font-bold text-emerald-700">
                              {row.won}
                            </td>
                            <td className="py-3 px-2.5 text-center font-mono text-rose-500">
                              {row.lost}
                            </td>
                            <td className="py-3 px-2.5 text-center font-mono text-slate-600 font-semibold">
                              {row.setDiff > 0 ? `+${row.setDiff}` : row.setDiff}
                            </td>
                            <td className="py-3 px-2.5 text-center font-mono text-slate-600 font-semibold">
                              {row.pointDiff > 0 ? `+${row.pointDiff}` : row.pointDiff}
                            </td>
                            <td className={'py-3 px-4 text-center font-mono font-black text-sm text-slate-950'}>
                              {row.points}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Footer Bảng */}
                <div className="px-5 py-2.5 bg-slate-50/60 border-t border-slate-100 text-[11px] text-slate-500 flex items-center justify-between">
                  <div className="flex items-center text-xs font-semibold gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                    <span>1 Trận Thắng = 1 Điểm</span>
                  </div>
                  {onSwitchToSchedule && (
                    <button
                      onClick={onSwitchToSchedule}
                      className="inline-flex items-center gap-1 text-emerald-700 hover:text-emerald-800 text-xs font-bold hover:underline"
                    >
                      <span>Xem lịch thi đấu</span>
                      <ChevronRight className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* ===================== CỘT BÊN PHẢI: QUY TẮC VÀO VÒNG TRONG ===================== */}
        <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-6">
          {/* Card Quy Tắc Vào Vòng Trong */}
          <div className="bg-gradient-to-b from-white to-slate-50/80 rounded-2xl border-2 border-emerald-500/30 p-5 sm:p-6 shadow-md shadow-emerald-950/5 space-y-5">
            {/* Header Quy Tắc */}
            <div className="flex items-center gap-2.5 pb-4 border-b border-slate-200/80">
              <div className="p-2 rounded-xl bg-emerald-600 text-white shadow-sm shadow-emerald-600/30">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-black text-slate-900">
                  Quy Tắc Vào Vòng Trong
                </h3>
                <p className="text-[12px] text-slate-500 font-medium">
                  Thể thức xếp hạng & Suất đi tiếp Knock-out
                </p>
              </div>
            </div>

            {/* Quy Tắc 1: Suất Đi Tiếp */}
            <div className="space-y-2.5">
              <div className="flex items-start gap-2.5">
                <div className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-800 font-black text-xs flex items-center justify-center shrink-0 mt-0.5 border border-emerald-200">
                  1
                </div>
                <div className="space-y-2 w-full">
                  <h4 className="h-6 text-xs flex items-center font-black uppercase tracking-wide text-slate-900">
                    Suất Vào Vòng Knock-out
                  </h4>
                  <div className="text-xs text-slate-700 leading-relaxed space-y-1.5">
                    {isSingleGroup ? (
                      <div className="p-3 rounded-xl bg-emerald-50/80 border border-emerald-200/80 text-emerald-950 space-y-1">
                        <p className=" flex items-center gap-1.5 text-emerald-900">
                          <CheckCircle2 className="w-4 h-4 font-bold text-emerald-600 shrink-0" />
                          <span>
                            Lấy <strong>4 đội có điểm cao nhất</strong> vào vòng knock-out (Bán Kết).
                          </span>
                        </p>
                      </div>
                    ) : (
                      <>
                        <div className="p-2.5 rounded-xl bg-emerald-50/80 border border-emerald-200/80 text-emerald-950">
                          <p className="font-bold flex items-center gap-1.5 text-emerald-900 mb-0.5">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                            Bảng 4 đội (hoặc nhiều hơn):
                          </p>
                          <p className="text-[12px] pl-5 text-emerald-900">
                            Lấy <strong>Đội Nhất + Đội Nhì</strong> vào vòng knock-out.
                          </p>
                        </div>

                        <div className="p-2.5 rounded-xl bg-sky-50/80 border border-sky-200/80 text-sky-950">
                          <p className="font-bold flex items-center gap-1.5 text-sky-900 mb-0.5">
                            <CheckCircle2 className="w-3.5 h-3.5 text-sky-600 shrink-0" />
                            Bảng 3 đội (hoặc ít hơn):
                          </p>
                          <p className="text-[12px] pl-5 text-sky-900">
                            Lấy duy nhất <strong>Đội Nhất bảng</strong> vào vòng knock-out.
                          </p>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Quy Tắc 2: Tiêu Chí Phân Định Bằng Điểm */}
            <div className="space-y-2.5 pt-3 border-t border-slate-200/70">
              <div className="flex items-start gap-2.5">
                <div className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-800 font-black text-xs flex items-center justify-center shrink-0 mt-0.5 border border-emerald-200">
                  2
                </div>
                <div className="space-y-2">
                  <h4 className="h-6 text-xs flex items-center font-black uppercase tracking-wide text-slate-900">
                    Thứ Tự Xét Khi Bằng Điểm
                  </h4>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Sau khi kết thúc vòng bảng, nếu các đội bằng điểm nhau thì xét theo thứ tự ưu tiên:
                  </p>
                  <ol className="text-xs text-slate-700 space-y-1.5 bg-slate-50 p-3 rounded-xl border border-slate-200/70">
                    <li className="flex items-center gap-2">
                      <span className="w-4 h-4 rounded-full bg-slate-200 text-slate-800 font-bold text-[10px] flex items-center justify-center shrink-0">
                        1
                      </span>
                      <span>Tổng điểm xếp hạng (1 thắng = 1 điểm)</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-4 h-4 rounded-full bg-slate-200 text-slate-800 font-bold text-[10px] flex items-center justify-center shrink-0">
                        2
                      </span>
                      <span>Hiệu số Set thắng/thua (Set W - Set L)</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-4 h-4 rounded-full bg-slate-200 text-slate-800 font-bold text-[10px] flex items-center justify-center shrink-0">
                        3
                      </span>
                      <span>Hiệu số Điểm số (Point W - Point L)</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-4 h-4 rounded-full bg-slate-200 text-slate-800 font-bold text-[10px] flex items-center justify-center shrink-0">
                        4
                      </span>
                      <span>Hệ số đối đầu trực tiếp</span>
                    </li>
                  </ol>

                  {/* Chú ý bốc thăm */}
                  <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200/80 text-amber-900 text-[12px] leading-relaxed flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <span>
                      <strong>Trường hợp mọi chỉ số bằng nhau:</strong> Ban tổ chức sẽ tiến hành{' '}
                      <strong>bốc thăm</strong> để chọn ra đội đi tiếp.
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
