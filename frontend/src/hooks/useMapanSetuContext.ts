"use client";

import { usePathname } from 'next/navigation';
import { useMemo } from 'react';

export interface PageContext {
  page: string;
  feature: string;
  role: string;
}

export function useMapanSetuContext(): PageContext {
  const pathname = usePathname() || '/';

  return useMemo(() => {
    let context: PageContext = {
      page: 'unknown',
      feature: 'general',
      role: 'public'
    };

    if (pathname === '/') {
      context = { page: 'landing', feature: 'home', role: 'public' };
    } else if (pathname.includes('/public/verification')) {
      context = { page: 'public-verification', feature: 'certificate-verification', role: 'public' };
    } else if (pathname.includes('/dashboard/business/applications')) {
      context = { page: 'business-applications', feature: 'application-management', role: 'business' };
    } else if (pathname.includes('/dashboard/business')) {
      context = { page: 'business-dashboard', feature: 'business-overview', role: 'business' };
    } else if (pathname.includes('/dashboard/officer/inspections')) {
      context = { page: 'officer-inspections', feature: 'inspection-management', role: 'officer' };
    } else if (pathname.includes('/dashboard/officer')) {
      context = { page: 'officer-dashboard', feature: 'officer-overview', role: 'officer' };
    } else if (pathname.includes('/dashboard/admin')) {
      context = { page: 'admin-dashboard', feature: 'admin-overview', role: 'admin' };
    }

    return context;
  }, [pathname]);
}
