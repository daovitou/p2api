import { IBookCategory } from "../interfaces/book.category.interface";
import { BookCategoryRepository } from "../repositories/book.category.repository";

export class BookCategoryService {
  private readonly bookCategoryRepository: BookCategoryRepository;
  constructor() {
    this.bookCategoryRepository = new BookCategoryRepository();
  }
  async findAll(filter?: any): Promise<IBookCategory[] | null> {
    return await this.bookCategoryRepository.findAll(filter);
  }
  async create(data: IBookCategory): Promise<IBookCategory> {
    return await this.bookCategoryRepository.create(data);
  }
  async findById(id: number, filter?: any): Promise<IBookCategory | null> {
    return await this.bookCategoryRepository.findById(id, filter);
  }
  async update(
    data: IBookCategory,
    filter?: any
  ): Promise<IBookCategory | null> {
    return await this.bookCategoryRepository.update({ ...data }, filter);
  }
  async findOne(filter?: any): Promise<IBookCategory | null> {
    return await this.bookCategoryRepository.findOne(filter);
  }
  async delete(filter?: any): Promise<IBookCategory | null> {
    return await this.bookCategoryRepository.delete(filter);
  }
}
