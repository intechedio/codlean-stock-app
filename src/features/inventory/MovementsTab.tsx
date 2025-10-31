import { useState } from "react";
import type { ID } from "../../lib/schemas";
import { useInventoryStore } from "./store";
import { useCatalogStore } from "../catalog/store";
import { Table, THead, TBody, TR, TH, TD } from "../../components/table/Table";
import { Badge } from "../../components/ui/badge";
import { fmtMoney } from "../../lib/utils";

interface Props {
  warehouseId: ID;
}

export function MovementsTab({ warehouseId }: Props) {
  const getMovementsForWarehouse = useInventoryStore(
    (s) => s.getMovementsForWarehouse
  );
  const movements = getMovementsForWarehouse(warehouseId);
  const materials = useCatalogStore((s) => s.catalog.materials);
  const suppliers = useCatalogStore((s) => s.catalog.suppliers);
  const customers = useCatalogStore((s) => s.catalog.customers);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  if (movements.length === 0) {
    return (
      <div className="rounded-xl border p-6 text-center text-sm text-muted-foreground">
        Hareket kaydı yok.
      </div>
    );
  }

  return (
    <Table>
      <THead>
        <TR>
          <TH />
          <TH>Tarih</TH>
          <TH>Tür</TH>
          <TH>Tedarikçi/Müşteri</TH>
          <TH>Satır Sayısı</TH>
          <TH>Toplam</TH>
        </TR>
      </THead>
      <TBody>
        {movements.map((mov) => {
          const isExpanded = expanded.has(mov.id);
          const total = mov.lines.reduce(
            (acc, line) => (acc += line.total || 0),
            0
          );
          return (
            <>
              <TR
                key={mov.id}
                className="cursor-pointer hover:bg-secondary"
                onClick={() =>
                  setExpanded((s) => {
                    const n = new Set(s);
                    if (n.has(mov.id)) n.delete(mov.id);
                    else n.add(mov.id);
                    return n;
                  })
                }
              >
                <TD>{isExpanded ? "▼" : "▶"}</TD>
                <TD>{new Date(mov.timestamp).toLocaleString()}</TD>
                <TD>
                  {mov.type === "IN" ? (
                    <Badge variant="success">Giriş</Badge>
                  ) : (
                    <Badge variant="destructive">Çıkış</Badge>
                  )}
                </TD>
                <TD>
                  {mov.type === "IN"
                    ? mov.supplierId
                      ? suppliers.find((s) => s.id === mov.supplierId)?.name
                      : "-"
                    : mov.customerId
                    ? customers.find((c) => c.id === mov.customerId)?.name
                    : "-"}
                </TD>
                <TD>{mov.lines.length}</TD>
                <TD>{fmtMoney(total)}</TD>
              </TR>
              {isExpanded && (
                <TR className="bg-secondary/30">
                  <TD colSpan={6} className="pl-8 py-3">
                    <div className="space-y-2 text-sm">
                      {mov.note && (
                        <div className="text-muted-foreground italic">
                          Not: {mov.note}
                        </div>
                      )}
                      <Table>
                        <THead>
                          <TR>
                            <TH>Malzeme</TH>
                            <TH>Miktar</TH>
                            <TH>Birim Fiyat</TH>
                            <TH>Toplam</TH>
                            <TH>Seriler/Lotlar</TH>
                          </TR>
                        </THead>
                        <TBody>
                          {mov.lines.map((line) => {
                            const material = materials.find(
                              (m) => m.id === line.materialId
                            );
                            return (
                              <TR key={line.id}>
                                <TD>{material?.name || "-"}</TD>
                                <TD>{line.quantity}</TD>
                                <TD>
                                  {line.unitPrice
                                    ? fmtMoney(line.unitPrice)
                                    : "-"}
                                </TD>
                                <TD>
                                  {line.total ? fmtMoney(line.total) : "-"}
                                </TD>
                                <TD>
                                  {line.serialNos &&
                                  line.serialNos.length > 0 ? (
                                    <div className="flex flex-wrap gap-1">
                                      {line.serialNos.map((sn, idx) => (
                                        <Badge
                                          key={idx}
                                          variant="outline"
                                          className="text-xs"
                                        >
                                          {sn}
                                        </Badge>
                                      ))}
                                    </div>
                                  ) : line.lotRefs &&
                                    line.lotRefs.length > 0 ? (
                                    <div className="text-xs text-muted-foreground">
                                      {line.lotRefs.length} referansı
                                    </div>
                                  ) : (
                                    "-"
                                  )}
                                </TD>
                              </TR>
                            );
                          })}
                        </TBody>
                      </Table>
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
