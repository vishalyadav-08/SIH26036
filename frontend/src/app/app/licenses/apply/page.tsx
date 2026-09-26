"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronRight, Factory, Store, PenTool, Package } from "lucide-react";

const categories = [
  {
    id: "MANUFACTURER",
    name: "Manufacturer License",
    description: "For manufacturing weights, measures, or measuring instruments.",
    icon: Factory,
    href: "/app/licenses/apply/MANUFACTURER",
  },
  {
    id: "DEALER",
    name: "Dealer License",
    description: "For trading or selling weights, measures, or measuring instruments.",
    icon: Store,
    href: "/app/licenses/apply/DEALER",
  },
  {
    id: "REPAIRER",
    name: "Repairer License",
    description: "For repairing weights, measures, or measuring instruments.",
    icon: PenTool,
    href: "/app/licenses/apply/REPAIRER",
  },
  {
    id: "PACKER_IMPORTER",
    name: "Packer/Importer Registration",
    description: "Registration for packers or importers of pre-packaged commodities (Rule 27).",
    icon: Package,
    href: "/app/licenses/apply/PACKER_IMPORTER",
  },
];

export default function SelectLicenseCategoryPage() {
  const router = useRouter();

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Apply for a New License</h1>
        <p className="mt-1 text-sm text-gray-500">
          Select the category of license or registration you need. The requirements and fees will vary based on your selection.
        </p>
      </div>

      <div className="overflow-hidden rounded-md bg-white shadow">
        <ul className="divide-y divide-gray-200">
          {categories.map((category) => (
            <li key={category.id}>
              <button
                onClick={() => router.push(category.href)}
                className="block w-full hover:bg-gray-50 text-left"
              >
                <div className="flex items-center px-4 py-4 sm:px-6">
                  <div className="flex min-w-0 flex-1 items-center">
                    <div className="flex-shrink-0">
                      <category.icon className="h-8 w-8 text-indigo-600" aria-hidden="true" />
                    </div>
                    <div className="min-w-0 flex-1 px-4 md:grid md:grid-cols-2 md:gap-4">
                      <div>
                        <p className="truncate text-sm font-medium text-indigo-600">{category.name}</p>
                        <p className="mt-2 flex items-center text-sm text-gray-500">
                          <span className="truncate">{category.description}</span>
                        </p>
                      </div>
                    </div>
                  </div>
                  <div>
                    <ChevronRight className="h-5 w-5 text-gray-400" aria-hidden="true" />
                  </div>
                </div>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
