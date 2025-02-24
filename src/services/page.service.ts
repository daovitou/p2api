import { IPage } from "../interfaces/page.interface";
import { PageRepository } from "../repositories/page.repository";

export class PageService {
  private readonly pageRepository: PageRepository;
  constructor() {
    this.pageRepository = new PageRepository();
  }
  async findAll(filter?: any): Promise<IPage[] | null> {
    return await this.pageRepository.findAll(filter);
  }
  async create(data: IPage): Promise<IPage> {
      return await this.pageRepository.create(data);
    }
    async findById(id: number, filter?: any): Promise<IPage | null> {
      return await this.pageRepository.findById(id, filter);
    }
    async update(data: IPage, filter?: any): Promise<IPage | null> {
      return await this.pageRepository.update({ ...data }, filter);
    }
    async findOne(filter?: any): Promise<IPage | null> {
      return await this.pageRepository.findOne(filter);
    }
    async delete(filter?: any): Promise<IPage | null> {
      return await this.pageRepository.delete(filter);
    }
}
