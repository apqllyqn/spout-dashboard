import { NextResponse } from 'next/server';
import type {
  Campaign,
  CampaignPerformance,
  InterestedLeadDetail,
  ReportInsight,
  PerformanceReport
} from '@/lib/types/emailbison';

const EMAILBISON_API_URL = process.env.EMAILBISON_API_URL || 'https://spellcast.hirecharm.com';
const EMAILBISON_API_TOKEN = process.env.EMAILBISON_API_TOKEN || '';

interface Reply {
  id: number;
  subject: string;
  from_email_address: string;
  from_name: string;
  text_body: string;
  html_body: string;
  interested: boolean;
  automated_reply: boolean;
  folder: string;
  campaign_id: number;
  lead_id: number | null;
  date_received: string;
}

interface Lead {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  company: string | null;
  title: string | null;
  custom_variables: Array<{ name: string; value: string | null }>;
  lead_campaign_data: Array<{
    campaign_id: number;
    interested: boolean;
    status: string;
    replies: number;
  }>;
  overall_stats: {
    replies: number;
    unique_replies: number;
  };
}

async function fetchApi<T>(endpoint: string): Promise<T> {
  const response = await fetch(`${EMAILBISON_API_URL}${endpoint}`, {
    headers: {
      'Authorization': `Bearer ${EMAILBISON_API_TOKEN}`,
      'Accept': 'application/json',
    },
    next: { revalidate: 300 }, // Cache for 5 minutes
  });
  if (!response.ok) throw new Error(`API error: ${response.status}`);
  return response.json();
}

async function postApi<T>(endpoint: string, body: object): Promise<T> {
  const response = await fetch(`${EMAILBISON_API_URL}${endpoint}`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${EMAILBISON_API_TOKEN}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify(body),
    next: { revalidate: 300 }, // Cache for 5 minutes
  });
  if (!response.ok) throw new Error(`API error: ${response.status}`);
  return response.json();
}

// Filter out bounce/auto-reply messages and find real interest
function isRealInterest(reply: Reply): boolean {
  const subject = reply.subject.toLowerCase();
  const body = (reply.text_body || '').toLowerCase();
  const fromEmail = reply.from_email_address.toLowerCase();

  // If marked as automated reply by the system, skip it
  if (reply.automated_reply) {
    return false;
  }

  // Exclude mail server bounces by email
  if (fromEmail.includes('postmaster') || fromEmail.includes('mailer-daemon') ||
      fromEmail.includes('noreply@') || fromEmail.includes('no-reply@')) {
    return false;
  }

  // Exclude bounces by subject
  if (subject.includes('undeliverable') || subject.includes('delivery status') ||
      subject.includes('delivery failed') || subject.includes('returned mail')) {
    return false;
  }

  // Exclude bounces by body content
  if (body.includes('delivery has failed') ||
      body.includes('message could not be delivered') ||
      body.includes('550 ') || body.includes('554 ')) {
    return false;
  }

  // Exclude out of office
  if (subject.includes('out of office') || subject.includes('automatic reply') ||
      body.includes('out of office') || body.includes('i am currently out')) {
    return false;
  }

  // Exclude clear negative responses
  if (body.includes('unsubscribe me') || body.includes('remove me from') ||
      body.includes('stop emailing me') || body.includes('not interested')) {
    return false;
  }

  // Since we're fetching with folder=inbox&interested=1, the API has already
  // filtered for interested replies. Just return true if we pass the checks above.
  return true;
}

function extractIndustry(lead: Lead, campaignName: string): string {
  // Check custom variables first
  const category = lead.custom_variables?.find(v => v.name === 'category')?.value;
  if (category) return category;

  // Fall back to campaign name
  const lower = campaignName.toLowerCase();
  if (lower.includes('solar')) return 'Solar';
  if (lower.includes('retail')) return 'Retail';
  if (lower.includes('prepper')) return 'Preparedness';
  if (lower.includes('van life')) return 'Outdoor/RV';
  if (lower.includes('water')) return 'Water Systems';
  if (lower.includes('hotel') || lower.includes('resort')) return 'Hospitality';
  if (lower.includes('tiny home') || lower.includes('adu')) return 'Construction';
  if (lower.includes('warehouse')) return 'Wholesale';
  return 'Other';
}

