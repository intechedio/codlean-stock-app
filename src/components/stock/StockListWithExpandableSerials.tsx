import { useState } from "react";
import type { Material, StockLot } from "../../lib/schemas";
import type { StockColumn } from "./StockList";
import { Table, THead, TBody, TR, TH, TD } from "../table/Table";

export interface StockItemWithSerials extends Record<string, any> {
  material: Material;
  lots: StockLot[];
  totalQty: number;
}

export interface StockListWithExpandableSerialsProps<
  TData extends StockItemWithSerials
> {
  data: TData[];
  columns: StockColumn<TData>[];
  emptyMessage?: string;
  searchFilter?: string;
}

export function StockListWithExpandableSerials<
  TData extends StockItemWithSerials
>({
  data,
  columns,
  emptyMessage,
  searchFilter,
}: StockListWithExpandableSerialsProps<TData>) {
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const filteredData = searchFilter
    ? data.filter((item) => {
        const lower = searchFilter.toLowerCase();
        return (
          item.material.name.toLowerCase().includes(lower) ||
          item.material.brand.toLowerCase().includes(lower) ||
          item.material.model.toLowerCase().includes(lower)
        );
      })
    : data;

  if (filteredData.length === 0) {
    return (
      <div className="rounded-xl border p-6 text-center text-sm text-muted-foreground">
        {searchFilter
          ? "Arama sonucu bulunamadı."
          : emptyMessage || "Stok kaydı bulunamadı."}
      </div>
    );
  }

  const toggleExpanded = (materialId: string) => {
    setExpanded((s) => {
      const n = new Set(s);
      if (n.has(materialId)) n.delete(materialId);
      else n.add(materialId);
      return n;
    });
  };

  const enhancedColumns = columns.map((col) => {
    if (col.key === "actions" || col.label === "") {
      return {
        ...col,
        render: (item: TData, index: number) => {
          const isSeri = item.material.trackType === "Seri Takip";
          const isExpandedRow = expanded.has(item.material.id);
          const toggleButton =
            isSeri && item.lots.length > 0 ? (
              <button
                type="button"
                className="text-xs text-primary hover:underline"
                onClick={() => toggleExpanded(item.material.id)}
              >
                {isExpandedRow ? "Serileri gizle" : `${item.lots.length} seri`}
              </button>
            ) : null;

          if (col.key === "actions" || col.label === "") {
            return (
              <>
                {col.render(item, index)}
                {toggleButton}
              </>
            );
          }
          return col.render(item, index);
        },
      };
    }
    return col;
  });

  return (
    <Table>
      <THead>
        <TR>
          {enhancedColumns.map((col) => (
            <TH key={col.key} className={col.headerClassName}>
              {col.label}
            </TH>
          ))}
        </TR>
      </THead>
      <TBody>
        {filteredData.map((item, index) => {
          const isExpandedRow = expanded.has(item.material.id);
          return (
            <>
              <TR key={item.material.id}>
                {enhancedColumns.map((col) => (
                  <TD key={col.key} className={col.cellClassName}>
                    {col.render(item, index)}
                  </TD>
                ))}
              </TR>
              {item.material.trackType === "Seri Takip" &&
                item.lots.length > 0 &&
                isExpandedRow && (
                  <TR
                    key={`exp-${item.material.id}`}
                    className="bg-secondary/30"
                  >
                    <TD colSpan={enhancedColumns.length} className="pl-8 py-2">
                      <div className="text-xs space-y-1">
                        <div className="font-medium mb-2">Seri Numaraları:</div>
                        <div className="flex flex-wrap gap-2">
                          {item.lots.map((lot) => (
                            <span
                              key={lot.id}
                              className="px-2 py-1 bg-background rounded border text-xs font-mono"
                            >
                              {lot.serialNo}
                            </span>
                          ))}
                        </div>
                      </div>
                    </TD>
                  </TR>
                )}
            </>
          );
        })}
      </TBody>
    </Table>
  );
}

export default StockListWithExpandableSerials;
