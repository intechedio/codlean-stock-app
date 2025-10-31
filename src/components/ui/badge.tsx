import { type HTMLAttributes } from "react";

type Variant =
  | "default"
  | "secondary"
  | "outline"
  | "success"
  | "warning"
  | "destructive";

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: Variant;
}

export function Badge({
  className,
  variant = "default",
  ...props
}: BadgeProps) {
  const base =
    "inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium";
  const map: Record<Variant, string> = {
    default: "bg-primary text-primary-foreground border-transparent",
    secondary: "bg-secondary text-foreground border-transparent",
    outline: "bg-transparent text-foreground border-input",
    success: "bg-green-500/10 text-green-700 border-green-500/20",
    warning: "bg-yellow-500/10 text-yellow-700 border-yellow-500/20",
    destructive: "bg-destructive/10 text-red-700 border-destructive/20",
  };
  return (
    <span
      className={[base, map[variant], className || ""].join(" ")}
      {...props}
    />
  );
}
