import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";

export default function FieldConflictsPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Conflict Resolution</h1>
        <p className="text-sm text-slate-500">Resolve data mismatches from offline sync operations.</p>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-600" />
            Pending Conflicts
          </CardTitle>
          <CardDescription>Review and resolve synchronization issues</CardDescription>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertDescription>
              No synchronization conflicts detected.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  );
}
