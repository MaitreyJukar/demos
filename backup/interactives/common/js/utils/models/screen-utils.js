(function () {
    'use strict';
    MathInteractives.Common.Utilities.Models.ScreenUtils = Backbone.Model.extend({}, {
        _transformCSSStrings: ['transform', '-webkit-transform', '-o-transform', '-moz-transform', '-ms-transform'],
        _transformOriginCSSStrings: ['transform-origin', '-ms-transform-origin', '-webkit-transform-origin'],

        types: {
            DOWNLOAD: "download",
            URL: "url",
            BASE64: "base64"
        },

        formats: {
            PNG: "image/png",
            JPG: "image/jpeg"
        },

        defaults: {
            complete: $.noop,
            format: "image/png",
            strFileName: "screenshot",
            type: "url",
            strPdfPath: "http://app.discoveryeducation.com/posttopdf/?postType=postashtml/",
            strImagePath: "http://discovery.zeuslearning.com/CreateFile.aspx"
        },

        regex: {
            SVG_NAMESPACE: /xmlns=\"http:\/\/www\.w3\.org\/2000\/svg\"/,
            RGB_COLOR: /^.*(rgba?\([^)]+\)).*$/
        },

        init: function init() {
            var $body = $(document.body), pdfContent, imageForm, i, arrInputs, input, iLen;
            pdfContent = document.createElement("div");
            pdfContent.id = "PdfContent";
            $("body").append(pdfContent);

            imageForm = document.createElement("form");
            imageForm.name = "ImageForm";
            imageForm.id = "ImageForm";
            imageForm.method = "post";
            imageForm.target = "_blank";
            $("body").append(imageForm);
            arrInputs = ["ext", "data", "filename", "isBase64", "download"];
            for (i = 0, iLen = arrInputs.length; i < iLen; i++) {
                input = document.createElement("input");
                input.type = "hidden";
                input.name = arrInputs[i];
                imageForm.appendChild(input);
            }

            $(pdfContent).css('display', 'none');
            $(imageForm).css('display', 'none');
        },


        uploadImage: function uploadImage(options) {
            var data = {}, $ImageForm = $("#ImageForm");
            $ImageForm[0].action = options.path;
            $ImageForm.find("input").each(function () {
                this.value = options[this.name];
                data[this.name] = this.value;
            });
            switch (options.type) {
                case "submit":
                    $ImageForm.submit();
                    options.complete();
                    break;
                case "ajax":
                    $.ajax({
                        data: data,
                        type: 'POST',
                        dataType: "text",
                        url: $ImageForm[0].action,
                        success: function (data) {
                            options.complete();
                        }
                    });
                    break;
            }
        },

        /*
        * Draws the current video frame on a canvas. And places it over the video tag.
        * Context of the function is the video element object
        */
        _parseVideo: function _parseVideo() {

            var canvas, $canvas, $this = $(this);
            if (!$this.is(":visible")) {
                return;
            }
            canvas = document.createElement("canvas");
            $canvas = $(canvas);
            var ctx = canvas.getContext('2d');
            var position = $this.offset();
            canvas.style.position = "absolute";
            canvas.className = "ScreenShotTempCanvas";
            canvas.width = $this.width();
            canvas.height = $this.height();
            ctx.drawImage(this, 0, 0);
            $(canvas).insertAfter(this);
            $canvas.offset(position);
        },

        /*
        * Renders SVG elements on screen onto a canvas
        * Context of the function is the SVG element object
        */
        _parseSVG: function _parseSVG() {
            //Ignore elements that are not visible
            var canvas, xml, offset, $this = $(this);
            if (!$this.parent().is(":visible")) {
                return;
            }

            canvas = document.createElement("canvas");
            canvas.className = "ScreenShotTempCanvas";
            //convert SVG into a XML string
            xml = (new XMLSerializer()).serializeToString(this);

            // Removing the name space as IE throws an error
            xml = xml.replace(MathInteractives.Common.Utilities.Models.ScreenUtils.regex.SVG_NAMESPACE, '');

            //draw the SVG onto a canvas
            canvg(canvas, xml);
            $(canvas).insertAfter(this);
            //hide the SVG element
            this.className.baseVal = "ForceDisplayNone";
        },

        /*
        *   html2Canvas does not support divs with transform.
        *   This function replaces transform div with a canvas and draws that div on it.
        */
        _parseTransformDiv: function _parseTransformDiv(onComplete, strTransform) {
            var $this = $(this),
                canvasWithTransform = document.createElement("canvas"),//the canvas that will appear instead of the transform div
                $canvasWithTransform = $(canvasWithTransform),
                ctx = canvasWithTransform.getContext('2d'),
                bounds = this.getBoundingClientRect(),//bounds of div with transform
                // css transform gives us a string like 'matrix(0.312321, -0.949977, 0.949977, 0.312321, 0, 0)'
                // we need to make an array from the above matrix string using regex explained below
                // replace one or more (+) word characters (\w) followed by `(` at the start (^) with a `[`
                // then replace the `)` at the end with `]`
                transformArrayString = strTransform.replace(/^\w+\(/, "[").replace(/\)$/, "]"),
                // this will leave us with a string '[0.312321, -0.949977, 0.949977, 0.312321, 0, 0]'
                // then parse the new string (in the JSON encoded form of an array) as JSON into a variable
                transformArray = JSON.parse(transformArrayString),
                identityMatrix = [1, 0, 0, 1, 0, 0],
                isIdentity = true,
                transformLeftShift,
                transformTopShift,
                offsetAfterTransformNone,
                strTransformOrigin,
                arrOrigin,
                originX,
                originY,
                i,
                transformOriginCSSStrings = MathInteractives.Common.Utilities.Models.ScreenUtils._transformOriginCSSStrings,
                length = transformOriginCSSStrings.length;

            for (i = 0; i < transformArray.length; i++) {
                isIdentity = isIdentity && (transformArray[i] == identityMatrix[i]);
                if (!isIdentity) {
                    break;
                }
            }

            if (isIdentity) {
                onComplete();
                return;
            }

            for (i = 0; i < length; i++) {
                strTransformOrigin = $this.css(transformOriginCSSStrings[i]);
                if (strTransformOrigin) {
                    break;
                }
            }
            if (!strTransformOrigin || strTransformOrigin === 'none') {
                onComplete();
                return;
            }
            arrOrigin = strTransformOrigin.split(' ');
            originX = parseInt(arrOrigin[0], 10);
            originY = parseInt(arrOrigin[1], 10);
            //remove transform on the div
            $this.addClass('transform-none');

            //calculate the shift in top and left after removing transform
            offsetAfterTransformNone = $this.offset();
            transformLeftShift = offsetAfterTransformNone.left - bounds.left;
            transformTopShift = offsetAfterTransformNone.top - bounds.top;

            //increment the transform origin by the above calculated shift [because we'll be drawing on canvasWithTransform at (transformLeftShift,transformTopShift)]
            originX += transformLeftShift;
            originY += transformTopShift;

            //place canvasWithTransform at an offset same as the transform div
            $canvasWithTransform.css('position', 'absolute');
            $canvasWithTransform.insertAfter(this);
            canvasWithTransform.className = "ScreenShotTempCanvas";
            canvasWithTransform.width = bounds.width;
            canvasWithTransform.height = bounds.height;
            $canvasWithTransform.offset({ top: bounds.top, left: bounds.left });

            //apply the transform of div on canvasWithTransform
            ctx.translate(originX, originY);
            ctx.transform.apply(ctx, transformArray);
            ctx.translate(-originX, -originY);
            //below code draws the div(without transform) on a temporary canvas(canvasWithoutTransform) and then this canvasWithoutTransform is drawn on canvasWithTransform
            window.html2canvas(this, {
                background: 'rgba(0, 0, 0, 0)',
                onrendered: function (canvasWithoutTransform) {
                    var temp = canvasWithTransform;
                    if (ctx.canvas.height !== 0 && ctx.canvas.width !== 0) {
                        try {
                            ctx.drawImage(canvasWithoutTransform, transformLeftShift, transformTopShift);
                        }
                        catch (e) {
                            // Ignoring this element
                        }
                    }
                    //add back the transform that we removed earlier on the div
                    $this.removeClass('transform-none');
                    //hide the transform div so that it does not cause any issue in screenshot
                    $this.addClass('opacity-transperant');
                    onComplete();
                },
                useCORS: true
            });
        },

        /*
        *   html2Canvas does not support box-shadow property.
        *   For shadows, we create a outline surrounding the element to differentiate it from other elements
        *   In case the shadow is the only boundary to the element.
        *   Context of the function is a html element
        */
        _applyBoxShadowFix: function _applyBoxShadowFix() {
            var $this = $(this), strBoxShadow, strBoxShadowColor;
            var strStyle, strBorderStyle, strBgColor, strBgImage, strOutline;
            var bBorderStyle, bBgColor, bBgImage, bOutline;

            strBoxShadow = $this.css("box-shadow");
            if (strBoxShadow && strBoxShadow !== "none") {
                //extract shadow color
                strBoxShadowColor = strBoxShadow.replace(MathInteractives.Common.Utilities.Models.ScreenUtils.regex.RGB_COLOR, '$1');

                if (strBoxShadowColor === strBoxShadow) {
                    //for IE as it returns value in HEX and not as RGB
                    strBoxShadowColor = strBoxShadow.substring(strBoxShadow.lastIndexOf(" "), strBoxShadow.length);
                    strBoxShadow = strBoxShadow.replace(" " + strBoxShadowColor, "");
                }
                else {
                    strBoxShadow = strBoxShadow.replace(strBoxShadowColor + " ", "");
                }

                // Draw a border in case of shadows

                strBorderStyle = $this.css("borderLeftStyle");
                strBgColor = $this.css("background-color");
                strBgImage = $this.css("background-image");
                strOutline = $this.css("outlineStyle");

                bBorderStyle = !strBorderStyle || strBorderStyle === "none";
                bOutline = !strOutline || strOutline === "none";
                bBgColor = strBgColor === "transparent" || !strBgColor;
                bBgImage = !strBgImage || strBgImage === "none";

                if (bBorderStyle && bBgColor && bBgImage && bOutline) {
                    return "#" + this.id + "{outline:1px solid " + strBoxShadowColor + ";}";
                }
            }
            return "";
        },

        /*
        * @param options :  strFileName -   The default file name of the screenshot image to be uploaded on the
        *                                   server. Default: 'glossary'
        *
        *                          type -   Whether it should return the url to the image or as a download popup
        *                                   Default: MathInteractives.Common.Utilities.Models.ScreenUtils.types.DOWNLOAD
        *
        *                  strImagePath -   Server path on which the image upload request should be sent
        *                                   Default: "http://discovery.zeuslearning.com/CreateFile.aspx"
        */
        getScreenShot: function getScreenShot(options) {
            var tempOptions,
                strStyleTag,
                oContainer,
                $Container,
                strTransform,
                parsableElements,
                noOfElementsParsed = 0,
                onParseTransformComplete,
                i,
                transformCSSStrings = MathInteractives.Common.Utilities.Models.ScreenUtils._transformCSSStrings,
                BrowserCheck = MathInteractives.Common.Utilities.Models.BrowserCheck,
                length = transformCSSStrings.length;

            window.scroll(0, 0);

            tempOptions = $.extend({}, MathInteractives.Common.Utilities.Models.ScreenUtils.defaults);
            options = $.extend(tempOptions, options);

            oContainer = options.container;
            $Container = $(oContainer);
            strStyleTag = "<style id='ScreenShotFixes'>";

            //ignore elements that are not visible and elements inside svg tag
            parsableElements = $Container.find("*:visible").not("svg *");
            onParseTransformComplete = function () {
                noOfElementsParsed++;
                if (noOfElementsParsed >= parsableElements.length) {
                    MathInteractives.Common.Utilities.Models.ScreenUtils._proceedWithScreenShot(options);
                }
            }

            parsableElements.each(function () {
                var $this = $(this), nBorderWidth, id, borderRadius;
                id = this.id;
                for (i = 0; i < length; i++) {
                    strTransform = $this.css(transformCSSStrings[i]);
                    if (strTransform) {
                        break;
                    }
                }

                if (strTransform && strTransform !== "none") {
                    //strStyleTag += "transform: none !important;";
                    MathInteractives.Common.Utilities.Models.ScreenUtils._parseTransformDiv.call(this, onParseTransformComplete, strTransform);
                }
                else {
                    noOfElementsParsed++;
                }
                //Fix for box-shadows since html2Canvas does not render box shadows.
                strStyleTag += MathInteractives.Common.Utilities.Models.ScreenUtils._applyBoxShadowFix.call(this);
                switch (this.tagName.toLowerCase()) {

                    case "video":
                        //Fix for videos since html2Canvas does not render videos.
                        MathInteractives.Common.Utilities.Models.ScreenUtils._parseVideo.call(this);
                        break;
                    case "svg":
                        //Fix for SVG since html2Canvas does not render SVG.
                        MathInteractives.Common.Utilities.Models.ScreenUtils._parseSVG.call(this);
                        break;
                    case "table":
                        /*
                        * htmp2Canvas does not support table border='1' attribute.
                        * Hence adding borders to td and th through CSS
                        * temporarily for taking screenshot
                        */
                        /* removing as this was behaving buggy*/

                        /*adding this to handle border radius issue for tables*/

                        borderRadius = $this.css("border-top-right-radius") || $this.css("border-top-left-radius");
                        if (borderRadius) {
                            strStyleTag += '#' + id + " { border-top-right-radius: 0px !important; border-top-left-radius: 0px !important;}";
                            strStyleTag += '#' + id + " th { border-top-right-radius: 0px !important; border-top-left-radius: 0px !important;}";
                        }
                        if (BrowserCheck.isIE) {
                            strStyleTag += '#' + id + " { border-collapse:collapse !important; border:none !important;}";
                            strStyleTag += '#' + id + " th {border-right-width:1px !important}";
                            strStyleTag += '#' + id + " td {border-right-width:1px !important}";
                        }
                        break;
                }
            });
            strStyleTag += "</style>";
            $("head").append(strStyleTag);

            if (noOfElementsParsed >= parsableElements.length) {
                MathInteractives.Common.Utilities.Models.ScreenUtils._proceedWithScreenShot(options);
            }
        },

        //called from getScreenShot
        _proceedWithScreenShot: function _proceedWithScreenShot(options) {
            var $Container = $(options.container);
            window.html2canvas([$Container[0]], {
                onrendered: function (canvas) {
                    var strDataURL, oUploadOptions;

                    //remove the temporary canvases
                    $Container.find(".ScreenShotTempCanvas").remove();

                    //remove 'opacity:0' that was added in MathInteractives.Common.Utilities.Models.ScreenUtils._parseTransformDiv();
                    $Container.find(".opacity-transperant").removeClass('opacity-transperant');

                    //show back SVG elements
                    $Container.find("svg.ForceDisplayNone").each(function () {
                        this.className.baseVal = "";
                    });

                    //remove temporary styles
                    $("#ScreenShotFixes").remove();

                    //upload canvas as base64 string
                    var imageFormat = options.format;
                    strDataURL = canvas.toDataURL(imageFormat);
                    strDataURL = strDataURL.replace("data:" + imageFormat + ";base64,", "");

                    if (options.type === MathInteractives.Common.Utilities.Models.ScreenUtils.types.BASE64) {
                        if (options.complete) {
                            options.complete(strDataURL);
                        }
                        return;
                    }

                    oUploadOptions = {
                        ext: imageFormat.substring(imageFormat.indexOf("/") + 1, imageFormat.length),
                        data: strDataURL,
                        filename: options.strFileName,
                        path: options.strImagePath,
                        isBase64: true,
                        complete: options.complete
                    }
                    switch (options.type) {
                        case MathInteractives.Common.Utilities.Models.ScreenUtils.types.URL:
                            oUploadOptions = $.extend(oUploadOptions, {
                                download: false,
                                type: "ajax"
                            });
                            break;
                        case MathInteractives.Common.Utilities.Models.ScreenUtils.types.DOWNLOAD:
                            oUploadOptions = $.extend(oUploadOptions, {
                                download: true,
                                type: "submit"
                            });
                            break;
                    }
                    MathInteractives.Common.Utilities.Models.ScreenUtils.uploadImage(oUploadOptions);
                },

                background: options.background,
                useCORS: options.useCORS
            });
        }
    })
}());