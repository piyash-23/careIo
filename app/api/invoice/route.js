import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const body = await request.json();
    const { email, bookingId, totalCost, serviceTitle } = body;

    console.log(`[MOCK INVOICE] Sending invoice to ${email} for booking ${bookingId}`);
    console.log(`[MOCK INVOICE] Service: ${serviceTitle}, Total: $${totalCost}`);

    // Simulate some delay
    await new Promise(resolve => setTimeout(resolve, 500));

    return NextResponse.json({ 
      success: true, 
      message: 'Invoice sent successfully',
      details: { email, bookingId, totalCost }
    });
  } catch (error) {
    console.error('Invoice API Error:', error);
    return NextResponse.json({ success: false, error: 'Failed to process invoice' }, { status: 500 });
  }
}
