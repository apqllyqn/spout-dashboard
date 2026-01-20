'use client';

import { useState, useMemo } from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { formatNumber } from '@/lib/utils';

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

interface CampaignListFromReportProps {
  campaigns: CampaignPerformance[];
}

export function CampaignListFromReport({ campaigns }: CampaignListFromReportProps) {
  const [search, setSearch] = useState('');

  const filteredCampaigns = useMemo(() => {
    return campaigns.filter((campaign) =>
      campaign.name.toLowerCase().includes(search.toLowerCase())
    );
  }, [campaigns, search]);

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="flex gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search campaigns..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {/* Table */}
      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">#</TableHead>
              <TableHead>Campaign</TableHead>
              <TableHead className="text-right">Leads</TableHead>
              <TableHead className="text-right">Interested</TableHead>
              <TableHead className="text-right">Reply %</TableHead>
              <TableHead className="text-right">Interest %</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredCampaigns.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  <p className="text-muted-foreground">No campaigns found</p>
                </TableCell>
              </TableRow>
            ) : (
              filteredCampaigns.map((campaign) => (
                <TableRow key={campaign.id}>
                  <TableCell className="font-medium text-muted-foreground">
                    {campaign.rank}
                  </TableCell>
                  <TableCell className="font-medium">
                    {campaign.name}
                  </TableCell>
                  <TableCell className="text-right">
                    {formatNumber(campaign.leadsContacted)}
                  </TableCell>
                  <TableCell className="text-right font-medium text-blue-600">
                    {campaign.interested}
                  </TableCell>
                  <TableCell className="text-right font-mono">
                    {campaign.replyRate}%
                  </TableCell>
                  <TableCell className="text-right font-mono font-bold">
                    {campaign.interestRate}%
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
