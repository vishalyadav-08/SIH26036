import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function FieldInspectionsPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Inspections</h1>
        <p className="text-sm text-slate-500">Manage your assigned verification requests.</p>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Assigned Queue</CardTitle>
          <CardDescription>Inspections allocated to you</CardDescription>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertDescription>
              No pending inspections assigned at this time.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  );
}
