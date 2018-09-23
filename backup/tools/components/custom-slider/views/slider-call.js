(function (MathUtilities) {


    MathUtilities.Components.Slider = {};
    MathUtilities.Components.Slider.Views = {};
    MathUtilities.Components.Slider.Models = {};

    MathUtilities.Components.Slider.Models.slideCall = Backbone.Model.extend(null, {
        init: function () {

            var slideModel = new MathUtilities.Components.Slider.Models.slider();
            var slideView = new MathUtilities.Components.Slider.Views.slider({ model: slideModel, el: $('#sliderbox') });
           
//            slideView.set(5);            
//            $('#sliderBox').on('change', function () { debugger; });
        }
    });

} (window.MathUtilities));
 