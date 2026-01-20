'use client';

import { usePathname } from 'next/navigation';

const pageTitles: Record<string, string> = {
  '/campaigns': 'Campaigns',
  '/settings': 'Settings',
  '/report': 'Report',
};

export function Header() {
  const pathname = usePathname();

  // Get title based on path
  const getTitle = () => {
    // Check exact match first
    if (pageTitles[pathname]) {
      return pageTitles[pathname];
    }

    // Check for campaign detail page
    if (pathname.startsWith('/campaigns/')) {
      return 'Campaign Details';
    }

    return 'Dashboard';
  };

  return (
    <header className="flex h-16 items-center justify-between border-b bg-background px-6">
      <h1 className="text-xl font-semibold">{getTitle()}</h1>
    </header>
  );
}
