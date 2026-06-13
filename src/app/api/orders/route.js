import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const orders = await db.getOrders();
    return NextResponse.json({ success: true, orders });
  } catch (error) {
    console.error('API get orders error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch orders' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    
    if (!body.items || !Array.isArray(body.items) || body.items.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Order must contain at least one item' },
        { status: 400 }
      );
    }
    
    if (!body.personName || body.personName.trim() === '') {
      return NextResponse.json(
        { success: false, error: 'Your Name is required' },
        { status: 400 }
      );
    }

    const newOrder = await db.createOrder({
      personName: body.personName.trim(),
      notes: body.notes ? body.notes.trim() : '',
      items: body.items
    });

    return NextResponse.json({ success: true, order: newOrder }, { status: 201 });
  } catch (error) {
    console.error('API create order error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to submit order' },
      { status: 500 }
    );
  }
}

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const orderId = searchParams.get('id');
    
    if (!orderId) {
      return NextResponse.json(
        { success: false, error: 'Order ID is required' },
        { status: 400 }
      );
    }

    const cancelledOrder = await db.cancelOrder(orderId);
    
    if (!cancelledOrder) {
      return NextResponse.json(
        { success: false, error: 'Order not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, order: cancelledOrder });
  } catch (error) {
    console.error('API cancel order error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to cancel order' },
      { status: 500 }
    );
  }
}
