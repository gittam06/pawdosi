import type { ComponentProps, ReactNode } from "react";

import { cn } from "cn";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

/**
 * Form field wrappers that keep label, hint and error wiring in one place.
 *
 * Errors come from a Server Action's `fieldErrors`, keyed by the input name,
 * and are announced with role="alert" as well as linked through
 * aria-describedby so screen readers get them twice over: on focus and on
 * appearance.
 */

type FieldShellProps = {
  name: string;
  label: string;
  hint?: string;
  errors?: string[];
  children: ReactNode;
};

function FieldShell({ name, label, hint, errors, children }: FieldShellProps) {
  const hasError = Boolean(errors?.length);

  return (
    <div className="space-y-1.5">
      <Label htmlFor={name}>{label}</Label>
      {children}
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

function describedBy(name: string, hint?: string, hasError?: boolean) {
  const ids = [hint ? `${name}-hint` : null, hasError ? `${name}-error` : null]
    .filter(Boolean)
    .join(" ");

  return ids || undefined;
}

type TextFieldProps = Omit<ComponentProps<typeof Input>, "name" | "id"> & {
  name: string;
  label: string;
  hint?: string;
  errors?: string[];
};

export function TextField({
  name,
  label,
  hint,
  errors,
  className,
  ...props
}: TextFieldProps) {
  const hasError = Boolean(errors?.length);

  return (
    <FieldShell name={name} label={label} hint={hint} errors={errors}>
      <Input
        id={name}
        name={name}
        aria-invalid={hasError || undefined}
        aria-describedby={describedBy(name, hint, hasError)}
        className={cn("h-10", className)}
        {...props}
      />
    </FieldShell>
  );
}

type TextAreaFieldProps = Omit<
  ComponentProps<typeof Textarea>,
  "name" | "id"
> & {
  name: string;
  label: string;
  hint?: string;
  errors?: string[];
};

export function TextAreaField({
  name,
  label,
  hint,
  errors,
  ...props
}: TextAreaFieldProps) {
  const hasError = Boolean(errors?.length);

  return (
    <FieldShell name={name} label={label} hint={hint} errors={errors}>
      <Textarea
        id={name}
        name={name}
        aria-invalid={hasError || undefined}
        aria-describedby={describedBy(name, hint, hasError)}
        {...props}
      />
    </FieldShell>
  );
}
