import { Injectable } from '@angular/core';

@Injectable()

export class MessageService {

    /**
     * json object containing all string table data
     */
    static jsonData: object;

    /**
     * json object containing all data related to dlo
     */
    static dloData: object;
    static assets: object;

    /**
     * dlo name for which data is loaded or to be loaded
     */
    static activityName: string;
    static section: SECTION;

    /**
     * boolean to identify whether data for dlo specified is loaded or not
     */
    static dataLoaded: boolean = false;

    /**
     * get text corresponding to id from string table json
     * @param  {string} id - id of text to be found from json
     */
    static getMessage(id: string) {
        return this.jsonData[id];
    }

}

export enum SECTION {
    LEARN = 0,
    EXPLORE = 1,
    TAKE_QUIZ = 2,
    NONE = 3
}
