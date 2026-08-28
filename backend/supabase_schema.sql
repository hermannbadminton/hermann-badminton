-- =========================================================================
-- SQL SCHEMA FOR SUPABASE (Hermann Badminton Club)
-- Hướng dẫn: Copy toàn bộ nội dung file này và dán vào Supabase SQL Editor -> Run
-- =========================================================================

-- 1. Bảng Người Dùng & Phân Quyền Quản Trị (users)
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    full_name TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'MEMBER' CHECK (role IN ('ADMIN', 'REFEREE', 'MEMBER')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- TẠO SẴN 1 TÀI KHOẢN ADMIN DUY NHẤT ĐƯỢC VÀO QUẢN TRỊ
-- Tài khoản đăng nhập:
-- Username: admin
-- Password: admin123
INSERT INTO users (username, password, full_name, role)
VALUES ('admin', 'admin123', 'Quản Trị Viên Hermann CLB', 'ADMIN')
ON CONFLICT (username) DO NOTHING;

-- 2. Bảng Giải Đấu (tournaments)
CREATE TABLE IF NOT EXISTS tournaments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    category TEXT DEFAULT 'Đơn Nam',
    format TEXT DEFAULT 'GROUP_KNOCKOUT',
    group_count INT DEFAULT 2,
    advancing_per_group INT DEFAULT 2,
    start_date TEXT NOT NULL,
    end_date TEXT NOT NULL,
    location TEXT NOT NULL,
    prize_pool TEXT DEFAULT '20.000.000 VNĐ',
    rules_description TEXT DEFAULT 'Áp dụng luật cầu lông BWF tiêu chuẩn.',
    max_sets INT DEFAULT 3,
    points_to_win_set INT DEFAULT 21,
    max_points_cap INT DEFAULT 30,
    banner TEXT DEFAULT 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?auto=format&fit=crop&w=1200&q=80',
    status TEXT DEFAULT 'UPCOMING',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Bảng Đội / Vận Động Viên (teams)
CREATE TABLE IF NOT EXISTS teams (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tournament_id UUID REFERENCES tournaments(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    group_name TEXT DEFAULT 'Bảng A',
    seed INT DEFAULT NULL,
    avatar TEXT DEFAULT '🏸',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Bảng Trận Đấu (matches)
CREATE TABLE IF NOT EXISTS matches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tournament_id UUID REFERENCES tournaments(id) ON DELETE CASCADE,
    stage TEXT DEFAULT 'KNOCKOUT', -- 'GROUP' hoặc 'KNOCKOUT'
    group_name TEXT DEFAULT NULL,
    round_number INT NOT NULL,
    match_order INT NOT NULL,
    round_name TEXT DEFAULT NULL,
    team1_id UUID DEFAULT NULL,
    team2_id UUID DEFAULT NULL,
    winner_id UUID DEFAULT NULL,
    court TEXT DEFAULT 'Sân 1',
    scheduled_time TEXT DEFAULT NULL,
    set_scores JSONB DEFAULT '[]'::jsonb,
    status TEXT DEFAULT 'SCHEDULED', -- 'SCHEDULED', 'IN_PROGRESS', 'COMPLETED'
    next_match_id UUID DEFAULT NULL,
    next_match_slot INT DEFAULT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_teams_tournament ON teams(tournament_id);
CREATE INDEX IF NOT EXISTS idx_matches_tournament ON matches(tournament_id);
CREATE INDEX IF NOT EXISTS idx_matches_stage ON matches(stage);

-- =========================================================================
-- QUAN TRỌNG: TẮT RLS (ROW LEVEL SECURITY) ĐỂ BACKEND THÊM/SỬA/XÓA DỮ LIỆU
-- =========================================================================
ALTER TABLE IF EXISTS tournaments DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS teams DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS matches DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS users DISABLE ROW LEVEL SECURITY;
