import { NextResponse } from 'next/server';
import { getUser } from '@/lib/api/emailbison';

export async function GET() {
  try {
    const response = await getUser();
    return NextResponse.json(response);
  } catch (error) {
    console.error('User fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user' },
      { status: 500 }
    );
  }
}
