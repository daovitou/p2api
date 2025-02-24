import { IVideo } from "../interfaces/video.category";
import { VideoRepository } from "../repositories/video.repository";

export class VideoService {
  private readonly videoRepository: VideoRepository;
  constructor() {
    this.videoRepository = new VideoRepository();
  }
  async findAll(filter?: any): Promise<IVideo[] | null> {
    return await this.videoRepository.findAll(filter);
  }
  async create(data: IVideo): Promise<IVideo> {
      return await this.videoRepository.create(data);
    }
    async findById(id: number, filter?: any): Promise<IVideo | null> {
      return await this.videoRepository.findById(id, filter);
    }
    async update(data: IVideo, filter?: any): Promise<IVideo | null> {
      return await this.videoRepository.update({ ...data }, filter);
    }
    async findOne(filter?: any): Promise<IVideo | null> {
      return await this.videoRepository.findOne(filter);
    }
    async delete(filter?: any): Promise<IVideo | null> {
      return await this.videoRepository.delete(filter);
    }
}
