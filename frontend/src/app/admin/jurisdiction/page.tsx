"use client";

import { useEffect, useState } from "react";
import { JurisdictionService } from "@/services/jurisdiction";
import { Map, MapPin, Building, Shield } from "lucide-react";

export default function JurisdictionDashboard() {
  const [loading, setLoading] = useState(true);
  const [states, setStates] = useState<any[]>([]);
  const [divisions, setDivisions] = useState<any[]>([]);
  const [districts, setDistricts] = useState<any[]>([]);
  const [assignments, setAssignments] = useState<any[]>([]);

  useEffect(() => {
    async function loadData() {
      try {
        const [statesData, divsData, distsData, assignsData] = await Promise.all([
          JurisdictionService.getStates(),
          JurisdictionService.getDivisions(),
          JurisdictionService.getDistricts(),
          JurisdictionService.getAssignments()
        ]);
        
        setStates(Array.isArray(statesData) ? statesData : (statesData as any)?.results || []);
        setDivisions(Array.isArray(divsData) ? divsData : (divsData as any)?.results || []);
        setDistricts(Array.isArray(distsData) ? distsData : (distsData as any)?.results || []);
        setAssignments(Array.isArray(assignsData) ? assignsData : (assignsData as any)?.results || []);
      } catch (err: any) {
        console.error("Failed to load jurisdiction data", err);
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
        <h1 className="text-2xl font-bold text-gray-900">Jurisdiction & Routing Configuration</h1>
        <p className="mt-1 text-sm text-gray-500">
          Manage states, divisions, districts, and officer assignments.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <div className="bg-white overflow-hidden rounded-lg shadow p-5">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Map className="h-6 w-6 text-gray-400" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">States Configured</dt>
                <dd className="text-lg font-medium text-gray-900">{states.length}</dd>
              </dl>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden rounded-lg shadow p-5">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Building className="h-6 w-6 text-gray-400" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">Divisions</dt>
                <dd className="text-lg font-medium text-gray-900">{divisions.length}</dd>
              </dl>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden rounded-lg shadow p-5">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <MapPin className="h-6 w-6 text-gray-400" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">Districts Configured</dt>
                <dd className="text-lg font-medium text-gray-900">{districts.length}</dd>
              </dl>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden rounded-lg shadow p-5">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Shield className="h-6 w-6 text-gray-400" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">Active Officer Assignments</dt>
                <dd className="text-lg font-medium text-gray-900">{assignments.length}</dd>
              </dl>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-md mt-8">
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
          <h3 className="text-lg leading-6 font-medium text-gray-900">Current Assignments</h3>
        </div>
        <ul className="divide-y divide-gray-200">
          {assignments.length === 0 ? (
            <li className="px-4 py-8 text-center text-gray-500 text-sm">
              No officer assignments configured yet.
            </li>
          ) : (
            assignments.map((assignment) => (
              <li key={assignment.id} className="px-4 py-4 sm:px-6">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-indigo-600 truncate">
                    {assignment.officer_details?.displayName || assignment.officer}
                  </p>
                  <div className="ml-2 flex-shrink-0 flex">
                    <p className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                      {assignment.designation}
                    </p>
                  </div>
                </div>
                <div className="mt-2 sm:flex sm:justify-between">
                  <div className="sm:flex">
                    <p className="flex items-center text-sm text-gray-500">
                      <MapPin className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                      {assignment.district_details?.name || assignment.division_details?.name || assignment.state_details?.name}
                    </p>
                  </div>
                </div>
              </li>
            ))
          )}
        </ul>
      </div>
    </div>
  );
}
