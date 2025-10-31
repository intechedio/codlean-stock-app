import type { HTMLAttributes } from "react";

export function Table({
  className,
  ...props
}: HTMLAttributes<HTMLTableElement>) {
  return (
    <div className="relative w-full overflow-x-auto rounded-xl border bg-card shadow-sm">
      <table
        className={[
          "w-full border-collapse text-sm",
          "[&_thead_th]:sticky [&_thead_th]:top-0 [&_thead_th]:z-10 [&_thead_th]:bg-card",
          className || "",
        ].join(" ")}
        {...props}
      />
    </div>
  );
}

export function THead(props: HTMLAttributes<HTMLTableSectionElement>) {
  return <thead {...props} />;
}
export function TBody({
  className,
  ...props
}: HTMLAttributes<HTMLTableSectionElement>) {
  return (
    <tbody
      className={[
        "[&_tr:nth-child(even)]:bg-secondary/30",
        className || "",
      ].join(" ")}
      {...props}
    />
  );
}
export function TFoot(props: HTMLAttributes<HTMLTableSectionElement>) {
  return <tfoot {...props} />;
}
export function TR(props: HTMLAttributes<HTMLTableRowElement>) {
  return <tr {...props} />;
}
export function TH({
  className,
  ...props
}: HTMLAttributes<HTMLTableCellElement>) {
  return (
    <th
      className={[
        "px-3 py-2 text-left font-medium border-b",
        className || "",
      ].join(" ")}
      {...props}
    />
  );
}
export function TD({
  className,
  colSpan,
  ...props
}: HTMLAttributes<HTMLTableCellElement> & { colSpan?: number }) {
  return (
    <td
      className={["px-3 py-2 align-top border-b", className || ""].join(" ")}
      colSpan={colSpan}
      {...props}
    />
  );
}
