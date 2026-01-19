import { NextRequest, NextResponse } from 'next/server';
import { getCampaign } from '@/lib/api/emailbison';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const response = await getCampaign(parseInt(id));
    return NextResponse.json(response);
  } catch (error) {
    console.error('Campaign fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch campaign' },
      { status: 500 }
    );
  }
}
