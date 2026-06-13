import { createClient } from '@supabase/supabase-js';

// These environment variables need to be set in your environment
// NEXT_PUBLIC_SUPABASE_URL=your-project-url
// NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase environment variables not set. Using in-memory fallback.');
}

// Create a mock client if credentials are missing to avoid build errors
const createMockClient = () => {
  const mockError = new Error('Supabase credentials not configured');
  return {
    from: () => ({
      select: () => ({ data: [], error: mockError }),
      insert: () => ({ data: null, error: mockError }),
      update: () => ({ data: null, error: mockError }),
      delete: () => ({ data: null, error: mockError }),
      order: () => ({ data: [], error: mockError }),
      gte: () => ({ lt: () => ({ data: [], error: mockError }) }),
    }),
  };
};

export const supabase = (supabaseUrl && supabaseAnonKey)
  ? createClient(supabaseUrl, supabaseAnonKey)
  : createMockClient();
