import * as React from "react";
import { Box, BoxProps } from "./box";

export type ParagraphProps = BoxProps;

export function Paragraph({ className, ref, ...props }: ParagraphProps) {
  return (
    <Box
      as="p"
      ref={ref}
      className={className}
      {...props}
    />
  );
}

Paragraph.displayName = "Paragraph";
