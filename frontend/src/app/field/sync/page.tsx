import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { RefreshCw } from "lucide-react";

export default function FieldSyncCenterPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Sync Center</h1>
        <p className="text-sm text-slate-500">Synchronize offline data with the MapanSetu network.</p>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <RefreshCw className="w-5 h-5" />
            Synchronization Status
          </CardTitle>
          <CardDescription>Review and push local changes</CardDescription>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertDescription>
              All offline records are synced. You are up to date.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  );
}
