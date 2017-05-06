/* globals  document */
"use strict";
var Tasker = {};
Tasker.Models = {};
Tasker.Views = {};
Tasker.Collections = {};
window.Tasker = Tasker;

var initialize = function() {
    Tasker.Engine = new Engine();
    Tasker.Engine.fetchJSONData(onJSONDataSuccess.bind(this));
};


var onJSONDataSuccess = function(response) {
    Tasker.Engine.parseJSONData(response.data);
};

var saveAll = function() {
    Tasker.Engine.saveAllData();
};

document.ready(function() {
    initialize();
});
