'use client';

import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
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
          View and manage all your email campaigns
        </p>
      </div>

      <CampaignList campaigns={campaigns} />
    </PageContainer>
  );
}
