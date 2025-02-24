import { IBookCategory } from "../interfaces/book.category.interface";
import { BookCategoryModel } from "../models/sequelize.db";
import { GenericRepository } from "./generic.repository";

export class BookCategoryRepository extends GenericRepository<IBookCategory> {
  constructor() {
    super(BookCategoryModel);
  }
}
