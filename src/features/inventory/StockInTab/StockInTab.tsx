import { FormProvider, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { StockInHeaderSchema, StockInLineSchema } from '../../../lib/schemas';
import { RHFSelect } from '../../../components/form/RHFSelect';
import { RHFDate } from '../../../components/form/RHFDate';
import { RHFText } from '../../../components/form/RHFText';
import { Button } from '../../../components/ui/button';
import { ItemsGrid } from './ItemsGrid';
import { useInventoryStore } from '../store';
import { useCatalogStore } from '../../catalog/store';
import { useToast } from '../../../components/feedback/Toast';
import type { ID } from '../../../lib/schemas';
import { isoNow } from '../../../lib/utils';

const formSchema = z.object({
  header: StockInHeaderSchema,
  lines: z.array(StockInLineSchema).min(1, 'En az bir satır gerekli'),
}).superRefine((data, ctx) => {
  data.lines.forEach((line, idx) => {
    if (line.unitPrice != null) {
      const expected = Number((line.qty * line.unitPrice).toFixed(2));
      const total = Number((line.total ?? expected).toFixed(2));
      if (total !== expected) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Toplam tutar birim fiyat x adet olmalıdır',
          path: ['lines', idx, 'total'],
        });
      }
    }
  });
});

type FormValues = z.infer<typeof formSchema>;

interface Props {
  warehouseId: ID;
}

export function StockInTab({ warehouseId }: Props) {
  const methods = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      header: { supplierId: '', date: isoNow().split('T')[0], note: '' },
      lines: [],
    },
  });
  const { control, handleSubmit, reset } = methods;
  const stockIn = useInventoryStore((s) => s.stockIn);
  const suppliers = useCatalogStore((s) => s.catalog.suppliers);
  const { push } = useToast();

  const onSubmit = handleSubmit((values) => {
    try {
      stockIn(
        warehouseId,
        values.header,
        values.lines.map((line) => ({
          materialId: line.materialId,
          qty: line.qty,
          unitPrice: line.unitPrice,
          serialNos: (line as any).serials,
        })),
      );
      push({ title: 'Stok girişi başarılı', kind: 'success' });
      reset();
    } catch (err: any) {
      push({ title: 'Hata', description: err.message || 'Stok girişi başarısız', kind: 'error' });
    }
  });

  return (
    <FormProvider {...methods}>
      <form className="space-y-4" onSubmit={onSubmit}>
        <div className="rounded-xl border p-4 space-y-3">
          <RHFSelect control={control} name="header.supplierId" label="Tedarikçi">
            <option value="">Seçiniz</option>
            {suppliers.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </RHFSelect>
          <RHFDate control={control} name="header.date" label="Tarih" />
          <RHFText control={control} name="header.note" label="Not (opsiyonel)" placeholder="Opsiyonel not" />
        </div>
        <ItemsGrid />
        <Button type="submit">Stok Girişi Yap</Button>
      </form>
    </FormProvider>
  );
}
