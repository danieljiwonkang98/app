# Supabase Database Migrations

This folder contains SQL migration scripts for setting up the required database tables in your Supabase project.

## How to Use These Scripts

1. **Create a Supabase Project**:

   - Sign up or log in at [https://supabase.com](https://supabase.com)
   - Create a new project
   - Take note of your project URL and anon key (you'll need these later)

2. **Execute the SQL Scripts**:

   - Navigate to the SQL Editor in your Supabase dashboard
   - Execute the scripts in the following order:
     1. `00_enable_extensions.sql` - Enables required PostgreSQL extensions
     2. `01_create_interview_codes_table.sql` - Creates the interview codes table
     3. `02_create_sessions_table.sql` - Creates the sessions table

3. **Update Application Configuration**:
   - Update the Supabase configuration in `src/renderer/services/config.js`:
   ```javascript
   const SUPABASE_CONFIG = {
     url: getEnv('SUPABASE_URL', 'your-actual-supabase-url'),
     key: getEnv('SUPABASE_KEY', 'your-actual-anon-key'),
   };
   ```

## Table Structure

### interview_codes

| Column     | Type      | Description                      |
| ---------- | --------- | -------------------------------- |
| id         | UUID      | Primary key                      |
| code       | TEXT      | Unique interview code            |
| user_id    | UUID      | User ID associated with the code |
| expiration | TIMESTAMP | When the code expires            |
| active     | BOOLEAN   | Whether the code is active       |
| created_at | TIMESTAMP | When the record was created      |
| updated_at | TIMESTAMP | When the record was last updated |

### sessions

| Column             | Type      | Description                      |
| ------------------ | --------- | -------------------------------- |
| session_id         | TEXT      | Primary key                      |
| code               | TEXT      | Interview code used              |
| user_id            | UUID      | User ID associated with session  |
| start_time         | TIMESTAMP | When the session started         |
| expires_at         | TIMESTAMP | When the session expires         |
| valid              | BOOLEAN   | Whether the session is valid     |
| terminated_at      | TIMESTAMP | When the session was terminated  |
| termination_reason | TEXT      | Reason for termination           |
| created_at         | TIMESTAMP | When the record was created      |
| updated_at         | TIMESTAMP | When the record was last updated |

## Sample Data

The migration scripts include sample interview codes for testing:

- `TEST123` - Valid code (expires in 30 days)
- `DEMO456` - Valid code (expires in 30 days)
- `EXPIRED` - Expired code
- `INACTIVE` - Inactive code

## Important Notes

1. Update the admin user ID in the RLS policies to match your admin user's UUID.
2. The pg_cron extension section is commented out as it may not be available in all Supabase projects.
3. Update any test data with appropriate values for your specific use case.
