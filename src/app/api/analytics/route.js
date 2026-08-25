import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const yearParam = searchParams.get('year');
    const monthParam = searchParams.get('month');

    const year = (yearParam && yearParam !== 'all') ? parseInt(yearParam, 10) : null;
    const month = (monthParam !== null && monthParam !== undefined && monthParam !== 'all' && monthParam !== '') ? parseInt(monthParam, 10) : undefined;

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
