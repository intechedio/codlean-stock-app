import { useState, useMemo } from "react";
import type { ID, Material } from "../../lib/schemas";
import { useInventoryStore } from "../inventory/store";
import { useWarehousesStore } from "../warehouses/store";
import { StockList, type StockColumn } from "../../components/stock/StockList";
import { Input } from "../../components/ui/input";
import { Paginator } from "../../components/table/Paginator";
import { Badge } from "../../components/ui/badge";
import { CreateMaterialDialog } from "../catalog/CreateMaterialDialog";
import { useCatalogStore } from "../catalog/store";

const PAGE_SIZE = 20;

type StockItem = {
  material: Material;
  totalsByWarehouse: Record<ID, number>;
  total: number;
};

export default function StocksListPage() {
  /* const ensureSeeded = useInventoryStore((s) => s.ensureSeeded); */
  const lots = useInventoryStore((s) => s.inventory.lots);
  const materials = useCatalogStore((s) => s.catalog.materials);
  const warehouses = useWarehousesStore((s) => s.warehouses.entities);
  const systemStock = useMemo(() => {
    const byMaterial: Record<
      string,
      { totalsByWarehouse: Record<string, number>; total: number }
    > = {};
    for (const lot of Object.values(lots)) {
      const entry = (byMaterial[lot.materialId] ||= {
        totalsByWarehouse: {},
        total: 0,
      });
      entry.totalsByWarehouse[lot.warehouseId] =
        (entry.totalsByWarehouse[lot.warehouseId] ?? 0) + lot.quantity;
      entry.total += lot.quantity;
    }
    return [...materials]
      .map((material) => {
        const totals = byMaterial[material.id] || {
          totalsByWarehouse: {},
          total: 0,
        };
        return { material, ...totals };
      })
      .sort((a, b) => a.material.name.localeCompare(b.material.name));
  }, [materials, lots]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  /*   useEffect(() => {
    ensureSeeded();
  }, [ensureSeeded]); */

  const filtered = useMemo(() => {
    const lower = search.toLowerCase();
    return systemStock.filter((s) => {
      const material = s.material;
      return (
        material.name.toLowerCase().includes(lower) ||
        material.brand.toLowerCase().includes(lower) ||
        material.model.toLowerCase().includes(lower)
      );
    });
  }, [systemStock, search]);

  const paginated = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filtered.slice(start, start + PAGE_SIZE);
  }, [filtered, page]);

  const columns: StockColumn<StockItem>[] = [
    {
      key: "material",
      label: "Malzeme",
      render: (item) => (
        <span className="font-medium">{item.material.name}</span>
      ),
    },
    {
      key: "brandModel",
      label: "Marka/Model",
      render: (item) => (
        <span className="text-sm text-muted-foreground">
          {item.material.brand} / {item.material.model}
        </span>
      ),
    },
    {
      key: "unit",
      label: "Birim",
      render: (item) => item.material.unit,
    },
    {
      key: "byWarehouse",
      label: "Depolara Göre",
      render: (item) => (
        <div className="space-y-1">
          {Object.entries(item.totalsByWarehouse).map(([whId, qty]) => {
            const wh = warehouses[whId];
            return (
              <div key={whId} className="text-xs">
                <Badge variant="outline" className="mr-1">
                  {wh?.name || whId.slice(0, 8)}
                </Badge>
                <span className="text-muted-foreground">{qty}</span>
              </div>
            );
          })}
        </div>
      ),
    },
    {
      key: "total",
      label: "Toplam",
      render: (item) => <span className="font-medium">{item.total}</span>,
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-semibold">Global Stok</h1>
          <CreateMaterialDialog />
        </div>
        <div className="w-64">
          <Input
            placeholder="Malzeme, marka, model ara..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
        </div>
      </div>
      {filtered.length === 0 ? (
        <div className="rounded-xl border p-6 text-center text-sm text-muted-foreground">
          {search ? "Arama sonucu bulunamadı." : "Sistemde stok kaydı yok."}
        </div>
      ) : (
        <>
          <StockList data={paginated} columns={columns} />
          <Paginator
            page={page}
            pageSize={PAGE_SIZE}
            total={filtered.length}
            onChange={setPage}
          />
        </>
      )}
    </div>
  );
}
