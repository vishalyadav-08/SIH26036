"use client";

import { useAuth } from "@/hooks/useAuth";
import { UserCircle, Mail, Briefcase, Building2, Shield, LogOut, Info } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Skeleton } from "@/components/ui/skeleton";

export default function BusinessProfilePage() {
  const { user, logout, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto space-y-8 pb-12 animate-in fade-in duration-500">
        <PageHeader title="Business Profile" subtitle="Manage your business identity and account settings." />
        <div className="space-y-6">
          <Skeleton className="h-64 w-full rounded-xl" />
          <Skeleton className="h-40 w-full rounded-xl" />
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-3xl mx-auto space-y-8 pb-12 animate-in fade-in duration-500">
        <PageHeader title="Business Profile" subtitle="Manage your business identity and account settings." />
        <Alert variant="destructive">
          <AlertDescription>User session not found. Please log in again.</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8 pb-12 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <PageHeader 
          title="Business Profile" 
          subtitle="View your business identity and authenticated session." 
        />
        <Button variant="outline" className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200" onClick={logout}>
          <LogOut className="w-4 h-4 mr-2" />
          Sign Out
        </Button>
      </div>

      <Alert className="bg-blue-50 border-blue-200">
        <Info className="h-5 w-5 text-blue-600" />
        <AlertDescription className="text-blue-700">
          This is a read-only view. Profile editing and password management are currently managed externally by the central government identity provider.
        </AlertDescription>
      </Alert>

      <div className="space-y-6">
        <Card className="shadow-sm border-slate-200">
          <CardHeader className="bg-slate-50/50 border-b pb-4">
            <CardTitle className="flex items-center gap-2 text-lg">
              <UserCircle className="w-5 h-5 text-slate-700" />
              Identity Information
            </CardTitle>
            <CardDescription>Your registered primary contact identity.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                  <UserCircle className="w-3.5 h-3.5" />
                  Full Name
                </div>
                <div className="font-medium text-slate-900">{user.displayName}</div>
              </div>
              
              <div>
                <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5" />
                  Email Address
                </div>
                <div className="font-medium text-slate-900">{user.email}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-slate-200">
          <CardHeader className="bg-slate-50/50 border-b pb-4">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Briefcase className="w-5 h-5 text-slate-700" />
              Business Account
            </CardTitle>
            <CardDescription>Legal metrology registration details.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5" />
                  Business ID
                </div>
                <div className="font-medium text-slate-900 font-mono text-sm bg-slate-50 p-2 rounded border border-slate-100 inline-block mt-0.5">
                  {user.businessId || "Not assigned"}
                </div>
              </div>
              
              <div>
                <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5" />
                  Account Role
                </div>
                <div className="mt-1">
                  <Badge variant="outline" className="bg-slate-50">
                    {user.role}
                  </Badge>
                </div>
              </div>

              <div>
                <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                  Account Status
                </div>
                <div className="mt-1">
                  <StatusBadge status={user.active ? "ACTIVE" : "EXPIRED"} />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
