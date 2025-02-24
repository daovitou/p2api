export interface BaseRepository<T> {
  findAll(filters?: any): Promise<T[] | null>;
  create(data: T, filters?: any): Promise<T>;
  findOne(filters?: any): Promise<T | null>;
  findById(id:number,filters?: any): Promise<T | null>;
  update(data: T, filters?: any): Promise<T | null>;
  delete(filters?: any): Promise<T | null>;
}
