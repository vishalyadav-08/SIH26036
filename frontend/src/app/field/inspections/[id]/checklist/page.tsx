"use client";

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ArrowLeft, Save, Loader2, Check } from 'lucide-react';
import { useState, useEffect } from 'react';
import { offlineService } from '@/services/field/offline.service';

const defaultChecklist = [
  { id: 'seal', label: 'Manufacturer Seal Intact', required: true, checked: false, notes: '' },
  { id: 'plate', label: 'Stamping Plate Visible', required: true, checked: false, notes: '' },
  { id: 'zero', label: 'Zero Error Within Limits', required: true, checked: false, notes: '' },
  { id: 'prev_cert', label: 'Previous Certificate Available', required: false, checked: false, notes: '' },
  { id: 'manual', label: 'User Manual Present', required: false, checked: false, notes: '' },
];

export default function ChecklistScreen() {
  const params = useParams() as { id: string };
  const [items, setItems] = useState(defaultChecklist);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<number | null>(null);

  useEffect(() => {
    offlineService.getInspectionDraft(params.id).then(draft => {
      if (draft && draft.checklist) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        setItems(draft.checklist as any);
      }
    });
  }, [params.id]);

  const saveChecklist = async (currentItems: typeof defaultChecklist) => {
    setIsSaving(true);
    await offlineService.saveDraft(params.id, { checklist: currentItems });
    // eslint-disable-next-line react-hooks/purity
    setLastSaved(Date.now());
    setIsSaving(false);
  };

  const updateItem = (id: string, updates: Partial<typeof defaultChecklist[0]>) => {
    const newItems = items.map(item => item.id === id ? { ...item, ...updates } : item);
    setItems(newItems);
    saveChecklist(newItems); // Auto-save
  };

  return (
    <div className="space-y-6 pb-20">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href={`/field/inspections/${params.id}`} className="p-2 -ml-2 bg-transparent rounded-full hover:bg-gray-100">
            <ArrowLeft className="w-5 h-5 text-gray-700" />
          </Link>
          <h1 className="text-xl font-bold tracking-tight text-gray-900">Checklist</h1>
        </div>
        <div className="text-xs font-medium text-gray-500 flex items-center gap-1">
          {isSaving ? <Loader2 className="w-3 h-3 animate-spin" /> : lastSaved ? <><Check className="w-3 h-3 text-green-500"/> Saved</> : 'Unsaved'}
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 bg-gray-50 border-b border-gray-100">
          <h2 className="font-semibold text-gray-800">Physical Verification</h2>
        </div>
        <div className="divide-y divide-gray-100">
          {items.slice(0, 3).map(item => (
            <ChecklistItem 
              key={item.id} 
              item={item} 
              onChange={(updates) => updateItem(item.id, updates)} 
            />
          ))}
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 bg-gray-50 border-b border-gray-100">
          <h2 className="font-semibold text-gray-800">Documentation</h2>
        </div>
        <div className="divide-y divide-gray-100">
          {items.slice(3).map(item => (
            <ChecklistItem 
              key={item.id} 
              item={item} 
              onChange={(updates) => updateItem(item.id, updates)} 
            />
          ))}
        </div>
      </div>
      
      {/* Footer Navigation */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-200 flex justify-between z-10 md:static md:bg-transparent md:border-0 md:p-0">
        <Link 
          href={`/field/inspections/${params.id}`}
          className="px-6 py-2.5 rounded-lg font-medium text-gray-700 bg-gray-100 hover:bg-gray-200"
        >
          Back
        </Link>
        <Link 
          href={`/field/inspections/${params.id}/readings`}
          className="px-6 py-2.5 rounded-lg font-medium text-white bg-blue-600 hover:bg-blue-700 shadow-sm"
        >
          Next: Readings
        </Link>
      </div>
    </div>
  );
}

function ChecklistItem({ item, onChange }: { 
  item: { label: string; required: boolean; checked: boolean; notes: string }; 
  onChange: (updates: Partial<{ label: string; required: boolean; checked: boolean; notes: string }>) => void 
}) {
  return (
    <div className="flex items-start gap-3 p-4 hover:bg-gray-50 transition-colors">
      <div className="pt-0.5">
        <input 
          type="checkbox" 
          checked={item.checked}
          onChange={(e) => onChange({ checked: e.target.checked })}
          className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
        />
      </div>
      <div className="flex-1">
        <label className="text-sm font-medium text-gray-900 block cursor-pointer" onClick={() => onChange({ checked: !item.checked })}>
          {item.label} {item.required && <span className="text-red-500">*</span>}
        </label>
        <input 
          type="text" 
          value={item.notes}
          onChange={(e) => onChange({ notes: e.target.value })}
          placeholder="Optional notes..." 
          className="mt-2 w-full text-sm border-gray-200 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
      </div>
    </div>
  );
}
