(function (MathUtilities) {
    'use strict';
    MathUtilities.Components.EquationEngine.Models.Profile = Backbone.Model.extend({}, {

        profiler: {},

        getStartTime: function getStartTime(id) {
            var startTime = new Date().getTime();
            this.profiler[id] = {id:'', start: 0, end: 0, processingTime: 0 };
            this.profiler[id].start = startTime;
            return;
        },
        getProcessingTime: function getProcessingTime(id) {
            var endTime = new Date().getTime();
            this.profiler[id].end = endTime;
            this.profiler[id].processingTime = (endTime - this.profiler[id].start);
            return this.profiler[id].processingTime;

        }
   
    });
} (window.MathUtilities));