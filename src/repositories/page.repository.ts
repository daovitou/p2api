import { IPage } from "../interfaces/page.interface";
import { PageModel } from "../models/sequelize.db";
import { GenericRepository } from "./generic.repository";

export class PageRepository extends GenericRepository<IPage>{
    constructor(){
        super(PageModel);
    }
}