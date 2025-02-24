export interface IVideo {
  id?: number;
  title?: string;
  youtubeId?: string;
  published?: Date;
  author?: string;
  deletedAt?: Date;
  createdAt?:Date;
  updatedAt?:Date;
  languageId?: number;
  videoCategoryId?: number;
  viewer?:number
}
