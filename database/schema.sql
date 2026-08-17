-- ==============================================================================
-- 《国产游戏红黑榜》 核心数据库设计 (PostgreSQL / Supabase)
-- 包含：核心表、外键约束、RLS策略、自动计算触发器
-- ==============================================================================

-- 启用 UUID 扩展
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. 开发商表
CREATE TABLE developers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    logo_url TEXT,
    founded_year INT,
    description TEXT,
    official_website TEXT,
    maintenance_index INT DEFAULT 70 CHECK (maintenance_index BETWEEN 0 AND 100),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. 游戏主表
CREATE TABLE games (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(150) NOT NULL,
    english_name VARCHAR(150),
    developer_id UUID REFERENCES developers(id) ON DELETE SET NULL,
    publisher VARCHAR(100),
    release_date DATE,
    platforms TEXT[] DEFAULT '{"PC (Steam)"}',
    genre VARCHAR(50) NOT NULL,
    commercial_model VARCHAR(50) DEFAULT '买断制', -- 买断制 / 免费抽卡 / 内购 / 赛季制等
    description TEXT,
    cover_url TEXT,
    steam_url TEXT,
    official_url TEXT,
    
    -- 维护状态枚举: active(活跃维护), normal(正常更新), reduced(更新减少), long_dormant(长期无更新), abandoned(停止维护), terminated(终止开发), defunct(停运)
    maintenance_status VARCHAR(30) DEFAULT 'normal',
    last_update_date DATE DEFAULT CURRENT_DATE,
    longest_update_gap_days INT DEFAULT 0,
    
    -- 评分双轨体系 (0 - 100)
    quality_score INT DEFAULT 75,       -- 游戏品质分 (好不好玩)
    recommend_score INT DEFAULT 70,     -- 消费者推荐指数 (值不值得买)
    risk_score INT DEFAULT 30,          -- 长期弃坑/消费风险指数 (0低 - 100高)
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. 标签定义与关联表
CREATE TABLE tags (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(50) UNIQUE NOT NULL,
    category VARCHAR(30) NOT NULL, -- 维护/品质/商业模式/营销/玩家关系/内容/评价
    color VARCHAR(20) DEFAULT '#4B5563',
    description TEXT
);

CREATE TABLE game_tags (
    game_id UUID REFERENCES games(id) ON DELETE CASCADE,
    tag_id UUID REFERENCES tags(id) ON DELETE CASCADE,
    PRIMARY KEY (game_id, tag_id)
);

-- 4. 事件核心表 (三层信息架构：观点、事实、证据)
CREATE TABLE incidents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    game_id UUID REFERENCES games(id) ON DELETE CASCADE,
    developer_id UUID REFERENCES developers(id) ON DELETE SET NULL,
    user_id UUID,
    title VARCHAR(200) NOT NULL,
    incident_type VARCHAR(20) NOT NULL, -- 'red' (红榜负责行为) / 'black' (黑榜问题) / 'dispute' (争议事件)
    category VARCHAR(50) NOT NULL,      -- 开发责任/营销策略/玩家公平性/内容政策/商业模式
    severity INT DEFAULT 2 CHECK (severity BETWEEN 1 AND 5), -- 1级轻微 -> 5级重大
    event_date DATE NOT NULL,
    
    -- 三层信息
    player_opinion TEXT NOT NULL,       -- 第一层：玩家观点与感受
    factual_description TEXT NOT NULL,  -- 第二层：客观事实陈述
    
    -- 证据等级: S(官方公告/更新日志), A(官方社媒), B(可靠媒体/多方来源), C(玩家录像截图), D(单方口述)
    evidence_level VARCHAR(5) DEFAULT 'B' CHECK (evidence_level IN ('S', 'A', 'B', 'C', 'D')),
    evidence_links TEXT[] DEFAULT '{}',
    
    -- 官方回应与状态
    official_response TEXT,
    official_response_date DATE,
    official_response_source TEXT,
    status VARCHAR(30) DEFAULT 'confirmed' CHECK (status IN ('confirmed', 'mostly_confirmed', 'disputed', 'player_feedback', 'unverified', 'resolved')),
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. 游戏历史更新时间线
CREATE TABLE update_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    game_id UUID REFERENCES games(id) ON DELETE CASCADE,
    update_date DATE NOT NULL,
    version_name VARCHAR(50),
    update_type VARCHAR(30) DEFAULT 'patch', -- major, content, bugfix, patch, announcement
    summary TEXT NOT NULL
);

