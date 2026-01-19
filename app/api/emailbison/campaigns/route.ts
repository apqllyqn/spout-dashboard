import { NextRequest, NextResponse } from 'next/server';
import { getCampaigns } from '@/lib/api/emailbison';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || undefined;
    const status = searchParams.get('status') || undefined;

    const response = await getCampaigns({ search, status });
    return NextResponse.json(response);
  } catch (error) {
    console.error('Campaigns fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch campaigns' },
      { status: 500 }
    );
  }
}
