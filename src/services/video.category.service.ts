import { IVideoCategory } from "../interfaces/video.category.interface";
import { VideoCategoryRepository } from "../repositories/video.category.repository";

export class VideoCategoryService {
  private readonly videoCategoryRepository: VideoCategoryRepository;
  constructor() {
    this.videoCategoryRepository = new VideoCategoryRepository();
  }
  async findAll(filter?: any): Promise<IVideoCategory[] | null> {
    return await this.videoCategoryRepository.findAll(filter);
  }
  async create(data: IVideoCategory): Promise<IVideoCategory> {
      return await this.videoCategoryRepository.create(data);
    }
    async findById(id: number, filter?: any): Promise<IVideoCategory | null> {
      return await this.videoCategoryRepository.findById(id, filter);
    }
    async update(data: IVideoCategory, filter?: any): Promise<IVideoCategory | null> {
      return await this.videoCategoryRepository.update({ ...data }, filter);
    }
    async findOne(filter?: any): Promise<IVideoCategory | null> {
      return await this.videoCategoryRepository.findOne(filter);
    }
    async delete(filter?: any): Promise<IVideoCategory | null> {
      return await this.videoCategoryRepository.delete(filter);
    }
}
