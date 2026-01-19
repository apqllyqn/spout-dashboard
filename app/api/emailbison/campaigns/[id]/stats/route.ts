import { NextRequest, NextResponse } from 'next/server';
import { getCampaignStats } from '@/lib/api/emailbison';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { start_date, end_date } = body;

    if (!start_date || !end_date) {
      return NextResponse.json(
        { error: 'start_date and end_date are required' },
        { status: 400 }
      );
    }

    const response = await getCampaignStats(parseInt(id), start_date, end_date);
    return NextResponse.json(response);
  } catch (error) {
    console.error('Campaign stats fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch campaign stats' },
      { status: 500 }
    );
  }
}
