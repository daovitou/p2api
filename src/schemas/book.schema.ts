import { z } from "zod";
import { BookCategoryModel, UserModel } from "../models/sequelize.db";
import { BookCategoryService } from "../services/book.category.service";
import { Op, where } from "sequelize";
const bookCategoryServie = new BookCategoryService()

const categories = async (id: number) => await bookCategoryServie.findAll({ where: { id: id } })

export const BookSchema = z.object({
    body: z
        .object({
            code: z
                .string()
                .trim()
                .min(1, { message: "Code is required" }),
            title: z
                .string()
                .trim()
                .min(1, { message: "Title is required" }),
            // bookCategoryId: z.number().int().superRefine(async (bookCategoryId, ctx) => {
            //     const existing = await bookCategoryServie.findById(bookCategoryId)
            //     if (!existing) {
            //         ctx.addIssue({
            //             code: z.ZodIssueCode.custom,
            //             message: "Book category id is invalid",
            //             path: ["bookCategoryId"]
            //         })
            //     }
            // }),
            ebook: z.instanceof(File, { message: "Ebook is required" }),
            image: z.instanceof(File, { message: "Thumnail is required" })
        })
});
