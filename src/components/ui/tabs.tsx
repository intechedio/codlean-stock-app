import {
  createContext,
  type ReactNode,
  useContext,
  useMemo,
  useState,
} from "react";

interface TabsContextValue {
  value: string;
  setValue(next: string): void;
}

const TabsContext = createContext<TabsContextValue | null>(null);

interface TabsProps {
  defaultValue: string;
  value?: string;
  onValueChange?: (v: string) => void;
  children: ReactNode;
}

export function Tabs({
  defaultValue,
  value,
  onValueChange,
  children,
}: TabsProps) {
  const [internal, setInternal] = useState(defaultValue);
  const v = value ?? internal;
  const setValue = (next: string) =>
    onValueChange ? onValueChange(next) : setInternal(next);
  const ctx = useMemo(() => ({ value: v, setValue }), [v]);
  return <TabsContext.Provider value={ctx}>{children}</TabsContext.Provider>;
}

export function TabsList({ children }: { children: ReactNode }) {
  return (
    <div className="inline-flex items-center gap-1 rounded-lg border bg-card p-1">
      {children}
    </div>
  );
}

export function TabsTrigger({
  value,
  children,
}: {
  value: string;
  children: ReactNode;
}) {
  const ctx = useContext(TabsContext)!;
  const active = ctx.value === value;
  return (
    <button
      type="button"
      onClick={() => ctx.setValue(value)}
      className={`px-3 py-1.5 rounded-md text-sm ${
        active ? "bg-secondary font-medium" : "hover:bg-secondary/70"
      }`}
    >
      {children}
    </button>
  );
}

export function TabsContent({
  value,
  children,
}: {
  value: string;
  children: ReactNode;
}) {
  const ctx = useContext(TabsContext)!;
  if (ctx.value !== value) return null;
  return <div className="mt-4">{children}</div>;
}
