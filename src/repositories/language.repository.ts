import { ILanguage } from "../interfaces/language.interface";
import { LanguageModel } from "../models/sequelize.db";
import { GenericRepository } from "./generic.repository";

export class LanguageRepository extends GenericRepository<ILanguage>{
    constructor(){
        super(LanguageModel);
    }
}