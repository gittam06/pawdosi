"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

import { TextField } from "@/components/forms/fields";
import { Button } from "@/components/ui/button";

type PasswordFieldProps = {
  name?: string;
  label?: string;
  hint?: string;
  errors?: string[];
  autoComplete?: string;
  required?: boolean;
};

/**
 * Password input with a reveal toggle — cheaper than a confirm field and far
 * better than letting people guess what they typed on a phone keyboard.
 */
export function PasswordField({
  name = "password",
  label = "Password",
  hint,
  errors,
  autoComplete = "current-password",
  required = true,
}: PasswordFieldProps) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="relative">
      <TextField
        name={name}
        label={label}
        hint={hint}
        errors={errors}
        type={visible ? "text" : "password"}
        autoComplete={autoComplete}
        required={required}
        className="pr-10"
      />
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        // Sits over the input, which is the second child of the field shell.
        className="absolute top-7 right-1"
        aria-label={visible ? "Hide password" : "Show password"}
        aria-pressed={visible}
        onClick={() => setVisible((current) => !current)}
      >
        {visible ? (
          <EyeOff className="size-4" aria-hidden />
        ) : (
          <Eye className="size-4" aria-hidden />
        )}
      </Button>
    </div>
  );
}
