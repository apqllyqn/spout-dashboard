'use client';

import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { PageContainer } from '@/components/layout';
import { OverviewStats } from '@/components/dashboard/OverviewStats';
import { CampaignCard } from '@/components/campaigns/CampaignCard';
import { useAuthStore } from '@/lib/stores';
import type { Campaign } from '@/lib/types/emailbison';
import { toast } from 'sonner';

export default function OverviewPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuthStore();

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

  if (isLoading) {
    return (
      <PageContainer>
        <div className="flex h-full items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </PageContainer>
    );
  }

  // Get recent campaigns (last 5)
  const recentCampaigns = [...campaigns]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 5);

  return (
    <PageContainer className="space-y-6">
      {/* Welcome */}
      <div>
        <h2 className="text-2xl font-bold">Welcome back, {user?.name?.split(' ')[0] || 'User'}</h2>
        <p className="text-muted-foreground">
          Here&apos;s an overview of your email campaigns
        </p>
      </div>

      {/* Stats */}
      <OverviewStats campaigns={campaigns} />

      {/* Recent Campaigns */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Recent Campaigns</h3>
        {recentCampaigns.length === 0 ? (
          <p className="text-muted-foreground">No campaigns yet</p>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {recentCampaigns.map((campaign) => (
              <CampaignCard key={campaign.id} campaign={campaign} />
            ))}
          </div>
        )}
      </div>
    </PageContainer>
  );
}
