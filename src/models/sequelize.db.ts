import { Sequelize, DataTypes } from "sequelize";
import { sequelize } from "../db/sequelize.db";
import bcrypt from "bcrypt";

export const MinioModel = sequelize.define('minios', {
  fieldname: { type: DataTypes.STRING },
  originalname: { type: DataTypes.STRING },
  encoding: { type: DataTypes.STRING },
  mimetype: { type: DataTypes.STRING },
  size: { type: DataTypes.STRING },
  bucket: { type: DataTypes.STRING },
  key: { type: DataTypes.STRING },
  acl: { type: DataTypes.STRING },
  contentType: { type: DataTypes.STRING },
  contentDisposition: { type: DataTypes.STRING },
  contentEncoding: { type: DataTypes.STRING },
  storageClass: { type: DataTypes.STRING },
  serverSideEncryption: { type: DataTypes.STRING },
  location: { type: DataTypes.STRING },
  etag: { type: DataTypes.STRING },
}, { timestamps: true })

export const RoleModel = sequelize.define(
  "roles",
  {
    name: { type: DataTypes.STRING, allowNull: false },
    deletedAt: { type: DataTypes.DATE },
  },
  { timestamps: true }
);

export const UserModel = sequelize.define(
  "users",
  {
    firstname: { type: DataTypes.STRING, allowNull: false },
    lastname: { type: DataTypes.STRING, allowNull: false },
    username: { type: DataTypes.STRING, allowNull: false, unique: true },
    email: {
      type: DataTypes.STRING,
      unique: true,
      validate: { isEmail: true },
    },
    profile: {
      type: DataTypes.TEXT(),
      defaultValue: "profile.png"
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    phone: { type: DataTypes.STRING, defaultValue: "000-000-0000" },
    status: { type: DataTypes.BOOLEAN, defaultValue: true },
    roleId: { type: DataTypes.INTEGER, allowNull: false },
    deletedAt: { type: DataTypes.DATE },
    accessToken: { type: DataTypes.STRING },
    refreshToken: { type: DataTypes.STRING },
  },
  { timestamps: true }
);

export const PageModel = sequelize.define(
  "pages",
  {
    name: { type: DataTypes.STRING, allowNull: false },
    slug:{type: DataTypes.TEXT },
    description: { type: DataTypes.TEXT },
    deletedAt: { type: DataTypes.DATE },
  },
  { timestamps: true }
);

export const BookCategoryModel = sequelize.define(
  "bookCategories",
  {
    name: { type: DataTypes.STRING, allowNull: false },
    deletedAt: { type: DataTypes.DATE },
  },
  { timestamps: true }
);

export const LanguageModel = sequelize.define(
  "languages",
  {
    name: { type: DataTypes.STRING, allowNull: false },
    deletedAt: { type: DataTypes.DATE },
  },
  { timestamps: true }
);

export const VideoCatogoryModel = sequelize.define(
  "videoCategories",
  {
    name: { type: DataTypes.STRING, allowNull: false },
    deletedAt: { type: DataTypes.DATE },
  },
  { timestamps: true }
);

export const BookModel = sequelize.define(
  "books",
  {
    code: { type: DataTypes.STRING },
    title: { type: DataTypes.STRING },
    author: { type: DataTypes.STRING },
    issued: { type: DataTypes.DATE },
    page: { type: DataTypes.INTEGER },
    isbn: { type: DataTypes.STRING },
    issn: { type: DataTypes.STRING },
    image: { type: DataTypes.STRING },
    viewer: { type: DataTypes.INTEGER, defaultValue:0},
    bookCategoryId: { type: DataTypes.INTEGER },
    languageId: { type: DataTypes.INTEGER },
    deletedAt: { type: DataTypes.DATE },
    ebook: { type: DataTypes.STRING }
  },
  { timestamps: true }
);

export const VideoModel = sequelize.define(
  "videos",
  {
    title: { type: DataTypes.STRING },
    youtubeId: { type: DataTypes.STRING },
    published: { type: DataTypes.DATE },
    author: { type: DataTypes.STRING },
    videoCategoryId: { type: DataTypes.INTEGER },
    languageId: { type: DataTypes.INTEGER },
    deletedAt: { type: DataTypes.DATE },
    viewer: { type: DataTypes.INTEGER,defaultValue:0 }
  },
  { timestamps: true }
);

RoleModel.hasMany(UserModel, {
  foreignKey: "roleId",
  onDelete: "NO ACTION",
  onUpdate: "NO ACTION",
});
UserModel.belongsTo(RoleModel);

VideoCatogoryModel.hasMany(VideoModel, {
  foreignKey: "videoCategoryId",
  onDelete: "NO ACTION",
  onUpdate: "NO ACTION",
});
VideoModel.belongsTo(VideoCatogoryModel);
LanguageModel.hasMany(VideoModel, {
  foreignKey: "languageId",
  onDelete: "NO ACTION",
  onUpdate: "NO ACTION",
});
VideoModel.belongsTo(LanguageModel);

BookCategoryModel.hasMany(BookModel, {
  foreignKey: "bookCategoryId",
  onDelete: "NO ACTION",
  onUpdate: "NO ACTION",
});
BookModel.belongsTo(BookCategoryModel);
LanguageModel.hasMany(BookModel, {
  foreignKey: "languageId",
  onDelete: "NO ACTION",
  onUpdate: "NO ACTION",
});
BookModel.belongsTo(LanguageModel);
