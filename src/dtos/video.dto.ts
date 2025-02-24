import { IVideo } from "../interfaces/video.category";

export class CreateVideoDTO {
    title?: string;
    youtubeId?: string;
    published?: Date;
    author?: string;
    deletedAt?: Date;
    languageId?: number;
    videoCategoryId?: number;
    constructor(data: IVideo) {
        this.title = data.title
        this.youtubeId = data.youtubeId
        this.published = data.published
        this.author = data.author
        this.languageId = data.languageId
        this.videoCategoryId = data.videoCategoryId
    }
}


export class UpdateVideoDTO {
    title?: string;
    youtubeId?: string;
    published?: Date;
    author?: string;
    deletedAt?: Date;
    languageId?: number;
    videoCategoryId?: number;
    viewer?: number;
    constructor(data: IVideo) {
        this.title = data.title
        this.youtubeId = data.youtubeId
        this.published = data.published
        this.author = data.author
        this.languageId = data.languageId
        this.videoCategoryId = data.videoCategoryId
        this.viewer = data.viewer
    }
}