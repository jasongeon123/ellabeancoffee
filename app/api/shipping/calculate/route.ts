import { NextRequest, NextResponse } from 'next/server';
import { calculateShipping, isValidZipCode, isValidStateCode } from '@/lib/shipping';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { address, city, state, zip, country, cartSubtotal } = body;

    // Validation
    if (!address || !city || !state || !zip) {
      return NextResponse.json(
        { error: 'Missing required address fields' },
        { status: 400 }
      );
    }

    // Validate ZIP code format
    if (!isValidZipCode(zip)) {
      return NextResponse.json(
        { error: 'Invalid ZIP code format' },
        { status: 400 }
      );
    }

    // Validate state code
    if (!isValidStateCode(state)) {
      return NextResponse.json(
        { error: 'Invalid state code' },
        { status: 400 }
      );
    }

    // Validate cart subtotal
    if (typeof cartSubtotal !== 'number' || cartSubtotal < 0) {
      return NextResponse.json(
        { error: 'Invalid cart subtotal' },
        { status: 400 }
      );
    }

    // Calculate shipping
    const shippingResult = calculateShipping(
      { address, city, state, zip, country },
      cartSubtotal
    );

    return NextResponse.json(shippingResult);
  } catch (error) {
    console.error('Shipping calculation error:', error);
    return NextResponse.json(
      { error: 'Failed to calculate shipping' },
      { status: 500 }
    );
  }
}
