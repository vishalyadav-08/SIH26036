"use client";

import { useState } from "react";
import { PublicHeader } from "@/components/layout/PublicHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import Link from "next/link";
import { ArrowLeft, MapPin, Phone, CheckCircle, Search } from "lucide-react";

// Mock data for GATC (Government Approved Test Centre) offices
const gatcData: Record<string, { id: string; name: string; address: string; contact: string; categories: string[] }[]> = {
  "Andhra Pradesh": [
    { id: "AP-1", name: "Vijayawada GATC Centre", address: "Autonagar, Vijayawada 520007", contact: "0866-255-4321", categories: ["Water meter", "Clinical Thermometer"] },
    { id: "AP-2", name: "Visakhapatnam Metrology Lab", address: "MVP Colony, Visakhapatnam 530017", contact: "0891-270-1122", categories: ["Beam Scale", "Weights"] }
  ],
  "Assam": [
    { id: "AS-1", name: "Guwahati Reference Lab", address: "Dispur, Guwahati 781005", contact: "0361-223-9988", categories: ["Tape Measures", "Counter Machine"] }
  ],
  "Delhi": [
    { id: "DL-1", name: "National Metrology Institute (GATC)", address: "Pusa Road, New Delhi 110012", contact: "011-2586-1234", categories: ["Water meter", "Clinical Thermometer", "Load cell"] },
    { id: "DL-2", name: "Delhi Weights & Measures Lab", address: "Okhla Industrial Estate, New Delhi 110020", contact: "011-4433-2211", categories: ["Beam Scale", "Weights", "Non-automatic weighing instrument"] },
  ],
  "Gujarat": [
    { id: "GJ-1", name: "Ahmedabad Standard Lab", address: "Navrangpura, Ahmedabad 380009", contact: "079-2630-1234", categories: ["Sphygmomanometer", "Non-automatic weighing instrument"] },
    { id: "GJ-2", name: "Surat Verification Centre", address: "Ring Road, Surat 395002", contact: "0261-234-5678", categories: ["Weights of all Categories", "Tape Measures"] }
  ],
  "Karnataka": [
    { id: "KA-1", name: "Bangalore Metrology Centre", address: "Koramangala, Bangalore 560034", contact: "080-2553-9911", categories: ["Automatic Rail Weighbridges", "Load cell"] },
    { id: "KA-2", name: "Hubli Test Centre", address: "Vidya Nagar, Hubli 580021", contact: "0836-237-4455", categories: ["Counter Machine", "Weights"] }
  ],
  "Maharashtra": [
    { id: "MH-1", name: "Mumbai Metrology Centre", address: "Bandra Kurla Complex, Mumbai 400051", contact: "022-2655-8899", categories: ["Non-automatic weighing", "Sphygmomanometer", "Tape Measures"] },
    { id: "MH-2", name: "Pune GATC Hub", address: "Shivajinagar, Pune 411005", contact: "020-2553-7766", categories: ["Load cell", "Beam Scale", "Water meter"] }
  ],
  "Tamil Nadu": [
    { id: "TN-1", name: "Chennai State Lab", address: "Guindy, Chennai 600032", contact: "044-2250-1122", categories: ["Counter Machine", "Clinical Thermometer"] },
    { id: "TN-2", name: "Coimbatore GATC Office", address: "Peelamedu, Coimbatore 641004", contact: "0422-257-3344", categories: ["Weights of all Categories", "Beam Scale"] }
  ],
  "Uttar Pradesh": [
    { id: "UP-1", name: "UP State Metrology Lab", address: "Gomti Nagar, Lucknow 226010", contact: "0522-230-1122", categories: ["Weights of all Categories", "Counter Machine", "Water meter"] },
    { id: "UP-2", name: "Noida GATC Verification Centre", address: "Sector 62, Noida 201309", contact: "0120-432-8877", categories: ["Automatic Rail Weighbridges", "Clinical Thermometer"] },
    { id: "UP-3", name: "Kanpur Test Centre", address: "Civil Lines, Kanpur 208001", contact: "0512-234-5566", categories: ["Tape Measures", "Beam Scale"] }
  ],
  "West Bengal": [
    { id: "WB-1", name: "Kolkata GATC HQ", address: "Salt Lake City, Kolkata 700091", contact: "033-2334-7788", categories: ["Non-automatic weighing instrument", "Load cell"] }
  ]
};

