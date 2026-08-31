import { ReactNode } from "react";
import { BusinessHeader } from "@/components/layout/BusinessHeader";
import { BusinessSidebar } from "@/components/layout/BusinessSidebar";

export const metadata = {
  title: "MapanSetu Business Portal",
  description: "Manage instruments and applications.",
};

export default function BusinessLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <BusinessHeader />
      
      <div className="flex-1 flex max-w-[1600px] w-full mx-auto">
        <BusinessSidebar />
        
        <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
