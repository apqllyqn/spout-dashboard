// EmailBison API Types

export interface Tag {
  id: number;
  name: string;
  default: boolean;
}

export interface Team {
  id: number;
  name: string;
  personal_team: boolean;
  main: boolean;
  parent_id: number | null;
  total_monthly_email_verification_credits: number;
  remaining_monthly_email_verification_credits: number;
  remaining_email_verification_credits: number;
  total_email_verification_credits: number;
  sender_email_limit: number;
  warmup_limit: number;
  warmup_filter_phrase: string | null;
  has_access_to_warmup: boolean;
  has_access_to_healthcheck: boolean;
  created_at: string;
  updated_at: string;
}

export interface User {
  id: number;
  name: string;
  email: string;
  team?: Team;
  workspace?: Team;
  profile_photo_path: string | null;
  profile_photo_url: string;
  created_at: string;
  updated_at: string;
}

export type CampaignStatus =
  | 'Draft'
  | 'Launching'
  | 'Active'
  | 'Paused'
  | 'Stopped'
  | 'Completed'
  | 'Failed'
  | 'Queued'
  | 'Archived';

export type CampaignType = 'outbound' | 'reply_followup';

export interface Campaign {
  id: number;
  uuid: string;
  name: string;
  type: CampaignType;
  status: CampaignStatus;
  completion_percentage?: number;
  emails_sent: number;
  opened: number;
  unique_opens: number;
  replied: number;
  unique_replies: number;
  bounced: number;
  unsubscribed: number;
  interested: number;
  total_leads: number;
  total_leads_contacted: number;
  max_emails_per_day: number;
  max_new_leads_per_day: number;
  plain_text: boolean;
  open_tracking: boolean;
  can_unsubscribe: boolean;
  unsubscribe_text: string;
  created_at: string;
  updated_at: string;
  tags: Tag[];
}

export interface SequenceStepStats {
  sequence_step_id: number;
  email_subject: string;
  sent: number;
  leads_contacted: number;
  unique_opens: number;
  unique_replies: number;
  unsubscribed: number;
  bounced: number;
  interested: number;
}

export interface CampaignStats {
  emails_sent: string;
  total_leads_contacted: string;
  opened: string;
  opened_percentage: string;
  unique_opens_per_contact: string;
  unique_opens_per_contact_percentage: string;
  unique_replies_per_contact: string;
  unique_replies_per_contact_percentage: string;
  bounced: string;
  bounced_percentage: string;
  unsubscribed: string;
  unsubscribed_percentage: string;
  interested: string;
  interested_percentage: string;
  sequence_step_stats: SequenceStepStats[];
}

export interface ChartDataSeries {
  label: string;
  color: string;
  dates: [string, number][];
}

export interface Lead {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  title: string;
  company: string;
  notes: string;
  status: string;
  custom_variables: { name: string; value: string }[];
  lead_campaign_data: unknown[];
  overall_stats: {
    emails_sent: number;
    opens: number;
    replies: number;
    unique_replies: number;
    unique_opens: number;
  };
  created_at: string;
  updated_at: string;
}

export interface Reply {
  id: number;
  uuid: string;
  folder: string;
  subject: string;
  read: boolean;
  interested: boolean;
  automated_reply: boolean;
  html_body: string;
  text_body: string;
  date_received: string;
  type: string;
  tracked_reply: boolean;
  campaign_id: number;
  lead_id: number | null;
  sender_email_id: number;
  from_name: string;
  from_email_address: string;
  primary_to_email_address: string;
  created_at: string;
  updated_at: string;
}

export interface SenderEmail {
  id: number;
  name: string;
  email: string;
  email_signature: string;
  imap_server: string;
  imap_port: number;
  smtp_server: string;
  smtp_port: number;
  daily_limit: number;
  type: string;
  status: string;
  emails_sent_count: number;
  total_replied_count: number;
  total_opened_count: number;
  unsubscribed_count: number;
  bounced_count: number;
  unique_replied_count: number;
  unique_opened_count: number;
  total_leads_contacted_count: number;
  interested_leads_count: number;
  created_at: string;
  updated_at: string;
  tags: Tag[];
}

// API Response wrappers
export interface ApiResponse<T> {
  data: T;
}

export interface ApiListResponse<T> {
  data: T[];
}

export interface ApiError {
  message: string;
  errors?: Record<string, string[]>;
}

// Dashboard aggregated stats
export interface DashboardStats {
  totalCampaigns: number;
  activeCampaigns: number;
  pausedCampaigns: number;
  completedCampaigns: number;
  totalEmailsSent: number;
  totalOpens: number;
  totalReplies: number;
  totalBounced: number;
  overallOpenRate: number;
  overallReplyRate: number;
  overallBounceRate: number;
}

// Campaign Performance Report Types
export type PerformanceGrade = 'highest' | 'good' | 'average' | 'poor';

export interface CampaignPerformance {
  rank: number;
  id: number;
  name: string;
  subjectLine: string;
  replyRate: number;
  interestRate: number;
  grade: PerformanceGrade;
  verdict: string;
  // Extended stats for expanded view
  emailsSent: number;
  uniqueOpens: number;
  uniqueReplies: number;
  interested: number;
  bounced: number;
  openRate: number;
  bounceRate: number;
}

// Data-driven linguistic analysis with actual metrics
export interface SubjectPerformer {
  subject: string;
  campaign: string;
  interestRate: number;
  replyRate: number;
  sent: number;
}

export interface SubjectAnalysis {
  topPerformers: SubjectPerformer[];
  bottomPerformers: SubjectPerformer[];
  patterns: {
    avgLength: { top: number; bottom: number };
    hasPersonalization: { top: number; bottom: number }; // % with {{variables}}
    hasQuestion: { top: number; bottom: number }; // % ending in ?
  };
}

export interface CopyAnalysis {
  subjects: SubjectAnalysis;
  summary: {
    topAvgInterest: number;
    bottomAvgInterest: number;
    totalCampaignsAnalyzed: number;
  };
}

// Legacy interface kept for backwards compatibility
export interface LinguisticAnalysis {
  subjectLines: {
    worked: string[];
    failed: string[];
    keyPattern: string;
  };
  bodyText: {
    worked: string[];
    failed: string[];
    keyPattern: string;
  };
  ctas: {
    worked: string[];
    failed: string[];
    keyPattern: string;
  };
}

export interface InterestedLead {
  company: string;
  industry: string;
  campaign: string;
  response: string;
}

// Enhanced lead detail for Apollo-style leads explorer
export interface InterestedLeadDetail {
  id: number;
  email: string;
  name: string;
  company: string;
  title: string;
  industry: string;
  campaign: string;
  campaignId: number;
  subject: string;
  replyPreview: string;
  replyDate: string;
  replyId: number;
}

export type InsightType = 'success' | 'warning' | 'failure' | 'info' | 'next_step';

export interface ReportInsight {
  type: InsightType;
  emoji: string;
  headline: string;
  detail: string;
}

export interface PerformanceReport {
  workspaceName: string;
  cycleNumber: number;
  startDate: string;
  endDate: string;
  heroMetrics: {
    totalCampaigns: number;
    leadsContacted: number;
    messagesSent: number;
    avgResponseRate: number;
    emailPositives: number;
  };
  campaigns: CampaignPerformance[];
  copyAnalysis: CopyAnalysis;
  interestedLeads: InterestedLeadDetail[];
  filters: {
    campaigns: string[];
    industries: string[];
  };
  insights: ReportInsight[];
}
