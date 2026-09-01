"use client";

import { use } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ClipboardCheck } from "lucide-react";

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function FieldInspectionDetailPage({ params }: PageProps) {
  const resolvedParams = use(params);
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Inspection Details</h1>
        <p className="text-sm text-slate-500">Record verification checklist for {resolvedParams.id}</p>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ClipboardCheck className="w-5 h-5" />
            Field Checklist
          </CardTitle>
          <CardDescription>Enter test results and compliance status</CardDescription>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertDescription>
              Checklist data synchronization service is currently unavailable in this environment.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  );
}
