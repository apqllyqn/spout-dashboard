'use client';

import { useEffect, useState, useMemo } from 'react';
import { PageContainer } from '@/components/layout';
import { Skeleton } from '@/components/ui/skeleton';
import type { PerformanceReport, CampaignPerformance, ReportInsight, InterestedLeadDetail } from '@/lib/types/emailbison';
import {
  TrendingUp,
  Users,
  MessageSquare,
  Target,
  Mail,
  CheckCircle,
  XCircle,
  Search,
  ChevronDown,
  Calendar,
  Building2,
  MailOpen
} from 'lucide-react';

// Insight card component - clean, professional styling
function InsightCard({ insight }: { insight: ReportInsight }) {
  return (
    <div className="rounded-lg border border-border bg-card p-4 hover:bg-muted/30 transition-colors">
      <h4 className="font-semibold text-foreground mb-2">
        {insight.emoji} {insight.headline}
      </h4>
      <p className="text-sm text-muted-foreground">{insight.detail}</p>
    </div>
  );
}

// Hero metric card component
function HeroMetricCard({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
}) {
  return (
    <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
          <Icon className="h-5 w-5 text-white" />
        </div>
        <div>
          <span className="text-white/70 text-sm font-medium">{label}</span>
          <p className="text-2xl font-bold text-white">{value}</p>
        </div>
      </div>
    </div>
  );
}

// Sequence step interface for lazy loading
interface SequenceStep {
  id: number;
  sequence_step_id?: string;
  order: number;
  subject: string;
  body: string;
  delay_days?: number;
  delay_hours?: number;
  is_variant?: boolean;
  variant_letter?: string;
  is_thread_reply?: boolean;
  sent?: number;
  unique_replies?: number;
  reply_rate?: number;
  interested?: number;
  bounced?: number;
}

