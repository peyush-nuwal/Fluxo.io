"use client";

import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { motion } from "motion/react";
import { useId, useState } from "react";
import type { ReactNode } from "react";

type Option<T extends string> = {
  value: T;
  label?: ReactNode;
  icon?: ReactNode;
};

type SegmentRadioGroupProps<T extends string> = {
  value?: T;
  defaultValue?: T;
  type?: "default" | "ghost";
  options: Option<T>[];
  onChange: (value: T) => void;
  className?: string;
};

export function SegmentRadioGroup<T extends string>({
  value,
  defaultValue,
  options,
  onChange,
  className,
  type = "default",
}: SegmentRadioGroupProps<T>) {
  const groupId = useId();
  const [internalValue, setInternalValue] = useState<T | undefined>(
    defaultValue,
  );

  const isControlled = value !== undefined;
  const selectedValue = isControlled ? value : internalValue;

  const handleValueChange = (nextValue: string) => {
    const typedValue = nextValue as T;
    if (!isControlled) {
      setInternalValue(typedValue);
    }
    onChange(typedValue);
  };

  return (
    <RadioGroup
      value={value}
      defaultValue={defaultValue}
      onValueChange={handleValueChange}
      className={cn(
        "relative inline-flex w-fit p-1",
        type === "default"
          ? "rounded-md border border-border bg-muted"
          : "bg-transparent",
      )}
    >
      {options.map((opt) => {
        const checked = selectedValue === opt.value;
        const hasLabel = opt.label !== undefined && opt.label !== null;
        const hasIcon = opt.icon !== undefined && opt.icon !== null;
        const inputId = `${groupId}-${opt.value}`;

        return (
          <Label
            key={opt.value}
            htmlFor={inputId}
            className={cn(
              "relative z-10 flex cursor-pointer select-none items-center justify-center rounded-sm px-3 py-1.5 text-sm font-medium transition-colors",
              className,
              checked
                ? type === "default"
                  ? "text-primary-foreground"
                  : "text-primary"
                : "text-muted-foreground hover:text-foreground hover:bg-primary/40",
            )}
          >
            {checked && (
              <motion.span
                layoutId={`segment-indicator-${groupId}`}
                className={cn(
                  "absolute inset-0 z-[-1] rounded-sm transition-colors",
                  type === "default" ? "bg-primary" : "bg-transparent",
                )}
                transition={{
                  type: "spring",
                  stiffness: 500,
                  damping: 40,
                }}
              />
            )}

            <RadioGroupItem
              id={inputId}
              value={opt.value}
              className="sr-only"
            />

            {(hasIcon || hasLabel) && (
              <span className="flex items-center gap-2">
                {hasIcon ? opt.icon : null}
                {hasLabel ? opt.label : null}
              </span>
            )}
          </Label>
        );
      })}
    </RadioGroup>
  );
}
