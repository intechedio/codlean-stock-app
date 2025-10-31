import { useState, useMemo } from "react";
import type { ID, StockLot, Material } from "../../../lib/schemas";
import { useInventoryStore } from "../store";
import { useCatalogStore } from "../../catalog/store";
import {
  Table,
  THead,
  TBody,
  TR,
  TH,
  TD,
} from "../../../components/table/Table";
import { Input } from "../../../components/ui/input";
import { Badge } from "../../../components/ui/badge";

interface Props {
  warehouseId: ID;
  onSelectionChange: (
    selections: Array<
      | { type: "Seri Takip"; materialId: ID; lotIds: ID[] }
      | { type: "Normal"; materialId: ID; qty: number }
    >
  ) => void;
}

export function OutPickerTable({ warehouseId, onSelectionChange }: Props) {
  const getWarehouseStock = useInventoryStore((s) => s.getWarehouseStock);
  const stock = getWarehouseStock(warehouseId);
  const materials = useCatalogStore((s) => s.catalog.materials);
  const [selectedSerials, setSelectedSerials] = useState<Set<ID>>(new Set());
  const [normalQtys, setNormalQtys] = useState<Record<ID, number>>({});
  const [filter, setFilter] = useState<"all" | "Seri Takip" | "Normal">("all");

  const filteredStock = useMemo(() => {
    return stock.filter(
      (s) => filter === "all" || s.material.trackType === filter
    );
  }, [stock, filter]);

  const updateSelections = (serials: Set<ID>, qtys: Record<ID, number>) => {
    const selections: Array<
      | { type: "Seri Takip"; materialId: ID; lotIds: ID[] }
      | { type: "Normal"; materialId: ID; qty: number }
    > = [];
    const byMaterial = new Map<ID, ID[]>();
    serials.forEach((lotId) => {
      const lot = stock.flatMap((s) => s.lots).find((l) => l.id === lotId);
      if (lot) {
        if (!byMaterial.has(lot.materialId)) byMaterial.set(lot.materialId, []);
        byMaterial.get(lot.materialId)!.push(lotId);
      }
    });
    byMaterial.forEach((lotIds, materialId) => {
      selections.push({ type: "Seri Takip" as const, materialId, lotIds });
    });
    Object.entries(qtys).forEach(([materialId, qty]) => {
      if (qty > 0)
        selections.push({ type: "Normal" as const, materialId, qty });
    });
    onSelectionChange(selections);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <button
          type="button"
          className={`px-3 py-1 rounded-md text-sm ${
            filter === "all" ? "bg-secondary" : ""
          }`}
          onClick={() => setFilter("all")}
        >
          Tümü
        </button>
        <button
          type="button"
          className={`px-3 py-1 rounded-md text-sm ${
            filter === "Seri Takip" ? "bg-secondary" : ""
          }`}
          onClick={() => setFilter("Seri Takip")}
        >
          Seri Takip
        </button>
        <button
          type="button"
          className={`px-3 py-1 rounded-md text-sm ${
            filter === "Normal" ? "bg-secondary" : ""
          }`}
          onClick={() => setFilter("Normal")}
        >
          Normal
        </button>
      </div>
      {filteredStock.length === 0 ? (
        <div className="rounded-xl border p-6 text-center text-sm text-muted-foreground">
          Stok bulunamadı.
        </div>
      ) : (
        <Table>
          <THead>
            <TR>
              <TH />
              <TH>Malzeme</TH>
              <TH>Marka/Model</TH>
              <TH>Birim</TH>
              <TH>Mevcut</TH>
              <TH>Seçim</TH>
            </TR>
          </THead>
          <TBody>
            {filteredStock.map(({ material, lots, totalQty }) => {
              const isSeri = material.trackType === "Seri Takip";
              if (isSeri) {
                return (
                  <tr
                    key={`grp-${material.id}`}
                    style={{ display: "contents" }}
                  >
                    {lots.map((lot) => {
                      const checked = selectedSerials.has(lot.id);
                      return (
                        <TR key={lot.id}>
                          <TD>
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={(e) => {
                                const n = new Set(selectedSerials);
                                if (e.target.checked) n.add(lot.id);
                                else n.delete(lot.id);
                                setSelectedSerials(n);
                                updateSelections(n, normalQtys);
                              }}
                            />
                          </TD>
                          <TD className="font-medium">{material.name}</TD>
                          <TD className="text-sm text-muted-foreground">
                            {material.brand} / {material.model}
                          </TD>
                          <TD>{material.unit}</TD>
                          <TD>
                            <Badge variant="outline">{lot.serialNo}</Badge>
                          </TD>
                          <TD>Seri: {lot.serialNo}</TD>
                        </TR>
                      );
                    })}
                  </tr>
                );
              } else {
                const qty = normalQtys[material.id] || 0;
                return (
                  <TR key={material.id}>
                    <TD>
                      <input
                        type="checkbox"
                        checked={qty > 0}
                        onChange={(e) => {
                          const n = { ...normalQtys };
                          if (e.target.checked) n[material.id] = 1;
                          else delete n[material.id];
                          setNormalQtys(n);
                          updateSelections(selectedSerials, n);
                        }}
                      />
                    </TD>
                    <TD className="font-medium">{material.name}</TD>
                    <TD className="text-sm text-muted-foreground">
                      {material.brand} / {material.model}
                    </TD>
                    <TD>{material.unit}</TD>
                    <TD>{totalQty}</TD>
                    <TD>
                      {qty > 0 && (
                        <Input
                          type="number"
                          min="1"
                          max={totalQty}
                          value={qty}
                          onChange={(e) => {
                            const v = Math.min(
                              totalQty,
                              Math.max(1, Number(e.target.value) || 0)
                            );
                            const n = { ...normalQtys, [material.id]: v };
                            setNormalQtys(n);
                            updateSelections(selectedSerials, n);
                          }}
                          className="w-20"
                        />
                      )}
                    </TD>
                  </TR>
                );
              }
            })}
          </TBody>
        </Table>
      )}
    </div>
  );
}
