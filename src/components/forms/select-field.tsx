"use client";

import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type Option = { value: string; label: string };

type SelectFieldProps = {
  name: string;
  label: string;
  options: readonly Option[];
  defaultValue?: string;
  placeholder?: string;
  hint?: string;
  errors?: string[];
  required?: boolean;
};

/**
 * Radix's Select renders a hidden native <select> when given a `name`, so the
 * value is posted with the rest of the form and the Server Action sees it
 * without any client-side plumbing.
 */
export function SelectField({
  name,
  label,
  options,
  defaultValue,
  placeholder = "Choose one",
  hint,
  errors,
  required,
}: SelectFieldProps) {
  const hasError = Boolean(errors?.length);
  const describedBy =
    [hint ? `${name}-hint` : null, hasError ? `${name}-error` : null]
      .filter(Boolean)
      .join(" ") || undefined;

  return (
    <div className="space-y-1.5">
      <Label htmlFor={name}>{label}</Label>

      <Select name={name} defaultValue={defaultValue} required={required}>
        <SelectTrigger
          id={name}
          className="h-10 w-full"
          aria-invalid={hasError || undefined}
          aria-describedby={describedBy}
        >
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {hint ? (
        <p id={`${name}-hint`} className="text-xs text-muted-foreground">
          {hint}
        </p>
      ) : null}
      {hasError ? (
        <ul
          id={`${name}-error`}
          role="alert"
          className="space-y-0.5 text-xs font-medium text-destructive"
        >
          {errors?.map((message) => (
            <li key={message}>{message}</li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
