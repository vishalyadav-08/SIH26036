"use client";

import { useEffect, useState } from "react";
import { StandardsService } from "@/services/standards";
import { Box, UserCheck, Settings } from "lucide-react";

export default function SealDashboard() {
  const [loading, setLoading] = useState(true);
  const [inventory, setInventory] = useState<any[]>([]);
  const [allocations, setAllocations] = useState<any[]>([]);
  const [equipment, setEquipment] = useState<any[]>([]);

  useEffect(() => {
    async function loadData() {
      try {
        const [invData, allocData, equipData] = await Promise.all([
          StandardsService.getInventory(),
          StandardsService.getAllocations(),
          StandardsService.getEquipment()
        ]);
        
        setInventory(Array.isArray(invData) ? invData : (invData as any)?.results || []);
        setAllocations(Array.isArray(allocData) ? allocData : (allocData as any)?.results || []);
        setEquipment(Array.isArray(equipData) ? equipData : (equipData as any)?.results || []);
      } catch (err: any) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-t-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Standards & Seal Management</h1>
        <p className="mt-1 text-sm text-gray-500">
          Track verification seals and laboratory equipment standard calibration.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
        <div className="bg-white overflow-hidden rounded-lg shadow p-5">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Box className="h-6 w-6 text-indigo-500" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">Seal Batches</dt>
                <dd className="text-lg font-medium text-gray-900">{inventory.length}</dd>
              </dl>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden rounded-lg shadow p-5">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <UserCheck className="h-6 w-6 text-green-500" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">Officer Allocations</dt>
                <dd className="text-lg font-medium text-gray-900">{allocations.length}</dd>
              </dl>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden rounded-lg shadow p-5">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Settings className="h-6 w-6 text-yellow-500" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">Lab Equipment</dt>
                <dd className="text-lg font-medium text-gray-900">{equipment.length}</dd>
              </dl>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
