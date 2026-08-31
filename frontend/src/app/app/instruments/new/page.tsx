"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { ArrowLeft, Loader2, Save } from "lucide-react";

import { PageHeader } from "@/components/ui/PageHeader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

import { registerInstrument } from "@/services/instruments/instruments.service";

const INSTRUMENT_TYPES = [
  { value: "ELECTRONIC_SCALE", label: "Electronic Scale" },
  { value: "PLATFORM_SCALE", label: "Platform Scale" },
  { value: "COUNTER_SCALE", label: "Counter Scale" },
  { value: "WEIGHBRIDGE", label: "Weighbridge" },
  { value: "SPRING_BALANCE", label: "Spring Balance" },
  { value: "MEASURING_TAPE", label: "Measuring Tape" },
];

const formSchema = z.object({
  instrumentNumber: z.string().min(3, "Instrument ID must be at least 3 characters").max(50, "Too long"),
  serialNumber: z.string().optional(),
  instrumentType: z.string().min(1, "Please select an instrument type"),
  manufacturer: z.string().min(2, "Manufacturer is required"),
  model: z.string().min(2, "Model is required"),
  capacity: z.string().min(1, "Capacity is required").refine(val => !isNaN(Number(val)) && Number(val) > 0, "Capacity must be a positive number"),
  capacityUnit: z.string().min(1, "Unit is required"),
  location: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function RegisterInstrumentPage() {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  
  const { register, handleSubmit, control, formState: { errors, isSubmitting } } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      instrumentNumber: "",
      serialNumber: "",
      instrumentType: "",
      manufacturer: "",
      model: "",
      capacity: "",
      capacityUnit: "kg",
      location: "",
    }
  });

  const onSubmit = async (data: FormValues) => {
    setServerError(null);
    try {
      const payload = {
        ...data,
        capacity: Number(data.capacity)
      };
      const newInst = await registerInstrument(payload);
      router.push(`/app/instruments/${newInst.id}`);
    } catch (err) {
      console.error(err);
      setServerError("Failed to register instrument. Please try again.");
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in duration-500 pb-12">
      <div>
        <Button variant="ghost" asChild className="mb-2 -ml-3 text-slate-500 hover:text-slate-900">
          <Link href="/app/instruments">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Instruments
          </Link>
        </Button>
        
        <PageHeader 
          title="Register Instrument" 
          subtitle="Add a new measuring device to your business profile."
        />
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <Card>
          <CardHeader>
            <CardTitle>Instrument Details</CardTitle>
            <CardDescription>All required fields must be filled accurately according to the device&apos;s nameplate.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {serverError && (
              <Alert variant="destructive">
                <AlertTitle>Registration Failed</AlertTitle>
                <AlertDescription>{serverError}</AlertDescription>
              </Alert>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label htmlFor="instrumentNumber" className="text-sm font-medium text-slate-900">
                  Internal Instrument ID <span className="text-red-500">*</span>
                </label>
                <Input 
                  id="instrumentNumber" 
                  placeholder="e.g. SCALE-01" 
                  {...register("instrumentNumber")} 
                  aria-invalid={!!errors.instrumentNumber}
                  aria-describedby={errors.instrumentNumber ? "instrumentNumber-error" : undefined}
                />
                {errors.instrumentNumber && (
                  <p id="instrumentNumber-error" className="text-xs text-red-500">{errors.instrumentNumber.message}</p>
                )}
                <p className="text-[10px] text-slate-500">A unique identifier you use internally for this device.</p>
              </div>

              <div className="space-y-2">
                <label htmlFor="serialNumber" className="text-sm font-medium text-slate-900">
                  Serial Number
                </label>
                <Input 
                  id="serialNumber" 
                  placeholder="e.g. SN-123456" 
                  {...register("serialNumber")} 
                />
                <p className="text-[10px] text-slate-500">The manufacturer&apos;s serial number if available.</p>
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="instrumentType" className="text-sm font-medium text-slate-900">
                Instrument Type <span className="text-red-500">*</span>
              </label>
              <Controller
                name="instrumentType"
                control={control}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger 
                      id="instrumentType"
                      aria-invalid={!!errors.instrumentType}
                      aria-describedby={errors.instrumentType ? "instrumentType-error" : undefined}
                    >
                      <SelectValue placeholder="Select type..." />
                    </SelectTrigger>
                    <SelectContent>
                      {INSTRUMENT_TYPES.map(type => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.instrumentType && (
                <p id="instrumentType-error" className="text-xs text-red-500">{errors.instrumentType.message}</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label htmlFor="manufacturer" className="text-sm font-medium text-slate-900">
                  Manufacturer <span className="text-red-500">*</span>
                </label>
                <Input 
                  id="manufacturer" 
                  placeholder="e.g. Mettler Toledo" 
                  {...register("manufacturer")} 
                  aria-invalid={!!errors.manufacturer}
                  aria-describedby={errors.manufacturer ? "manufacturer-error" : undefined}
                />
                {errors.manufacturer && (
                  <p id="manufacturer-error" className="text-xs text-red-500">{errors.manufacturer.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <label htmlFor="model" className="text-sm font-medium text-slate-900">
                  Model <span className="text-red-500">*</span>
                </label>
                <Input 
                  id="model" 
                  placeholder="e.g. IND236" 
                  {...register("model")} 
                  aria-invalid={!!errors.model}
                  aria-describedby={errors.model ? "model-error" : undefined}
                />
                {errors.model && (
                  <p id="model-error" className="text-xs text-red-500">{errors.model.message}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label htmlFor="capacity" className="text-sm font-medium text-slate-900">
                  Maximum Capacity <span className="text-red-500">*</span>
                </label>
                <Input 
                  id="capacity" 
                  type="number"
                  step="0.01"
                  placeholder="e.g. 100" 
                  {...register("capacity")} 
                  aria-invalid={!!errors.capacity}
                  aria-describedby={errors.capacity ? "capacity-error" : undefined}
                />
                {errors.capacity && (
                  <p id="capacity-error" className="text-xs text-red-500">{errors.capacity.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <label htmlFor="capacityUnit" className="text-sm font-medium text-slate-900">
                  Unit <span className="text-red-500">*</span>
                </label>
                <Controller
                  name="capacityUnit"
                  control={control}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger 
                        id="capacityUnit"
                        aria-invalid={!!errors.capacityUnit}
                        aria-describedby={errors.capacityUnit ? "capacityUnit-error" : undefined}
                      >
                        <SelectValue placeholder="Select unit..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="kg">Kilograms (kg)</SelectItem>
                        <SelectItem value="g">Grams (g)</SelectItem>
                        <SelectItem value="mg">Milligrams (mg)</SelectItem>
                        <SelectItem value="t">Tonnes (t)</SelectItem>
                        <SelectItem value="l">Litres (l)</SelectItem>
                        <SelectItem value="ml">Millilitres (ml)</SelectItem>
                        <SelectItem value="m">Metres (m)</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.capacityUnit && (
                  <p id="capacityUnit-error" className="text-xs text-red-500">{errors.capacityUnit.message}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="location" className="text-sm font-medium text-slate-900">
                Location in Premises
              </label>
              <Input 
                id="location" 
                placeholder="e.g. Warehouse 3, Bay A" 
                {...register("location")} 
              />
            </div>
          </CardContent>
          <CardFooter className="flex justify-end gap-3 border-t bg-slate-50/50 pt-6">
            <Button type="button" variant="outline" asChild disabled={isSubmitting}>
              <Link href="/app/instruments">Cancel</Link>
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Registering...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Register Instrument
                </>
              )}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
}