interface CampaignWithSubject {
  campaign: Campaign;
  subjectLine: string;
  interestRate: number;
  replyRate: number;
}

function buildCopyAnalysis(campaignDetails: CampaignWithSubject[]): {
  subjects: {
    topPerformers: Array<{ subject: string; campaign: string; interestRate: number; replyRate: number; sent: number }>;
    bottomPerformers: Array<{ subject: string; campaign: string; interestRate: number; replyRate: number; sent: number }>;
    patterns: { avgLength: { top: number; bottom: number }; hasPersonalization: { top: number; bottom: number }; hasQuestion: { top: number; bottom: number } };
  };
  summary: { topAvgInterest: number; bottomAvgInterest: number; totalCampaignsAnalyzed: number };
} {
  // Sort campaigns by interest rate
  const sorted = [...campaignDetails].sort((a, b) => b.interestRate - a.interestRate);
  const withInterest = sorted.filter(c => c.campaign.emails_sent >= 100); // Only analyze campaigns with meaningful volume

  // Deduplicate by subject line - keep best performer for each unique subject
  const seenSubjectsTop = new Set<string>();
  const topCampaigns = withInterest.filter(c => {
    const subjectKey = c.subjectLine.toLowerCase().trim();
    if (seenSubjectsTop.has(subjectKey)) return false;
    seenSubjectsTop.add(subjectKey);
    return true;
  }).slice(0, 5);

  // For bottom performers, work from the end (worst first), dedupe
  const seenSubjectsBottom = new Set<string>();
  const reversedForBottom = [...withInterest].reverse();
  const bottomCampaigns = reversedForBottom.filter(c => {
    const subjectKey = c.subjectLine.toLowerCase().trim();
    if (seenSubjectsBottom.has(subjectKey)) return false;
    seenSubjectsBottom.add(subjectKey);
    return true;
  }).slice(0, 5);

  // Build subject line analysis
  const topSubjects = topCampaigns.map(c => ({
    subject: c.subjectLine,
    campaign: c.campaign.name.split(':')[0].split('-')[0].trim(),
    interestRate: c.interestRate,
    replyRate: c.replyRate,
    sent: c.campaign.emails_sent,
  }));

  const bottomSubjects = bottomCampaigns.map(c => ({
    subject: c.subjectLine,
    campaign: c.campaign.name.split(':')[0].split('-')[0].trim(),
    interestRate: c.interestRate,
    replyRate: c.replyRate,
    sent: c.campaign.emails_sent,
  }));

  // Calculate subject patterns
  const calcAvgLength = (subjects: typeof topSubjects) =>
    subjects.length ? Math.round(subjects.reduce((sum, s) => sum + s.subject.length, 0) / subjects.length) : 0;

  const calcPersonalization = (subjects: typeof topSubjects) => {
    if (!subjects.length) return 0;
    const withVars = subjects.filter(s => s.subject.includes('{{') || s.subject.includes('{{')).length;
    return Math.round((withVars / subjects.length) * 100);
  };

  const calcQuestion = (subjects: typeof topSubjects) => {
    if (!subjects.length) return 0;
    const withQuestion = subjects.filter(s => s.subject.includes('?')).length;
    return Math.round((withQuestion / subjects.length) * 100);
  };

  return {
    subjects: {
      topPerformers: topSubjects,
      bottomPerformers: bottomSubjects,
      patterns: {
        avgLength: { top: calcAvgLength(topSubjects), bottom: calcAvgLength(bottomSubjects) },
        hasPersonalization: { top: calcPersonalization(topSubjects), bottom: calcPersonalization(bottomSubjects) },
        hasQuestion: { top: calcQuestion(topSubjects), bottom: calcQuestion(bottomSubjects) },
      },
    },
    summary: {
      topAvgInterest: topCampaigns.length
        ? parseFloat((topCampaigns.reduce((s, c) => s + c.interestRate, 0) / topCampaigns.length).toFixed(2))
        : 0,
      bottomAvgInterest: bottomCampaigns.length
        ? parseFloat((bottomCampaigns.reduce((s, c) => s + c.interestRate, 0) / bottomCampaigns.length).toFixed(2))
        : 0,
      totalCampaignsAnalyzed: withInterest.length,
    },
  };
}

