import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const items = db.getItems();
    return NextResponse.json({ success: true, items });
  } catch (error) {
    console.error('API items error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch items' },
      { status: 500 }
    );
  }
}
