'use client';

import { useEffect, useState, use } from 'react';
import Link from 'next/link';
import { Loader2, ArrowLeft, Calendar } from 'lucide-react';
import { PageContainer } from '@/components/layout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { CampaignStats } from '@/components/campaigns/CampaignStats';
import { CampaignChart } from '@/components/campaigns/CampaignChart';
import { SequenceStepsTable } from '@/components/campaigns/SequenceStepsTable';
import { STATUS_COLORS, DATE_RANGES } from '@/lib/constants';
import { cn, getDateRange } from '@/lib/utils';
import type { Campaign, CampaignStats as CampaignStatsType, ChartDataSeries } from '@/lib/types/emailbison';
import { toast } from 'sonner';

export default function CampaignDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [stats, setStats] = useState<CampaignStatsType | null>(null);
  const [chartData, setChartData] = useState<ChartDataSeries[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dateRange, setDateRange] = useState(30);

  useEffect(() => {
    const fetchCampaign = async () => {
      try {
        const response = await fetch(`/api/emailbison/campaigns/${id}`);
        if (!response.ok) throw new Error('Failed to fetch campaign');
        const data = await response.json();
        setCampaign(data.data);
      } catch (error) {
        console.error('Error fetching campaign:', error);
        toast.error('Failed to load campaign');
      }
    };

    fetchCampaign();
  }, [id]);

  useEffect(() => {
    const fetchStats = async () => {
      if (!campaign) return;

      const { start_date, end_date } = getDateRange(dateRange);

      try {
        setIsLoading(true);

        // Fetch stats and chart data in parallel
        const [statsResponse, chartResponse] = await Promise.all([
          fetch(`/api/emailbison/campaigns/${id}/stats`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ start_date, end_date }),
          }),
          fetch(
            `/api/emailbison/campaigns/${id}/chart?start_date=${start_date}&end_date=${end_date}`
          ),
        ]);

        if (statsResponse.ok) {
          const statsData = await statsResponse.json();
          setStats(statsData.data);
        }

        if (chartResponse.ok) {
          const chartDataRes = await chartResponse.json();
          setChartData(chartDataRes.data || []);
        }
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, [id, campaign, dateRange]);

  if (!campaign) {
    return (
      <PageContainer>
        <div className="flex h-full items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </PageContainer>
    );
  }

  const statusColor =
    STATUS_COLORS[campaign.status.toLowerCase()] || STATUS_COLORS.draft;

  return (
    <PageContainer className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon-sm" asChild>
              <Link href="/campaigns">
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <h2 className="text-2xl font-bold">{campaign.name}</h2>
            <Badge className={cn(statusColor.bg, statusColor.text, 'border-0')}>
              {campaign.status}
            </Badge>
          </div>
          <p className="text-muted-foreground">
            {campaign.type === 'outbound' ? 'Outbound Campaign' : 'Reply Follow-up'}{' '}
            &bull; {campaign.total_leads} leads
          </p>
        </div>

        {/* Date Range Selector */}
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <Select
            value={String(dateRange)}
            onValueChange={(v) => setDateRange(Number(v))}
          >
            <SelectTrigger className="w-[150px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {DATE_RANGES.map((range) => (
                <SelectItem key={range.value} value={String(range.value)}>
                  {range.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {isLoading ? (
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <>
          {/* Stats */}
          {stats && <CampaignStats stats={stats} />}

          {/* Chart */}
          <CampaignChart data={chartData} />

          {/* Sequence Steps */}
          {stats?.sequence_step_stats && (
            <SequenceStepsTable steps={stats.sequence_step_stats} />
          )}
        </>
      )}
    </PageContainer>
  );
}
