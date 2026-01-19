'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { Search, ChevronRight } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { formatDate, formatNumber, calcPercent, formatPercent, cn } from '@/lib/utils';
import { STATUS_COLORS, CAMPAIGN_STATUSES } from '@/lib/constants';
import type { Campaign } from '@/lib/types/emailbison';

interface CampaignListProps {
  campaigns: Campaign[];
}

export function CampaignList({ campaigns }: CampaignListProps) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const filteredCampaigns = useMemo(() => {
    return campaigns.filter((campaign) => {
      const matchesSearch = campaign.name
        .toLowerCase()
        .includes(search.toLowerCase());
      const matchesStatus =
        statusFilter === 'all' ||
        campaign.status.toLowerCase() === statusFilter.toLowerCase();
      return matchesSearch && matchesStatus;
    });
  }, [campaigns, search, statusFilter]);

  return (
    <div className="space-y-4">
      {/* Filters */}
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
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            {CAMPAIGN_STATUSES.map((status) => (
              <SelectItem key={status} value={status}>
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Campaign</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Sent</TableHead>
              <TableHead className="text-right">Open Rate</TableHead>
              <TableHead className="text-right">Reply Rate</TableHead>
              <TableHead className="text-right">Bounce Rate</TableHead>
              <TableHead className="text-right">Created</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredCampaigns.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="h-24 text-center">
                  <p className="text-muted-foreground">No campaigns found</p>
                </TableCell>
              </TableRow>
            ) : (
              filteredCampaigns.map((campaign) => {
                const statusColor =
                  STATUS_COLORS[campaign.status.toLowerCase()] ||
                  STATUS_COLORS.draft;
                const openRate = calcPercent(
                  campaign.unique_opens,
                  campaign.total_leads_contacted
                );
                const replyRate = calcPercent(
                  campaign.unique_replies,
                  campaign.total_leads_contacted
                );
                const bounceRate = calcPercent(
                  campaign.bounced,
                  campaign.emails_sent
                );

                return (
                  <TableRow key={campaign.id}>
                    <TableCell>
                      <Link
                        href={`/campaigns/${campaign.id}`}
                        className="font-medium hover:underline"
                      >
                        {campaign.name}
                      </Link>
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={cn(statusColor.bg, statusColor.text, 'border-0')}
                      >
                        {campaign.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      {formatNumber(campaign.emails_sent)}
                    </TableCell>
                    <TableCell className="text-right">
                      {formatPercent(openRate)}
                    </TableCell>
                    <TableCell className="text-right">
                      {formatPercent(replyRate)}
                    </TableCell>
                    <TableCell className="text-right">
                      {formatPercent(bounceRate)}
                    </TableCell>
                    <TableCell className="text-right text-muted-foreground">
                      {formatDate(campaign.created_at)}
                    </TableCell>
                    <TableCell>
                      <Link
                        href={`/campaigns/${campaign.id}`}
                        className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-accent"
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Link>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
