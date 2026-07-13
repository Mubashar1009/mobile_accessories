import * as React from "react";
import { Box, BoxProps } from "./box";
import { cn } from "@/lib/utils";

export const GRID_COLS = {
  1: "grid-cols-1",
  2: "grid-cols-2",
  3: "grid-cols-3",
  4: "grid-cols-4",
  5: "grid-cols-5",
  6: "grid-cols-6",
  12: "grid-cols-12",
  none: "grid-cols-none",
} as const;

export const GRID_ROWS = {
  1: "grid-rows-1",
  2: "grid-rows-2",
  3: "grid-rows-3",
  4: "grid-rows-4",
  5: "grid-rows-5",
  6: "grid-rows-6",
  none: "grid-rows-none",
} as const;

export const GAP_SIZES = {
  none: "gap-0",
  xs: "gap-1",
  sm: "gap-2",
  md: "gap-4",
  lg: "gap-6",
  xl: "gap-8",
  "2xl": "gap-10",
  "3xl": "gap-12",
} as const;

export const GAP_X_SIZES = {
  none: "gap-x-0",
  xs: "gap-x-1",
  sm: "gap-x-2",
  md: "gap-x-4",
  lg: "gap-x-6",
  xl: "gap-x-8",
  "2xl": "gap-x-10",
  "3xl": "gap-x-12",
} as const;

export const GAP_Y_SIZES = {
  none: "gap-y-0",
  xs: "gap-y-1",
  sm: "gap-y-2",
  md: "gap-y-4",
  lg: "gap-y-6",
  xl: "gap-y-8",
  "2xl": "gap-y-10",
  "3xl": "gap-y-12",
} as const;

export interface GridProps extends BoxProps {
  cols?: keyof typeof GRID_COLS;
  rows?: keyof typeof GRID_ROWS;
  gap?: keyof typeof GAP_SIZES;
  gapX?: keyof typeof GAP_X_SIZES;
  gapY?: keyof typeof GAP_Y_SIZES;
}

export function Grid({
  className,
  cols,
  rows,
  gap,
  gapX,
  gapY,
  ref,
  ...props
}: GridProps) {
  return (
    <Box
      ref={ref}
      className={cn(
        "grid",
        cols !== undefined && GRID_COLS[cols],
        rows !== undefined && GRID_ROWS[rows],
        gap !== undefined && GAP_SIZES[gap],
        gapX !== undefined && GAP_X_SIZES[gapX],
        gapY !== undefined && GAP_Y_SIZES[gapY],
        className
      )}
      {...props}
    />
  );
}

Grid.displayName = "Grid";
