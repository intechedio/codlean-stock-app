import { Suspense } from "react";
import { BrowserRouter, useLocation } from "react-router-dom";
import { AppRoutes } from "./AppRoutes";
import { Navbar } from "../components/layout/Navbar";
import { Sidebar } from "../components/layout/Sidebar";
import { ToastProvider } from "../components/feedback/Toast";

function AppLayout() {
  const location = useLocation();
  const isLoginPage = location.pathname === "/login";

  if (isLoginPage) {
    return (
      <main className="min-h-dvh flex items-center justify-center p-6">
        <Suspense fallback={<div />}>
          <AppRoutes />
        </Suspense>
      </main>
    );
  }

  return (
    <div className="min-h-dvh grid grid-cols-[240px_1fr] grid-rows-[auto_1fr]">
      <div className="col-span-2 row-[1]">
        <Navbar />
      </div>
      <aside className="row-[2] col-[1] border-r bg-secondary/30">
        <Sidebar />
      </aside>
      <main className="row-[2] col-[2] p-6">
        <div className="mx-auto max-w-[1200px]">
          <Suspense fallback={<div />}>
            <AppRoutes />
          </Suspense>
        </div>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <AppLayout />
      </ToastProvider>
    </BrowserRouter>
  );
}
