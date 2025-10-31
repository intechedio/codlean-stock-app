import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useWarehousesStore } from "./store";
import { CreateWarehouseDialog } from "./CreateWarehouseDialog";
import { Table, THead, TBody, TR, TH, TD } from "../../components/table/Table";
import { Badge } from "../../components/ui/badge";

export default function WarehousesListPage() {
  const navigate = useNavigate();
  const entities = useWarehousesStore((s) => s.warehouses.entities);
  const list = useWarehousesStore((s) => s.warehouses.list);
  const rows = useMemo(() => list.map((id) => entities[id]), [list, entities]);
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Depolar</h1>
        <CreateWarehouseDialog />
      </div>
      {rows.length === 0 ? (
        <div className="rounded-2xl border p-6 text-center text-sm">
          Henüz depo yok. <span className="ml-2">Yeni Depo ile başlayın.</span>
        </div>
      ) : (
        <Table>
          <THead>
            <TR>
              <TH>Ad</TH>
              <TH>Tür</TH>
              <TH>Durum</TH>
              <TH>Oluşturulma</TH>
            </TR>
          </THead>
          <TBody>
            {rows.map((w) => (
              <TR
                key={w.id}
                className="cursor-pointer hover:bg-secondary"
                onClick={() => navigate(`/warehouses/${w.id}`)}
              >
                <TD className="font-medium">{w.name}</TD>
                <TD>
                  <Badge variant="secondary">{w.type}</Badge>
                </TD>
                <TD>
                  {w.status === "Aktif" ? (
                    <Badge variant="success">Aktif</Badge>
                  ) : (
                    <Badge variant="destructive">Pasif</Badge>
                  )}
                </TD>
                <TD className="text-muted-foreground">
                  {new Date(w.createdAt).toLocaleString()}
                </TD>
              </TR>
            ))}
          </TBody>
        </Table>
      )}
    </div>
  );
}
