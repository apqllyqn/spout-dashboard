'use client';

import { useMemo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { ChartDataSeries } from '@/lib/types/emailbison';

interface CampaignChartProps {
  data: ChartDataSeries[];
}

export function CampaignChart({ data }: CampaignChartProps) {
  // Transform data for Recharts
  const chartData = useMemo(() => {
    if (!data || data.length === 0) return [];

    // Get all unique dates
    const dateSet = new Set<string>();
    data.forEach((series) => {
      series.dates.forEach(([date]) => {
        dateSet.add(date);
      });
    });

    const dates = Array.from(dateSet).sort();

    // Build data points
    return dates.map((date) => {
      const point: Record<string, string | number> = { date };
      data.forEach((series) => {
        const match = series.dates.find(([d]) => d === date);
        point[series.label] = match ? match[1] : 0;
      });
      return point;
    });
  }, [data]);

  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Campaign Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex h-[300px] items-center justify-center text-muted-foreground">
            No chart data available
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Campaign Performance</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 12 }}
                tickFormatter={(value) => {
                  const date = new Date(value);
                  return `${date.getMonth() + 1}/${date.getDate()}`;
                }}
              />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                }}
              />
              <Legend />
              {data.map((series) => (
                <Line
                  key={series.label}
                  type="monotone"
                  dataKey={series.label}
                  stroke={series.color}
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4 }}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
