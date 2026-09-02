"use client";

import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Download, Smartphone, ShieldCheck, Zap } from "lucide-react";

export function AppPromoModal() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Check if the user has already seen the popup in this session
    const hasSeenPromo = sessionStorage.getItem("mapansetu_app_promo_seen");
    if (!hasSeenPromo) {
      // Add a small delay so it doesn't appear immediately on load
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
      sessionStorage.setItem("mapansetu_app_promo_seen", "true");
    }
  };

  // Replace this with the actual Google Drive link
  const gdriveLink = "#";

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <div className="mx-auto w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-4">
            <Smartphone className="w-6 h-6" />
          </div>
          <DialogTitle className="text-center text-xl text-[#004e9f]">
            Download the MapanSetu App
          </DialogTitle>
          <DialogDescription className="text-center text-sm mt-2">
            Experience seamless metrology services on the go. The official MapanSetu app is now available for download.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <h4 className="text-sm font-semibold text-gray-900 mb-3">Key Features:</h4>
          <ul className="space-y-3">
            <li className="flex gap-3 text-sm text-gray-600">
              <Zap className="w-5 h-5 text-amber-500 shrink-0" />
              <span><strong>Instant Verification:</strong> Scan QR codes on instruments for quick authenticity checks.</span>
            </li>
            <li className="flex gap-3 text-sm text-gray-600">
              <ShieldCheck className="w-5 h-5 text-green-600 shrink-0" />
              <span><strong>Secure Access:</strong> Role-based dashboards for Businesses and Officers.</span>
            </li>
            <li className="flex gap-3 text-sm text-gray-600">
              <Download className="w-5 h-5 text-blue-500 shrink-0" />
              <span><strong>Offline Capabilities:</strong> Access crucial verification data even with low connectivity.</span>
            </li>
          </ul>
        </div>

        <DialogFooter className="flex-col sm:flex-col gap-2">
          <Button 
            className="w-full bg-[#004e9f] hover:bg-[#003366] text-white flex items-center justify-center gap-2"
            asChild
          >
            <a href={gdriveLink} target="_blank" rel="noopener noreferrer">
              <Download className="w-4 h-4" />
              Download APK from Google Drive
            </a>
          </Button>
          <Button 
            variant="outline" 
            className="w-full"
            onClick={() => handleOpenChange(false)}
          >
            Maybe Later
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
