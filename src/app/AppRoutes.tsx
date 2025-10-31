import { lazy } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { ProtectedRoute } from "./ProtectedRoute";

// Lazy-loaded feature pages (to be implemented in subsequent tasks)
const LoginPage = lazy(() => import("../features/auth/LoginPage"));
const WarehousesListPage = lazy(
  () => import("../features/warehouses/ListPage")
);
const WarehouseDetailPage = lazy(
  () => import("../features/warehouses/DetailPage")
);
const StocksListPage = lazy(() => import("../features/stocks/ListPage"));

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/warehouses" replace />} />
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/warehouses"
        element={
          <ProtectedRoute>
            <WarehousesListPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/warehouses/:id"
        element={
          <ProtectedRoute>
            <WarehouseDetailPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/stocks"
        element={
          <ProtectedRoute>
            <StocksListPage />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/warehouses" replace />} />
    </Routes>
  );
}
