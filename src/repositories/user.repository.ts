import { IUser } from "../interfaces/user.interface";
import { UserModel } from "../models/sequelize.db";
import { GenericRepository } from "./generic.repository";

export class UserRepository extends GenericRepository<IUser> {
  constructor() {
    super(UserModel);
  }
  async findByEmail(email: string, filter?: any): Promise<IUser | null> {
    const filterOpts = {
      where: { email: email },
      ...filter,
    };
    const user = await UserModel.findOne(filterOpts);
    return user ? (user.toJSON() as IUser) : null;
  }
  async findByUsername(username: string, filter?: any): Promise<IUser | null> {
    const filterOpts = {
      where: { username: username },
      ...filter,
    };
    const user = await UserModel.findOne(filterOpts);
    return user ? (user.toJSON() as IUser) : null;
  }
}
