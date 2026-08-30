import { BusinessHeader } from '@/components/layout/BusinessHeader';
import { SiteFooter } from '@/components/layout/SiteFooter';

export default function BusinessLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-[#f7f9fb]">
      <BusinessHeader />
      <main id="main-content" className="flex-1">
        {children}
      </main>
      <SiteFooter />
    </div>
  );
}
