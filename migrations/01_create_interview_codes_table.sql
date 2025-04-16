-- Create interview_codes table
CREATE TABLE IF NOT EXISTS interview_codes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code TEXT NOT NULL UNIQUE,
  user_id UUID NOT NULL,
  expiration TIMESTAMP WITH TIME ZONE NOT NULL,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_interview_codes_code ON interview_codes(code);
CREATE INDEX IF NOT EXISTS idx_interview_codes_active ON interview_codes(active);
CREATE INDEX IF NOT EXISTS idx_interview_codes_expiration ON interview_codes(expiration);

-- Create row level security policies
ALTER TABLE interview_codes ENABLE ROW LEVEL SECURITY;

-- Allow read access for all authenticated users
CREATE POLICY "Allow read access for all authenticated users"
  ON interview_codes
  FOR SELECT
  TO authenticated
  USING (true);

-- Allow insert/update/delete only for admin users (you can customize this policy)
CREATE POLICY "Allow full access for admin users only"
  ON interview_codes
  FOR ALL
  TO authenticated
  USING (auth.uid() IN (
    SELECT auth.uid() FROM auth.users
    WHERE auth.uid() = '00000000-0000-0000-0000-000000000000' -- Replace with actual admin user ID
  ));

-- Insert some sample interview codes for testing
INSERT INTO interview_codes (code, user_id, expiration, active)
VALUES 
  ('TEST123', '00000000-0000-0000-0000-000000000000', NOW() + INTERVAL '30 days', TRUE),
  ('DEMO456', '00000000-0000-0000-0000-000000000000', NOW() + INTERVAL '30 days', TRUE),
  ('EXPIRED', '00000000-0000-0000-0000-000000000000', NOW() - INTERVAL '1 day', TRUE),
  ('INACTIVE', '00000000-0000-0000-0000-000000000000', NOW() + INTERVAL '30 days', FALSE);

-- Create or replace function to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to update the updated_at timestamp
CREATE TRIGGER update_interview_codes_updated_at
BEFORE UPDATE ON interview_codes
FOR EACH ROW
EXECUTE FUNCTION update_modified_column(); 