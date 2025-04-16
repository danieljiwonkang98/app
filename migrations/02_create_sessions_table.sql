-- Create sessions table
CREATE TABLE IF NOT EXISTS sessions (
  session_id TEXT PRIMARY KEY,
  code TEXT NOT NULL,
  user_id UUID NOT NULL,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  valid BOOLEAN NOT NULL DEFAULT TRUE,
  terminated_at TIMESTAMP WITH TIME ZONE,
  termination_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_sessions_valid ON sessions(valid);
CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_expires_at ON sessions(expires_at);
CREATE INDEX IF NOT EXISTS idx_sessions_code ON sessions(code);

-- Create foreign key constraint
ALTER TABLE sessions ADD CONSTRAINT fk_sessions_interview_codes
  FOREIGN KEY (code) REFERENCES interview_codes(code)
  ON DELETE CASCADE;

-- Create row level security policies
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;

-- Allow read access for all authenticated users
CREATE POLICY "Allow read access for all authenticated users"
  ON sessions
  FOR SELECT
  TO authenticated
  USING (true);

-- Allow insert for all authenticated users
CREATE POLICY "Allow insert for all authenticated users"
  ON sessions
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Allow update only for session owners
CREATE POLICY "Allow update for session owners"
  ON sessions
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());

-- Create or replace function to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_sessions_modified_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to update the updated_at timestamp
CREATE TRIGGER update_sessions_updated_at
BEFORE UPDATE ON sessions
FOR EACH ROW
EXECUTE FUNCTION update_sessions_modified_column();

-- Create a function to clean up expired sessions
CREATE OR REPLACE FUNCTION cleanup_expired_sessions()
RETURNS void AS $$
BEGIN
  UPDATE sessions 
  SET 
    valid = FALSE, 
    terminated_at = NOW(), 
    termination_reason = 'Automatic cleanup of expired session'
  WHERE 
    valid = TRUE AND 
    expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

-- Create a cron job to run the cleanup function every hour
-- NOTE: This requires pg_cron extension to be enabled in Supabase
-- You may need to run this manually or set up an external scheduler if pg_cron is not available
-- COMMENT OUT THIS SECTION IF pg_cron IS NOT AVAILABLE
/*
SELECT cron.schedule(
  'cleanup-expired-sessions',  -- name of the cron job
  '0 * * * *',                -- run every hour (cron syntax)
  $$SELECT cleanup_expired_sessions()$$
);
*/ 