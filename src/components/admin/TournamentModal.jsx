import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { useTournament } from '../../context/TournamentContext';
import { usePreventBodyScroll } from '../../hooks/usePreventBodyScroll';
import { Trophy, Calendar, MapPin, Award, BookOpen, X, Check, Upload, Image as ImageIcon, Trash2, Link as LinkIcon } from 'lucide-react';

export default function TournamentModal({ tournament, onClose }) {
  usePreventBodyScroll(true);

  const { createTournament, updateTournament } = useTournament();
  const isEditing = !!tournament;

  const [formData, setFormData] = useState({
    name: tournament?.name || '',
    category: tournament?.category || 'Đơn Nam',
    format: tournament?.format || 'GROUP_KNOCKOUT',
    groupCount: tournament?.groupCount || 1,
    advancingPerGroup: tournament?.advancingPerGroup || null,
    status: tournament?.status || 'UPCOMING',
    startDate: tournament?.startDate || new Date().toISOString().split('T')[0],
    endDate: tournament?.endDate || new Date().toISOString().split('T')[0],
    location: tournament?.location || '',
    prizePool: tournament?.prizePool || '500.000 VNĐ',
    rulesDescription: tournament?.rulesDescription || 'Áp dụng luật cầu lông BWF tiêu chuẩn.',
    maxSets: tournament?.maxSets || 1,
    pointsToWinSet: tournament?.pointsToWinSet || 21,
    maxPointsCap: tournament?.maxPointsCap || 30,
    banner: tournament?.banner || 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?auto=format&fit=crop&w=1200&q=80',
  });

  const [uploadError, setUploadError] = useState('');

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setUploadError('Vui lòng chọn file hình ảnh (JPG, PNG, WEBP,...)');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setUploadError('Dung lượng ảnh tối đa 5MB');
      return;
    }

    setUploadError('');
    const reader = new FileReader();
    reader.onload = (uploadEvent) => {
      const base64 = uploadEvent.target.result;
      setFormData((prev) => ({ ...prev, banner: base64 }));
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.location.trim()) {
      alert('Vui lòng nhập đầy đủ tên giải đấu và địa điểm.');
      return;
    }

    if (isEditing) {
      updateTournament(tournament.id, formData);
    } else {
      createTournament(formData);
    }
    onClose();
  };

  return createPortal(
    <div className="fixed inset-0 z-[99999] w-screen h-screen min-h-screen flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-md overflow-y-auto">
      {/* Click outside to close backdrop */}
      <div className="fixed inset-0" onClick={onClose} aria-hidden="true" />

      <div className="relative z-10 bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-slate-100 overflow-hidden my-auto max-h-[90vh] flex flex-col">
        {/* Header - Màu sắc sáng & hiện đại */}
        <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 text-white px-6 py-4 flex items-center justify-between shrink-0 shadow-sm">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center backdrop-blur-sm">
              <Trophy className="w-4 h-4 text-white" />
            </div>
            <h3 className="text-base font-bold">
              {isEditing ? 'Chỉnh Sửa Thông Tin Giải Đấu' : 'Thêm Mới Giải Đấu Cầu Lông'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/20 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4">
          {/* Tên giải & Nội dung */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Tên Giải Đấu *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="VD: Giải Cầu Lông Mở Rộng 2026..."
                className="w-full px-3.5 py-2 text-sm bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Nội Dung Thi Đấu
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              >
                <option value="Đơn Nam">Đơn Nam</option>
                <option value="Đơn Nữ">Đơn Nữ</option>
                <option value="Đôi Nam">Đôi Nam</option>
                <option value="Đôi Nữ">Đôi Nữ</option>
                <option value="Đôi Nam Nữ">Đôi Nam Nữ</option>
              </select>
            </div>
          </div>

          {/* Cấu hình Thể Thức Thi Đấu */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-slate-800 uppercase">
                Thể Thức Thi Đấu *
              </label>
              <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                Tùy chọn cấu hình giải
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <label
                className={`p-3 rounded-xl border cursor-pointer transition-all flex flex-col justify-between ${
                  formData.format === 'GROUP_KNOCKOUT'
                    ? 'border-emerald-500 bg-emerald-50/50 ring-2 ring-emerald-500/20'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <input
                  type="radio"
                  name="tournamentFormat"
                  className="sr-only"
                  checked={formData.format === 'GROUP_KNOCKOUT'}
                  onChange={() => setFormData({ ...formData, format: 'GROUP_KNOCKOUT' })}
                />
                <div>
                  <p className="text-xs font-bold text-slate-800">📊 Vòng Bảng + Knockout</p>
                  <p className="text-[11px] text-slate-500 mt-1">Đánh vòng tròn chia bảng, chọn các đội đầu bảng vào đấu loại trực tiếp.</p>
                </div>
              </label>

              <label
                className={`p-3 rounded-xl border cursor-pointer transition-all flex flex-col justify-between ${
                  formData.format === 'KNOCKOUT'
                    ? 'border-emerald-500 bg-emerald-50/50 ring-2 ring-emerald-500/20'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <input
                  type="radio"
                  name="tournamentFormat"
                  className="sr-only"
                  checked={formData.format === 'KNOCKOUT'}
                  onChange={() => setFormData({ ...formData, format: 'KNOCKOUT' })}
                />
                <div>
                  <p className="text-xs font-bold text-slate-800">🏆 Loại Trực Tiếp</p>
                  <p className="text-[11px] text-slate-500 mt-1">Single Elimination từ đầu đến chung kết (không chia bảng).</p>
                </div>
              </label>

              <label
                className={`p-3 rounded-xl border cursor-pointer transition-all flex flex-col justify-between ${
                  formData.format === 'ROUND_ROBIN'
                    ? 'border-emerald-500 bg-emerald-50/50 ring-2 ring-emerald-500/20'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <input
                  type="radio"
                  name="tournamentFormat"
                  className="sr-only"
                  checked={formData.format === 'ROUND_ROBIN'}
                  onChange={() => setFormData({ ...formData, format: 'ROUND_ROBIN' })}
                />
                <div>
                  <p className="text-xs font-bold text-slate-800">🔄 Vòng Tròn Thuần Túy</p>
                  <p className="text-[11px] text-slate-500 mt-1">Tất cả các đội thi đấu vòng tròn tính điểm tranh thứ hạng cao nhất.</p>
                </div>
              </label>
            </div>

            {/* Chi tiết thông số vòng bảng nếu chọn GROUP_KNOCKOUT hoặc ROUND_ROBIN */}
            {formData.format === 'GROUP_KNOCKOUT' && (
              <div className="pt-2 border-t border-slate-200/80 grid grid-cols-1 sm:grid-cols-2 gap-3 animate-fade-in">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Số Lượng Bảng Đấu:
                  </label>
                  <select
                    value={formData.groupCount}
                    onChange={(e) => setFormData({ ...formData, groupCount: Number(e.target.value) })}
                    className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg font-semibold"
                  >
                    <option value={1}>1 Bảng</option>
                    <option value={2}>2 Bảng</option>
                    <option value={3}>3 Bảng</option>
                    <option value={4}>4 Bảng</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Số Đội Đi Tiếp (Có Thể Tùy Chọn Lại Sau Vòng Bảng):
                  </label>
                  <select
                    value={formData.advancingPerGroup}
                    onChange={(e) => setFormData({ ...formData, advancingPerGroup: Number(e.target.value) })}
                    className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg font-semibold text-emerald-800"
                  >
                    <option value={0}>Chọn sau khi kết thúc vòng bảng</option>
                    <option value={2}>Top 2 Mỗi Bảng (Nhất Bảng & Nhì Bảng)</option>
                    <option value={1}>Top 1 Mỗi Bảng (Chỉ Nhất Bảng)</option>
                    <option value={3}>Top 3 Mỗi Bảng</option>
                  </select>
                </div>
              </div>
            )}
          </div>

          {/* Trạng thái & Giải thưởng */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Trạng Thái
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              >
                <option value="UPCOMING">Sắp Diễn Ra (Upcoming)</option>
                <option value="ONGOING">Đang Diễn Ra (Ongoing)</option>
                <option value="COMPLETED">Đã Kết Thúc (Completed)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Tổng Giá Trị Giải Thưởng
              </label>
              <input
                type="text"
                value={formData.prizePool}
                onChange={(e) => setFormData({ ...formData, prizePool: e.target.value })}
                placeholder="VD: 500.000 VNĐ"
                className="w-full px-3.5 py-2 text-sm bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Thời gian & Địa điểm */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Ngày Bắt Đầu
              </label>
              <input
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Ngày Kết Thúc
              </label>
              <input
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
              Địa Điểm Thi Đấu *
            </label>
            <input
              type="text"
              required
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              placeholder="VD: Cung Thể Thao Quần Ngựa, Hà Nội"
              className="w-full px-3.5 py-2 text-sm bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            />
          </div>

          {/* Cấu hình Thông số Thể thức & Luật Cầu lông */}
          <div className="p-4 bg-emerald-50/60 rounded-xl border border-emerald-200">
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-emerald-900 mb-3 flex items-center gap-1.5">
              <Award className="w-4 h-4 text-emerald-600" />
              Thiết Lập Thông Số Luật Thi Đấu (BWF)
            </h4>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Số Set Tối Đa
                </label>
                <select
                  value={formData.maxSets}
                  onChange={(e) => setFormData({ ...formData, maxSets: Number(e.target.value) })}
                  className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-lg"
                >
                  <option value={3}>3 Set Thắng 2</option>
                  <option value={5}>5 Set Thắng 3</option>
                  <option value={1}>1 Set</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Điểm Thắng 1 Set
                </label>
                <input
                  type="number"
                  value={formData.pointsToWinSet}
                  onChange={(e) => setFormData({ ...formData, pointsToWinSet: Number(e.target.value) })}
                  className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-lg text-center font-bold"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Điểm Chạm Kịch Trần
                </label>
                <input
                  type="number"
                  value={formData.maxPointsCap}
                  onChange={(e) => setFormData({ ...formData, maxPointsCap: Number(e.target.value) })}
                  className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-lg text-center font-bold"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
              Quy Định & Nội Quy Giải
            </label>
            <textarea
              rows={2}
              value={formData.rulesDescription}
              onChange={(e) => setFormData({ ...formData, rulesDescription: e.target.value })}
              className="w-full px-3.5 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              {isEditing ? 'Cập Nhật' : 'Tạo Giải Đấu'}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}
