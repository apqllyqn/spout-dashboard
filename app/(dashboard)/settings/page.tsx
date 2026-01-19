'use client';

import { User, Building2, Mail, TrendingUp } from 'lucide-react';
import { PageContainer } from '@/components/layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuthStore } from '@/lib/stores';

export default function SettingsPage() {
  const { user } = useAuthStore();
  const workspace = user?.workspace || user?.team;

  return (
    <PageContainer className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Settings</h2>
        <p className="text-muted-foreground">
          Account and workspace information
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Account Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Account Information
            </CardTitle>
            <CardDescription>
              Your account details
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Name</p>
              <p className="font-medium">{user?.name || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Email</p>
              <p className="font-medium">{user?.email || 'N/A'}</p>
            </div>
          </CardContent>
        </Card>

        {/* Workspace Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Workspace
            </CardTitle>
            <CardDescription>
              Your workspace details
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Workspace Name</p>
              <p className="font-medium">{workspace?.name || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Created</p>
              <p className="font-medium">
                {workspace?.created_at
                  ? new Date(workspace.created_at).toLocaleDateString()
                  : 'N/A'}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Credits */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Email Verification Credits
            </CardTitle>
            <CardDescription>
              Your email verification allocation
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Remaining Credits</p>
              <p className="font-medium">
                {workspace?.remaining_email_verification_credits?.toLocaleString() || '0'}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Credits</p>
              <p className="font-medium">
                {workspace?.total_email_verification_credits?.toLocaleString() || '0'}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Features */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Features
            </CardTitle>
            <CardDescription>
              Available features
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm">Warmup Access</p>
              <p className={`text-sm font-medium ${workspace?.has_access_to_warmup ? 'text-success' : 'text-muted-foreground'}`}>
                {workspace?.has_access_to_warmup ? 'Enabled' : 'Disabled'}
              </p>
            </div>
            <div className="flex items-center justify-between">
              <p className="text-sm">Healthcheck Access</p>
              <p className={`text-sm font-medium ${workspace?.has_access_to_healthcheck ? 'text-success' : 'text-muted-foreground'}`}>
                {workspace?.has_access_to_healthcheck ? 'Enabled' : 'Disabled'}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  );
}
