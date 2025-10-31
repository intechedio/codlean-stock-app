import { useState, useEffect } from 'react';
import { useFormContext } from 'react-hook-form';
import { Dialog, DialogFooter, DialogHeader } from '../../../components/ui/dialog';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import type { Material } from '../../../lib/schemas';
import { useInventoryStore } from '../store';
import { SerialsSchemaFactory } from '../../../lib/schemas';

interface Props {
  material: Material;
  qty: number;
  index: number;
  onConfirm: (serials: string[]) => void;
  hasSerials?: boolean;
}

export function SerialModal({ material, qty, index, onConfirm, hasSerials = false }: Props) {
  const [open, setOpen] = useState(false);
  const [serials, setSerials] = useState<string[]>([]);
  const [error, setError] = useState<string>('');
  const getSerialIndex = useInventoryStore((s) => s.getSerialIndex);
  const { watch } = useFormContext();
  const allLines = watch('lines') || [];
  const existingSerials = allLines.flatMap((line: any, idx: number) => idx !== index ? (line.serials || []) : []);

  // Initialize serials array when modal opens
  useEffect(() => {
    if (open) {
      const savedSerials = (allLines[index] as any)?.serials || [];
      // Only use saved serials if count matches qty, otherwise create new array
      if (savedSerials.length === qty) {
        setSerials([...savedSerials]);
      } else {
        setSerials(Array(qty).fill(''));
      }
      setError('');
    }
  }, [open, qty, index, allLines]);

  const updateSerial = (idx: number, value: string) => {
    const newSerials = [...serials];
    newSerials[idx] = value;
    setSerials(newSerials);
    setError('');
  };

  const handleSave = () => {
    setError('');
    const trimmed = serials.map((s) => s.trim()).filter(Boolean);
    const schema = SerialsSchemaFactory({
      trackType: material.trackType,
      qty,
      serialIndex: getSerialIndex(),
      existing: existingSerials,
    });
    const result = schema.safeParse(trimmed);
    if (!result.success) {
      setError(result.error.issues[0]?.message || 'Geçersiz seri numaraları');
      return;
    }
    onConfirm(trimmed);
    setOpen(false);
  };

  const handleCancel = () => {
    setOpen(false);
    setError('');
  };

  if (material.trackType !== 'Seri Takip') return null;

  return (
    <>
      <Button type="button" size="sm" variant={hasSerials ? "outline" : "secondary"} onClick={() => setOpen(true)}>
        {hasSerials ? `✓ Seri Ekle (${qty})` : "Seri Ekle"}
      </Button>
      <Dialog open={open} onOpenChange={(isOpen) => {
        if (!isOpen) handleCancel();
        else setOpen(true);
      }}>
        <DialogHeader>Seri Numaraları ({qty} adet)</DialogHeader>
        <div className="space-y-3">
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {Array.from({ length: qty }).map((_, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <label className="text-sm font-medium w-12">{idx + 1}.</label>
                <Input
                  value={serials[idx] || ''}
                  onChange={(e) => updateSerial(idx, e.target.value)}
                  placeholder={`Seri ${idx + 1}`}
                  autoFocus={idx === 0}
                />
              </div>
            ))}
          </div>
          <div className="text-xs text-muted-foreground text-center">
            {serials.filter((s) => s.trim()).length} / {qty} seri girildi
          </div>
          {error && <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md p-2">{error}</div>}
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={handleCancel}>
              İptal
            </Button>
            <Button type="button" onClick={handleSave}>
              Kaydet
            </Button>
          </DialogFooter>
        </div>
      </Dialog>
    </>
  );
}
