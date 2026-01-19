'use client';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatNumber, calcPercent, formatPercent } from '@/lib/utils';
import type { SequenceStepStats } from '@/lib/types/emailbison';

interface SequenceStepsTableProps {
  steps: SequenceStepStats[];
}

export function SequenceStepsTable({ steps }: SequenceStepsTableProps) {
  if (!steps || steps.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Sequence Steps</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">No sequence step data available</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Sequence Steps Performance</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Step</TableHead>
              <TableHead>Subject</TableHead>
              <TableHead className="text-right">Sent</TableHead>
              <TableHead className="text-right">Opens</TableHead>
              <TableHead className="text-right">Replies</TableHead>
              <TableHead className="text-right">Bounced</TableHead>
              <TableHead className="text-right">Interested</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {steps.map((step, index) => (
              <TableRow key={step.sequence_step_id}>
                <TableCell className="font-medium">{index + 1}</TableCell>
                <TableCell className="max-w-[200px] truncate">
                  {step.email_subject}
                </TableCell>
                <TableCell className="text-right">
                  {formatNumber(step.sent)}
                </TableCell>
                <TableCell className="text-right">
                  {formatNumber(step.unique_opens)}
                  <span className="text-xs text-muted-foreground ml-1">
                    ({formatPercent(calcPercent(step.unique_opens, step.leads_contacted))})
                  </span>
                </TableCell>
                <TableCell className="text-right">
                  {formatNumber(step.unique_replies)}
                  <span className="text-xs text-muted-foreground ml-1">
                    ({formatPercent(calcPercent(step.unique_replies, step.leads_contacted))})
                  </span>
                </TableCell>
                <TableCell className="text-right">
                  {formatNumber(step.bounced)}
                </TableCell>
                <TableCell className="text-right">
                  {formatNumber(step.interested)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