// Expandable Campaign Performance Table
function CampaignPerformanceTable({ campaigns }: { campaigns: CampaignPerformance[] }) {
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [sequenceData, setSequenceData] = useState<Record<number, SequenceStep[]>>({});
  const [loadingSequence, setLoadingSequence] = useState<number | null>(null);

  // Lazy load sequence when expanding
  const handleExpand = async (campaignId: number) => {
    if (expandedId === campaignId) {
      setExpandedId(null);
      return;
    }

    setExpandedId(campaignId);

    // Only fetch if we don't have it cached
    if (!sequenceData[campaignId]) {
      setLoadingSequence(campaignId);
      try {
        const response = await fetch(`/api/emailbison/campaigns/${campaignId}/sequence`);
        if (response.ok) {
          const { data } = await response.json();
          setSequenceData(prev => ({ ...prev, [campaignId]: data || [] }));
        }
      } catch (error) {
        console.error('Failed to fetch sequence:', error);
      } finally {
        setLoadingSequence(null);
      }
    }
  };

  return (
    <div>
      <h2 className="text-3xl font-bold text-foreground mb-6">Campaign Performance</h2>
      <div className="rounded-lg border bg-card shadow-sm overflow-hidden">
        <div className="flex flex-col space-y-1.5 p-6 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950/20 dark:to-purple-950/20 border-b">
          <h3 className="flex items-center gap-3 text-xl font-bold">
            <div className="w-8 h-8 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center">
              <TrendingUp className="h-4 w-4 text-white" />
            </div>
            Campaign Performance Ranked by Interest Rate
            <span className="text-sm font-normal text-muted-foreground ml-auto">Click to expand</span>
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="h-12 px-4 text-left font-semibold text-muted-foreground w-12"></th>
                <th className="h-12 px-4 text-left font-semibold text-muted-foreground w-16">Rank</th>
                <th className="h-12 px-4 text-left font-semibold text-muted-foreground">Campaign</th>
                <th className="h-12 px-4 text-left font-semibold text-muted-foreground">Subject Line</th>
                <th className="h-12 px-4 text-right font-semibold text-muted-foreground">Reply %</th>
                <th className="h-12 px-4 text-right font-semibold text-muted-foreground">Interest %</th>
              </tr>
            </thead>
            <tbody>
              {campaigns.map((campaign) => (
                <>
                  <tr
                    key={campaign.id}
                    className="hover:bg-muted/50 border-b border-border/50 cursor-pointer transition-colors"
                    onClick={() => handleExpand(campaign.id)}
                  >
                    <td className="p-4">
                      <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${expandedId === campaign.id ? 'rotate-180' : ''}`} />
                    </td>
                    <td className="p-4 font-medium">
                      <div className="flex items-center gap-2">
                        {campaign.rank === 1 && <span className="text-yellow-500">🏆</span>}
                        <span>#{campaign.rank}</span>
                      </div>
                    </td>
                    <td className="p-4 font-medium text-foreground max-w-[200px] truncate" title={campaign.name}>
                      {campaign.name}
                    </td>
                    <td className="p-4 max-w-[250px]">
                      <span className="text-sm bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950/20 dark:to-purple-950/20 px-3 py-1.5 rounded-lg border border-indigo-500/10 font-medium truncate block" title={campaign.subjectLine}>
                        &quot;{campaign.subjectLine}&quot;
                      </span>
                    </td>
                    <td className="p-4 text-right font-mono">{campaign.replyRate}%</td>
                    <td className="p-4 text-right font-mono font-bold">{campaign.interestRate}%</td>
                  </tr>
                  {expandedId === campaign.id && (
                    <tr key={`${campaign.id}-expanded`} className="bg-muted/30">
                      <td colSpan={6} className="p-6">
                        <div className="space-y-4">
                          {/* Stats Grid */}
                          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                            <div className="bg-card rounded-lg p-3 border">
                              <p className="text-xs text-muted-foreground mb-1">Leads Reached</p>
                              <p className="font-bold text-lg">{campaign.leadsContacted?.toLocaleString() || 0}</p>
                            </div>
                            <div className="bg-card rounded-lg p-3 border">
                              <p className="text-xs text-muted-foreground mb-1">Emails Sent</p>
                              <p className="font-bold text-lg">{campaign.emailsSent?.toLocaleString() || 0}</p>
                            </div>
                            <div className="bg-card rounded-lg p-3 border">
                              <p className="text-xs text-muted-foreground mb-1">Replies</p>
                              <p className="font-bold text-lg">{campaign.uniqueReplies?.toLocaleString() || 0}</p>
                            </div>
                            <div className="bg-card rounded-lg p-3 border">
                              <p className="text-xs text-muted-foreground mb-1">Interested</p>
                              <p className="font-bold text-lg text-green-600">{campaign.interested?.toLocaleString() || 0}</p>
                            </div>
                            <div className="bg-card rounded-lg p-3 border">
                              <p className="text-xs text-muted-foreground mb-1">Bounced</p>
                              <p className="font-bold text-lg text-red-500">{campaign.bounced?.toLocaleString() || 0}</p>
                            </div>
                            <div className="bg-card rounded-lg p-3 border">
                              <p className="text-xs text-muted-foreground mb-1">Bounce Rate</p>
                              <p className="font-bold text-lg">{campaign.bounceRate || 0}%</p>
                            </div>
                          </div>

                          {/* Email Sequence */}
                          <div className="bg-card rounded-lg border overflow-hidden">
                            <div className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950/20 dark:to-purple-950/20 px-4 py-3 border-b">
                              <div className="flex items-center gap-2">
                                <Mail className="h-4 w-4 text-indigo-600" />
                                <p className="text-sm font-semibold text-indigo-700 dark:text-indigo-400">Email Sequence</p>
                              </div>
                            </div>
                            <div className="p-4">
                              {loadingSequence === campaign.id ? (
                                <div className="flex items-center justify-center py-8">
                                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600"></div>
                                  <span className="ml-2 text-sm text-muted-foreground">Loading sequence...</span>
                                </div>
                              ) : sequenceData[campaign.id] && sequenceData[campaign.id].length > 0 ? (
                                <div className="space-y-4">
                                  {sequenceData[campaign.id].map((step, idx) => (
                                    <div key={step.id || idx} className="border rounded-lg overflow-hidden">
                                      <div className="bg-muted/50 px-4 py-2 flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                          <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 text-xs font-bold">
                                            {idx + 1}
                                          </span>
                                          <span className="text-sm font-medium">Step {idx + 1}</span>
                                          {step.is_variant && (
                                            <span className="text-xs bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 px-2 py-0.5 rounded">
                                              Variant {step.variant_letter || ''}
                                            </span>
                                          )}
                                          {step.is_thread_reply && (
                                            <span className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 px-2 py-0.5 rounded">
                                              Thread Reply
                                            </span>
                                          )}
                                        </div>
                                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                          {step.sent !== undefined && (
                                            <span>{step.sent?.toLocaleString()} sent</span>
                                          )}
                                          {step.reply_rate !== undefined && (
                                            <span className="font-medium text-green-600">{step.reply_rate}% reply</span>
                                          )}
                                          {(step.delay_days || step.delay_hours) && (
                                            <span>
                                              {step.delay_days ? `${step.delay_days}d` : ''}{step.delay_hours ? `${step.delay_hours}h` : ''} delay
                                            </span>
                                          )}
                                        </div>
                                      </div>
                                      <div className="p-4 space-y-3">
                                        <div>
                                          <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-1">Subject</p>
                                          <p className="text-sm font-medium text-foreground">{step.subject}</p>
                                        </div>
                                        {step.body ? (
                                          <div>
                                            <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-1">Body</p>
                                            <div
                                              className="text-sm text-muted-foreground whitespace-pre-wrap bg-muted/30 rounded-lg p-3 max-h-48 overflow-y-auto"
                                              dangerouslySetInnerHTML={{ __html: step.body?.replace(/\n/g, '<br/>') || '' }}
                                            />
                                          </div>
                                        ) : (
                                          <div className="flex items-center gap-4 text-sm bg-muted/30 rounded-lg p-3">
                                            {step.sent !== undefined && (
                                              <div>
                                                <span className="text-muted-foreground">Sent: </span>
                                                <span className="font-medium">{step.sent?.toLocaleString()}</span>
                                              </div>
                                            )}
                                            {step.unique_replies !== undefined && (
                                              <div>
                                                <span className="text-muted-foreground">Replies: </span>
                                                <span className="font-medium text-green-600">{step.unique_replies}</span>
                                              </div>
                                            )}
                                            {step.interested !== undefined && (
                                              <div>
                                                <span className="text-muted-foreground">Interested: </span>
                                                <span className="font-medium text-green-600">{step.interested}</span>
                                              </div>
                                            )}
                                            {step.bounced !== undefined && (
                                              <div>
                                                <span className="text-muted-foreground">Bounced: </span>
                                                <span className="font-medium text-red-500">{step.bounced}</span>
                                              </div>
                                            )}
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <div className="text-center py-6 text-muted-foreground">
                                  <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
                                  <p className="text-sm">No sequence data available</p>
                                  <p className="text-xs mt-1">Subject: &quot;{campaign.subjectLine}&quot;</p>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Performance Summary */}
                          <div className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950/20 dark:to-purple-950/20 rounded-lg p-4 border border-indigo-500/10">
                            <div className="flex items-center gap-2 mb-2">
                              <Target className="h-4 w-4 text-indigo-600" />
                              <p className="text-xs text-indigo-600 uppercase tracking-wider font-semibold">Performance Summary</p>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              Reached <span className="font-semibold text-foreground">{campaign.leadsContacted?.toLocaleString() || 0}</span> leads
                              → <span className="font-semibold text-foreground">{campaign.uniqueReplies?.toLocaleString() || 0}</span> replied ({campaign.replyRate}%)
                              → <span className="font-semibold text-green-600">{campaign.interested?.toLocaleString() || 0}</span> interested ({campaign.interestRate}%)
                            </p>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// Format relative time
function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays}d ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

// Apollo-style Leads Explorer component
function LeadsExplorer({
  leads,
  filters,
}: {
  leads: InterestedLeadDetail[];
  filters: { campaigns: string[]; industries: string[] };
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [campaignFilter, setCampaignFilter] = useState('');
  const [industryFilter, setIndustryFilter] = useState('');
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const filteredLeads = useMemo(() => {
    return leads.filter((lead) => {
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesSearch =
          lead.name.toLowerCase().includes(query) ||
          lead.email.toLowerCase().includes(query) ||
          lead.company.toLowerCase().includes(query) ||
          lead.replyPreview.toLowerCase().includes(query);
        if (!matchesSearch) return false;
      }

      // Campaign filter
      if (campaignFilter && lead.campaign !== campaignFilter) return false;

      // Industry filter
      if (industryFilter && lead.industry !== industryFilter) return false;

      return true;
    });
  }, [leads, searchQuery, campaignFilter, industryFilter]);

  return (
    <div className="rounded-lg border bg-card shadow-sm overflow-hidden">
      {/* Header with search and filters */}
      <div className="flex flex-col space-y-1.5 p-4 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950/20 dark:to-purple-950/20 border-b">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center">
              <Users className="h-4 w-4 text-white" />
            </div>
            <h3 className="text-lg font-bold">
              Interested Leads
              <span className="ml-2 text-sm font-normal text-muted-foreground">
                ({filteredLeads.length} of {leads.length})
              </span>
            </h3>
          </div>

          {/* Search bar */}
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search leads..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-9 pl-9 pr-3 text-sm rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
          </div>
        </div>

        {/* Filter pills */}
        <div className="flex items-center gap-2 pt-2">
          <div className="relative">
            <select
              value={campaignFilter}
              onChange={(e) => setCampaignFilter(e.target.value)}
              className="h-8 pl-3 pr-8 text-xs rounded-full border border-border bg-background appearance-none cursor-pointer hover:bg-muted/50 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            >
              <option value="">All Campaigns</option>
              {filters.campaigns.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground pointer-events-none" />
          </div>

          <div className="relative">
            <select
              value={industryFilter}
              onChange={(e) => setIndustryFilter(e.target.value)}
              className="h-8 pl-3 pr-8 text-xs rounded-full border border-border bg-background appearance-none cursor-pointer hover:bg-muted/50 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            >
              <option value="">All Industries</option>
              {filters.industries.map((i) => (
                <option key={i} value={i}>{i}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground pointer-events-none" />
          </div>

          {(campaignFilter || industryFilter || searchQuery) && (
            <button
              onClick={() => {
                setSearchQuery('');
                setCampaignFilter('');
                setIndustryFilter('');
              }}
              className="h-8 px-3 text-xs rounded-full border border-border bg-background hover:bg-muted/50 text-muted-foreground"
            >
              Clear filters
            </button>
          )}
        </div>
      </div>

      {/* Leads table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/30">
              <th className="h-10 px-4 text-left font-medium text-muted-foreground text-xs uppercase tracking-wider">Contact</th>
              <th className="h-10 px-4 text-left font-medium text-muted-foreground text-xs uppercase tracking-wider">Company</th>
              <th className="h-10 px-4 text-left font-medium text-muted-foreground text-xs uppercase tracking-wider">Campaign</th>
              <th className="h-10 px-4 text-left font-medium text-muted-foreground text-xs uppercase tracking-wider">Reply</th>
              <th className="h-10 px-4 text-left font-medium text-muted-foreground text-xs uppercase tracking-wider w-24">Date</th>
            </tr>
          </thead>
          <tbody>
            {filteredLeads.slice(0, 50).map((lead) => (
              <tr
                key={lead.replyId}
                className="hover:bg-muted/30 border-b border-border/50 cursor-pointer transition-colors"
                onClick={() => setExpandedId(expandedId === lead.replyId ? null : lead.replyId)}
              >
                <td className="py-3 px-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xs font-medium">
                      {lead.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-foreground truncate">{lead.name}</p>
                      <p className="text-xs text-muted-foreground truncate">{lead.email}</p>
                    </div>
                  </div>
                </td>
                <td className="py-3 px-4">
                  <div className="min-w-0">
                    <p className="font-medium truncate flex items-center gap-1.5">
                      <Building2 className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
                      {lead.company}
                    </p>
                    {lead.title && (
                      <p className="text-xs text-muted-foreground truncate">{lead.title}</p>
                    )}
                  </div>
                </td>
                <td className="py-3 px-4">
                  <div className="flex flex-col gap-1">
                    <span className="inline-flex items-center rounded-md bg-indigo-50 dark:bg-indigo-950/30 px-2 py-0.5 text-xs font-medium text-indigo-700 dark:text-indigo-400 w-fit">
                      {lead.campaign}
                    </span>
                    <span className="text-xs text-muted-foreground">{lead.industry}</span>
                  </div>
                </td>
                <td className="py-3 px-4 max-w-[200px]">
                  <div className="flex items-start gap-1.5">
                    <MailOpen className="h-3.5 w-3.5 text-green-600 flex-shrink-0 mt-0.5" />
                    <p className={`text-xs ${expandedId === lead.replyId ? '' : 'line-clamp-2'} text-muted-foreground`}>
                      {lead.replyPreview || 'Interested'}
                    </p>
                  </div>
                </td>
                <td className="py-3 px-4">
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Calendar className="h-3.5 w-3.5" />
                    {formatRelativeTime(lead.replyDate)}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredLeads.length === 0 && (
          <div className="py-12 text-center text-muted-foreground">
            <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>No leads match your filters</p>
          </div>
        )}

        {filteredLeads.length > 50 && (
          <div className="py-3 px-4 text-center text-sm text-muted-foreground bg-muted/20 border-t">
            Showing 50 of {filteredLeads.length} leads. Use search to find specific leads.
          </div>
        )}
      </div>
    </div>
  );
}

export default function ReportPage() {
  const [report, setReport] = useState<PerformanceReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchReport = async () => {
      try {
        const response = await fetch('/api/report');
        if (!response.ok) throw new Error('Failed to fetch report');
        const { data } = await response.json();
        setReport(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load report');
      } finally {
        setLoading(false);
      }
    };

    fetchReport();
  }, []);

  if (loading) {
    return (
      <PageContainer className="space-y-8">
        <Skeleton className="h-64 w-full rounded-3xl" />
        <Skeleton className="h-96 w-full" />
      </PageContainer>
    );
  }

  if (error || !report) {
    return (
      <PageContainer className="flex items-center justify-center h-[60vh]">
        <div className="text-center">
          <p className="text-destructive font-medium">{error || 'No data available'}</p>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer className="space-y-8 pb-12">
      {/* Campaign Period */}
      <div className="text-center">
        <p className="text-lg font-semibold text-muted-foreground">
          Campaign Period: {report.startDate} - {report.endDate}
        </p>
      </div>

      {/* Hero Section */}
      <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-purple-700 text-white rounded-3xl p-8 shadow-xl">
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-4 mb-4">
              <div className="w-8 h-8 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center">
                <TrendingUp className="h-5 w-5" />
              </div>
              <span className="text-white/80 font-medium text-sm uppercase tracking-wider">
                PERFORMANCE REPORT
              </span>
            </div>
            <h1 className="text-4xl font-bold mb-3 leading-tight">
              Campaign Performance Summary
            </h1>
            <div className="flex items-center gap-2 text-white/70">
              <span className="text-sm font-medium">{report.workspaceName} Workspace</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          <HeroMetricCard
            icon={Target}
            label="Total Campaigns"
            value={report.heroMetrics.totalCampaigns}
          />
          <HeroMetricCard
            icon={Users}
            label="Leads Contacted"
            value={report.heroMetrics.leadsContacted.toLocaleString()}
          />
          <HeroMetricCard
            icon={MessageSquare}
            label="Messages Sent"
            value={report.heroMetrics.messagesSent.toLocaleString()}
          />
          <HeroMetricCard
            icon={TrendingUp}
            label="Avg Response Rate"
            value={`${report.heroMetrics.avgResponseRate}%`}
          />
          <HeroMetricCard
            icon={Mail}
            label="Email Positives"
            value={report.heroMetrics.emailPositives}
          />
        </div>
      </div>

      {/* Campaign Performance Table */}
      <CampaignPerformanceTable campaigns={report.campaigns} />

      {/* Data-Driven Copy Analysis */}
      {report.copyAnalysis && (
        <div className="space-y-8">
          <div className="mb-8">
            <h2 className="text-3xl font-bold mb-3 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Copy Analysis: What Worked & What Didn&apos;t
            </h2>
            <p className="text-muted-foreground text-lg">
              Data-driven insights from {report.copyAnalysis.summary.totalCampaignsAnalyzed} campaigns analyzed
            </p>
          </div>

          {/* Subject Lines - Data Driven */}
          <div className="rounded-lg border bg-card shadow-sm overflow-hidden">
            <div className="flex flex-col space-y-1.5 p-6 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950/20 dark:to-purple-950/20 border-b">
              <h3 className="flex items-center gap-3 text-lg font-bold">
                <div className="w-7 h-7 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center">
                  <MessageSquare className="h-4 w-4 text-white" />
                </div>
                Subject Lines
              </h3>
            </div>
            <div className="space-y-8 p-6">
              {/* Top Performers */}
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-6 h-6 bg-green-500/10 rounded-lg flex items-center justify-center">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  </div>
                  <h4 className="font-semibold text-green-600 text-lg">Top Performers</h4>
                  <span className="text-sm text-muted-foreground ml-auto">
                    Avg: {report.copyAnalysis.summary.topAvgInterest}% interest
                  </span>
                </div>
                <div className="space-y-3">
                  {report.copyAnalysis.subjects.topPerformers.map((item, idx) => (
                    <div key={idx} className="bg-green-50 dark:bg-green-950/20 p-4 rounded-xl border border-green-500/20">
                      <p className="text-sm font-medium text-green-700 dark:text-green-400 mb-2">
                        &quot;{item.subject}&quot;
                      </p>
                      <div className="flex items-center gap-4 text-xs text-green-600/80">
                        <span className="font-semibold">{item.interestRate}% interest</span>
                        <span>{item.replyRate}% reply</span>
                        <span>{item.sent.toLocaleString()} sent</span>
                        <span className="text-muted-foreground">• {item.campaign}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Bottom Performers */}
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-6 h-6 bg-red-500/10 rounded-lg flex items-center justify-center">
                    <XCircle className="h-4 w-4 text-red-500" />
                  </div>
                  <h4 className="font-semibold text-red-600 text-lg">Underperformers</h4>
                  <span className="text-sm text-muted-foreground ml-auto">
                    Avg: {report.copyAnalysis.summary.bottomAvgInterest}% interest
                  </span>
                </div>
                <div className="space-y-3">
                  {report.copyAnalysis.subjects.bottomPerformers.map((item, idx) => (
                    <div key={idx} className="bg-red-50 dark:bg-red-950/20 p-4 rounded-xl border border-red-500/20">
                      <p className="text-sm font-medium text-red-700 dark:text-red-400 mb-2">
                        &quot;{item.subject}&quot;
                      </p>
                      <div className="flex items-center gap-4 text-xs text-red-600/80">
                        <span className="font-semibold">{item.interestRate}% interest</span>
                        <span>{item.replyRate}% reply</span>
                        <span>{item.sent.toLocaleString()} sent</span>
                        <span className="text-muted-foreground">• {item.campaign}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Pattern Analysis */}
              <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6 rounded-2xl">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-6 h-6 bg-white/20 rounded-lg flex items-center justify-center">
                    <TrendingUp className="h-4 w-4 text-white" />
                  </div>
                  <h5 className="font-bold text-white text-lg">Pattern Analysis</h5>
                </div>
                <div className="grid grid-cols-3 gap-4 text-white/90">
                  <div className="text-center">
                    <p className="text-2xl font-bold">{report.copyAnalysis.subjects.patterns.avgLength.top}</p>
                    <p className="text-xs text-white/70">Avg chars (top)</p>
                    <p className="text-xs text-white/50">vs {report.copyAnalysis.subjects.patterns.avgLength.bottom} (bottom)</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold">{report.copyAnalysis.subjects.patterns.hasPersonalization.top}%</p>
                    <p className="text-xs text-white/70">Use personalization</p>
                    <p className="text-xs text-white/50">vs {report.copyAnalysis.subjects.patterns.hasPersonalization.bottom}% (bottom)</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold">{report.copyAnalysis.subjects.patterns.hasQuestion.top}%</p>
                    <p className="text-xs text-white/70">Use questions</p>
                    <p className="text-xs text-white/50">vs {report.copyAnalysis.subjects.patterns.hasQuestion.bottom}% (bottom)</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Body Text Analysis */}
          <div className="rounded-lg border bg-card shadow-sm overflow-hidden">
            <div className="flex flex-col space-y-1.5 p-6 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950/20 dark:to-purple-950/20 border-b">
              <h3 className="flex items-center gap-3 text-lg font-bold">
                <div className="w-7 h-7 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center">
                  <Target className="h-4 w-4 text-white" />
                </div>
                Body Text
              </h3>
            </div>
            <div className="space-y-8 p-6">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-6 h-6 bg-green-500/10 rounded-lg flex items-center justify-center">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  </div>
                  <h4 className="font-semibold text-green-600 text-lg">What Worked</h4>
                </div>
                <div className="space-y-3">
                  <div className="bg-green-50 dark:bg-green-950/20 p-4 rounded-xl border border-green-500/20">
                    <p className="text-sm font-medium text-green-700 dark:text-green-400">
                      Pain-first hooks: &quot;You haven&apos;t integrated...&quot; outperformed benefit-led openings
                    </p>
                  </div>
                  <div className="bg-green-50 dark:bg-green-950/20 p-4 rounded-xl border border-green-500/20">
                    <p className="text-sm font-medium text-green-700 dark:text-green-400">
                      ROI claims with specific numbers: &quot;19x ROI&quot;, &quot;$22 AOV lift&quot;, &quot;4.7x increase&quot;
                    </p>
                  </div>
                  <div className="bg-green-50 dark:bg-green-950/20 p-4 rounded-xl border border-green-500/20">
                    <p className="text-sm font-medium text-green-700 dark:text-green-400">
                      Authority markers: &quot;Shopify Enterprise Council&quot;, &quot;475 brands&quot;, &quot;400 deployments&quot;
                    </p>
                  </div>
                  <div className="bg-green-50 dark:bg-green-950/20 p-4 rounded-xl border border-green-500/20">
                    <p className="text-sm font-medium text-green-700 dark:text-green-400">
                      Risk reversal: &quot;Free through 2026&quot;, &quot;No commissions&quot;, &quot;Setup in minutes&quot;
                    </p>
                  </div>
                </div>
              </div>
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-6 h-6 bg-red-500/10 rounded-lg flex items-center justify-center">
                    <XCircle className="h-4 w-4 text-red-500" />
                  </div>
                  <h4 className="font-semibold text-red-600 text-lg">What Failed</h4>
                </div>
                <div className="space-y-3">
                  <div className="bg-red-50 dark:bg-red-950/20 p-4 rounded-xl border border-red-500/20">
                    <p className="text-sm font-medium text-red-700 dark:text-red-400">
                      Value-first intros that lead with benefits instead of pain points
                    </p>
                  </div>
                  <div className="bg-red-50 dark:bg-red-950/20 p-4 rounded-xl border border-red-500/20">
                    <p className="text-sm font-medium text-red-700 dark:text-red-400">
                      Generic company introductions: &quot;We just launched...&quot;
                    </p>
                  </div>
                  <div className="bg-red-50 dark:bg-red-950/20 p-4 rounded-xl border border-red-500/20">
                    <p className="text-sm font-medium text-red-700 dark:text-red-400">
                      Hypotheticals and feature-led explanations: &quot;If you could...&quot;
                    </p>
                  </div>
                </div>
              </div>
              <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6 rounded-2xl">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-6 h-6 bg-white/20 rounded-lg flex items-center justify-center">
                    <TrendingUp className="h-4 w-4 text-white" />
                  </div>
                  <h5 className="font-bold text-white text-lg">Key Pattern</h5>
                </div>
                <p className="text-white/90 font-medium">
                  Pain-first + Authority + Proof &gt; Value-led + Casual + Feature-led
                </p>
              </div>
            </div>
          </div>

          {/* Call-to-Actions Analysis */}
          <div className="rounded-lg border bg-card shadow-sm overflow-hidden">
            <div className="flex flex-col space-y-1.5 p-6 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950/20 dark:to-purple-950/20 border-b">
              <h3 className="flex items-center gap-3 text-lg font-bold">
                <div className="w-7 h-7 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center">
                  <Mail className="h-4 w-4 text-white" />
                </div>
                Call-to-Actions
              </h3>
            </div>
            <div className="space-y-8 p-6">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-6 h-6 bg-green-500/10 rounded-lg flex items-center justify-center">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  </div>
                  <h4 className="font-semibold text-green-600 text-lg">What Worked</h4>
                </div>
                <div className="space-y-3">
                  <div className="bg-green-50 dark:bg-green-950/20 p-4 rounded-xl border border-green-500/20">
                    <p className="text-sm font-medium text-green-700 dark:text-green-400">
                      Permission-based: &quot;Mind if I shoot over a quick video?&quot;
                    </p>
                  </div>
                  <div className="bg-green-50 dark:bg-green-950/20 p-4 rounded-xl border border-green-500/20">
                    <p className="text-sm font-medium text-green-700 dark:text-green-400">
                      Soft asks: &quot;Open to it?&quot;, &quot;Worth exploring?&quot;, &quot;Want a short video?&quot;
                    </p>
                  </div>
                  <div className="bg-green-50 dark:bg-green-950/20 p-4 rounded-xl border border-green-500/20">
                    <p className="text-sm font-medium text-green-700 dark:text-green-400">
                      Confirmation CTAs: &quot;Is this still the case?&quot;
                    </p>
                  </div>
                  <div className="bg-green-50 dark:bg-green-950/20 p-4 rounded-xl border border-green-500/20">
                    <p className="text-sm font-medium text-green-700 dark:text-green-400">
                      Value-exchange: &quot;...to walk you through 3 custom ideas&quot;
                    </p>
                  </div>
                </div>
              </div>
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-6 h-6 bg-red-500/10 rounded-lg flex items-center justify-center">
                    <XCircle className="h-4 w-4 text-red-500" />
                  </div>
                  <h4 className="font-semibold text-red-600 text-lg">What Failed</h4>
                </div>
                <div className="space-y-3">
                  <div className="bg-red-50 dark:bg-red-950/20 p-4 rounded-xl border border-red-500/20">
                    <p className="text-sm font-medium text-red-700 dark:text-red-400">
                      Mechanical CTAs: &quot;Reply &apos;yes&apos;&quot;
                    </p>
                  </div>
                  <div className="bg-red-50 dark:bg-red-950/20 p-4 rounded-xl border border-red-500/20">
                    <p className="text-sm font-medium text-red-700 dark:text-red-400">
                      Generic asks: &quot;Can we schedule 15 minutes?&quot;
                    </p>
                  </div>
                  <div className="bg-red-50 dark:bg-red-950/20 p-4 rounded-xl border border-red-500/20">
                    <p className="text-sm font-medium text-red-700 dark:text-red-400">
                      CTAs without clear value for recipient
                    </p>
                  </div>
                </div>
              </div>
              <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6 rounded-2xl">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-6 h-6 bg-white/20 rounded-lg flex items-center justify-center">
                    <TrendingUp className="h-4 w-4 text-white" />
                  </div>
                  <h5 className="font-bold text-white text-lg">Key Pattern</h5>
                </div>
                <p className="text-white/90 font-medium">
                  Permission-based &gt; Value-exchange &gt; Confirmation &gt; Mechanical
                </p>
              </div>
            </div>
          </div>

          {/* Summary Card */}
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6 rounded-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-white" />
              </div>
              <h3 className="font-bold text-white text-xl">Key Takeaway</h3>
            </div>
            <p className="text-white/90 text-lg">
              Top campaigns average <span className="font-bold">{report.copyAnalysis.summary.topAvgInterest}%</span> interest
              vs <span className="font-bold">{report.copyAnalysis.summary.bottomAvgInterest}%</span> for bottom performers
              — a <span className="font-bold">{report.copyAnalysis.summary.topAvgInterest > 0 && report.copyAnalysis.summary.bottomAvgInterest > 0
                ? Math.round((report.copyAnalysis.summary.topAvgInterest / report.copyAnalysis.summary.bottomAvgInterest) * 10) / 10
                : 0}x</span> difference.
            </p>
          </div>
        </div>
      )}

      {/* Apollo-style Leads Explorer */}
      {report.interestedLeads.length > 0 && (
        <div>
          <h2 className="text-3xl font-bold text-foreground mb-6">
            Interested Leads Explorer
          </h2>
          <LeadsExplorer leads={report.interestedLeads} filters={report.filters} />
        </div>
      )}

      {/* Key Insights */}
      <div>
        <h2 className="text-3xl font-bold text-foreground mb-6">Key Insights</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {report.insights.map((insight, index) => (
            <InsightCard key={index} insight={insight} />
          ))}
        </div>
      </div>
    </PageContainer>
  );
}
