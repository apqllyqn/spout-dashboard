'use client';

import { useEffect, useState } from 'react';
import { Loader2, Users, Mail, TrendingUp, MessageSquare } from 'lucide-react';
import { PageContainer } from '@/components/layout';
import { CampaignListFromReport } from '@/components/campaigns/CampaignListFromReport';
import { toast } from 'sonner';

interface CampaignPerformance {
  rank: number;
  id: number;
  name: string;
  subjectLine: string;
  replyRate: number;
  interestRate: number;
  leadsContacted: number;
  emailsSent: number;
  uniqueReplies: number;
  interested: number;
}

interface ReportData {
  campaigns: CampaignPerformance[];
  heroMetrics: {
    totalCampaigns: number;
    leadsContacted: number;
    messagesSent: number;
    avgResponseRate: number;
    emailPositives: number;
  };
}

export default function CampaignsPage() {
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchReport = async () => {
      try {
        // Use the report API which has accurate, filtered data
        const response = await fetch('/api/report');
        if (!response.ok) throw new Error('Failed to fetch report');
        const json = await response.json();
        // API returns { data: { ... } }
        setReportData(json.data);
      } catch (error) {
        console.error('Error fetching report:', error);
        toast.error('Failed to load campaigns');
      } finally {
        setIsLoading(false);
      }
    };

    fetchReport();
  }, []);

  if (isLoading || !reportData) {
    return (
      <PageContainer>
        <div className="flex h-full items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </PageContainer>
    );
  }

  const { campaigns, heroMetrics } = reportData;

  return (
    <PageContainer className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Campaigns</h2>
        <p className="text-muted-foreground">
          {heroMetrics.totalCampaigns} campaigns across all verticals
        </p>
      </div>

      {/* Aggregate Stats - from report API (accurate, filtered data) */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <div className="rounded-lg border bg-card p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
              <Mail className="h-5 w-5 text-blue-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{heroMetrics.totalCampaigns}</p>
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
              <p className="text-2xl font-bold">{heroMetrics.leadsContacted.toLocaleString()}</p>
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
              <p className="text-2xl font-bold">{heroMetrics.messagesSent.toLocaleString()}</p>
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
              <p className="text-2xl font-bold">{heroMetrics.emailPositives}</p>
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
              <p className="text-2xl font-bold">{heroMetrics.avgResponseRate}%</p>
              <p className="text-sm text-muted-foreground">Response Rate</p>
            </div>
          </div>
        </div>
      </div>

      <CampaignListFromReport campaigns={campaigns} />
    </PageContainer>
  );
}
