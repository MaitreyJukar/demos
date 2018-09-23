(function (MathUtilities) {
    'use strict';
    if (typeof MathUtilities.Components.ImageCrop === 'undefined') {
        MathUtilities.Components.ImageCrop = {};
        MathUtilities.Components.ImageCrop.Models = {};
        MathUtilities.Components.ImageCrop.Views = {};
    }
    MathUtilities.Components.ImageCrop.Models.CropImageModel = Backbone.Model.extend({
        
        defaults: {
            _paperscope: null,
            _item: null,//raster
            _tranform: null,//object having _tl,_tr,_bl,_br paper points positions & _moveHit as bounding rect of image
            _canvasElem: null,
            _engine: null
        }
    });
})(window.MathUtilities);