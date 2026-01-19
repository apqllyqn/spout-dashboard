'use client';

import { Mail, Eye, MessageSquare, AlertTriangle, Users, TrendingUp } from 'lucide-react';
import { MetricCard } from './MetricCard';
import type { Campaign } from '@/lib/types/emailbison';
import { calcPercent } from '@/lib/utils';

interface OverviewStatsProps {
  campaigns: Campaign[];
}

export function OverviewStats({ campaigns }: OverviewStatsProps) {
  // Aggregate stats from all campaigns
  const stats = campaigns.reduce(
    (acc, campaign) => {
      acc.totalEmailsSent += campaign.emails_sent;
      acc.totalOpens += campaign.opened;
      acc.totalReplies += campaign.replied;
      acc.totalBounced += campaign.bounced;
      acc.totalLeadsContacted += campaign.total_leads_contacted;
      acc.totalInterested += campaign.interested;
      return acc;
    },
    {
      totalEmailsSent: 0,
      totalOpens: 0,
      totalReplies: 0,
      totalBounced: 0,
      totalLeadsContacted: 0,
      totalInterested: 0,
    }
  );

  const activeCampaigns = campaigns.filter(c => c.status === 'Active').length;

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
      <MetricCard
        title="Total Campaigns"
        value={campaigns.length}
        subtitle={`${activeCampaigns} active`}
        icon={Mail}
      />
      <MetricCard
        title="Emails Sent"
        value={stats.totalEmailsSent}
        icon={Mail}
      />
      <MetricCard
        title="Open Rate"
        value={calcPercent(stats.totalOpens, stats.totalEmailsSent)}
        format="percent"
        icon={Eye}
      />
      <MetricCard
        title="Reply Rate"
        value={calcPercent(stats.totalReplies, stats.totalEmailsSent)}
        format="percent"
        icon={MessageSquare}
      />
      <MetricCard
        title="Bounce Rate"
        value={calcPercent(stats.totalBounced, stats.totalEmailsSent)}
        format="percent"
        icon={AlertTriangle}
      />
      <MetricCard
        title="Interested"
        value={stats.totalInterested}
        icon={TrendingUp}
      />
    </div>
  );
}
