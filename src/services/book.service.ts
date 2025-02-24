import { IBook } from "../interfaces/book.interface";
import { BookRepository } from "../repositories/book.repository";

export class BookService {
  private readonly bookRepository: BookRepository;
  constructor() {
    this.bookRepository = new BookRepository();
  }
  async findAll(filter?: any): Promise<IBook[] | null> {
    return await this.bookRepository.findAll(filter);
  }
  async create(data: IBook): Promise<IBook> {
    return await this.bookRepository.create(data);
  }
  async findById(id: number, filter?: any): Promise<IBook | null> {
    return await this.bookRepository.findById(id, filter);
  }
  async update(data: IBook, filter?: any): Promise<IBook | null> {
    return await this.bookRepository.update({ ...data }, filter);
  }
  async findOne(filter?: any): Promise<IBook | null> {
    return await this.bookRepository.findOne(filter);
  }
  async delete(filter?: any): Promise<IBook | null> {
    return await this.bookRepository.delete(filter);
  }
}
