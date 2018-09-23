import { Injectable } from '@angular/core';

@Injectable()
export class AccessibilityService {
    static jsonData: object;
    static activityName: string;
    static dataLoaded: boolean = false;

    static getAccData(id: string) {
        return this.jsonData[id];
    }
}
