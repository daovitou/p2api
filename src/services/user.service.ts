import { findLast } from "lodash";
import { IUser } from "../interfaces/user.interface";
import { UserRepository } from "../repositories/user.repository";

class UserService {
  private readonly userRepository: UserRepository;
  constructor() {
    this.userRepository = new UserRepository();
  }
  async findAll(filter?: any): Promise<IUser[] | null> {
    return await this.userRepository.findAll(filter);
  }
  async create(data: IUser): Promise<IUser> {
    return await this.userRepository.create({ ...data });
  }
  async findById(id: number, filter?: any): Promise<IUser | null> {
    return await this.userRepository.findById(id, filter);
  }
  async update(data: IUser, filter?: any): Promise<IUser | null> {
    return await this.userRepository.update({ ...data }, filter);
  }
  async findOne(filter?: any): Promise<IUser | null> {
    return await this.userRepository.findOne(filter);
  }
  async delete(filter?: any): Promise<IUser | null> {
    return await this.userRepository.delete(filter);
  }
  async findByUsername(username: string, filter?: any): Promise<IUser | null> {
    return await this.userRepository.findByUsername(username, filter);
  }
  async findByEmail(email: string): Promise<IUser | null> {
    return await this.userRepository.findByEmail(email);
  }
}

export default UserService;
