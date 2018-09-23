SliderModel = Backbone.Model.extend({
    defaults: {
        min: -10,
        max: 10,
        value: 1,
        step: 0.1
    },
    parseData: function (min, max, step) {

        this.set({ min: min, max: max, step: step });

    }
});