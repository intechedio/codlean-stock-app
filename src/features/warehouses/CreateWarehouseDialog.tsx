import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  WarehouseSchema,
  type WarehouseStatus,
  type WarehouseType,
} from "../../lib/schemas";
import { RHFText } from "../../components/form/RHFText";
import { RHFSelect } from "../../components/form/RHFSelect";
import { Dialog, DialogFooter, DialogHeader } from "../../components/ui/dialog";
import { Button } from "../../components/ui/button";
import { useWarehousesStore } from "./store";
import { useToast } from "../../components/feedback/Toast";

type FormValues = z.infer<typeof WarehouseSchema>;

export function CreateWarehouseDialog() {
  const [open, setOpen] = useState(false);
  const createWarehouse = useWarehousesStore((s) => s.createWarehouse);
  const { push } = useToast();
  const { control, handleSubmit, reset } = useForm<FormValues>({
    resolver: zodResolver(WarehouseSchema),
    defaultValues: {
      name: "",
      type: "Üretim" as WarehouseType,
      status: "Aktif" as WarehouseStatus,
    },
  });
  const onSubmit = handleSubmit((values) => {
    createWarehouse(values);
    push({ title: "Depo oluşturuldu", kind: "success" });
    setOpen(false);
    reset();
  });

  return (
    <>
      <Button onClick={() => setOpen(true)}>Yeni Depo</Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogHeader>Yeni Depo</DialogHeader>
        <form className="space-y-3" onSubmit={onSubmit}>
          <RHFText
            control={control}
            name="name"
            label="Ad"
            placeholder="Depo adı"
          />
          <RHFSelect control={control} name="type" label="Tür">
            <option value="Üretim">Üretim</option>
            <option value="Yükleme">Yükleme</option>
          </RHFSelect>
          <RHFSelect control={control} name="status" label="Durum">
            <option value="Aktif">Aktif</option>
            <option value="Pasif">Pasif</option>
          </RHFSelect>
          <DialogFooter>
            <Button
              type="button"
              variant="ghost"
              onClick={() => setOpen(false)}
            >
              İptal
            </Button>
            <Button type="submit">Oluştur</Button>
          </DialogFooter>
        </form>
      </Dialog>
    </>
  );
}
