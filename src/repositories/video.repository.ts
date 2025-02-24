import { IVideo } from "../interfaces/video.category";
import { VideoModel } from "../models/sequelize.db";
import { GenericRepository } from "./generic.repository";

export class VideoRepository extends GenericRepository<IVideo>{
    constructor(){
        super(VideoModel);
    }
}