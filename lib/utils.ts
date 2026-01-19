import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Format date to readable string
export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(d);
}

// Format date with time
export function formatDateTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(d);
}

// Format number with commas
export function formatNumber(num: number): string {
  return new Intl.NumberFormat('en-US').format(num);
}

// Format percentage
export function formatPercent(value: number | string): string {
  const num = typeof value === 'string' ? parseFloat(value) : value;
  return `${num.toFixed(1)}%`;
}

// Calculate percentage
export function calcPercent(part: number, total: number): number {
  if (total === 0) return 0;
  return (part / total) * 100;
}

// Generate initials from name
export function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

// Capitalize first letter
export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

// Format status for display
export function formatStatus(status: string): string {
  return status
    .split('_')
    .map((word) => capitalize(word))
    .join(' ');
}

// Get status color class
export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    'active': 'bg-success text-white',
    'paused': 'bg-warning text-white',
    'draft': 'bg-muted text-muted-foreground',
    'launching': 'bg-primary text-primary-foreground',
    'completed': 'bg-chart-3 text-white',
    'stopped': 'bg-destructive text-white',
    'failed': 'bg-destructive text-white',
    'queued': 'bg-muted text-muted-foreground',
  };
  return colors[status.toLowerCase()] || 'bg-muted text-muted-foreground';
}

// Format API date string
export function parseApiDate(dateStr: string): Date {
  return new Date(dateStr);
}

// Get date range for API requests
export function getDateRange(days: number): { start_date: string; end_date: string } {
  const end = new Date();
  const start = new Date();
  start.setDate(start.getDate() - days);

  return {
    start_date: start.toISOString().split('T')[0],
    end_date: end.toISOString().split('T')[0],
  };
}
