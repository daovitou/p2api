import { ILanguage } from "../interfaces/language.interface";

export class CreateLanguageDTO {
  name?: string;
  constructor(data: ILanguage) {
    this.name = data.name;
  }
}

export class UpdateLanguageDTO {
  name?: string;
  constructor(data: ILanguage) {
    this.name = data.name;
  }
}
