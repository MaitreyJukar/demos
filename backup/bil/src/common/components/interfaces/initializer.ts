import { Language } from "../../helper/utilities";

export interface Options {
    queData: {
        subType: string;
        [id: string]: any;
    };
    $container: JQuery<HTMLElement> | HTMLElement;
    data?: any;
    saveData?: boolean;
    currentLanguage: Language;
}

export interface Initializer {
    init(options?: Options): any; // Returns newly created view or any other object for use.
}
