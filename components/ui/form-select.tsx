"use client";

import { Select } from "@base-ui/react/select";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export type FormSelectOption = {
  value: string;
  label: string;
};

type FormSelectProps = {
  id: string;
  name: string;
  defaultValue?: string;
  value?: string;
  onValueChange?: (value: string) => void;
  options: FormSelectOption[];
  invalid?: boolean;
  className?: string;
};

export function FormSelect({
  id,
  name,
  defaultValue,
  value,
  onValueChange,
  options,
  invalid = false,
  className,
}: FormSelectProps) {
  const labels = Object.fromEntries(options.map((option) => [option.value, option.label]));

  return (
    <Select.Root
      name={name}
      value={value}
      defaultValue={value === undefined ? defaultValue : undefined}
      modal={false}
      onValueChange={(next) => {
        if (typeof next === "string") {
          onValueChange?.(next);
        }
      }}
    >
      <Select.Trigger
        id={id}
        className={cn(
          "flex h-11 w-full items-center justify-between gap-2 rounded-lg border border-input bg-transparent px-2.5 text-left text-sm outline-none select-none",
          "focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50",
          "disabled:cursor-not-allowed disabled:opacity-50",
          "aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20",
          "data-popup-open:border-ring data-popup-open:ring-3 data-popup-open:ring-ring/50",
          className,
        )}
        aria-invalid={invalid}
      >
        <Select.Value className="min-w-0 flex-1 truncate">
          {(value: string) => labels[value] ?? value}
        </Select.Value>
        <Select.Icon className="text-muted-foreground">
          <ChevronDown aria-hidden="true" className="size-4" />
        </Select.Icon>
      </Select.Trigger>
      <Select.Portal>
        <Select.Positioner className="z-[80] outline-none" sideOffset={6} alignItemWithTrigger={false}>
          <Select.Popup className="min-w-[var(--anchor-width)] origin-(--transform-origin) rounded-lg bg-popover p-1 text-popover-foreground shadow-lg ring-1 ring-foreground/10 duration-100 data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95">
            <Select.List>
              {options.map((option) => (
                <Select.Item
                  key={option.value}
                  value={option.value}
                  className="flex min-h-9 cursor-default items-center rounded-md px-2.5 text-sm outline-none select-none data-highlighted:bg-muted data-highlighted:text-foreground data-selected:font-medium"
                >
                  <Select.ItemText>{option.label}</Select.ItemText>
                </Select.Item>
              ))}
            </Select.List>
          </Select.Popup>
        </Select.Positioner>
      </Select.Portal>
    </Select.Root>
  );
}
