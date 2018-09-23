import * as Backbone from "backbone";
import ItemCollection from "../collections/item-collection";

export default class MenuModel extends Backbone.Model {
  get subMenuItems(): ItemCollection { return this.get("childLinks"); }
  set subMenuItems(value: ItemCollection) { this.set("childLinks", value); }

  get totalPages(): number { return (this.subMenuItems.totalPages || 1); }

  get visitedPages(): number { return (this.subMenuItems.visitedPages || (this.visited ? 1 : 0)); }

  get visited(): boolean { return (this.get("_visited")); }
  set visited(value) { this.set("_visited", value); }

  get progress(): number { return (this.get("_progress")); }
  set progress(value) { this.set("_progress", value); this.updateVisitedState(); }

  get bookmark(): boolean { return (this.get("_bookmark")); }
  set bookmark(value) { this.set("_bookmark", value); }

  get refid(): string { return (this.get("refid")); }
  set refid(value) { this.set("refid", value); }

  get text(): string { return (this.get("text")); }
  set text(value) { this.set("text", value); }

  get dataURL(): string { return (this.get("dataURL")); }
  set dataURL(value) { this.set("dataURL", value); }

  get pageTitle(): string { return (this.get("pageTitle")); }
  set pageTitle(value) { this.set("pageTitle", value); }

  get hash(): string { return (this.get("hash")); }
  set hash(value) { this.set("hash", value); }

  get time(): number { return (this.get("_time")); }
  set time(value) { this.set("_time", value); }

  get read(): boolean { return (this.get("_read")); }
  set read(value) { this.set("_read", value); }

  timer: any;

  defaults() {
    return {
      "childLinks": new ItemCollection(),
      "_visited": false,
      "_bookmark": false,
      "_progress": 0,
      "_time": 0
    };
  }
  parse(data: string) {
    return {
      item: data
    };
  }
  initialize(attr?: any) {
    if (attr && attr.childLinks) {
      this.set('childLinks', new ItemCollection(this.subMenuItems as any));
    }
    this.listenTo(this.subMenuItems, "change:_visited", this.updateProgress);
    this.listenTo(this.subMenuItems, "change:_progress", this.updateProgress);
  }
  /**
  * Adds model of submenu item to parents collection
  *
  * @param model 'model of submenu item'
  */
  addToParent(model: MenuModel, attr: string) {
    this.subMenuItems.add(model);
  }

  updateProgress() {
    this.progress = (this.visitedPages / this.totalPages) * 100;
  }

  /**
  * Set visited to true if progress greater than 99
  */
  updateVisitedState() {
    this.visited = this.progress >= 99;
  }

  /**
  * Toggles bookmark boolean
  */
  toggleBookMark() {
    this.bookmark = !this.bookmark;
  }
  /**
  * Start timer on click of leaf node
  */
  startTimer() {
    let that = this;

    this.timer = setInterval(function() {
      that.time = that.time + 1;
    }, 1000);
  }
  /**
  * Stop timer after required time has been completed
  */
  stopTimer() {
    clearInterval(this.timer);
  }
}