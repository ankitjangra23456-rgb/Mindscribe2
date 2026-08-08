-- ============================================================
-- Run this in: Supabase Dashboard > SQL Editor > New Query
-- Project: iifofxxcmctgkegewfkx (MindscribeExamX)
-- ============================================================

-- 1. Create the profiles table to store registered user details
CREATE TABLE IF NOT EXISTS public.profiles (
  id          uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email       text UNIQUE NOT NULL,
  full_name   text,
  role        text DEFAULT 'Student',
  created_at  timestamptz DEFAULT now()
);

-- 2. Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 3. Allow users to view their own profile
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

-- 4. Allow users to insert/update their own profile
CREATE POLICY "Users can upsert own profile"
  ON public.profiles FOR ALL
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- 5. Allow the service role (backend) full access
CREATE POLICY "Service role full access"
  ON public.profiles FOR ALL
  USING (auth.role() = 'service_role');

-- 6. After running above, check what auth.users exist:
SELECT id, email, created_at, email_confirmed_at
FROM auth.users
ORDER BY created_at DESC;
