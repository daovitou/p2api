import { z } from "zod";

export const BookCategorySchema = z.object({
    body: z
        .object({
            name: z
                .string()
                .trim()
                .min(1,{message:"Category's name is required"}),
        })
});
