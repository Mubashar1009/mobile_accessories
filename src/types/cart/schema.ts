import { z } from "zod";
import { dbProductSchema } from "../product/schema";

export const cartItemSchema = z.object({
  id: z.string(),
  product: dbProductSchema,
  quantity: z.number().int().min(1, "Quantity must be at least 1"),
});
