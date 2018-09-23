import * as Backbone from "backbone";
import * as _ from "underscore";
import SideMenuCollection from "../collections/side-menu";
import ItemModel from "../models/item-model";
declare const cb: number;
declare const kDebug: boolean;

class SavedData {
  items: any;
}

export default class PlayerModel extends Backbone.Model {
  public static INDEX_URLS = {
    VIDEO: "kepler/office16/index.html",
    VIDEO_DEBUG: "kepler_web/index.hbp.debug.html",
    SCRATCHPAD: "scratchpad/office16/index.html",
    SKILL: "kepler/office16/index.html",
    SKILL_DEBUG: "kepler_web/index.hbp.debug.html"
  };

  get sideMenuCollection(): SideMenuCollection { return this.get("sideMenuCollection"); }

  get activeModel(): ItemModel { return (this.get("activeModel")); }
  set activeModel(model) { this.set("activeModel", model); }

  get menuData(): any { return (this.get("menuData")); }

  get dataToBeSaved(): any { return (this.get("dataToBeSaved")); }
  set dataToBeSaved(data) { this.set("dataToBeSaved", data); }

  get savedData(): any { return (this.get("savedData")); }
  set savedData(data) { this.set("savedData", data); }

  get serverURL(): string { return location.origin + "/eproduct/data/zeus-ssm-poc"; }

  get signoutURL(): string { return location.origin + "/eproduct/j_spring_security_logout"; }

  get appName(): string { return (this.get("appName")); }
  set appName(data) { this.set("appName", data); }

  get keplerVideoIframeUrl(): string { return (this.get("keplerVideoIframeUrl")); }
  set keplerVideoIframeUrl(data) { this.set("keplerVideoIframeUrl", data); }

  get keplerScratchPadIframeUrl(): string { return (this.get("keplerScratchPadIframeUrl")); }
  set keplerScratchPadIframeUrl(data) { this.set("keplerScratchPadIframeUrl", data); }

  get keplerSkillIframeUrl(): string { return (this.get("keplerSkillIframeUrl")); }
  set keplerSkillIframeUrl(data) { this.set("keplerSkillIframeUrl", data); }

  get bookmarkedAccText(): string { return (this.get("bookmarkedAccText")); }
  set bookmarkedAccText(data) { this.set("bookmarkedAccText", data); }

  get unbookmarkedAccText(): string { return (this.get("unbookmarkedAccText")); }
  set unbookmarkedAccText(data) { this.set("unbookmarkedAccText", data); }

  defaults() {
    return {
      "bookmarkedAccText": "Page is bookmarked, enter to unbookmark",
      "unbookmarkedAccText": "Page is not bookmarked, enter to bookmark",
      "sideMenuCollection": new SideMenuCollection(),
      "activeModel": null as ItemModel,
      "menuData": {},
      "dataToBeSaved": {},
      "savedData": {},
      "keplerVideoIframeUrl": (kDebug ? PlayerModel.INDEX_URLS.VIDEO_DEBUG : PlayerModel.INDEX_URLS.VIDEO) + "?cb=" + cb,
      "keplerScratchPadIframeUrl": PlayerModel.INDEX_URLS.SCRATCHPAD,
      "keplerSkillIframeUrl": (kDebug ? PlayerModel.INDEX_URLS.SKILL_DEBUG : PlayerModel.INDEX_URLS.SKILL) + "?cb=" + cb
    };
  }

  initialize() {
    this.parseSavedData();
  }

  proceedWithLoading() {
    this.attachListeners();
    this.trigger("data-fetched");
  }

  attachListeners() {
    this.listenTo(this.sideMenuCollection, "change", function () {
      this.updateSavedData();
    });
  }

  parseSavedData() {
    this.getServerData(this.onSavedDataFetchSuccess.bind(this), this.onSavedDataFetchError.bind(this));
  }

  onSavedDataFetchSuccess(data: any) {
    if (data) {
      const newData = JSON.parse(data);
      /* if (newData.cb !== void 0 && newData.cb !== null && newData.cb === cb) {
        this.savedData = newData;
      } else {
        console.info("Version upgraded!! Discarding old stored data.");
        localStorage.removeItem("HBP");
      } */
      if (newData !== void 0 && newData !== null) {
        this.savedData = newData;
      }
    }
    this.proceedWithLoading();
  }

  onSavedDataFetchError(data: any) {
    this.proceedWithLoading();
  }

  updateSavedData() {
    const obj = _.filter(this.menuData, (params: any) => {
      return params.itemModel.time || params.itemModel.visited || params.itemModel.progress || params.itemModel.bookmark;
    });
    this.dataToBeSaved.items = obj;
    return this.saveDataToServer();
  }

  saveDataToServer() {
    this.dataToBeSaved.cb = cb;
    const data = JSON.stringify(this.dataToBeSaved, function (k, v) {
      switch (k) {
        case "itemView":
        case "text":
        case "hash":
        case "dataURL":
        case "childLinks":
        case "sideMenuCollection":
          return undefined;
        case "_bookmark":
        case "_progress":
        case "_visited":
        case "currentLink":
          return v ? v : undefined;
        default:
          return v;
      }
    });
    
    return this.updateServerData(data, this.onDataSaveSuccess.bind(this), this.onDataSaveError.bind(this));
  }

  updateUrlOnServer(url: string) {
    this.dataToBeSaved.currentLink = url;
    return this.saveDataToServer();
  }

  clearServerData() {
    return this.updateServerData(JSON.stringify({}));
  }

  updateServerData(data: string, success = (data: any) => { return data; }, failure = (data: any) => { return data; }) {
    return this.ajax({
      data: {
        value: data
      },
      method: "POST",
      url: this.serverURL
    }).then(success).catch(failure);
  }

  onDataSaveSuccess(data: any): any {

  }

  onDataSaveError(data: any): any {

  }

  getServerData(successCallback: (value: any) => any, errorCallback: (value: any) => any) {
    this.ajax({
      method: "GET",
      url: this.serverURL
    }).then(successCallback).catch(errorCallback);
  }

  ajax(options: any) {
    return new Promise<any>(function (resolve, reject) {
      $.ajax(options).done(resolve).fail(reject);
    });
  }
}

