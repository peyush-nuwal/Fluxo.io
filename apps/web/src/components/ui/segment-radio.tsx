"use client";

import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { motion } from "motion/react";
import { useId } from "react";
import type { ReactNode } from "react";

type Option<T extends string> = {
  value: T;
  label?: ReactNode;
  icon?: ReactNode;
};

type SegmentRadioGroupProps<T extends string> = {
  value?: T;
  defaultValue?: T;
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
}: SegmentRadioGroupProps<T>) {
  const layoutId = useId();

  return (
    <RadioGroup
      value={value}
      defaultValue={defaultValue}
      onValueChange={(v) => onChange(v as T)}
      className={cn(
        "relative inline-flex w-fit rounded-md border border-border bg-muted p-1",
        className,
      )}
    >
      {options.map((opt) => {
        const checked = value === opt.value;
        const hasLabel = opt.label !== undefined && opt.label !== null;
        const hasIcon = opt.icon !== undefined && opt.icon !== null;

        return (
          <Label
            key={opt.value}
            htmlFor={opt.value}
            className={cn(
              "relative z-10 flex cursor-pointer select-none items-center justify-center rounded-sm px-3 py-1.5 text-sm font-medium transition-colors hover:bg-primary/40",

              checked
                ? "text-primary-foreground "
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {checked && (
              <motion.span
                layoutId={`segment-indicator-${layoutId}`}
                className={cn(
                  "absolute inset-0 z-[-1] rounded-sm transition-colors",
                  checked ? "bg-primary" : "bg-transparent ",
                )}
                transition={{
                  type: "spring",
                  stiffness: 500,
                  damping: 40,
                }}
              />
            )}

            <RadioGroupItem
              id={opt.value}
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
