"use client";

import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { UserCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function FieldProfilePage() {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Officer Profile</h1>
        <p className="text-sm text-slate-500">View your operational identity.</p>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-emerald-600" />
            Identity Details
          </CardTitle>
          <CardDescription>Legal Metrology Officer credentials</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <AlertDescription className="text-xs">
              Profile updates must be managed through the central admin directory.
            </AlertDescription>
          </Alert>
          
          <div className="grid grid-cols-2 gap-4 pt-2">
            <div>
              <p className="text-xs text-slate-500 font-semibold uppercase">Name</p>
              <p className="text-sm font-medium">{user?.displayName || "Field Officer"}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500 font-semibold uppercase">Role</p>
              <Badge variant="secondary" className="mt-1">{user?.role}</Badge>
            </div>
            <div>
              <p className="text-xs text-slate-500 font-semibold uppercase">Email</p>
              <p className="text-sm font-medium">{user?.email}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
