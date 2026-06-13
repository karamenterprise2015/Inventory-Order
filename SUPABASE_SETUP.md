# Supabase Setup Guide

This application is now configured to use Supabase for storing orders. Follow these steps to set it up:

## 1. Create a Supabase Project

1. Go to [https://supabase.com](https://supabase.com)
2. Sign up or log in
3. Click "New Project"
4. Choose your organization
5. Enter project details:
   - Name: `inventory-order` (or your preferred name)
   - Database Password: (save this securely)
   - Region: Choose closest to your users
6. Click "Create new project"
7. Wait for the project to be provisioned (2-3 minutes)

## 2. Get Your Supabase Credentials

1. Go to your project dashboard
2. Navigate to **Settings → API**
3. Copy the following values:
   - **Project URL** (looks like `https://xyz.supabase.co`)
   - **anon/public key** (looks like `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`)

## 3. Set Environment Variables

Create a `.env.local` file in your project root (this file is gitignored):

```env
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

Replace the values with the credentials you copied in step 2.

## 4. Create the Orders Table

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor** (left sidebar)
3. Click "New Query"
4. Copy and paste the SQL from `supabase-schema.sql` file:

```sql
-- Create orders table for storing inventory orders
CREATE TABLE IF NOT EXISTS orders (
  id TEXT PRIMARY KEY,
  person_name TEXT NOT NULL,
  notes TEXT,
  items JSONB NOT NULL,
  total_items INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'Ordered',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  cancelled_at TIMESTAMP WITH TIME ZONE
);

-- Create index on created_at for faster queries
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);

-- Create index on status for filtering
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);

-- Enable Row Level Security (optional, for production security)
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all operations (adjust for production security)
CREATE POLICY "Allow all access to orders" ON orders
  FOR ALL
  USING (true)
  WITH CHECK (true);
```

5. Click "Run" to execute the SQL

## 5. Restart Your Development Server

After setting up the environment variables, restart your Next.js dev server:

```bash
npm run dev
```

## How It Works

- The application will try to use Supabase first
- If Supabase credentials are not set or connection fails, it falls back to in-memory storage
- All order operations (create, read, cancel, delete, analytics) are stored in Supabase
- Data persists across server restarts when using Supabase

## Security Notes

For production deployment:

1. **Enable proper RLS policies**: The current policy allows all access. Update it based on your security requirements.
2. **Use service role key for server operations**: For admin operations, use the service role key instead of the anon key.
3. **Add authentication**: Implement user authentication to restrict access to orders.
4. **Environment variables**: Never commit `.env.local` to version control.

## Troubleshooting

**Orders not persisting?**
- Check that environment variables are set correctly
- Verify Supabase project is active
- Check browser console for errors
- Check server logs for Supabase connection warnings

**Connection errors?**
- Verify your Supabase project URL and anon key
- Ensure your project is not paused
- Check network connectivity
