import { IBookCategory } from "./book.category.interface";

export interface IBook{
    id?:number;
    code?:string;
    title?:string;
    author?:string;
    issued?:Date;
    page?:number;
    isbn?:string;
    issn?:string;
    image?:string;
    ebook?:string;
    viewer?:number;
    bookCategoryId?:number;
    languageId?:number;
    deletedAt?:Date;
    bookCategory?:IBookCategory
}