import { NextRequest, NextResponse } from 'next/server';
import { getCampaignChartStats } from '@/lib/api/emailbison';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const start_date = searchParams.get('start_date');
    const end_date = searchParams.get('end_date');

    if (!start_date || !end_date) {
      return NextResponse.json(
        { error: 'start_date and end_date are required' },
        { status: 400 }
      );
    }

    const response = await getCampaignChartStats(parseInt(id), start_date, end_date);
    return NextResponse.json(response);
  } catch (error) {
    console.error('Campaign chart stats fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch chart stats' },
      { status: 500 }
    );
  }
}
