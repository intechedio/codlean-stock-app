import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { MaterialSchema, type TrackType, type Unit } from '../../lib/schemas';
import { RHFText } from '../../components/form/RHFText';
import { RHFSelect } from '../../components/form/RHFSelect';
import { Dialog, DialogFooter, DialogHeader } from '../../components/ui/dialog';
import { Button } from '../../components/ui/button';
import { useCatalogStore } from './store';
import { useToast } from '../../components/feedback/Toast';

type FormValues = z.infer<typeof MaterialSchema>;

export function CreateMaterialDialog() {
  const [open, setOpen] = useState(false);
  const createMaterial = useCatalogStore((s) => s.createMaterial);
  const { push } = useToast();
  const { control, handleSubmit, reset } = useForm<FormValues>({
    resolver: zodResolver(MaterialSchema),
    defaultValues: { name: '', brand: '', model: '', unit: 'Adet' as Unit, trackType: 'Normal' as TrackType },
  });
  const onSubmit = handleSubmit((values) => {
    createMaterial(values);
    push({ title: 'Malzeme oluşturuldu', kind: 'success' });
    setOpen(false);
    reset();
  });

  return (
    <>
      <Button onClick={() => setOpen(true)}>Yeni Stok</Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogHeader>Yeni Stok</DialogHeader>
        <form className="space-y-3" onSubmit={onSubmit}>
          <RHFText control={control} name="name" label="Ad" placeholder="Stok adı" />
          <RHFText control={control} name="brand" label="Marka" placeholder="Marka" />
          <RHFText control={control} name="model" label="Model" placeholder="Model" />
          <RHFSelect control={control} name="unit" label="Birim">
            <option value="Adet">Adet</option>
            <option value="Kilogram">Kilogram</option>
          </RHFSelect>
          <RHFSelect control={control} name="trackType" label="Takip Tipi">
            <option value="Normal">Normal</option>
            <option value="Seri Takip">Seri Takip</option>
          </RHFSelect>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>İptal</Button>
            <Button type="submit">Oluştur</Button>
          </DialogFooter>
        </form>
      </Dialog>
    </>
  );
}



