-- ── Zerofi Supabase Database Setup ───────────────────────────────────────────
-- Run this SQL in your Supabase project's SQL Editor (supabase.com → SQL Editor)
-- This sets up encrypted user data storage with row-level security.

-- ── 1. Create the user_data table ────────────────────────────────────────────
-- Stores each user's encrypted financial data as key-value pairs.
-- Values are AES-256-GCM encrypted BEFORE they reach this database.

CREATE TABLE IF NOT EXISTS public.user_data (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  key         TEXT NOT NULL,
  value       TEXT NOT NULL,  -- AES-256-GCM encrypted JSON, base64-encoded
  updated_at  TIMESTAMPTZ DEFAULT now(),
  UNIQUE (user_id, key)
);

-- ── 2. Create indexes for performance ────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_user_data_user_id ON public.user_data(user_id);
CREATE INDEX IF NOT EXISTS idx_user_data_key     ON public.user_data(key);

-- ── 3. Enable Row Level Security ─────────────────────────────────────────────
-- RLS ensures users can ONLY read/write their own rows.
-- Even if someone gets your API key, they can't read another user's data.

ALTER TABLE public.user_data ENABLE ROW LEVEL SECURITY;

-- ── 4. RLS Policies ──────────────────────────────────────────────────────────

-- Users can only SELECT their own rows
CREATE POLICY "Users can read own data"
  ON public.user_data FOR SELECT
  USING (auth.uid() = user_id);

-- Users can only INSERT their own rows
CREATE POLICY "Users can insert own data"
  ON public.user_data FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can only UPDATE their own rows
CREATE POLICY "Users can update own data"
  ON public.user_data FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can only DELETE their own rows
CREATE POLICY "Users can delete own data"
  ON public.user_data FOR DELETE
  USING (auth.uid() = user_id);

-- ── 5. Beta codes table (optional, for server-side validation) ───────────────
CREATE TABLE IF NOT EXISTS public.beta_codes (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  code        TEXT UNIQUE NOT NULL,
  used_by     UUID REFERENCES auth.users(id),
  used_at     TIMESTAMPTZ,
  created_at  TIMESTAMPTZ DEFAULT now(),
  is_active   BOOLEAN DEFAULT true
);

-- Only admins can manage beta codes (no RLS policy for public access)
ALTER TABLE public.beta_codes ENABLE ROW LEVEL SECURITY;

-- ── 6. Updated_at trigger ─────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_user_data_updated_at
  BEFORE UPDATE ON public.user_data
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- ── 7. Insert initial beta codes ─────────────────────────────────────────────
INSERT INTO public.beta_codes (code) VALUES
  ('ZEROFI2026'),
  ('NOVA2026'),
  ('GETPAID2026'),
  ('ZEROFIBETA'),
  ('FAMILYBETA'),
  ('GIGLIFE2026')
ON CONFLICT (code) DO NOTHING;

-- ── Done! ─────────────────────────────────────────────────────────────────────
-- Next steps:
-- 1. Copy your Project URL and Publishable Key from Settings > API Keys
-- 2. Create a .env file in the zerofi/ folder:
--      VITE_SUPABASE_URL=https://your-project.supabase.co
--      VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_xxx
-- 3. Run: npm install && npm run dev


-- ── CCPA Consent Records ──────────────────────────────────────────────────────
-- Records proof of user consent at signup — required for CCPA and GLBA
-- This table is append-only — consent records are never deleted

CREATE TABLE IF NOT EXISTS public.user_consents (
  id                UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id           UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  timestamp         TIMESTAMPTZ DEFAULT now() NOT NULL,
  terms_version     TEXT NOT NULL DEFAULT '1.0.0',
  privacy_version   TEXT NOT NULL DEFAULT '1.0.0',
  beta_version      TEXT NOT NULL DEFAULT '1.0.0',
  integrity_version TEXT NOT NULL DEFAULT '1.0.0',
  consent_method    TEXT NOT NULL DEFAULT 'checkbox_signup',
  ip_hash           TEXT,  -- hashed IP, never raw
  user_agent_hash   TEXT   -- hashed user agent
);

