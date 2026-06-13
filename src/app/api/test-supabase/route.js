import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase.js';

export async function GET() {
  const diagnostics = {
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'SET' : 'NOT SET',
    supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'SET' : 'NOT SET',
    supabaseUrlLength: process.env.NEXT_PUBLIC_SUPABASE_URL?.length || 0,
    supabaseKeyLength: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.length || 0,
  };

  // Test Supabase connection
  try {
    const { data, error } = await supabase
      .from('orders')
      .select('count')
      .limit(1);

    diagnostics.supabaseConnection = error ? 'FAILED' : 'SUCCESS';
    diagnostics.supabaseError = error ? error.message : null;
    diagnostics.supabaseErrorCode = error ? error.code : null;
  } catch (err) {
    diagnostics.supabaseConnection = 'EXCEPTION';
    diagnostics.supabaseError = err.message;
  }

  return NextResponse.json(diagnostics);
}
