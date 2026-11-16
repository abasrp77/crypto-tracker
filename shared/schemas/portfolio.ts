// shared/schemas/portfolio.ts
import { z } from "zod";

export const addAssetSchema = z.object({
  coingeckoId: z.string().min(1, "Please select a valid crypto asset"),

  symbol: z
    .string()
    .min(1, "Symbol is required")
    .transform((val) => val.toUpperCase()),

  name: z.string().min(1, "Name is required"),

  image: z.string().url("Invalid image URL").optional(),

  amount: z.coerce
    .number({ message: "Amount must be a valid number" })
    .positive("Amount must be greater than 0"),

  buyPriceUsd: z.coerce
    .number({ message: "Buy price must be a valid number" })
    .nonnegative("Buy price cannot be negative"),
});

export type AddAssetInput = z.infer<typeof addAssetSchema>;
