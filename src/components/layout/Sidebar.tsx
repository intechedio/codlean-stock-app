import { Link, useLocation } from "react-router-dom";

export function Sidebar() {
  const { pathname } = useLocation();
  const items = [
    { to: "/warehouses", label: "Depo Yönetimi" },
    { to: "/stocks", label: "Stok Listesi" },
  ];
  return (
    <div className="p-4 space-y-2">
      {items.map((it) => {
        const active = pathname.startsWith(it.to);
        return (
          <Link
            key={it.to}
            to={it.to}
            className={`block px-3 py-2 rounded-md text-sm ${
              active ? "bg-secondary font-medium" : "hover:bg-secondary/70"
            }`}
          >
            {it.label}
          </Link>
        );
      })}
    </div>
  );
}
