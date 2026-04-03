-- Phase 3: PostgreSQL Schema for Supabase (Gerd 2.0 – The Legacy)

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Training Plans Table
CREATE TABLE IF NOT EXISTS training_plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  author_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  markdown_content TEXT NOT NULL,
  visibility TEXT CHECK (visibility IN ('private', 'team_parents', 'public')) DEFAULT 'private',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Messages Table (Communication between Trainer and Parents)
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  plan_id UUID REFERENCES training_plans(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  message_text TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ROW LEVEL SECURITY (RLS) policies

-- Enable RLS
ALTER TABLE training_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- 1. Trainers: Full access to their own plans
CREATE POLICY "Trainers manage own plans" ON training_plans
  FOR ALL
  USING (auth.uid() = author_id);

-- 2. Parents/Members: Read-only access to 'team_parents' or 'public' plans
CREATE POLICY "Others view shared plans" ON training_plans
  FOR SELECT
  USING (visibility = 'team_parents' OR visibility = 'public');

-- 3. Messages: View messages on accessible plans
CREATE POLICY "View messages on accessible plans" ON messages
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM training_plans 
      WHERE id = messages.plan_id 
      AND (visibility = 'team_parents' OR visibility = 'public' OR author_id = auth.uid())
    )
  );

-- 4. Messages: Insert messages to shared plans
CREATE POLICY "Users can post messages to shared plans" ON messages
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM training_plans 
      WHERE id = plan_id 
      AND (visibility = 'team_parents' OR visibility = 'public')
    )
  );
