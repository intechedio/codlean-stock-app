import type { InputHTMLAttributes } from "react";
import { Controller, type Control } from "react-hook-form";
import { Input } from "../ui/input";

interface Props extends Omit<InputHTMLAttributes<HTMLInputElement>, "name"> {
  control: Control<any>;
  name: string;
  label: string;
}

export function RHFText({ control, name, label, ...rest }: Props) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <div>
          <label className="mb-1 block text-sm" htmlFor={name}>
            {label}
          </label>
          <Input id={name} {...field} {...rest} />
          {fieldState.error ? (
            <p className="mt-1 text-xs text-red-600">
              {fieldState.error.message}
            </p>
          ) : null}
        </div>
      )}
    />
  );
}
