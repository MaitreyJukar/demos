/* globals  document */
"use strict";
document.ready(function() {
    var Tasker = {};
    Tasker.Models = {};
    Tasker.Views = {};
    Tasker.Collection = {};
    window.Tasker = Tasker;
    initialize();
});

var initialize = function() {
    Tasker.Engine = new Engine();
    Tasker.Engine.fetchJSONData(onJSONDataSuccess.bind(this));
};


var onJSONDataSuccess = function(response) {
    Tasker.Engine.parseJSONData(response.data);
};

var saveAll = function(){
	Tasker.Engine.saveAllData();
};