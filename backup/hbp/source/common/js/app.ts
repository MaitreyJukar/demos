import * as $ from 'jquery';
import Router from "./router";
import "../css/preloader";

interface ExtWindow extends Window {
    cb: number;
}

declare var CACHEBUSTER: number;
declare const window: ExtWindow;

export function startApp() {
    if (!CACHEBUSTER) {
        CACHEBUSTER = 4;
    }
    window.cb = CACHEBUSTER;
    var router = new Router({ appName: "spreadsheet-modeling" });
    console.log("App started! cb:", window.cb);
}

$(document).ready(startApp);