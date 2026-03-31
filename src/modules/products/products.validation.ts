import { z } from "zod";

export const productSlugParamsSchema = z.object({
  slug: z.string().min(1)
});
