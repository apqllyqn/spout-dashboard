import { NextRequest, NextResponse } from 'next/server';
import { getCampaignSequenceSteps, getCampaignStats } from '@/lib/api/emailbison';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const campaignId = parseInt(id);

    // First try to get full sequence steps
    const sequenceResponse = await getCampaignSequenceSteps(campaignId);

    if (sequenceResponse.data && sequenceResponse.data.length > 0) {
      return NextResponse.json(sequenceResponse);
    }

    // Fallback: use stats endpoint to get sequence_step_stats (subjects + metrics only)
    const today = new Date().toISOString().split('T')[0];
    const startDate = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    try {
      const statsResponse = await getCampaignStats(campaignId, startDate, today);

      if (statsResponse.data?.sequence_step_stats && statsResponse.data.sequence_step_stats.length > 0) {
        // Convert stats to sequence format (no body content available)
        const fallbackData = statsResponse.data.sequence_step_stats.map((stat, idx) => ({
          id: stat.sequence_step_id || idx,
          sequence_step_id: String(stat.sequence_step_id),
          order: idx + 1,
          subject: stat.email_subject || '',
          body: '', // Body not available from stats endpoint
          sent: stat.sent,
          unique_replies: stat.unique_replies,
          reply_rate: stat.sent > 0 ? parseFloat(((stat.unique_replies / stat.sent) * 100).toFixed(2)) : 0,
          interested: stat.interested,
          bounced: stat.bounced,
        }));

        return NextResponse.json({
          data: fallbackData,
          note: 'Body content not available - showing subjects and metrics only'
        });
      }
    } catch {
      // Stats fallback also failed
    }

    // If all fails, return empty
    return NextResponse.json({ data: [] });
  } catch (error) {
    console.error('Campaign sequence fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch campaign sequence' },
      { status: 500 }
    );
  }
}
