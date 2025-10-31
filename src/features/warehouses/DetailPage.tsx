import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { useWarehousesStore } from "./store";
import { Input } from "../../components/ui/input";
import { Select } from "../../components/ui/select";
import { Badge } from "../../components/ui/badge";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "../../components/ui/tabs";
import { useDebouncedCallback } from "../../lib/debounce";
import { WarehouseStockTab } from "../inventory/WarehouseStockTab";
import { StockInTab } from "../inventory/StockInTab/StockInTab";
import { StockOutTab } from "../inventory/StockOutTab/StockOutTab";
import { MovementsTab } from "../inventory/MovementsTab";

export default function WarehouseDetailPage() {
  const { id } = useParams();
  const warehouse = useWarehousesStore((s) =>
    id ? s.warehouses.entities[id] : undefined
  );
  const updateField = useWarehousesStore((s) => s.updateField);
  const [local, setLocal] = useState(() =>
    warehouse
      ? { name: warehouse.name, type: warehouse.type, status: warehouse.status }
      : { name: "", type: "Üretim" as const, status: "Aktif" as const }
  );
  const [saved, setSaved] = useState(false);
  const debouncedSave = useDebouncedCallback((patch: Partial<typeof local>) => {
    if (!id) return;
    updateField(id, patch);
    setSaved(true);
    setTimeout(() => setSaved(false), 900);
  }, 500);

  useEffect(() => {
    if (warehouse)
      setLocal({
        name: warehouse.name,
        type: warehouse.type,
        status: warehouse.status,
      });
  }, [warehouse]);

  if (!warehouse)
    return (
      <div className="text-sm text-muted-foreground">Depo bulunamadı.</div>
    );

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border p-4 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="flex-1 min-w-0">
            <label className="mb-1 block text-xs text-muted-foreground">
              Ad
            </label>
            <Input
              value={local.name}
              onChange={(e) => {
                const v = e.target.value;
                setLocal((s) => ({ ...s, name: v }));
                debouncedSave({ name: v });
              }}
            />
          </div>
          <div>
            <label className="mb-1 block text-xs text-muted-foreground">
              Tür
            </label>
            <Select
              value={local.type}
              onChange={(e) => {
                const v = e.target.value as typeof local.type;
                setLocal((s) => ({ ...s, type: v }));
                debouncedSave({ type: v });
              }}
            >
              <option value="Üretim">Üretim</option>
              <option value="Yükleme">Yükleme</option>
            </Select>
          </div>
          <div>
            <label className="mb-1 block text-xs text-muted-foreground">
              Durum
            </label>
            <Select
              value={local.status}
              onChange={(e) => {
                const v = e.target.value as typeof local.status;
                setLocal((s) => ({ ...s, status: v }));
                debouncedSave({ status: v });
              }}
            >
              <option value="Aktif">Aktif</option>
              <option value="Pasif">Pasif</option>
            </Select>
          </div>
          <div className="ml-auto text-xs text-muted-foreground">
            {saved ? (
              <span className="text-green-600">Kaydedildi ✓</span>
            ) : (
              <span>Otomatik kaydediliyor…</span>
            )}
          </div>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-3 text-sm text-muted-foreground">
          <div>
            Oluşturulma: {new Date(warehouse.createdAt).toLocaleString()}
          </div>
          <div>
            Güncelleme: {new Date(warehouse.updatedAt).toLocaleString()}
          </div>
        </div>
      </div>
      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Genel Bakış</TabsTrigger>
          <TabsTrigger value="stock">Stok</TabsTrigger>
          <TabsTrigger value="stock-in">Stok Girişi</TabsTrigger>
          <TabsTrigger value="stock-out">Stok Çıkışı</TabsTrigger>
          <TabsTrigger value="movements">Hareketler</TabsTrigger>
        </TabsList>
        <TabsContent value="overview">
          <div className="rounded-2xl border p-4">
            <div className="flex items-center gap-2 text-sm">
              <Badge variant="secondary">{warehouse.type}</Badge>
              {warehouse.status === "Aktif" ? (
                <Badge variant="success">Aktif</Badge>
              ) : (
                <Badge variant="destructive">Pasif</Badge>
              )}
            </div>
          </div>
        </TabsContent>
        <TabsContent value="stock">
          <WarehouseStockTab warehouseId={warehouse.id} />
        </TabsContent>
        <TabsContent value="stock-in">
          <StockInTab warehouseId={warehouse.id} />
        </TabsContent>
        <TabsContent value="stock-out">
          <StockOutTab warehouseId={warehouse.id} />
        </TabsContent>
        <TabsContent value="movements">
          <MovementsTab warehouseId={warehouse.id} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
