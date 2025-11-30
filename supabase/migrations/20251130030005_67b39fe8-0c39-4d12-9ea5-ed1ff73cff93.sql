-- =====================================================
-- SECURITY IMPROVEMENTS: 2FA, Rate Limiting, Sessions
-- =====================================================

-- 1. Create user_mfa table for TOTP-based 2FA
CREATE TABLE IF NOT EXISTS public.user_mfa (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  secret TEXT NOT NULL, -- TOTP secret (encrypted in application layer)
  enabled_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  backup_codes TEXT[], -- Array of backup codes (hashed)
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Enable RLS on user_mfa
ALTER TABLE public.user_mfa ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_mfa
CREATE POLICY "Users can view their own MFA settings"
  ON public.user_mfa
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own MFA settings"
  ON public.user_mfa
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own MFA settings"
  ON public.user_mfa
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own MFA settings"
  ON public.user_mfa
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all MFA settings"
  ON public.user_mfa
  FOR SELECT
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

-- 2. Create rate_limit_log table for tracking API usage
CREATE TABLE IF NOT EXISTS public.rate_limit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  identifier TEXT NOT NULL, -- IP address or user_id
  endpoint TEXT NOT NULL, -- Function name
  request_count INTEGER NOT NULL DEFAULT 1,
  window_start TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for fast lookups
CREATE INDEX IF NOT EXISTS idx_rate_limit_identifier_endpoint 
  ON public.rate_limit_log(identifier, endpoint, window_start);

-- RLS for rate_limit_log (admin only)
ALTER TABLE public.rate_limit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view rate limit logs"
  ON public.rate_limit_log
  FOR SELECT
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

-- 3. Create user_sessions table for tracking active sessions
CREATE TABLE IF NOT EXISTS public.user_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  session_token TEXT NOT NULL UNIQUE,
  last_activity TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for session lookups
CREATE INDEX IF NOT EXISTS idx_user_sessions_token 
  ON public.user_sessions(session_token);
CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id 
  ON public.user_sessions(user_id);

-- Enable RLS on user_sessions
ALTER TABLE public.user_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own sessions"
  ON public.user_sessions
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own sessions"
  ON public.user_sessions
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all sessions"
  ON public.user_sessions
  FOR ALL
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

-- 4. Function to cleanup expired sessions
CREATE OR REPLACE FUNCTION public.cleanup_expired_sessions()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM public.user_sessions
  WHERE expires_at < NOW();
END;
$$;

-- 5. Function to cleanup old rate limit logs (keep last 24 hours)
CREATE OR REPLACE FUNCTION public.cleanup_rate_limit_logs()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM public.rate_limit_log
  WHERE created_at < NOW() - INTERVAL '24 hours';
END;
$$;

-- 6. Trigger to update updated_at on user_mfa
CREATE TRIGGER update_user_mfa_updated_at
  BEFORE UPDATE ON public.user_mfa
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- 7. Comments for documentation
COMMENT ON TABLE public.user_mfa IS 'Stores TOTP secrets and backup codes for two-factor authentication';
COMMENT ON TABLE public.rate_limit_log IS 'Tracks API usage for rate limiting purposes';
COMMENT ON TABLE public.user_sessions IS 'Tracks active user sessions with timeout support';
COMMENT ON FUNCTION public.cleanup_expired_sessions() IS 'Removes expired sessions (should be called by cron job)';
COMMENT ON FUNCTION public.cleanup_rate_limit_logs() IS 'Removes old rate limit logs to prevent table bloat';