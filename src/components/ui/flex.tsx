import * as React from "react";
import { Box, BoxProps } from "./box";
import { cn } from "@/lib/utils";

export const FLEX_DIRECTIONS = {
  row: "flex-row",
  col: "flex-col",
  "row-reverse": "flex-row-reverse",
  "col-reverse": "flex-col-reverse",
} as const;

export const FLEX_ALIGN = {
  start: "items-start",
  center: "items-center",
  end: "items-end",
  baseline: "items-baseline",
  stretch: "items-stretch",
} as const;

export const FLEX_JUSTIFY = {
  start: "justify-start",
  center: "justify-center",
  end: "justify-end",
  between: "justify-between",
  around: "justify-around",
  evenly: "justify-evenly",
} as const;

export const FLEX_WRAPS = {
  wrap: "flex-wrap",
  nowrap: "flex-nowrap",
  "wrap-reverse": "flex-wrap-reverse",
} as const;

export interface FlexProps extends BoxProps {
  direction?: keyof typeof FLEX_DIRECTIONS;
  align?: keyof typeof FLEX_ALIGN;
  justify?: keyof typeof FLEX_JUSTIFY;
  wrap?: keyof typeof FLEX_WRAPS;
  gap?: string | number;
}

export function Flex({
  className,
  direction = "row",
  align,
  justify,
  wrap,
  gap,
  ref,
  ...props
}: FlexProps) {
  return (
    <Box
      ref={ref}
      className={cn(
        "flex",
        direction && FLEX_DIRECTIONS[direction],
        align && FLEX_ALIGN[align],
        justify && FLEX_JUSTIFY[justify],
        wrap && FLEX_WRAPS[wrap],
        gap !== undefined && `gap-${gap}`,
        className
      )}
      {...props}
    />
  );
}

Flex.displayName = "Flex";
