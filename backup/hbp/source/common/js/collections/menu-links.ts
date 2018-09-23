import * as Backbone from "backbone";
declare const cb: number;

export default class MainlinksCollection extends Backbone.Collection<Backbone.Model> {
    public appName: string;
    url = function () {
        return 'content/' + this.appName + '/json/side-menu.json?cb=' + cb;
    }
    constructor() {
        super();
    }
}