"use client";

import { useId, useRef, useState } from "react";
import { MapPin } from "lucide-react";

import { cn } from "cn";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { suggestCities, type City } from "@/config/cities";

type CityFieldProps = {
  name?: string;
  label?: string;
  value: string;
  onChange: (value: string) => void;
  hint?: string;
  errors?: string[];
  required?: boolean;
  placeholder?: string;
};

/**
 * City input with suggestions.
 *
 * Built as an ARIA combobox over a plain input rather than a Select, because
 * the list is a *shortcut*, not a constraint: anything typed is accepted, so
 * someone in a town that is not in the top 170 can still sign up. The listbox
 * is keyboard-navigable (arrows, Enter, Escape) and announces the active
 * option through aria-activedescendant.
 */
export function CityField({
  name = "city",
  label = "City",
  value,
  onChange,
  hint,
  errors,
  required,
  placeholder = "Start typing — Bengaluru, New Delhi…",
}: CityFieldProps) {
  const listId = useId();
  const optionId = (index: number) => `${listId}-option-${index}`;

  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const blurTimer = useRef<number | undefined>(undefined);

  const suggestions: City[] = suggestCities(value);
  const hasError = Boolean(errors?.length);
  const showList = isOpen && suggestions.length > 0;

  function choose(city: City) {
    onChange(city.name);
    setIsOpen(false);
    setActiveIndex(-1);
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Escape") {
      setIsOpen(false);
      setActiveIndex(-1);
      return;
    }

    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();

      if (!isOpen) {
        setIsOpen(true);
        setActiveIndex(0);
        return;
      }

      const step = event.key === "ArrowDown" ? 1 : -1;
      const next =
        (activeIndex + step + suggestions.length) % suggestions.length;
      setActiveIndex(next);
      return;
    }

    // Enter only commits a highlighted suggestion. Without a highlight it
    // falls through and submits the form, which is what typing a town that is
    // not on the list should do.
    if (event.key === "Enter" && isOpen && activeIndex >= 0) {
      event.preventDefault();
      choose(suggestions[activeIndex]);
    }
  }

  const describedBy =
    [hint ? `${name}-hint` : null, hasError ? `${name}-error` : null]
      .filter(Boolean)
      .join(" ") || undefined;

  return (
    <div className="space-y-1.5">
      <Label htmlFor={name}>{label}</Label>

      <div className="relative">
        <Input
          id={name}
          name={name}
          value={value}
          onChange={(event) => {
            onChange(event.target.value);
            setIsOpen(true);
            setActiveIndex(-1);
          }}
          onFocus={() => setIsOpen(true)}
          onBlur={() => {
            // Deferred so a click on an option lands before the list closes.
            blurTimer.current = window.setTimeout(() => setIsOpen(false), 120);
          }}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          required={required}
          autoComplete="off"
          className="h-10"
          role="combobox"
          aria-expanded={showList}
          aria-controls={listId}
          aria-autocomplete="list"
          aria-activedescendant={
            showList && activeIndex >= 0 ? optionId(activeIndex) : undefined
          }
          aria-invalid={hasError || undefined}
          aria-describedby={describedBy}
        />

        {showList ? (
          <ul
            id={listId}
            role="listbox"
            aria-label="City suggestions"
            className="absolute z-50 mt-1 max-h-64 w-full overflow-auto rounded-xl border border-border bg-popover p-1 shadow-pop"
          >
            {suggestions.map((city, index) => (
              <li
                key={`${city.name}-${city.state}`}
                id={optionId(index)}
                role="option"
                aria-selected={index === activeIndex}
                // onMouseDown, not onClick: mousedown fires before blur, so
                // the selection is not lost to the input closing the list.
                onMouseDown={(event) => {
                  event.preventDefault();
                  window.clearTimeout(blurTimer.current);
                  choose(city);
                }}
                onMouseEnter={() => setActiveIndex(index)}
                className={cn(
                  "flex cursor-pointer items-center gap-2 rounded-lg px-2.5 py-2 text-sm",
                  index === activeIndex
                    ? "bg-accent text-accent-foreground"
                    : "text-foreground",
                )}
              >
                <MapPin
                  className="size-3.5 shrink-0 text-muted-foreground"
                  aria-hidden
                />
                <span className="font-medium">{city.name}</span>
                <span className="ml-auto text-xs text-muted-foreground">
                  {city.state}
                </span>
              </li>
            ))}
          </ul>
        ) : null}
      </div>

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