const allStates = Object.keys(gatcData).sort();

export default function GatcLocatorPage() {
  const [selectedState, setSelectedState] = useState<string>("");

  const offices = selectedState && gatcData[selectedState] ? gatcData[selectedState] : [];

  return (
    <div className="min-h-screen flex flex-col bg-[#f8fafc] text-[#111c2d]">
      <PublicHeader />

      <main id="main-content" className="flex-1 focus:outline-none" tabIndex={-1}>
        <div className="bg-[#f0f3ff] border-b border-[#cbd5e1] py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-sm font-medium text-[#004e9f] hover:underline mb-4"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Home
            </Link>
            <h1 className="text-3xl font-bold text-[#111c2d] mb-2">Nearest GATC Offices</h1>
            <p className="text-[#414753] max-w-2xl">
              Locate Government Approved Test Centres (GATCs) in your state for verification of weights, measures, and instruments.
            </p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 min-h-[50vh]">
          {/* State Selector */}
          <div className="max-w-xl mx-auto mb-10">
            <label htmlFor="state-select" className="block text-sm font-semibold text-[#111c2d] mb-2">
              Select Your State
            </label>
            <div className="relative">
              <select
                id="state-select"
                value={selectedState}
                onChange={(e) => setSelectedState(e.target.value)}
                className="w-full bg-white border border-[#cbd5e1] text-[#111c2d] px-4 py-3 rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-[#004e9f] focus:border-[#004e9f] appearance-none"
              >
                <option value="">-- Choose a State --</option>
                {allStates.map((state) => (
                  <option key={state} value={state}>
                    {state}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-[#414753]">
                <svg className="h-4 w-4 fill-current" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                  <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                </svg>
              </div>
            </div>
          </div>

          {/* Results Area */}
          {selectedState ? (
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-[#cbd5e1] pb-4">
                <h2 className="text-xl font-semibold text-[#111c2d]">
                  GATC Offices in {selectedState} ({offices.length})
                </h2>
              </div>

              {offices.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {offices.map((office) => (
                    <div key={office.id} className="bg-white border border-[#cbd5e1] rounded-lg p-5 shadow-sm hover:shadow-md transition-shadow">
                      <h3 className="font-bold text-[#004e9f] text-lg mb-3">{office.name}</h3>
                      
                      <div className="space-y-3 mb-4 text-sm text-[#414753]">
                        <div className="flex items-start gap-2">
                          <MapPin className="w-4 h-4 text-[#727784] shrink-0 mt-0.5" />
                          <span>{office.address}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Phone className="w-4 h-4 text-[#727784] shrink-0" />
                          <span>{office.contact}</span>
                        </div>
                      </div>

                      <div className="pt-4 border-t border-[#f1f5f9]">
                        <p className="text-xs font-semibold text-[#111c2d] mb-2 uppercase tracking-wide">Verified Categories</p>
                        <div className="flex flex-wrap gap-1.5">
                          {office.categories.map((cat, idx) => (
                            <span key={idx} className="inline-flex items-center gap-1 bg-[#f0f3ff] text-[#004e9f] border border-[#dbe4ff] px-2 py-1 rounded text-[11px] font-medium">
                              <CheckCircle className="w-3 h-3" />
                              {cat}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 bg-white border border-[#cbd5e1] rounded-lg">
                  <Search className="w-10 h-10 text-[#cbd5e1] mx-auto mb-3" />
                  <h3 className="text-lg font-medium text-[#111c2d]">No GATC offices found</h3>
                  <p className="text-sm text-[#727784] mt-1">We couldn&apos;t find any GATC offices for the selected state.</p>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-16 bg-white border border-dashed border-[#cbd5e1] rounded-lg text-[#727784]">
              <MapPin className="w-12 h-12 mx-auto text-[#e2e8f0] mb-4" />
              <p className="text-lg font-medium text-[#111c2d] mb-1">Select a state to find nearby offices</p>
              <p className="text-sm">Choose from the dropdown above to view GATC locations.</p>
            </div>
          )}
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
