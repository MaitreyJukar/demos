var crossOriginCommuterFrame = document.createElement('iframe');
    var URLCallBackMap = {};
    crossOriginCommuterFrame.id = 'de-mathematics-interactive-cross-origin-commuter-frame';
    $(crossOriginCommuterFrame).css({
        position: 'absolute',
        top: '0px',
        left: '-999999px'
    });
    crossOriginCommuterFrame.onload = function () {
        crossOriginCommuterFrame.loaded = true;
    }
    $('body')[0].appendChild(crossOriginCommuterFrame);
    /**
    * This function is binded with 'message' event on window. It is fired when window.postMessage is called from iframe's cross domain src
    *
    * @method onBase64Recieved
    * @private
    */
    var onBase64Recieved = function (event) {
        var data = JSON.parse(event.originalEvent.data);
        if (data.nameSpace !== 'MathInteractives') {
            return;
        }
        var imageURL = data.url;
        var imageBase64 = data.imageBase64;
        var callBack = URLCallBackMap[imageURL];
        delete URLCallBackMap[imageURL];
        if (data.success) {
            callBack.success(imageBase64);
        } else {
            callBack.error(imageBase64);
        }
        return;
    };
    /**
    * Accepts cross origin image URL and returns its base64 string in the call back function. 
    *
    * @method getBase64FromImageURL
    * @public
    * @param {String} [imageURL] URL of the image whose base64 string is reuired
    * @param {function} [completeCallBack] Call back function that is called when base64 generation is complete with base64 string as an arguement.
    */
    MathInteractives.Common.Utilities.getBase64FromImageURL = function getBase64FromImageURL(imageURL, successCallBack, errorCallBack) {
        var thisRef;
        if (crossOriginCommuterFrame.loaded === true) {
            var callBack = {
                success: successCallBack,
                error: errorCallBack
            };
            URLCallBackMap[imageURL] = callBack;
            crossOriginCommuterFrame.contentWindow.postMessage(imageURL, '*');
        } else {
            crossOriginCommuterFrame.onload = function () {
                crossOriginCommuterFrame.loaded = true;
                getBase64FromImageURL(imageURL, successCallBack, errorCallBack);
            }
        }
        return;
    };
    $(window).on('message', onBase64Recieved);
