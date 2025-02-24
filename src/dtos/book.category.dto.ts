import { IBookCategory } from "../interfaces/book.category.interface";

export class CreateBookCategoryDTO {
  name?: string;
  constructor(data: IBookCategory) {
    this.name = data.name;
  }
}

export class UpdateBookCategoryDTO {
  name?: string;
  constructor(data: IBookCategory) {
    this.name = data.name;
  }
}
