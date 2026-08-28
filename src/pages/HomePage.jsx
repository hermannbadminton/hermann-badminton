import React, { useState } from 'react';
import { useTournament } from '../context/TournamentContext';
import { Trophy, Calendar, MapPin, Users, Award, Search, ArrowRight, Flame, Plus } from 'lucide-react';

export default function HomePage({ onSelectTournament, onOpenCreateTournament }) {
  const { tournaments, teams = [], isAdmin } = useTournament();

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const cleanStr = String(dateStr).split('T')[0];
    const parts = cleanStr.split('-');
    if (parts.length === 3) {
      return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    return dateStr;
  };

  const getCategoryBadge = (category) => {
    const cat = (category || '').toLowerCase();
    if (cat.includes('nữ') && !cat.includes('nam')) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-black bg-gradient-to-r from-[#ff57aa] to-[#e10031] text-white shadow-md shadow-rose-950/40 border border-pink-300/40 tracking-wide uppercase">
          {category}
        </span>
      );
    }
    if (cat.includes('nam nữ') || cat.includes('hỗn hợp')) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-black bg-gradient-to-r from-[#ba80f1] to-[#6961ef] text-white shadow-md shadow-purple-950/40 border border-purple-300/40 tracking-wide uppercase">
          {category}
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-black bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-md shadow-blue-950/40 border border-sky-300/40 tracking-wide uppercase">
        {category || 'Đôi Nam'}
      </span>
    );
  };

  return (
    <div className="space-y-10 pb-16">
      {/* Hero Banner - Màu sắc sáng & hiện đại */}
      <section className="relative rounded-3xl overflow-hidden shadow-xl bg-gradient-to-r from-emerald-800 via-teal-800 to-slate-900 border border-emerald-500/30 text-white">
        <div className="absolute inset-0 z-0 opacity-25">
          <img
            src="./bg.jpg"
            alt="Badminton Court"
            className="w-full h-full object-cover"
          />
        </div>

        <div className="relative z-10 p-6 sm:p-10 md:p-12 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold uppercase tracking-wider mb-4 border border-emerald-500/30">
            <Trophy className="w-3.5 h-3.5" />
            Hệ Thống Giải Đấu CLB
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black tracking-tight leading-tight mb-4">
            CLB Cầu Lông{' '}
            <div className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl bg-gradient-to-r from-emerald-200 via-teal-100 to-amber-200 bg-clip-text text-transparent drop-shadow-sm">
              Hermann Badminton
            </div>
          </h1>
          <p className="text-emerald-100/90 text-sm md:text-base leading-relaxed">
            Trang theo dõi nhánh đấu, bốc thăm chia bảng và cập nhật tỷ số trực tiếp dành riêng cho các thành viên CLB Hermann Badminton.
          </p>
        </div>
      </section>

      {/* Tournament Cards Grid */}
      {tournaments.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center shadow-sm">
          <Trophy className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-700">Chưa có giải đấu</h3>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tournaments.map((tournament) => {
            const teamCount = teams.filter(
              (team) => String(team.tournamentId) === String(tournament.id) || String(team.tournament_id) === String(tournament.id)
            ).length;
            const groupCount = tournament.groupCount ?? tournament.group_count ?? 1;

            return (
              <div
                key={tournament.id}
                onClick={() => onSelectTournament(tournament.id)}
                className="bg-white rounded-2xl border border-slate-200/90 shadow-sm hover:shadow-md hover:border-emerald-500/60 transition-all duration-200 overflow-hidden flex flex-col cursor-pointer group"
              >
                {/* Banner Image with Overlay & Title */}
                <div className="relative h-44 overflow-hidden bg-slate-900">
                  <img
                    src={tournament.banner}
                    alt={tournament.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-85"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/30 to-transparent" />
                  
                  {/* Category Badge on Top Left */}
                  <div className="absolute top-3 right-3">
                    {getCategoryBadge(tournament.category)}
                  </div>

                  {/* Tournament Name */}
                  <div className="absolute bottom-3 left-3 right-3 text-white">
                    <h3 className="text-base font-bold leading-snug group-hover:text-emerald-300 transition-colors line-clamp-2">
                      {tournament.name}
                    </h3>
                  </div>
                </div>

                {/* Tournament Details Body */}
                <div className="p-2 flex-1 flex flex-col justify-between">
                  {/* Info Meta Block */}
                  <div className="space-y-2 text-sm text-slate-600 bg-slate-50/70 p-3 rounded-xl">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5 text-slate-700 shrink-0" />
                      <span className="font-medium text-slate-700">
                        {formatDate(tournament.startDate)} ~ {formatDate(tournament.endDate)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-slate-700 shrink-0" />
                      <span className="truncate font-medium text-slate-700">{tournament.location || 'Sân CLB Hermann'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Award className="w-3.5 h-3.5 text-slate-700 shrink-0" />
                      <span className="font-medium text-slate-700">
                        {tournament.prizePool}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="w-3.5 h-3.5 text-slate-700 shrink-0" />
                      <span className="text-slate-700 font-medium">
                        {teamCount} Đội - {groupCount} Bảng
                      </span>
                    </div>
                  </div>

                  {/* Footer Action */}
                  <div className="pt-2 px-2 flex items-center justify-between text-xs font-bold text-emerald-700">
                    <span>Xem Nhánh Đấu & Tỷ Số</span>
                    <div className="w-7 h-7 rounded-full bg-emerald-50 text-emerald-700 group-hover:bg-emerald-600 group-hover:text-white flex items-center justify-center transition-all">
                      <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
