import type { InputHTMLAttributes } from 'react';
import { Controller, type Control } from 'react-hook-form';
import { Input } from '../ui/input';

interface Props extends Omit<InputHTMLAttributes<HTMLInputElement>, 'name'> {
  control: Control<any>;
  name: string;
  label: string;
}

export function RHFNumber({ control, name, label, ...rest }: Props) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <div>
          <label className="mb-1 block text-sm" htmlFor={name}>{label}</label>
          <Input id={name} type="number" {...field} {...rest} onChange={(e) => field.onChange(Number(e.target.value))} />
          {fieldState.error ? (
            <p className="mt-1 text-xs text-red-600">{fieldState.error.message}</p>
          ) : null}
        </div>
      )}
    />
  );
}


