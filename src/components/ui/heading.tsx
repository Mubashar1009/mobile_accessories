import * as React from "react";
import { Box, BoxProps } from "./box";
import { cn } from "@/lib/utils";

export interface HeadingProps extends BoxProps {
  level?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
}

export function Heading({ className, level = "h4", ref, ...props }: HeadingProps) {
  return (
    <Box
      as={level}
      ref={ref}
      className={cn("tracking-tight text-foreground", className)}
      {...props}
    />
  );
}

Heading.displayName = "Heading";
