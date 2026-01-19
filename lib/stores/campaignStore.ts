import { create } from 'zustand';
import type { Campaign, CampaignStats, ChartDataSeries } from '@/lib/types/emailbison';

interface CampaignState {
  campaigns: Campaign[];
  selectedCampaign: Campaign | null;
  campaignStats: CampaignStats | null;
  chartData: ChartDataSeries[];
  isLoading: boolean;
  error: string | null;

  setCampaigns: (campaigns: Campaign[]) => void;
  setSelectedCampaign: (campaign: Campaign | null) => void;
  setCampaignStats: (stats: CampaignStats | null) => void;
  setChartData: (data: ChartDataSeries[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

export const useCampaignStore = create<CampaignState>((set) => ({
  campaigns: [],
  selectedCampaign: null,
  campaignStats: null,
  chartData: [],
  isLoading: false,
  error: null,

  setCampaigns: (campaigns) => set({ campaigns, error: null }),
  setSelectedCampaign: (selectedCampaign) => set({ selectedCampaign }),
  setCampaignStats: (campaignStats) => set({ campaignStats }),
  setChartData: (chartData) => set({ chartData }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error, isLoading: false }),
  reset: () =>
    set({
      campaigns: [],
      selectedCampaign: null,
      campaignStats: null,
      chartData: [],
      isLoading: false,
      error: null,
    }),
}));
