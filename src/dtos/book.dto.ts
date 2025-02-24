
import { IBook } from "../interfaces/book.interface";

export class CreateBookDTO {
    code?: string;
    title?: string;
    author?: string;
    issued?: Date;
    page?: number;
    isbn?: string;
    issn?: string;
    image?: string;
    ebook?: string;
    viewer?: number;
    bookCategoryId?: number;
    languageId?: number;
    constructor(data: IBook) {
        this.code = data.code
        this.title = data.title
        this.author = data.author
        this.issued = data.issued
        this.page = data.page
        this.isbn = data.isbn
        this.issn = data.issn
        this.image = data.image
        this.ebook = data.ebook
        this.bookCategoryId = data.bookCategoryId
        this.languageId = data.languageId
        this.code = data.code
        this.viewer = data.viewer
    }
}


export class UpdateBookDTO {
    code?: string;
    title?: string;
    author?: string;
    issued?: Date;
    page?: number;
    isbn?: string;
    issn?: string;
    image?: string;
    viewer?: number;
    bookCategoryId?: number;
    languageId?: number;
    ebook?: string;
    constructor(data: IBook) {
        this.code = data.code
        this.title = data.title
        this.author = data.author
        this.issued = data.issued
        this.page = data.page
        this.isbn = data.isbn
        this.issn = data.issn
        this.image = data.image
        this.bookCategoryId = data.bookCategoryId
        this.languageId = data.languageId
        this.code = data.code
        this.ebook = data.ebook
    }
}