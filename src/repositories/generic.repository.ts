import { BaseRepository } from "./base.repository";

export class GenericRepository<T> implements BaseRepository<T> {
  private readonly model: any;
  constructor(model: any) {
    this.model = model;
  }
  async findAll(filter?: any): Promise<T[] | null> {
    return await this.model.findAll(filter);
  }
  async create(data: T, filter?: any): Promise<T> {
    return await this.model.create({ ...data }, filter);
  }
  async findById(id: number, filter?: any): Promise<T | null> {
    const filterOpts = {
      ...filter,
    };
    return await this.model.findByPk(id, filterOpts);
  }
  async update(data: T, filter?: any): Promise<T | null> {
    return await this.model.update({ ...data }, filter);
  }
  async delete(filter?: any): Promise<T | null> {
    return await this.model.destroy(filter);
  }
  async findOne(filter?:any):Promise<T | null>{
    return await this.model.findOne(filter)
  }
}
