/* globals Tasker, $ */

function Engine(params) {

};

Engine.prototype.initialize = function(params) {

};

Engine.prototype.fetchJSONData = function() {

};

Engine.prototype.parseJSONData = function() {
    this.boardModel = new Tasker.Models.Board({

    });
    this.boardView = new Tasker.Views.Board({
        "el": $('.board'),
        "model": this.boardModel
    });
};

Engine.prototype.saveAllData = function() {

};