interface User {
  id: number;
  name: string;
  email: string;
  workspace?: { id: number; name: string };
  team?: { id: number; name: string };
}

export async function GET(request: Request) {
  try {
    // Check for workspace_id query parameter
    const url = new URL(request.url);
    const workspaceId = url.searchParams.get('workspace_id');

    // Switch workspace if specified, otherwise default to Spout (13)
    const targetWorkspaceId = workspaceId ? parseInt(workspaceId) : 13; // Default to Spout
    try {
      await postApi<{ data: { id: number; name: string } }>('/api/workspaces/switch-workspace', {
        team_id: targetWorkspaceId
      });
    } catch {
      // Continue with current workspace if switch fails
    }

    // Fetch user info to get workspace name
    let workspaceName = 'EmailBison';
    try {
      const userResponse = await fetchApi<{ data: User }>('/api/users');
      workspaceName = userResponse.data.workspace?.name || userResponse.data.team?.name || 'EmailBison';
    } catch {
      // Fall back to default name
    }

    // Fetch all campaigns
    const { data: campaigns } = await fetchApi<{ data: Campaign[] }>('/api/campaigns');
    // Only include Active, Completed, Launching campaigns (exclude Draft, Paused, Failed, Archived, Stopped)
    const activeCampaigns = campaigns.filter(c =>
      c.emails_sent > 0 &&
      ['Active', 'Completed', 'Launching'].includes(c.status)
    );

    // Fetch interested replies from Inbox folder (paginated)
    // Note: API ignores per_page and returns 15 per page, so we need many pages
    let allReplies: Reply[] = [];
    let page = 1;
    const maxPages = 100; // Fetch up to 1500 interested replies (15 per page)

    while (page <= maxPages) {
      try {
        // Use folder=inbox and interested=1 for filtering interested replies
        const repliesResponse = await fetchApi<{
          data: Reply[];
          meta?: { last_page: number; current_page: number }
        }>(`/api/replies?folder=inbox&interested=1&page=${page}`);

        if (Array.isArray(repliesResponse.data)) {
          allReplies = [...allReplies, ...repliesResponse.data];
          if (!repliesResponse.meta || page >= repliesResponse.meta.last_page) break;
        } else {
          break;
        }
        page++;
      } catch {
        break;
      }
    }

    // Filter for REAL interested replies (not bounces/OOO)
    // Also filter to only include replies from campaigns in this workspace
    const campaignIds = new Set(activeCampaigns.map(c => c.id));
    const realInterestedReplies = allReplies.filter(reply =>
      isRealInterest(reply) && campaignIds.has(reply.campaign_id)
    );

    // Get campaign stats with subject lines
    const campaignDetailsRaw = await Promise.all(
      activeCampaigns.slice(0, 15).map(async (campaign) => {
        try {
          const statsResponse = await postApi<{
            data: {
              sequence_step_stats?: Array<{
                email_subject: string;
                sent: number;
                unique_replies: number;
                interested: number;
              }>;
            };
          }>(`/api/campaigns/${campaign.id}/stats`, {
            start_date: '2024-01-01',
            end_date: new Date().toISOString().split('T')[0],
          });

          const subjectLine = statsResponse.data.sequence_step_stats?.[0]?.email_subject || '';
          const cleanSubject = subjectLine.split('|')[0].replace('{', '').replace('}', '').trim();

          return { campaign, subjectLine: cleanSubject || campaign.name };
        } catch {
          return { campaign, subjectLine: campaign.name };
        }
      })
    );

    // Enrich campaign details with rates for analysis
    // IMPORTANT: Use total_leads_contacted (unique people) not emails_sent (includes follow-ups)
    const campaignDetails: CampaignWithSubject[] = campaignDetailsRaw.map(({ campaign, subjectLine }) => {
      const denominator = campaign.total_leads_contacted > 0 ? campaign.total_leads_contacted : campaign.emails_sent;
      return {
        campaign,
        subjectLine,
        interestRate: denominator > 0
          ? parseFloat(((campaign.interested / denominator) * 100).toFixed(2))
          : 0,
        replyRate: denominator > 0
          ? parseFloat(((campaign.unique_replies / denominator) * 100).toFixed(2))
          : 0,
      };
    });

    // Build campaign performances with extended stats
    const campaignPerformances: CampaignPerformance[] = campaignDetails
      .map(({ campaign, subjectLine, interestRate, replyRate }) => ({
        rank: 0,
        id: campaign.id,
        name: campaign.name,
        subjectLine,
        replyRate,
        interestRate,
        // Extended stats for expanded view
        leadsContacted: campaign.total_leads_contacted,
        emailsSent: campaign.emails_sent,
        uniqueReplies: campaign.unique_replies,
        interested: campaign.interested,
        bounced: campaign.bounced,
        bounceRate: campaign.emails_sent > 0
          ? parseFloat(((campaign.bounced / campaign.emails_sent) * 100).toFixed(2))
          : 0,
      }))
      .sort((a, b) => b.interestRate - a.interestRate)
      .map((c, i) => ({ ...c, rank: i + 1 }));

    // Build data-driven copy analysis
    const copyAnalysis = buildCopyAnalysis(campaignDetails);

    // Build enhanced lead details from replies
    const campaignMap = new Map(campaigns.map(c => [c.id, c.name]));
    const leadsMap = new Map<string, InterestedLeadDetail>();

    // Extract industry from campaign name
    function extractIndustryFromCampaign(campaignName: string): string {
      const lower = campaignName.toLowerCase();
      if (lower.includes('solar')) return 'Solar';
      if (lower.includes('retail')) return 'Retail';
      if (lower.includes('prepper')) return 'Preparedness';
      if (lower.includes('van life')) return 'Outdoor/RV';
      if (lower.includes('water')) return 'Water Systems';
      if (lower.includes('hotel') || lower.includes('resort')) return 'Hospitality';
      if (lower.includes('tiny home') || lower.includes('adu')) return 'Construction';
      if (lower.includes('warehouse')) return 'Wholesale';
      if (lower.includes('software') || lower.includes('saas')) return 'Software';
      if (lower.includes('agency')) return 'Agency';
      return 'Other';
    }

    // Build lead details from replies (dedupe by email)
    for (const reply of realInterestedReplies) {
      const email = reply.from_email_address.toLowerCase();
      if (leadsMap.has(email)) continue; // Skip duplicates

      const campaignName = campaignMap.get(reply.campaign_id) || 'Unknown Campaign';

      // Extract company from email domain
      const domain = email.split('@')[1] || '';
      const companyFromDomain = domain.split('.')[0] || '';
      const company = companyFromDomain.charAt(0).toUpperCase() + companyFromDomain.slice(1);

      leadsMap.set(email, {
        id: reply.lead_id || reply.id,
        email,
        name: reply.from_name || email.split('@')[0],
        company,
        title: '',
        industry: extractIndustryFromCampaign(campaignName),
        campaign: campaignName.split(':')[0].split('-')[0].trim(),
        campaignId: reply.campaign_id,
        subject: reply.subject.replace(/^Re:\s*/i, '').replace(/^\[External\]\s*/i, '').trim(),
        replyPreview: (reply.text_body || '').substring(0, 200).trim(),
        replyDate: reply.date_received,
        replyId: reply.id,
      });
    }

    // Aggregate metrics first (needed for lead count)
    const totalCampaigns = activeCampaigns.length;
    const totalSent = activeCampaigns.reduce((sum, c) => sum + c.emails_sent, 0);
    const totalLeadsContacted = activeCampaigns.reduce((sum, c) => sum + c.total_leads_contacted, 0);
    const totalReplies = activeCampaigns.reduce((sum, c) => sum + c.unique_replies, 0);
    const totalInterested = activeCampaigns.reduce((sum, c) => sum + c.interested, 0);
    // Use total_leads_contacted (unique people) not emails_sent (includes follow-ups)
    const avgResponseRate = totalLeadsContacted > 0 ? (totalReplies / totalLeadsContacted) * 100 : 0;

    // Convert to array and sort by date (most recent first)
    let interestedLeads = Array.from(leadsMap.values());
    interestedLeads.sort((a, b) => new Date(b.replyDate).getTime() - new Date(a.replyDate).getTime());

    // Cap to totalInterested to match EmailBison's authoritative count
    // The replies API may return more leads than campaign stats count
    if (interestedLeads.length > totalInterested) {
      interestedLeads = interestedLeads.slice(0, totalInterested);
    }

    // Extract unique campaigns and industries for filters
    const uniqueCampaigns = [...new Set(interestedLeads.map(l => l.campaign))].sort();
    const uniqueIndustries = [...new Set(interestedLeads.map(l => l.industry))].sort();

    // Generate insights
    const insights: ReportInsight[] = [];

    // Top performer
    if (campaignPerformances[0]?.interestRate > 0) {
      insights.push({
        type: 'success',
        emoji: '🏆',
        headline: `"${campaignPerformances[0].name.split(':')[0]}" leads at ${campaignPerformances[0].interestRate}%`,
        detail: `Subject: "${campaignPerformances[0].subjectLine}"`
      });
    }

    // Real interested count
    insights.push({
      type: 'success',
      emoji: '📧',
      headline: `${realInterestedReplies.length} verified interested replies`,
      detail: `Out of ${allReplies.length} total flagged as interested (filtered bounces/OOO)`
    });

    // Reply-to-interest gap
    const gapCampaigns = campaignPerformances.filter(c => c.replyRate > 3 && c.interestRate < 2);
    if (gapCampaigns.length > 0) {
      insights.push({
        type: 'warning',
        emoji: '⚠️',
        headline: `${gapCampaigns.length} campaigns with reply-interest gap`,
        detail: 'High replies but low interest - messaging may need refinement'
      });
    }

    // Low performers (below 1% interest rate)
    const lowPerformingCount = campaignPerformances.filter(c => c.interestRate < 1).length;
    if (lowPerformingCount > 2) {
      insights.push({
        type: 'warning',
        emoji: '⚠️',
        headline: `${lowPerformingCount} campaigns below 1% interest`,
        detail: 'Consider A/B testing subject lines and value propositions'
      });
    }

    // Volume insight
    insights.push({
      type: 'info',
      emoji: '📊',
      headline: `${totalSent.toLocaleString()} emails → ${totalInterested} interested`,
      detail: `${((totalInterested / totalSent) * 100).toFixed(2)}% overall interest rate`
    });

    // Next step recommendation
    const avgInterest = campaignPerformances.reduce((s, c) => s + c.interestRate, 0) / campaignPerformances.length;
    insights.push({
      type: 'next_step',
      emoji: '🚀',
      headline: avgInterest < 1.5 ? 'Test pain-first messaging' : 'Scale winning campaigns',
      detail: avgInterest < 1.5
        ? 'Low overall interest - try more specific, problem-focused subjects'
        : 'Strong interest rates - increase volume on top performers'
    });

    // Build report
    const report: PerformanceReport = {
      workspaceName,
      cycleNumber: 1,
      startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', {
        month: 'long', day: 'numeric', year: 'numeric',
      }),
      endDate: new Date().toLocaleDateString('en-US', {
        month: 'long', day: 'numeric', year: 'numeric',
      }),
      heroMetrics: {
        totalCampaigns,
        leadsContacted: totalLeadsContacted,
        messagesSent: totalSent,
        avgResponseRate: parseFloat(avgResponseRate.toFixed(1)),
        emailPositives: totalInterested, // Sum from campaign stats (authoritative)
      },
      campaigns: campaignPerformances,
      copyAnalysis,
      interestedLeads,
      filters: {
        campaigns: uniqueCampaigns,
        industries: uniqueIndustries,
      },
      insights,
    };

    return NextResponse.json({ data: report });
  } catch (error) {
    console.error('Report generation error:', error);
    return NextResponse.json({ error: 'Failed to generate report' }, { status: 500 });
  }
}
