import { useFieldArray, useFormContext } from 'react-hook-form';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Select } from '../../../components/ui/select';
import { Table, THead, TBody, TR, TH, TD } from '../../../components/table/Table';
import { useCatalogStore } from '../../catalog/store';
import { fmtMoney } from '../../../lib/utils';
import { SerialModal } from './SerialModal';

export function ItemsGrid() {
  const { control, watch, setValue } = useFormContext();
  const { fields, append, remove, insert } = useFieldArray({ control, name: 'lines' });
  const materials = useCatalogStore((s) => s.catalog.materials);
  const lines = watch('lines') || [];

  const addRow = () => {
    append({ materialId: '', qty: 1, unitPrice: undefined });
  };

  const duplicateRow = (index: number) => {
    const item = lines[index];
    if (item) insert(index + 1, { ...item });
  };

  return (
    <div className="space-y-3">
      <Table>
        <THead>
          <TR>
            <TH>Malzeme</TH>
            <TH>Marka</TH>
            <TH>Model</TH>
            <TH>Adet</TH>
            <TH>Birim</TH>
            <TH>Birim Fiyat</TH>
            <TH>Toplam</TH>
            <TH />
          </TR>
        </THead>
        <TBody>
          {fields.map((field, index) => {
            const materialId = watch(`lines.${index}.materialId`);
            const material = materials.find((m) => m.id === materialId);
            const qty = Number(watch(`lines.${index}.qty`) || 0);
            const unitPrice = Number(watch(`lines.${index}.unitPrice`) || 0);
            const total = qty * unitPrice;
            const isSeri = material?.trackType === 'Seri Takip';
            const savedSerials = watch(`lines.${index}.serials`) as string[] | undefined;
            const hasSerials = isSeri && savedSerials && savedSerials.length === qty;
            return (
              <TR key={field.id}>
                <TD>
                  <Select
                    value={materialId}
                    onChange={(e) => {
                      setValue(`lines.${index}.materialId`, e.target.value);
                      setValue(`lines.${index}.unitPrice`, undefined);
                      setValue(`lines.${index}.serials`, undefined);
                    }}
                  >
                    <option value="">Seçiniz</option>
                    {materials.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.name} - {m.brand} / {m.model} ({m.unit})
                      </option>
                    ))}
                  </Select>
                </TD>
                <TD className="text-muted-foreground">{material?.brand || '-'}</TD>
                <TD className="text-muted-foreground">{material?.model || '-'}</TD>
                <TD>
                  <Input
                    type="number"
                    min="1"
                    value={qty}
                    onChange={(e) => {
                      setValue(`lines.${index}.qty`, Number(e.target.value));
                      // Clear serials if quantity changes for serial-tracked materials
                      if (isSeri) {
                        setValue(`lines.${index}.serials`, undefined);
                      }
                    }}
                  />
                </TD>
                <TD className="text-muted-foreground">{material?.unit || '-'}</TD>
                <TD>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={unitPrice || ''}
                    onChange={(e) => setValue(`lines.${index}.unitPrice`, Number(e.target.value) || undefined)}
                  />
                </TD>
                <TD className="font-medium">{fmtMoney(total)}</TD>
                <TD>
                  <div className="flex items-center gap-2">
                    {isSeri && (
                      <SerialModal
                        material={material!}
                        qty={qty}
                        index={index}
                        hasSerials={hasSerials}
                        onConfirm={(serials) => {
                          setValue(`lines.${index}.serials`, serials);
                        }}
                      />
                    )}
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => duplicateRow(index)}
                    >
                      Kopyala
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="destructive"
                      onClick={() => remove(index)}
                    >
                      Sil
                    </Button>
                  </div>
                </TD>
              </TR>
            );
          })}
        </TBody>
      </Table>
      <Button type="button" variant="outline" onClick={addRow}>
        Satır Ekle
      </Button>
    </div>
  );
}
