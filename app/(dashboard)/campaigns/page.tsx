'use client';

import { useEffect, useState, useMemo } from 'react';
import { Loader2, Users, Mail, TrendingUp, MessageSquare } from 'lucide-react';
import { PageContainer } from '@/components/layout';
import { CampaignList } from '@/components/campaigns/CampaignList';
import type { Campaign } from '@/lib/types/emailbison';
import { toast } from 'sonner';

export default function CampaignsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCampaigns = async () => {
      try {
        const response = await fetch('/api/emailbison/campaigns');
        if (!response.ok) throw new Error('Failed to fetch campaigns');
        const data = await response.json();
        setCampaigns(data.data || []);
      } catch (error) {
        console.error('Error fetching campaigns:', error);
        toast.error('Failed to load campaigns');
      } finally {
        setIsLoading(false);
      }
    };

    fetchCampaigns();
  }, []);

  // Calculate accurate aggregate stats
  const stats = useMemo(() => {
    const totals = campaigns.reduce(
      (acc, c) => ({
        leadsContacted: acc.leadsContacted + c.total_leads_contacted,
        interested: acc.interested + c.interested,
        replies: acc.replies + c.unique_replies,
        sent: acc.sent + c.emails_sent,
      }),
      { leadsContacted: 0, interested: 0, replies: 0, sent: 0 }
    );

    const responseRate = totals.leadsContacted > 0
      ? Math.round((totals.interested / totals.leadsContacted) * 1000) / 10
      : 0;

    return { ...totals, responseRate };
  }, [campaigns]);

  if (isLoading) {
    return (
      <PageContainer>
        <div className="flex h-full items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Campaigns</h2>
        <p className="text-muted-foreground">
          {campaigns.length} campaigns across all verticals
        </p>
      </div>

      {/* Aggregate Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <div className="rounded-lg border bg-card p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
              <Mail className="h-5 w-5 text-blue-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{campaigns.length}</p>
              <p className="text-sm text-muted-foreground">Campaigns</p>
            </div>
          </div>
        </div>
        <div className="rounded-lg border bg-card p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-indigo-500/10 flex items-center justify-center">
              <Users className="h-5 w-5 text-indigo-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.leadsContacted.toLocaleString()}</p>
              <p className="text-sm text-muted-foreground">Leads Contacted</p>
            </div>
          </div>
        </div>
        <div className="rounded-lg border bg-card p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
              <MessageSquare className="h-5 w-5 text-purple-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.sent.toLocaleString()}</p>
              <p className="text-sm text-muted-foreground">Messages Sent</p>
            </div>
          </div>
        </div>
        <div className="rounded-lg border bg-card p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
              <TrendingUp className="h-5 w-5 text-green-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.interested}</p>
              <p className="text-sm text-muted-foreground">Interested</p>
            </div>
          </div>
        </div>
        <div className="rounded-lg border bg-card p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
              <TrendingUp className="h-5 w-5 text-emerald-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.responseRate}%</p>
              <p className="text-sm text-muted-foreground">Response Rate</p>
            </div>
          </div>
        </div>
      </div>

      <CampaignList campaigns={campaigns} />
    </PageContainer>
  );
}
