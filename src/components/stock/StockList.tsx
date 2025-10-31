import type { ReactNode } from "react";
import type { Material } from "../../lib/schemas";
import { Table, THead, TBody, TR, TH, TD } from "../table/Table";

export interface StockColumn<TData = any> {
  key: string;
  label: string;
  render: (data: TData, index: number) => ReactNode;
  headerClassName?: string;
  cellClassName?: string;
}

export interface StockListProps<TData extends { material: Material }> {
  data: TData[];
  columns: StockColumn<TData>[];
  emptyMessage?: string;
  searchFilter?: string;
}

export function StockList<TData extends { material: Material }>({
  data,
  columns,
  emptyMessage = "Stok kaydı bulunamadı.",
  searchFilter,
}: StockListProps<TData>) {
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
        {searchFilter ? "Arama sonucu bulunamadı." : emptyMessage}
      </div>
    );
  }

  return (
    <Table>
      <THead>
        <TR>
          {columns.map((col) => (
            <TH key={col.key} className={col.headerClassName}>
              {col.label}
            </TH>
          ))}
        </TR>
      </THead>
      <TBody>
        {filteredData.map((item, index) => (
          <TR key={item.material.id}>
            {columns.map((col) => (
              <TD key={col.key} className={col.cellClassName}>
                {col.render(item, index)}
              </TD>
            ))}
          </TR>
        ))}
      </TBody>
    </Table>
  );
}
