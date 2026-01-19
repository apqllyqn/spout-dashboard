'use client';

import { Mail, Eye, MessageSquare, AlertTriangle, UserMinus, Star, Users } from 'lucide-react';
import { MetricCard } from '@/components/dashboard/MetricCard';
import type { CampaignStats as CampaignStatsType } from '@/lib/types/emailbison';

interface CampaignStatsProps {
  stats: CampaignStatsType;
}

export function CampaignStats({ stats }: CampaignStatsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <MetricCard
        title="Emails Sent"
        value={parseInt(stats.emails_sent)}
        subtitle={`${stats.total_leads_contacted} leads contacted`}
        icon={Mail}
      />
      <MetricCard
        title="Unique Opens"
        value={parseInt(stats.unique_opens_per_contact)}
        subtitle={`${stats.unique_opens_per_contact_percentage}% open rate`}
        icon={Eye}
      />
      <MetricCard
        title="Unique Replies"
        value={parseInt(stats.unique_replies_per_contact)}
        subtitle={`${stats.unique_replies_per_contact_percentage}% reply rate`}
        icon={MessageSquare}
      />
      <MetricCard
        title="Bounced"
        value={parseInt(stats.bounced)}
        subtitle={`${stats.bounced_percentage}% bounce rate`}
        icon={AlertTriangle}
      />
      <MetricCard
        title="Interested"
        value={parseInt(stats.interested)}
        subtitle={`${stats.interested_percentage}% interested`}
        icon={Star}
      />
      <MetricCard
        title="Unsubscribed"
        value={parseInt(stats.unsubscribed)}
        subtitle={`${stats.unsubscribed_percentage}% unsubscribed`}
        icon={UserMinus}
      />
    </div>
  );
}
