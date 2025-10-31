import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { StockOutHeaderSchema } from "../../../lib/schemas";
import { RHFSelect } from "../../../components/form/RHFSelect";
import { RHFDate } from "../../../components/form/RHFDate";
import { RHFText } from "../../../components/form/RHFText";
import { Button } from "../../../components/ui/button";
import { OutPickerTable } from "./OutPickerTable";
import { useInventoryStore } from "../store";
import { useCatalogStore } from "../../catalog/store";
import { useToast } from "../../../components/feedback/Toast";
import type { ID } from "../../../lib/schemas";
import { isoNow } from "../../../lib/utils";

type FormValues = z.infer<typeof StockOutHeaderSchema>;

interface Props {
  warehouseId: ID;
}

export function StockOutTab({ warehouseId }: Props) {
  const { control, handleSubmit, reset } = useForm<FormValues>({
    resolver: zodResolver(StockOutHeaderSchema),
    defaultValues: { customerId: "", date: isoNow().split("T")[0], note: "" },
  });
  const stockOut = useInventoryStore((s) => s.stockOut);
  const customers = useCatalogStore((s) => s.catalog.customers);
  const { push } = useToast();
  const [selections, setSelections] = useState<
    Array<
      | { type: "Seri Takip"; materialId: ID; lotIds: ID[] }
      | { type: "Normal"; materialId: ID; qty: number }
    >
  >([]);

  const onSubmit = handleSubmit((values) => {
    if (selections.length === 0) {
      push({
        title: "Hata",
        description: "En az bir ürün seçmelisiniz",
        kind: "error",
      });
      return;
    }
    try {
      stockOut(warehouseId, values, selections);
      push({ title: "Stok çıkışı başarılı", kind: "success" });
      reset();
      setSelections([]);
    } catch (err: any) {
      push({
        title: "Hata",
        description: err.message || "Stok çıkışı başarısız",
        kind: "error",
      });
    }
  });

  return (
    <form className="space-y-4" onSubmit={onSubmit}>
      <div className="rounded-xl border p-4 space-y-3">
        <RHFSelect control={control} name="customerId" label="Müşteri">
          <option value="">Seçiniz</option>
          {customers.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </RHFSelect>
        <RHFDate control={control} name="date" label="Tarih" />
        <RHFText
          control={control}
          name="note"
          label="Not (opsiyonel)"
          placeholder="Opsiyonel not"
        />
      </div>
      <OutPickerTable
        warehouseId={warehouseId}
        onSelectionChange={setSelections}
      />
      <Button type="submit">Stok Çıkışı Yap</Button>
    </form>
  );
}
