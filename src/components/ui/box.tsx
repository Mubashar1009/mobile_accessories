import * as React from "react";
import { cn } from "@/lib/utils";

export const FONT_SIZES = {
  xs: "text-xs",
  sm: "text-sm",
  base: "text-base",
  lg: "text-lg",
  xl: "text-xl",
  "2xl": "text-2xl",
  "3xl": "text-3xl",
  "4xl": "text-4xl",
  "5xl": "text-5xl",
  "6xl": "text-6xl",
} as const;

export const FONT_WEIGHTS = {
  thin: "font-thin",
  extralight: "font-extralight",
  light: "font-light",
  normal: "font-normal",
  medium: "font-medium",
  semibold: "font-semibold",
  bold: "font-bold",
  extrabold: "font-extrabold",
  black: "font-black",
} as const;

export interface BoxProps extends React.HTMLAttributes<HTMLElement> {
  as?: React.ElementType;
  fontSize?: keyof typeof FONT_SIZES;
  fontWeight?: keyof typeof FONT_WEIGHTS;
  ref?: React.Ref<unknown>;
}

export function Box({
  as: Element = "div",
  className,
  fontSize,
  fontWeight,
  ref,
  ...props
}: BoxProps) {
  return (
    <Element
      ref={ref}
      className={cn(
        fontSize && FONT_SIZES[fontSize],
        fontWeight && FONT_WEIGHTS[fontWeight],
        className
      )}
      {...props}
    />
  );
}

Box.displayName = "Box";
