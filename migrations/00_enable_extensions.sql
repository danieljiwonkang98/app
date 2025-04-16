-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";      -- For UUID generation
CREATE EXTENSION IF NOT EXISTS "pgcrypto";       -- For cryptographic functions (corrected name)
-- CREATE EXTENSION IF NOT EXISTS "pg_cron";     -- For scheduled tasks (uncomment if available in your Supabase project)

-- Check if extensions are enabled
SELECT * FROM pg_extension WHERE extname IN ('uuid-ossp', 'pgcrypto');  