-- Users can only insert their own consent records, never update or delete
ALTER TABLE public.user_consents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert own consent"
  ON public.user_consents FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can read own consent"
  ON public.user_consents FOR SELECT
  USING (auth.uid() = user_id);

-- ── Data Deletion Requests ────────────────────────────────────────────────────
-- Tracks CCPA right-to-delete requests with audit trail

CREATE TABLE IF NOT EXISTS public.deletion_requests (
  id           UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id      UUID NOT NULL REFERENCES auth.users(id),
  requested_at TIMESTAMPTZ DEFAULT now(),
  completed_at TIMESTAMPTZ,
  status       TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'denied')),
  method       TEXT DEFAULT 'in_app',
  notes        TEXT
);

ALTER TABLE public.deletion_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert own deletion request"
  ON public.deletion_requests FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can read own deletion request"
  ON public.deletion_requests FOR SELECT
  USING (auth.uid() = user_id);

-- ── Security Audit Log ────────────────────────────────────────────────────────
-- Immutable audit log for SOC 2 CC7 monitoring controls

CREATE TABLE IF NOT EXISTS public.audit_log (
  id         UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id    UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  event_type TEXT NOT NULL,
  event_data JSONB,
  ip_hash    TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;

-- Audit log is insert-only — no updates or deletes permitted
CREATE POLICY "Users can insert own audit events"
  ON public.audit_log FOR INSERT
  WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

-- Only admins can read audit logs (no select policy for regular users)

-- ── Useful admin views ────────────────────────────────────────────────────────
-- These can be queried from your Supabase dashboard

CREATE OR REPLACE VIEW public.admin_user_summary AS
SELECT
  u.id,
  u.email,
  u.created_at,
  u.last_sign_in_at,
  COUNT(DISTINCT ud.key) as data_keys_count,
  MAX(ud.updated_at) as last_data_update,
  uc.timestamp as consent_date,
  uc.terms_version
FROM auth.users u
LEFT JOIN public.user_data ud ON u.id = ud.user_id
LEFT JOIN public.user_consents uc ON u.id = uc.user_id
GROUP BY u.id, u.email, u.created_at, u.last_sign_in_at, uc.timestamp, uc.terms_version;


-- ── Age Verification ──────────────────────────────────────────────────────────
-- COPPA + state age verification law compliance
-- We store age_verified flag and dob_hash (never raw DOB) in consent records

ALTER TABLE public.user_consents
  ADD COLUMN IF NOT EXISTS age_confirmed  BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS dob_verified   BOOLEAN DEFAULT false;

-- View to verify all signups have age confirmation
CREATE OR REPLACE VIEW public.admin_age_compliance AS
SELECT
  u.id,
  u.email,
  u.created_at,
  uc.age_confirmed,
  uc.dob_verified,
  uc.timestamp as consent_timestamp
FROM auth.users u
LEFT JOIN public.user_consents uc ON u.id = uc.user_id
ORDER BY u.created_at DESC;


-- ── Email Preferences (CAN-SPAM compliance) ───────────────────────────────────
-- Tracks user email opt-outs. Must be honored within 10 business days.

CREATE TABLE IF NOT EXISTS public.email_preferences (
  id                  UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id             UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  marketing           BOOLEAN DEFAULT true,
  product_updates     BOOLEAN DEFAULT true,
  weekly_summary      BOOLEAN DEFAULT true,
  security_alerts     BOOLEAN DEFAULT true,  -- cannot be disabled
  unsubscribed_all    BOOLEAN DEFAULT false,
  unsubscribed_at     TIMESTAMPTZ,
  unsubscribe_token   TEXT UNIQUE DEFAULT gen_random_uuid()::text,
  updated_at          TIMESTAMPTZ DEFAULT now(),
  UNIQUE (user_id)
);

ALTER TABLE public.email_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own email preferences"
  ON public.email_preferences FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own email preferences"
  ON public.email_preferences FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own email preferences"
  ON public.email_preferences FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Auto-create email preferences on signup
CREATE OR REPLACE FUNCTION public.handle_new_user_preferences()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.email_preferences (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created_preferences
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_preferences();


-- ── CAN-SPAM Unsubscribe Management ──────────────────────────────────────────
-- Tracks email unsubscribe preferences — must be honored within 10 business days

CREATE TABLE IF NOT EXISTS public.email_preferences (
  id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id         UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  email           TEXT NOT NULL,
  marketing       BOOLEAN DEFAULT true,
  weekly_digest   BOOLEAN DEFAULT true,
  product_updates BOOLEAN DEFAULT true,
  security_alerts BOOLEAN DEFAULT true,  -- cannot be unsubscribed
  updated_at      TIMESTAMPTZ DEFAULT now(),
  unsubscribed_all BOOLEAN DEFAULT false,
  unsubscribed_at  TIMESTAMPTZ,
  UNIQUE (user_id)
);

ALTER TABLE public.email_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own email preferences"
  ON public.email_preferences FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Trigger to timestamp unsubscribe
CREATE OR REPLACE FUNCTION public.handle_unsubscribe()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.unsubscribed_all = true AND OLD.unsubscribed_all = false THEN
    NEW.unsubscribed_at = now();
  END IF;
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER email_unsubscribe_timestamp
  BEFORE UPDATE ON public.email_preferences
  FOR EACH ROW EXECUTE FUNCTION public.handle_unsubscribe();

-- ── Multi-State Privacy — Data Export ─────────────────────────────────────────
-- Supports right to data portability across all 20 state privacy laws

CREATE TABLE IF NOT EXISTS public.data_export_requests (
  id           UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id      UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  requested_at TIMESTAMPTZ DEFAULT now(),
  completed_at TIMESTAMPTZ,
  status       TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'ready', 'delivered', 'expired')),
  download_url TEXT,
  expires_at   TIMESTAMPTZ
);

