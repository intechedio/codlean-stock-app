import type { ID } from "../../lib/schemas";
import { useInventoryStore } from "./store";
import { StockListWithExpandableSerials } from "../../components/stock/StockListWithExpandableSerials";
import type { StockColumn } from "../../components/stock/StockList";

interface Props {
  warehouseId: ID;
}

export function WarehouseStockTab({ warehouseId }: Props) {
  const getWarehouseStock = useInventoryStore((s) => s.getWarehouseStock);
  const stock = getWarehouseStock(warehouseId);

  const columns: StockColumn<typeof stock[0]>[] = [
    {
      key: "material",
      label: "Malzeme",
      render: (item) => <span className="font-medium">{item.material.name}</span>,
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
      key: "quantity",
      label: "Miktar",
      render: (item) => item.totalQty,
    },
    {
      key: "actions",
      label: "",
      render: () => null,
    },
  ];

  return (
    <StockListWithExpandableSerials
      data={stock}
      columns={columns}
      emptyMessage="Bu depoda stok yok."
    />
  );
}
