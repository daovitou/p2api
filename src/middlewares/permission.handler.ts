import { NextFunction, Request, Response } from "express";
import { roles } from "../utils/helpers"
import jwt from "jsonwebtoken";
import { Actions } from "../utils/helpers";
import { RoleModel } from "../models/sequelize.db";
import { errorResponse } from "../utils/responses";

type Role = 'Administrator' | 'Editor' | 'Entry';

const checkRole = async (action: Actions, role: number): Promise<boolean> => {
    let allow = false
    // console.log(roles[role].permissions.includes(action))
    await RoleModel.findOne({ where: { id: role } }).then(async (res) => {
        if (res) {
            allow = roles[res.getDataValue("name") as Role].permissions.includes(action);
        }
    })
    return allow;
}

export const checkPermission = (action: Actions) => async (req: Request, res: Response, next: NextFunction):Promise<any> => {
    const user: any = req.user
    if (await checkRole(action, user.roleId)) {
        next()
    } else {
        return errorResponse(res, 401, "Unauthorized")
    }
}