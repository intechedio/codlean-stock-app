import { ButtonHTMLAttributes, forwardRef } from "react";

type Variant = "default" | "secondary" | "destructive" | "outline" | "ghost";
type Size = "sm" | "md" | "lg";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

function classes(
  variant: Variant,
  size: Size,
  disabled?: boolean,
  extra?: string
) {
  const base =
    "inline-flex items-center justify-center whitespace-nowrap rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 disabled:opacity-50 disabled:cursor-not-allowed";
  const variants: Record<Variant, string> = {
    default: "bg-primary text-primary-foreground hover:opacity-90 shadow",
    secondary: "bg-secondary text-foreground hover:bg-secondary/80",
    destructive: "bg-destructive text-destructive-foreground hover:opacity-90",
    outline: "border border-input bg-transparent hover:bg-secondary",
    ghost: "bg-transparent hover:bg-secondary",
  };
  const sizes: Record<Size, string> = {
    sm: "h-8 px-3 text-xs",
    md: "h-9 px-4 text-sm",
    lg: "h-10 px-5 text-sm",
  };
  return [
    base,
    variants[variant],
    sizes[size],
    disabled ? "opacity-60" : "",
    extra || "",
  ]
    .filter(Boolean)
    .join(" ");
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { className, variant = "default", size = "md", disabled, ...props },
    ref
  ) => {
    return (
      <button
        ref={ref}
        className={classes(variant, size, disabled, className)}
        disabled={disabled}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";
