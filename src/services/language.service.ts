import { ILanguage } from "../interfaces/language.interface";
import { LanguageRepository } from "../repositories/language.repository";

export class LanguageService {
  private readonly languageRepository: LanguageRepository;
  constructor() {
    this.languageRepository = new LanguageRepository();
  }
  async findAll(filter?: any): Promise<ILanguage[] | null> {
    return await this.languageRepository.findAll(filter);
  }
  async create(data: ILanguage): Promise<ILanguage> {
    return await this.languageRepository.create(data);
  }
  async findById(id: number, filter?: any): Promise<ILanguage | null> {
    return await this.languageRepository.findById(id, filter);
  }
  async update(data: ILanguage, filter?: any): Promise<ILanguage | null> {
    return await this.languageRepository.update({ ...data }, filter);
  }
  async findOne(filter?: any): Promise<ILanguage | null> {
    return await this.languageRepository.findOne(filter);
  }
  async delete(filter?: any): Promise<ILanguage | null> {
    return await this.languageRepository.delete(filter);
  }
}
