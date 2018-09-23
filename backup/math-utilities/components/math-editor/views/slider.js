SliderView = Backbone.View.extend({
    initialize: function () {
        this.render();
    },

    render: function () {

        var model = this.model;
        $().html(model.get('min'));
        $().html(model.get('max'));

        $(function () {
            $().slider({
                min: model.get('min'),
                max: model.get('max'),
                value: model.get('value'),
                step: model.get('step'),
                create: function () {
                    $().html(model.get('value'));
                },
                slide: function (event, ui) {
                    $().html((ui.value));
                }
            });
        });
    },

    events: {
        'mouseover .slider-range-txt': 'sliderTextMouseOver',
        'mouseleave .slider-range-txt': 'sliderTextMouseLeave',
        'click .slider-range-txt': 'hideSlider'
    },

    sliderTextMouseOver: function () {

        $(event.target).css('color', 'black');
    },

    sliderTextMouseLeave: function () {

        $(event.target).removeAttr('style');
    },

    hideSlider: function () {

        $("#slider-container").hide();
    }
});