/* globals _, window, navigator  */

(function(MathUtilities) {
    'use strict';

    MathUtilities.Components.ImageManager = Backbone.Model.extend({

    }, {
        "_canvas": null,
        "_queue": null,
        "_cache": null,
        "_textTool": null,
        "_paperScope": null,
        "_imageLayer": null,
        "_fallbackLayer": null,
        "_textCallbackMap": null,
        "_inProgressItem": null,

        "init": function() {
            var ImageManager = MathUtilities.Components.ImageManager;
            ImageManager._canvas = document.createElement('canvas');
            ImageManager._queue = [];
            ImageManager._cache = {};
            ImageManager._textCallbackMap = {};
        },

        //url or text
        "loadImage": function(url, callback, dimension) {
            var ImageManager = MathUtilities.Components.ImageManager,
                data;

            if (ImageManager._cache && ImageManager._cache[url]) {
                data = ImageManager._cache[url];
                callback.call(this, data.data, [data.width, data.height]);
                return;
            }

            ImageManager._queue.push({
                "url": url,
                "callback": callback,
                "dimension": dimension
            });

            ImageManager.processQueue();
        },


        "getTextBase64": function(text, callback, dimension) {
            var ImageManager = MathUtilities.Components.ImageManager,
                textLoaded;
            textLoaded = function(base64) {
                ImageManager._textTool.off('generateBase64', textLoaded);
                callback.call(this, base64.base64);
                ImageManager._inProgressItem = null;
                ImageManager.processQueue();
            };
            ImageManager._textTool.on('generateBase64', textLoaded);
            ImageManager._textTool._generateBase64(text, dimension && dimension.width);
        },

        "isThisURL": function(url) {
            return url && url.indexOf('http') === 0;
        },

        "_cacheImage": function(url, data, height, width) {
            var obj = {
                "data": data,
                "height": height,
                "width": width
            };
            MathUtilities.Components.ImageManager._cache[url] = obj;
        },

        "processQueue": function() {
            var ImageManager = MathUtilities.Components.ImageManager,
                item;
            if (ImageManager._inProgressItem) {
                return;
            }
            if (ImageManager._queue.length > 0) {
                item = ImageManager._queue.pop();
                ImageManager._inProgressItem = item;

                if (ImageManager.isThisURL(item.url)) {
                    ImageManager.convertImage(item.url, item.callback);
                } else {
                    ImageManager.getTextBase64(item.url, item.callback, item.dimension);
                }
            }
        },

        "convertImage": function(url, callback) {
            var _canvas = MathUtilities.Components.ImageManager._canvas,
                ctx = _canvas.getContext('2d'),
                ImageManager = MathUtilities.Components.ImageManager,
                img, raster,
                isiPad = navigator.userAgent.match(/iPad/i) !== null,
                generateRaster;


            function isIE9or10() {
                return /MSIE (9|10)/i.test(navigator.appVersion);
            }

            function errorFunction() {
                callback.call(this);
                ImageManager.processQueue();
            }

            generateRaster = _.bind(function(src) {
                ImageManager._imageLayer.activate();

                raster = new ImageManager._paperScope.Raster(src);
                if (raster.isEmpty()) {
                    raster.onLoad = function() {
                        callback.call(this, raster, [raster.width, raster.height]);
                        ImageManager._inProgressItem = null;
                        ImageManager.processQueue();
                    };
                } else {
                    callback.call(this, raster, [raster.width, raster.height]);
                    ImageManager._inProgressItem = null;
                    ImageManager.processQueue();
                }

                ImageManager._fallbackLayer.activate();
            }, this);

            if (isIE9or10()) {
                generateRaster(url);
                return;
            }

            img = new Image();
            img.crossOrigin = 'Anonymous';
            img.addEventListener('error', errorFunction);
            img.addEventListener('abort', errorFunction);
            img.src = url;

            img.addEventListener('load', function() {
                    if (isiPad) {
                        generateRaster(img);

                    } else {
                        var dataURL;
                        _canvas.height = img.naturalHeight;
                        _canvas.width = img.naturalWidth;
                        ctx.drawImage(img, 0, 0);
                        dataURL = _canvas.toDataURL('image/png');

                        ImageManager._cacheImage(url, dataURL, img.naturalHeight, img.naturalWidth);
                        callback.call(this, dataURL, [img.naturalWidth, img.naturalHeight]);
                        _canvas = null;
                        ImageManager._inProgressItem = null;
                        ImageManager.processQueue();
                    }
                }, false);
        }
    });
})(window.MathUtilities);