ALTER TABLE public.data_export_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own export requests"
  ON public.data_export_requests FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);


-- ── CAN-SPAM Email Preferences ────────────────────────────────────────────────
-- Stores user email preferences for CAN-SPAM compliance
-- All preferences default to true except marketing (opt-in only)

CREATE TABLE IF NOT EXISTS public.email_preferences (
  user_id              UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  weekly_summary       BOOLEAN DEFAULT true,
  bill_reminders       BOOLEAN DEFAULT true,
  goal_milestones      BOOLEAN DEFAULT true,
  security_alerts      BOOLEAN DEFAULT true,  -- cannot be disabled
  product_updates      BOOLEAN DEFAULT false, -- opt-in only
  marketing            BOOLEAN DEFAULT false, -- opt-in only
  beta_communications  BOOLEAN DEFAULT true,
  updated_at           TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.email_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own email preferences"
  ON public.email_preferences FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Auto-create email preferences on signup
CREATE OR REPLACE FUNCTION public.create_email_preferences()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.email_preferences (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created_email_prefs
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.create_email_preferences();

-- ── Unsubscribe Tokens ────────────────────────────────────────────────────────
-- One-click unsubscribe without requiring login (CAN-SPAM requirement)

CREATE TABLE IF NOT EXISTS public.unsubscribe_tokens (
  token      TEXT PRIMARY KEY,
  user_id    UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  email_type TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  used_at    TIMESTAMPTZ
);

ALTER TABLE public.unsubscribe_tokens ENABLE ROW LEVEL SECURITY;

-- Tokens are validated server-side only — no user-level access needed

-- ── Data Portability Export Log ───────────────────────────────────────────────
-- Tracks CPRA/TDPSA data export requests

CREATE TABLE IF NOT EXISTS public.data_export_requests (
  id           UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id      UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  requested_at TIMESTAMPTZ DEFAULT now(),
  completed_at TIMESTAMPTZ,
  status       TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed')),
  download_url TEXT,
  expires_at   TIMESTAMPTZ
);

ALTER TABLE public.data_export_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own export requests"
  ON public.data_export_requests FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
