-- =========================================================================
-- SQL MIGRATION: THÊM CỘT THỜI GIAN THI ĐẤU & SÂN ĐẤU CHO BẢNG MATCHES
-- Hướng dẫn: Copy và dán vào Supabase Dashboard -> SQL Editor -> Nhấn RUN
-- =========================================================================

-- 1. Thêm cột thời gian thi đấu (scheduled_time)
ALTER TABLE matches ADD COLUMN IF NOT EXISTS scheduled_time TEXT DEFAULT NULL;

-- 2. Thêm cột sân thi đấu (court)
ALTER TABLE matches ADD COLUMN IF NOT EXISTS court TEXT DEFAULT 'Sân 1';
