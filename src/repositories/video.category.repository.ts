import { IVideoCategory } from "../interfaces/video.category.interface";
import { VideoCatogoryModel } from "../models/sequelize.db";
import { GenericRepository } from "./generic.repository";

export class VideoCategoryRepository extends GenericRepository<IVideoCategory>{
    constructor(){
        super(VideoCatogoryModel);
    }
}