"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { ArrowLeft, Loader2, Send } from "lucide-react";

import { PageHeader } from "@/components/ui/PageHeader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle } from "lucide-react";

import { createApplication } from "@/services/applications/applications.service";
import { getInstruments } from "@/services/instruments/instruments.service";
import type { Instrument } from "@/types/instrument";

const formSchema = z.object({
  instrumentId: z.string().min(1, "Please select an instrument to verify"),
  reason: z.string().min(10, "Please provide a detailed reason (at least 10 characters)"),
});

type FormValues = z.infer<typeof formSchema>;

export default function NewApplicationPage() {
  const router = useRouter();
  const [instruments, setInstruments] = useState<Instrument[]>([]);
  const [loadingInsts, setLoadingInsts] = useState(true);
  const [serverError, setServerError] = useState<string | null>(null);
  
  const { register, handleSubmit, control, formState: { errors, isSubmitting } } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      instrumentId: "",
      reason: "",
    }
  });

  useEffect(() => {
    async function fetchInstruments() {
      try {
        const data = await getInstruments();
        // Only allow verifying instruments that aren't already pending
        setInstruments(data);
      } catch (err) {
        console.error(err);
        setServerError("Failed to load instruments.");
      } finally {
        setLoadingInsts(false);
      }
    }
    fetchInstruments();
  }, []);

  const onSubmit = async (data: FormValues) => {
    setServerError(null);
    try {
      const newApp = await createApplication({
        instrumentId: data.instrumentId,
        reason: data.reason,
      });
      router.push(`/app/applications/${newApp.id}`);
    } catch (err) {
      console.error(err);
      setServerError("Failed to submit application. Please try again.");
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in duration-500 pb-12">
      <div>
        <Button variant="ghost" asChild className="mb-2 -ml-3 text-slate-500 hover:text-slate-900">
          <Link href="/app/applications">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Applications
          </Link>
        </Button>
        
        <PageHeader 
          title="New Verification Application" 
          subtitle="Submit a request for an official instrument verification."
        />
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <Card>
          <CardHeader>
            <CardTitle>Application Details</CardTitle>
            <CardDescription>Select the instrument you wish to verify and provide a reason for the request.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {serverError && (
              <Alert variant="destructive">
                <AlertTitle>Submission Failed</AlertTitle>
                <AlertDescription>{serverError}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <label htmlFor="instrumentId" className="text-sm font-medium text-slate-900">
                Target Instrument <span className="text-red-500">*</span>
              </label>
              
              {loadingInsts ? (
                <Skeleton className="h-10 w-full" />
              ) : instruments.length === 0 ? (
                <Alert className="bg-amber-50 border-amber-200">
                  <AlertCircle className="h-4 w-4 text-amber-600" />
                  <AlertTitle className="text-amber-800">No Instruments Available</AlertTitle>
                  <AlertDescription className="text-amber-700">
                    You do not have any registered instruments. Please register an instrument first before applying for verification.
                    <div className="mt-3">
                      <Button variant="outline" asChild size="sm">
                        <Link href="/app/instruments/new">Register Instrument</Link>
                      </Button>
                    </div>
                  </AlertDescription>
                </Alert>
              ) : (
                <Controller
                  name="instrumentId"
                  control={control}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger 
                        id="instrumentId"
                        aria-invalid={!!errors.instrumentId}
                        aria-describedby={errors.instrumentId ? "instrumentId-error" : undefined}
                      >
                        <SelectValue placeholder="Select an instrument..." />
                      </SelectTrigger>
                      <SelectContent>
                        {instruments.map(inst => (
                          <SelectItem key={inst.id} value={inst.id}>
                            {inst.instrumentNumber} - {String(inst.instrumentType).replace(/_/g, " ").toLowerCase()}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              )}
              {errors.instrumentId && (
                <p id="instrumentId-error" className="text-xs text-red-500">{errors.instrumentId.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <label htmlFor="reason" className="text-sm font-medium text-slate-900">
                Reason for Verification <span className="text-red-500">*</span>
              </label>
              <Textarea 
                id="reason" 
                placeholder="e.g. Periodic annual statutory verification, or re-verification after repair..." 
                className="min-h-[100px]"
                {...register("reason")} 
                aria-invalid={!!errors.reason}
                aria-describedby={errors.reason ? "reason-error" : undefined}
                disabled={instruments.length === 0 || loadingInsts}
              />
              {errors.reason && (
                <p id="reason-error" className="text-xs text-red-500">{errors.reason.message}</p>
              )}
              <p className="text-[10px] text-slate-500">Provide a brief explanation of why this verification is requested.</p>
            </div>

          </CardContent>
          <CardFooter className="flex justify-end gap-3 border-t bg-slate-50/50 pt-6">
            <Button type="button" variant="outline" asChild disabled={isSubmitting}>
              <Link href="/app/applications">Cancel</Link>
            </Button>
            <Button type="submit" disabled={isSubmitting || instruments.length === 0 || loadingInsts}>
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Submit Application
                </>
              )}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
}
