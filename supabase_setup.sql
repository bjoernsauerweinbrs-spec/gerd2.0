-- SUPABASE SETUP: GERD 2.0 ELITE ARCHITECTURE

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Create Roles Enum (Optional but cleaner)
-- CREATE TYPE user_role AS ENUM ('trainer', 'nlz_leiter', 'eltern');

-- 3. Create Training Plans Table
CREATE TABLE IF NOT EXISTS training_plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  author_id UUID REFERENCES auth.users(id) NOT NULL,
  title TEXT NOT NULL,
  markdown_content TEXT,
  tactic_json JSONB,
  visibility TEXT CHECK (visibility IN ('private', 'team_parents', 'public')) DEFAULT 'private',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Create Messages Table
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  plan_id UUID REFERENCES training_plans(id) ON DELETE CASCADE NOT NULL,
  sender_id UUID REFERENCES auth.users(id) NOT NULL,
  message_text TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Enable RLS
ALTER TABLE training_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- 6. RLS POLICIES: training_plans

-- TRAINER/NLZ: Full access to own plans
CREATE POLICY "Trainers: Full access to own plans" 
ON training_plans FOR ALL 
TO authenticated
USING (auth.uid() = author_id)
WITH CHECK (auth.uid() = author_id);

-- ELTERN: Read access to shared plans
CREATE POLICY "Eltern: Read shared plans" 
ON training_plans FOR SELECT 
TO authenticated
USING (visibility IN ('team_parents', 'public'));

-- 7. RLS POLICIES: messages

-- ANY AUTHENTICATED: Create messages on visible plans
CREATE POLICY "Users: Create messages on visible plans" 
ON messages FOR INSERT 
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM training_plans 
    WHERE id = plan_id 
    AND (visibility IN ('team_parents', 'public') OR author_id = auth.uid())
  )
);

-- TRAINER: Read messages on their plans
CREATE POLICY "Trainers: Read messages on own plans" 
ON messages FOR SELECT 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM training_plans 
    WHERE id = plan_id AND author_id = auth.uid()
  )
);

-- ELTERN: Read messages they sent or on public plans? 
-- The user prompt said: "Trainer dürfen Messages zu ihren eigenen Plänen lesen."
-- Let's stick to that and add a policy for senders to see their own messages.
CREATE POLICY "Users: Read own messages" 
ON messages FOR SELECT 
TO authenticated
USING (auth.uid() = sender_id);
