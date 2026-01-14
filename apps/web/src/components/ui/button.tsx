import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
  {
    variants: {
      variant: {
        /* ───────── Default / Primary ───────── */
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        primary: "bg-primary text-primary-foreground hover:bg-primary/90",

        outline:
          "border bg-background hover:bg-accent hover:text-accent-foreground",

        "outline-primary":
          "border border-primary text-primary bg-transparent hover:bg-primary/10 active:bg-primary/20",

        ghost: "hover:bg-accent hover:text-accent-foreground",

        "ghost-primary": "text-primary bg-transparent hover:bg-primary/10",

        link: "text-primary underline-offset-4 hover:underline",

        /* ───────── Secondary ───────── */
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80",

        "outline-secondary":
          "border border-secondary text-secondary-foreground bg-transparent hover:bg-secondary/20",

        /* ───────── Destructive ───────── */
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40",

        "outline-destructive":
          "border border-destructive text-destructive bg-transparent hover:bg-destructive/10",

        /* ───────── Success ───────── */
        success: "bg-success text-success-foreground hover:bg-success/90",

        "outline-success":
          "border border-success text-success bg-transparent hover:bg-success/10",
      },

      size: {
        default: "h-9 px-4 py-2 has-[>svg]:px-3",
        sm: "h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5",
        lg: "h-10 rounded-md px-6 has-[>svg]:px-4",
        icon: "size-9",
        "icon-sm": "size-8",
        "icon-lg": "size-10",
      },
    },

    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

function Button({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  }) {
  const Comp = asChild ? Slot : "button";

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };
