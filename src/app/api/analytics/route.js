import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const year = searchParams.get('year') ? parseInt(searchParams.get('year')) : null;
    const month = searchParams.get('month') ? parseInt(searchParams.get('month')) : undefined;

    const analytics = await db.getAnalytics(year, month);
    return NextResponse.json({ success: true, analytics });
  } catch (error) {
    console.error('API analytics error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch analytics' },
      { status: 500 }
    );
  }
}
