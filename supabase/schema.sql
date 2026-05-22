-- Phase 4: Operation P0 (Supabase Realtime Migration & RLS)

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. GLOBAL CLUB INFO (Singleton)
CREATE TABLE IF NOT EXISTS stark_club_info (
  id INT PRIMARY KEY DEFAULT 1,
  name TEXT NOT NULL DEFAULT 'Stark Elite',
  league TEXT DEFAULT 'Bundesliga',
  current_budget BIGINT DEFAULT 25000000,
  live_intelligence JSONB DEFAULT '{}'::jsonb
);

-- 2. ROSTERS (Profi & NLZ)
CREATE TABLE IF NOT EXISTS stark_roster (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  department TEXT CHECK (department IN ('profi', 'nlz')) NOT NULL,
  player_data JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. SCHEDULES (Training Lab)
CREATE TABLE IF NOT EXISTS stark_schedule (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  department TEXT CHECK (department IN ('profi', 'nlz')) NOT NULL,
  day TEXT NOT NULL,
  type TEXT NOT NULL,
  intensity INT DEFAULT 50,
  schedule_time TEXT DEFAULT '16:30 - 18:00',
  completed BOOLEAN DEFAULT false,
  is_matchday BOOLEAN DEFAULT false,
  sim_data JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. TACTICS & PLAYBOOKS
CREATE TABLE IF NOT EXISTS stark_tactics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  department TEXT CHECK (department IN ('profi', 'nlz')) NOT NULL,
  title TEXT NOT NULL,
  markdown_content TEXT NOT NULL,
  tactic_json JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. ENABLE REALTIME
ALTER PUBLICATION supabase_realtime ADD TABLE stark_club_info;
ALTER PUBLICATION supabase_realtime ADD TABLE stark_roster;
ALTER PUBLICATION supabase_realtime ADD TABLE stark_schedule;
ALTER PUBLICATION supabase_realtime ADD TABLE stark_tactics;

-- 6. SETUP ROW-LEVEL SECURITY (RLS)
ALTER TABLE stark_club_info ENABLE ROW LEVEL SECURITY;
ALTER TABLE stark_roster ENABLE ROW LEVEL SECURITY;
ALTER TABLE stark_schedule ENABLE ROW LEVEL SECURITY;
ALTER TABLE stark_tactics ENABLE ROW LEVEL SECURITY;

-- Helper function to get current user role loosely based on email
CREATE OR REPLACE FUNCTION get_stark_role() RETURNS TEXT AS $$
BEGIN
  IF auth.jwt() ->> 'email' = 'media@stark.elite' THEN
    RETURN 'media';
  ELSIF auth.jwt() ->> 'email' = 'profi@stark.elite' THEN
    RETURN 'profi';
  ELSIF auth.jwt() ->> 'email' = 'nlz@stark.elite' THEN
    RETURN 'nlz';
  ELSIF auth.jwt() ->> 'email' = 'manager@stark.elite' THEN
    RETURN 'manager';
  ELSE
    RETURN 'unknown';
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- POLICIES FOR CLUB INFO
CREATE POLICY "Manager can manage club info" ON stark_club_info FOR ALL USING (get_stark_role() IN ('manager', 'profi'));
CREATE POLICY "Everyone can view club info" ON stark_club_info FOR SELECT USING (true);


-- POLICIES FOR ROSTERS
CREATE POLICY "Media can view rosters" ON stark_roster FOR SELECT USING (true);

CREATE POLICY "Manager/Profi can edit profi roster" ON stark_roster
FOR ALL USING (
  (get_stark_role() = 'manager') OR
  (get_stark_role() = 'profi' AND department = 'profi')
);

CREATE POLICY "NLZ Trainer can edit nlz roster" ON stark_roster
FOR ALL USING (
  (get_stark_role() = 'nlz' AND department = 'nlz')
);


-- POLICIES FOR SCHEDULES
CREATE POLICY "Media can view schedules" ON stark_schedule FOR SELECT USING (true);

CREATE POLICY "Manager/Profi can edit profi schedules" ON stark_schedule
FOR ALL USING (
  (get_stark_role() = 'manager') OR
  (get_stark_role() = 'profi' AND department = 'profi')
);

CREATE POLICY "NLZ Trainer can edit nlz schedules" ON stark_schedule
FOR ALL USING (
  (get_stark_role() = 'nlz' AND department = 'nlz')
);


-- POLICIES FOR TACTICS & PLAYBOOKS
CREATE POLICY "Media can view tactics" ON stark_tactics FOR SELECT USING (true);

CREATE POLICY "Manager/Profi can edit profi tactics" ON stark_tactics
FOR ALL USING (
  (get_stark_role() = 'manager') OR
  (get_stark_role() = 'profi' AND department = 'profi')
);

CREATE POLICY "NLZ Trainer can edit nlz tactics" ON stark_tactics
FOR ALL USING (
  (get_stark_role() = 'nlz' AND department = 'nlz')
);

-- INITIAL SEED (Only if safe/empty)
INSERT INTO stark_club_info (id, name, league, current_budget) 
VALUES (1, 'Stark Elite', 'Bundesliga', 25000000)
ON CONFLICT (id) DO NOTHING;

-- 7. LOGISTICS LEDGER (CFO HUB)
CREATE TABLE IF NOT EXISTS logistics_ledger (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  item_name TEXT NOT NULL,
  category TEXT DEFAULT 'material',
  quantity INT DEFAULT 0,
  price_per_unit NUMERIC DEFAULT 0,
  total_value NUMERIC GENERATED ALWAYS AS (quantity * price_per_unit) STORED,
  status TEXT DEFAULT 'ok',
  ordered_by TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER PUBLICATION supabase_realtime ADD TABLE logistics_ledger;
ALTER TABLE logistics_ledger ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Media cannot view logistics" ON logistics_ledger FOR SELECT USING (get_stark_role() != 'media');
CREATE POLICY "Manager/Profi can manage logistics" ON logistics_ledger FOR ALL USING (get_stark_role() IN ('manager', 'profi'));
