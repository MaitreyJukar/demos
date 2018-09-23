/* globals _, MathUtilities, $, window  */

(function() {
    'use strict';

    if (MathUtilities.Components.Utils === undefined) {
        MathUtilities.Components.Utils = {};

        MathUtilities.Components.Utils.Models = {};
    }

    MathUtilities.Components.Utils.Models.ScreenUtils = Backbone.Model.extend({}, {
        "types": {
            "DOWNLOAD": "download",
            "URL": "url",
            "BASE64": "url",
            "LOCAL": "local"
        },

        "formats": {
            "PNG": "image/png",
            "JPG": "image/jpeg"
        },

        "MAX_SCREENSHOT_SIZE": {
            "width": 3000,
            "height": 3000
        },

        "defaults": {
            "complete": $.noop,
            "format": "image/png",
            "strFileName": "screenshot",
            "type": "url",
            "strPdfPath": "http://app.discoveryeducation.com/posttopdf/?postType=postashtml/",
            "strImagePath": "http://discovery.zeuslearning.com/CreateFile.aspx"
        },

        "regex": {
            "SVG_NAMESPACE": /xmlns=\"http:\/\/www\.w3\.org\/2000\/svg\"/, // xmlns="http://www.w3.org/2000/svg"
            "RGB_COLOR": /^.*(rgba?\([^)]+\)).*$/ // 'rgba' OR 'rgb' then '(' then any char except ')' followed by ')'
        },

        "init": function() {
            var pdfContent, imageForm, i, arrInputs, input, iLen;
            pdfContent = document.createElement("div");
            pdfContent.id = "PdfContent";
            $("body").append(pdfContent);

            imageForm = document.createElement("form");
            imageForm.name = "ImageForm";
            imageForm.id = "ImageForm";
            imageForm.method = "post";
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
            
            //for ipads - browser crashes or image is blank, if snapshot image is too big. Max limit toned down to 1k
            if (MathUtilities.Components.Utils.Models.BrowserCheck.isIOS) {
                MathUtilities.Components.Utils.Models.ScreenUtils.MAX_SCREENSHOT_SIZE = {
                    "width": 1000,
                    "height": 1000
                };
            }
        },

        /*
         *   html2Canvas does not support divs with transform.
         *   This function replaces transform div with a canvas and draws that div on it.
         */
        "_parseTransformDiv": function(onComplete) {
            var $this = $(this),
                canvasWithTransform = document.createElement("canvas"), //the canvas that will appear instead of the transform div
                $canvasWithTransform = $(canvasWithTransform),
                ctx = canvasWithTransform.getContext('2d'),
                arrOrigin = $this.css('transformOrigin').split(' '),
                originX = parseInt(arrOrigin[0], 10),
                originY = parseInt(arrOrigin[1], 10),
                bounds = this.getBoundingClientRect(), //bounds of div with transform
                // css transform gives us a string like 'matrix(0.312321, -0.949977, 0.949977, 0.312321, 0, 0)'
                // we need to make an array from the above matrix string using regex explained below
                // replace one or more (+) word characters (\w) followed by `(` at the start (^) with a `[`
                // then replace the `)` at the end with `]`
                transformArrayString = ($this.css('transform')).replace(/^\w+\(/, "[").replace(/\)$/, "]"),
                // this will leave us with a string '[0.312321, -0.949977, 0.949977, 0.312321, 0, 0]'
                // then parse the new string (in the JSON encoded form of an array) as JSON into a variable
                transformArray = JSON.parse(transformArrayString),
                transformLeftShift,
                transformTopShift,
                offsetAfterTransformNone;

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
            $canvasWithTransform.offset({
                "top": bounds.top,
                "left": bounds.left
            });

            //apply the transform of div on canvasWithTransform
            ctx.translate(originX, originY);
            ctx.transform.apply(ctx, transformArray);
            ctx.translate(-originX, -originY);

            //below code draws the div(without transform) on a temporary canvas(canvasWithoutTransform) and then this canvasWithoutTransform is drawn on canvasWithTransform
            window.html2canvas(this, {
                "background": 'rgba(0, 0, 0, 0)',
                "onrendered": function(canvasWithoutTransform) {
                    ctx.drawImage(canvasWithoutTransform, transformLeftShift, transformTopShift);
                    //add back the transform that we removed earlier on the div
                    $this.removeClass('transform-none');
                    //hide the transform div so that it does not cause any issue in screenshot
                    $this.addClass('opacity-transperant');
                    onComplete();
                }
            });
        },

        "uploadImage": function(options) {
            var data = {},
                $ImageForm = $("#ImageForm");
            $ImageForm[0].action = options.path;
            _.each($ImageForm.find("input"), function(input) {
                input.value = options[input.name];
                data[input.name] = input.value;
            });
            switch (options.type) {
                case "submit":
                    $ImageForm.submit();
                    options.complete();
                    break;
                case "ajax":
                    $.ajax({
                        "data": data,
                        "type": 'POST',
                        "dataType": "text",
                        "url": $ImageForm[0].action,
                        "success": function() {
                            options.complete();
                        }
                    });
                    break;
            }
        },

        //called from getScreenShot
        "_proceedWithScreenShot": function(options) {
            var $Container = $(options.container);
            window.html2canvas([$Container[0]], {
                "onrendered": function(canvas) {
                    var strDataURL, oUploadOptions, originalData,
                        imageFormat;

                    //remove the temporary canvases
                    $Container.find(".ScreenShotTempCanvas").remove();

                    //remove 'opacity:0' that was added in MathUtilities.Components.Utils.Models.ScreenUtils._parseTransformDiv();
                    $Container.find(".opacity-transperant").removeClass('opacity-transperant');

                    //show back SVG elements
                    _.each($Container.find("svg.ForceDisplayNone"), function(svg) {
                        svg.className.baseVal = "";
                    });

                    //remove temporary styles
                    $("#ScreenShotFixes").remove();

                    //upload canvas as base64 string
                    imageFormat = options.format;
                    strDataURL = canvas.toDataURL(imageFormat);
                    originalData = strDataURL;
                    strDataURL = strDataURL.replace("data:" + imageFormat + ";base64,", "");

                    if (options.type === MathUtilities.Components.Utils.Models.ScreenUtils.types.BASE64) {

                        if (options.debug) { //debug flag is used to determine whether to load base64 as it is
                            options.complete(originalData);
                        } else {
                            options.complete(strDataURL);
                        }

                        return;
                    }

                    oUploadOptions = {
                        "ext": imageFormat.substring(imageFormat.indexOf("/") + 1, imageFormat.length),
                        "data": strDataURL,
                        "filename": options.strFileName,
                        "path": options.strImagePath,
                        "isBase64": true,
                        "complete": options.complete
                    };
                    switch (options.type) {
                        case MathUtilities.Components.Utils.Models.ScreenUtils.types.URL:
                            oUploadOptions = $.extend(oUploadOptions, {
                                "download": false,
                                "type": "ajax"
                            });
                            break;
                        case MathUtilities.Components.Utils.Models.ScreenUtils.types.DOWNLOAD:
                            oUploadOptions = $.extend(oUploadOptions, {
                                "download": true,
                                "type": "submit"
                            });
                            break;
                    }
                    MathUtilities.Components.Utils.Models.ScreenUtils.uploadImage(oUploadOptions);
                }
            });
        },

        /*
         * Draws the current video frame on a canvas. And places it over the video tag.
         * Context of the function is the video element object
         */
        "_parseVideo": function() {

            var canvas, $canvas, $this = $(this),
                ctx, position;
            if (!$this.is(":visible")) {
                return;
            }
            canvas = document.createElement("canvas");
            $canvas = $(canvas);
            ctx = canvas.getContext('2d');
            position = $this.offset();
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
        "_parseSVG": function() {
            //Ignore elements that are not visible
            var canvas, xml, $this = $(this);
            if (!$this.parent().is(":visible")) {
                return;
            }

            canvas = document.createElement("canvas");
            canvas.className = "ScreenShotTempCanvas";
            //convert SVG into a XML string
            xml = (new XMLSerializer()).serializeToString(this);

            // Removing the name space as IE throws an error
            xml = xml.replace(MathUtilities.Components.Utils.Models.ScreenUtils.regex.SVG_NAMESPACE, '');

            //draw the SVG onto a canvas
            canvg(canvas, xml);
            $(canvas).insertAfter(this);
            //hide the SVG element
            this.className.baseVal = "ForceDisplayNone";
        },

        /*
         *   html2Canvas does not support box-shadow property.
         *   For shadows, we create a outline surrounding the element to differentiate it from other elements
         *   In case the shadow is the only boundary to the element.
         *   Context of the function is a html element
         */
        "_applyBoxShadowFix": function() {
            var $this = $(this),
                strBoxShadow, strBoxShadowColor,
                strBorderStyle, strBgColor, strBgImage, strOutline,
                bBorderStyle, bBgColor, bBgImage, bOutline;

            strBoxShadow = $this.css("box-shadow");
            if (strBoxShadow && strBoxShadow !== "none") {
                //extract shadow color
                strBoxShadowColor = strBoxShadow.replace(MathUtilities.Components.Utils.Models.ScreenUtils.regex.RGB_COLOR, '$1');

                if (strBoxShadowColor === strBoxShadow) {
                    //for IE as it returns value in HEX and not as RGB
                    strBoxShadowColor = strBoxShadow.substring(strBoxShadow.lastIndexOf(" "), strBoxShadow.length);
                    strBoxShadow = strBoxShadow.replace(" " + strBoxShadowColor, "");
                } else {
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

        "confirmScreenshotSize": function(options, sizeConfirmed, sizeRejected, context) {
            var $screenShotModal = $("#screen-shot-size-modal"),
                ScreenUtils = MathUtilities.Components.Utils.Models.ScreenUtils,
                affirmative, negative, toggleEvents;

            affirmative = function() {
                toggleEvents(false);
                $screenShotModal.modal('hide');
                if (sizeConfirmed) {
                    sizeConfirmed.call(context);
                }
            };
            negative = function() {
                toggleEvents(false);
                ScreenUtils.setVisibilityScreenshotPreparationModal(false);
                if ($.de && $.de.loadingComplete) {
                    $.de.loadingComplete($("body"));
                }
                if (sizeRejected) {
                    sizeRejected.call(context);
                }
            };
            toggleEvents = function(set) {
                if (set) {
                    $(".btn-danger", $screenShotModal).on('click.screenshot', affirmative);
                    $screenShotModal.on("hide.bs.modal", negative);
                } else {
                    $(".btn-danger", $screenShotModal).off('click.screenshot');
                    $screenShotModal.off("hide.bs.modal");
                }
            };
            if (options.cropped) {
                $screenShotModal.modal('show');
                toggleEvents(true);
                return;
            }
            sizeConfirmed.call(context);
        },

        "setVisibilityScreenshotPreparationModal": function(visible) {
            var screenshotModal = $(".preparing-screenshot-modal"),
                selector = ".tool-holder-tool-container, .math-utilities-whiteboard-tool, .math-utilities-tools-construction-tool";

            if (visible) {
                screenshotModal.css('visibility', 'visible');
                $(selector).css("overflow", "visible");
                // if screenshot size is greater than tool window size we have to set overflow visible
                // so that the image captured by html2canvas is not cropped to window size
                $("body").css("overflow", "visible");
            } else {
                screenshotModal.css('visibility', 'hidden');
                $(selector).css("overflow", "hidden");
                $("body").css("overflow", "auto");
            }
        },

        /*
         * @param options :  strFileName -   The default file name of the screenshot image to be uploaded on the
         *                                   server. Default: 'glossary'
         *
         *                          type -   Whether it should return the url to the image or as a download popup
         *                                   Default: MathUtilities.Components.Utils.Models.ScreenUtils.types.DOWNLOAD
         *
         *                  strImagePath -   Server path on which the image upload request should be sent
         *                                   Default: "http://discovery.zeuslearning.com/CreateFile.aspx"
         */
        "getScreenShot": function(options) {
            var tempOptions,
                strStyleTag,
                oContainer,
                $Container,
                strTransform,
                parsableElements,
                noOfElementsParsed = 0,
                onParseTransformComplete;

            tempOptions = $.extend({}, MathUtilities.Components.Utils.Models.ScreenUtils.defaults);
            options = $.extend(tempOptions, options);

            oContainer = options.container;
            $Container = $(oContainer);
            strStyleTag = "<style id='ScreenShotFixes'>";

            //ignore elements that are not visible and elements inside svg tag
            parsableElements = $Container.find("*:visible").not("svg *");
            onParseTransformComplete = function() {
                noOfElementsParsed++;
                if (noOfElementsParsed >= parsableElements.length) {
                    MathUtilities.Components.Utils.Models.ScreenUtils._proceedWithScreenShot(options);
                }
            };

            _.each(parsableElements, function(parsableElement) {
                var $parsableElement = $(parsableElement),
                    nBorderWidth, id;
                id = parsableElement.id;
                //remove transforms as they are not currently supported
                strTransform = $parsableElement.css("transform");
                if (strTransform && strTransform !== "none") {
                    onParseTransformComplete();
                } else {
                    noOfElementsParsed++;
                }

                //Fix for box-shadows since html2Canvas does not render box shadows.
                strStyleTag += MathUtilities.Components.Utils.Models.ScreenUtils._applyBoxShadowFix.call(parsableElement);
                switch (parsableElement.tagName.toLowerCase()) {
                    case "video":
                        //Fix for videos since html2Canvas does not render videos.
                        MathUtilities.Components.Utils.Models.ScreenUtils._parseVideo.call(parsableElement);
                        break;
                    case "svg":
                        //Fix for SVG since html2Canvas does not render SVG.
                        MathUtilities.Components.Utils.Models.ScreenUtils._parseSVG.call(parsableElement);
                        break;
                    case "table":
                        /*
                         * htmp2Canvas does not support table border='1' attribute.
                         * Hence adding borders to td and th through CSS
                         * temporarily for taking screenshot
                         */
                        nBorderWidth = $parsableElement.attr("border");
                        if (nBorderWidth) {
                            strStyleTag += '#' + id + " td, #" + id + " th { border:" + nBorderWidth + "px solid black}";
                        }
                        break;
                }
            });
            // Add below class while taking screenshot to solve issue of linear gradient is not rendered properly in screenshot
            strStyleTag += '.screenshot-linear-gradient-fix{background:none !important;}</style>';
            $("head").append(strStyleTag);

            if (noOfElementsParsed >= parsableElements.length) {
                MathUtilities.Components.Utils.Models.ScreenUtils._proceedWithScreenShot(options);
            }
        }
    });
}());
