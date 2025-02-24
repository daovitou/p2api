import { IUser } from "../interfaces/user.interface";

export class CreateUserDTO {
  firstname?: string;
  lastname?: string;
  username?: string;
  email?: string;
  password?: string;
  phone?: string;
  status?: boolean;
  profile?: string;
  roleId?: number;
  constructor(data: IUser) {
    this.firstname = data.firstname;
    this.lastname = data.lastname;
    this.username = data.username;
    this.email = data.email;
    this.password = data.password;
    this.phone = data.phone;
    this.status = data.status;
    this.roleId = data.roleId;
    this.profile = data.profile
  }
}
export class UpdateUserDTO {
  firstname?: string;
  lastname?: string;
  phone?: string;
  status?: boolean;
  roleId?: number;
  constructor(data: IUser) {
    this.firstname = data.firstname;
    this.lastname = data.lastname;
    this.phone = data.phone;
    this.status = data.status;
    this.roleId = data.roleId;
  }
}
export class LogginDTO {
  username?: string;
  password?: string;
  constructor(data: IUser) {
    this.username = data.username;
    this.password = data.password;
  }
}
