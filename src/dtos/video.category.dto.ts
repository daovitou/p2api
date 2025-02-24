import { IVideoCategory } from "../interfaces/video.category.interface";

export class CreateVideoCategoryDTO {
  name?: string;
  constructor(data: IVideoCategory) {
    this.name = data.name;
  }
}

export class UpdateVideoCategoryDTO {
  name?: string;
  constructor(data: IVideoCategory) {
    this.name = data.name;
  }
}
