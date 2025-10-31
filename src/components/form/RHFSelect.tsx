import type { ReactNode, SelectHTMLAttributes } from 'react';
import { Controller, type Control } from 'react-hook-form';
import { Select } from '../ui/select';

interface Props extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'name'> {
  control: Control<any>;
  name: string;
  label: string;
  children: ReactNode;
}

export function RHFSelect({ control, name, label, children, ...rest }: Props) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <div>
          <label className="mb-1 block text-sm" htmlFor={name}>{label}</label>
          <Select id={name} {...field} {...rest}>
            {children}
          </Select>
          {fieldState.error ? (
            <p className="mt-1 text-xs text-red-600">{fieldState.error.message}</p>
          ) : null}
        </div>
      )}
    />
  );
}


