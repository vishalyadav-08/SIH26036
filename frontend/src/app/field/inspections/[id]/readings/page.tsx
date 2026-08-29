"use client";

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ArrowLeft, Plus, Loader2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import { offlineService } from '@/services/field/offline.service';
import { useState, useEffect } from 'react';

const readingSchema = z.object({
  testPoint: z.number().min(0, "Must be positive"),
  referenceValue: z.number(),
  indicatedValue: z.number(),
  unit: z.enum(['kg', 'g', 'L', 'mL', 'm']),
  notes: z.string().optional(),
});

type ReadingForm = z.infer<typeof readingSchema>;

export default function ReadingsScreen() {
  const params = useParams() as { id: string };
  const [readings, setReadings] = useState<(ReadingForm & { errorValue: number })[]>([]);
  
  useEffect(() => {
    offlineService.getInspectionDraft(params.id).then(draft => {
      if (draft && draft.readings) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        setReadings(draft.readings as any);
      }
    });
  }, [params.id]);

  const { register, handleSubmit, watch, reset, formState: { errors } } = useForm<ReadingForm>({
    resolver: zodResolver(readingSchema),
    defaultValues: { unit: 'kg' }
  });

  const refVal = watch("referenceValue") || 0;
  const indVal = watch("indicatedValue") || 0;
  const calculatedError = (Number(indVal) - Number(refVal)).toFixed(3);

  const saveMutation = useMutation({
    mutationFn: async (data: ReadingForm) => {
      const newReading = {
        ...data,
        errorValue: Number(calculatedError),
        sequence: readings.length + 1,
        capturedAt: new Date().toISOString()
      };
      const updatedReadings = [...readings, newReading];
      await offlineService.saveDraft(params.id, { readings: updatedReadings });
      return newReading;
    },
    onSuccess: (newReading) => {
      setReadings(prev => [...prev, newReading]);
      reset();
    }
  });

  const onSubmit = (data: ReadingForm) => {
    saveMutation.mutate(data);
  };

  return (
    <div className="space-y-6 pb-20">
      <div className="flex items-center gap-3">
        <Link href={`/field/inspections/${params.id}`} className="p-2 -ml-2 bg-transparent rounded-full hover:bg-gray-100">
          <ArrowLeft className="w-5 h-5 text-gray-700" />
        </Link>
        <h1 className="text-xl font-bold tracking-tight text-gray-900">Readings</h1>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <h2 className="font-semibold text-gray-800 mb-4">Add Measurement</h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Test Point</label>
            <input type="number" step="any" {...register('testPoint', { valueAsNumber: true })} className="w-full border-gray-200 rounded-lg shadow-sm" placeholder="e.g. 50" />
            {errors.testPoint && <p className="text-red-500 text-xs mt-1">{errors.testPoint.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Reference Value</label>
            <input type="number" step="any" {...register('referenceValue', { valueAsNumber: true })} className="w-full border-gray-200 rounded-lg shadow-sm" placeholder="e.g. 50" />
            {errors.referenceValue && <p className="text-red-500 text-xs mt-1">{errors.referenceValue.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Indicated Value</label>
            <input type="number" step="any" {...register('indicatedValue', { valueAsNumber: true })} className="w-full border-gray-200 rounded-lg shadow-sm" placeholder="e.g. 49.9" />
            {errors.indicatedValue && <p className="text-red-500 text-xs mt-1">{errors.indicatedValue.message}</p>}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Unit</label>
              <select {...register('unit')} className="w-full border-gray-200 rounded-lg shadow-sm">
                <option value="kg">kg</option>
                <option value="g">g</option>
                <option value="L">L</option>
                <option value="mL">mL</option>
                <option value="m">m</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Error</label>
              <input type="text" readOnly value={calculatedError} className="w-full bg-gray-50 border-gray-200 rounded-lg text-gray-500 shadow-sm outline-none" />
            </div>
          </div>
          
          <button 
            type="submit" 
            disabled={saveMutation.isPending}
            className="w-full py-2.5 flex items-center justify-center gap-2 text-blue-600 font-medium border-2 border-dashed border-blue-200 rounded-lg hover:bg-blue-50 transition-colors disabled:opacity-50"
          >
            {saveMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
            <span>Save Reading</span>
          </button>
          
          {saveMutation.isError && (
            <p className="text-red-500 text-xs mt-2 text-center">Failed to save reading to server.</p>
          )}
        </div>
      </form>

      {/* Recorded Readings List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-100 flex justify-between items-center bg-gray-50">
          <h3 className="font-medium text-gray-800 text-sm">Recorded Values</h3>
          <span className="text-xs font-semibold px-2 py-1 bg-green-100 text-green-800 rounded">{readings.length} Entry</span>
        </div>
        <div className="divide-y divide-gray-100">
          {readings.length === 0 ? (
             <div className="p-4 text-center text-sm text-gray-500">No readings recorded yet</div>
          ) : readings.map((r, i) => (
            <div key={i} className="p-4 flex justify-between items-center text-sm">
              <div>
                <p className="font-medium text-gray-900">{r.referenceValue} {r.unit} Ref</p>
                <p className="text-gray-500">{r.indicatedValue} {r.unit} Indicated</p>
              </div>
              <div className="text-right">
                <p className={Number(r.errorValue) === 0 ? "font-medium text-green-600" : "font-medium text-orange-600"}>
                  Error: {r.errorValue} {r.unit}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-200 flex justify-between z-10 md:static md:bg-transparent md:border-0 md:p-0">
        <Link 
          href={`/field/inspections/${params.id}/checklist`}
          className="px-6 py-2.5 rounded-lg font-medium text-gray-700 bg-gray-100 hover:bg-gray-200"
        >
          Back
        </Link>
        <Link 
          href={`/field/inspections/${params.id}/evidence`}
          className="px-6 py-2.5 rounded-lg font-medium text-white bg-blue-600 hover:bg-blue-700 shadow-sm"
        >
          Next: Evidence
        </Link>
      </div>
    </div>
  );
}
