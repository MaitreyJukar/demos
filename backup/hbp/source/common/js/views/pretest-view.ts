import * as Backbone from "backbone";

export default class PretestView extends Backbone.View < Backbone.Model > {
    //this view was created just for testing routes
    constructor() {
        super({el: "#main-content-holder"});
    }
    initialize() {
        this.render();
    }
    render() {
        let template = require("./../tpl/pretest.hbs");
        this.$el.html(template());
        return this;
    }
}