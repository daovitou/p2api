import { IRole } from "../interfaces/role.interface";
import { RoleModel } from "../models/sequelize.db";
import { GenericRepository } from "./generic.repository";

export class RoleRepository extends GenericRepository<IRole> {
  constructor() {
    super(RoleModel);
  }
  
}
