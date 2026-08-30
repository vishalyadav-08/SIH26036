import React from 'react';
import Link from 'next/link';
import { Home, ClipboardList, RefreshCw, User } from 'lucide-react';
import { QueryProvider } from '@/components/providers/QueryProvider';
import { NetworkIndicator } from '@/components/field/NetworkIndicator';
import { OfflineDatabaseProvider } from '@/components/providers/OfflineDatabaseProvider';

export default function FieldLayout({ children }: { children: React.ReactNode }) {
  return (
    <QueryProvider>
      <OfflineDatabaseProvider>
        <div className="flex flex-col min-h-screen bg-gray-50 pb-16 md:pb-0">
          {/* Mobile Header */}
          <header className="sticky top-0 z-10 flex items-center justify-between px-4 py-3 bg-white border-b shadow-sm">
            <div className="flex items-center gap-2">
              <div className="font-bold text-lg text-blue-700 tracking-tight">MapanSetu</div>
              <div className="px-2 py-0.5 text-xs font-semibold bg-blue-100 text-blue-800 rounded-full">FIELD</div>
            </div>
            <div className="flex items-center gap-3">
              <NetworkIndicator />
              {/* Profile snippet */}
              <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-sm font-bold text-gray-600">
                ON
              </div>
            </div>
          </header>

          {/* Main Content Area */}
          <main className="flex-1 w-full max-w-3xl mx-auto p-4 md:p-6 lg:p-8">
            {children}
          </main>

          {/* Mobile Bottom Navigation */}
          <nav className="fixed bottom-0 left-0 right-0 z-20 bg-white border-t flex items-center justify-around pb-safe md:hidden">
            <NavItem href="/field" icon={<Home className="w-5 h-5" />} label="Home" />
            <NavItem href="/field/inspections" icon={<ClipboardList className="w-5 h-5" />} label="Inspections" />
            <NavItem href="/field/sync" icon={<RefreshCw className="w-5 h-5" />} label="Sync" />
            <NavItem href="/field/profile" icon={<User className="w-5 h-5" />} label="Profile" />
          </nav>
        </div>
      </OfflineDatabaseProvider>
    </QueryProvider>
  );
}

function NavItem({ href, icon, label }: { href: string; icon: React.ReactNode; label: string }) {
  return (
    <Link href={href} className="flex flex-col items-center justify-center w-full py-3 text-gray-500 hover:text-blue-600 active:text-blue-700 transition-colors">
      {icon}
      <span className="text-[10px] mt-1 font-medium">{label}</span>
    </Link>
  );
}
