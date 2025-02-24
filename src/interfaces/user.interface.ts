import { IRole } from "./role.interface";

export interface IUser {
  id?: number;
  firstname?: string;
  lastname?: string;
  username?: string;
  email?: string;
  password?: string;
  phone?: string;
  status?: boolean;
  roleId?: number;
  deletedAt?: Date;
  accessToken?: string;
  refreshToken?: string;
  profile?:string;
  role?:IRole
}
