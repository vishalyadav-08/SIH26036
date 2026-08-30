import { PublicHeader } from '@/components/layout/PublicHeader';
import { SiteFooter } from '@/components/layout/SiteFooter';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-slate-100/70">
      <PublicHeader />
      <main id="main-content" className="flex-1 flex items-center justify-center py-12 px-4">
        {children}
      </main>
      <SiteFooter />
    </div>
  );
}
