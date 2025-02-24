import { IPage } from "../interfaces/page.interface";

export class CreatePageDTO {
  name?: string;
  description?:string;
  constructor(data: IPage) {
    this.name = data.name;
  }
}

export class UpdatePageDTO {
  name?: string;
  description?:string;
  constructor(data: IPage) {
    this.name = data.name;
    this.description = data.description
  }
}
