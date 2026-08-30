import { AdminHeader } from '@/components/layout/AdminHeader';
import { SiteFooter } from '@/components/layout/SiteFooter';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-[#f7f9fb]">
      <AdminHeader />
      <main id="main-content" className="flex-1">
        {children}
      </main>
      <SiteFooter />
    </div>
  );
}
