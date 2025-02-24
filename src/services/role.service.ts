import { IRole } from "../interfaces/role.interface";
import { RoleRepository } from "../repositories/role.repository";

export class RoleService {
  private readonly roleRepository: RoleRepository;
  constructor() {
    this.roleRepository = new RoleRepository();
  }
  async findAll(filter?: any): Promise<IRole[] | null> {
    return await this.roleRepository.findAll(filter);
  }
}