-- 6. 玩家多维度评分与评价表 (九大核心指标)
CREATE TABLE reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    game_id UUID REFERENCES games(id) ON DELETE CASCADE,
    user_id UUID NOT NULL,
    user_name VARCHAR(50) DEFAULT '匿名玩家',
    user_level INT DEFAULT 1,
    
    -- 基础品质指标
    quality_score INT CHECK (quality_score BETWEEN 0 AND 100),
    completion_score INT CHECK (completion_score BETWEEN 0 AND 100),
    optimization_score INT CHECK (optimization_score BETWEEN 0 AND 100),
    content_score INT CHECK (content_score BETWEEN 0 AND 100),
    
    -- 责任与运营指标
    commercial_score INT CHECK (commercial_score BETWEEN 0 AND 100),
    developer_score INT CHECK (developer_score BETWEEN 0 AND 100),
    maintenance_score INT CHECK (maintenance_score BETWEEN 0 AND 100),
    fairness_score INT CHECK (fairness_score BETWEEN 0 AND 100),
    marketing_score INT CHECK (marketing_score BETWEEN 0 AND 100),
    
    content TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT one_review_per_user_per_game UNIQUE (game_id, user_id)
);

-- 7. 投稿待审表 (全量投稿先进审核)
CREATE TABLE submissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID,
    submitter_name VARCHAR(50),
    submission_type VARCHAR(30) NOT NULL, -- 'incident', 'game', 'review', 'update'
    target_name VARCHAR(150) NOT NULL,
    data JSONB NOT NULL,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'need_more_evidence', 'disputed')),
    admin_remark TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    reviewed_at TIMESTAMPTZ
);

-- 8. 举报与审计日志
CREATE TABLE reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    target_type VARCHAR(30) NOT NULL,
    target_id UUID NOT NULL,
    reason_category VARCHAR(50) NOT NULL,
    details TEXT,
    status VARCHAR(20) DEFAULT 'pending',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE admin_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    admin_id UUID,
    action_type VARCHAR(50) NOT NULL,
    target_type VARCHAR(30) NOT NULL,
    target_id UUID,
    details JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- RLS (Row Level Security) 行级安全策略
-- ==============================================================================
ALTER TABLE developers ENABLE ROW LEVEL SECURITY;
ALTER TABLE games ENABLE ROW LEVEL SECURITY;
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE incidents ENABLE ROW LEVEL SECURITY;
ALTER TABLE update_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_logs ENABLE ROW LEVEL SECURITY;

-- 公开读策略 (所有人均可查看公开游戏库与确认档案)
CREATE POLICY "Public games read" ON games FOR SELECT USING (true);
CREATE POLICY "Public developers read" ON developers FOR SELECT USING (true);
CREATE POLICY "Public tags read" ON tags FOR SELECT USING (true);
CREATE POLICY "Public game_tags read" ON game_tags FOR SELECT USING (true);
CREATE POLICY "Public incidents read" ON incidents FOR SELECT USING (true);
CREATE POLICY "Public updates read" ON update_history FOR SELECT USING (true);
CREATE POLICY "Public reviews read" ON reviews FOR SELECT USING (true);

-- 投稿与评价写入策略
CREATE POLICY "Users can insert reviews" ON reviews FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own reviews" ON reviews FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert submissions" ON submissions FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can insert reports" ON reports FOR INSERT WITH CHECK (true);