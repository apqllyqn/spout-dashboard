import Link from 'next/link';
import { formatDate, formatNumber, calcPercent, formatPercent, cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { STATUS_COLORS } from '@/lib/constants';
import type { Campaign } from '@/lib/types/emailbison';

interface CampaignCardProps {
  campaign: Campaign;
}

export function CampaignCard({ campaign }: CampaignCardProps) {
  const statusColor = STATUS_COLORS[campaign.status.toLowerCase()] || STATUS_COLORS.draft;

  const openRate = calcPercent(campaign.unique_opens, campaign.total_leads_contacted);
  const replyRate = calcPercent(campaign.unique_replies, campaign.total_leads_contacted);
  const bounceRate = calcPercent(campaign.bounced, campaign.emails_sent);

  return (
    <Link href={`/campaigns/${campaign.id}`}>
      <Card className="card-hover cursor-pointer py-4">
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between">
            <CardTitle className="text-base font-medium line-clamp-1">
              {campaign.name}
            </CardTitle>
            <Badge className={cn(statusColor.bg, statusColor.text, 'border-0')}>
              {campaign.status}
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground">
            Created {formatDate(campaign.created_at)}
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-4 text-center">
            <div>
              <p className="text-lg font-semibold">{formatNumber(campaign.emails_sent)}</p>
              <p className="text-xs text-muted-foreground">Sent</p>
            </div>
            <div>
              <p className="text-lg font-semibold">{formatPercent(openRate)}</p>
              <p className="text-xs text-muted-foreground">Open Rate</p>
            </div>
            <div>
              <p className="text-lg font-semibold">{formatPercent(replyRate)}</p>
              <p className="text-xs text-muted-foreground">Reply Rate</p>
            </div>
            <div>
              <p className="text-lg font-semibold">{formatPercent(bounceRate)}</p>
              <p className="text-xs text-muted-foreground">Bounce Rate</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
