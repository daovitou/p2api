import { IBook } from "../interfaces/book.interface";
import { BookModel } from "../models/sequelize.db";
import { GenericRepository } from "./generic.repository";

export class BookRepository extends GenericRepository<IBook> {
  constructor() {
    super(BookModel);
  }
}
