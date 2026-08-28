import React from 'react';
import { CheckCircle2, Shield } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-white text-slate-600 py-8 sm:py-10 border-t border-slate-200 shadow-xs mt-auto !pb-3">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-12 mb-6">
          {/* Cột 1: Thông tin thương hiệu CLB */}
          <div className="space-y-3">
            <div className="flex items-center">
              <img
                src="/logo.png"
                alt="Hermann Badminton Logo"
                className="h-12 sm:h-16 w-auto object-contain"
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
            </div>
            <p className="text-sm text-slate-500 leading-relaxed max-w-md">
              Hệ thống tổ chức giải đấu, theo dõi kết quả thi đấu, bốc thăm chia bảng và cập nhật nhánh đấu trực tiếp dành cho thành viên CLB Hermann Badminton.
            </p>
          </div>

          {/* Cột 2: Thể thức & Tiêu chuẩn thi đấu */}
          <div>
            <h4 className="text-slate-900 text-base font-bold uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
              Thể Thức & Quy Chuẩn Thi Đấu
            </h4>
            <ul className="text-sm space-y-1.5 text-slate-600">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Luật thi đấu BWF tiêu chuẩn & Nội quy CLB Hermann</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Vòng bảng thi đấu vòng tròn 1 lượt</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Sơ đồ phân nhánh đấu loại trực tiếp</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Tự động tính điểm xếp hạng & thăng hạng nhánh đấu</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Dòng bản quyền chân trang */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-center text-[12px] text-slate-400 font-medium">
          <p>© 2026 Hermann Badminton</p>
        </div>
      </div>
    </footer>
  );
}
