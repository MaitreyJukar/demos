(function(MathUtilities) {
    "use strict";
     var ConstructionTool = MathUtilities.Tools.ConstructionTool;

    ConstructionTool.Views.CanvasAcc = Backbone.View.extend({

        "initialize": function() {
            var templates = ConstructionTool.Views.templates["canvas-accessibility"]().trim(),
                accManager = this.model.get("accManager"),
                accObj = {
                    "elementId": "canvas-temp-acc-focus",
                    "type": "text",
                    "tabIndex": -1
                };
            this.$el.append(templates);
            accManager.createAccDiv(accObj);
        },

        "createAccDiv": function(data) {
            if (typeof data === "undefined" || data === null) {
                return void 0;
            }
            var templates = null,
                prevElem = this.$el.find(".canvas-acc-container:last"),
                prevElemId = null,
                counter = 0,
                $newDiv = null,
                accElem = null,
                accHandlerObj = null,
                accManager = this.model.get("accManager"),
                tabIndex = this.model.get("startIndex");

            if (prevElem.length !== 0) {
                prevElemId = prevElem.attr("id");
                counter = Number(prevElemId.substring(prevElemId.lastIndexOf("-") + 1)) + 1;
                tabIndex = accManager.getTabIndex(prevElem.find(".parent").attr("id")) + 15;

            }

            templates = ConstructionTool.Views.templates["canvas-focus"]({
                "id": counter,
                "data": data,
                "tabIndex": tabIndex
            }).trim();

            $newDiv = $(templates);

            this.$el.append($newDiv);

            accElem = $newDiv.find(".canvas-acc-div");

            $.each(accElem, function(key, value) {
                accHandlerObj = {
                    "elementId": $(value).attr("id"),
                    "type": "text",
                    "tabIndex": tabIndex++
                };
                accManager.createAccDiv(accHandlerObj);
            });

            accElem.on("focusin", $.proxy(this.canvasElemFocusIn, this))
                .on("focusout", $.proxy(this.canvasElemFocusOut, this))
                .on("keydown", $.proxy(this.onKeyDown, this))
                .on("keyup", $.proxy(this.onKeyUp, this));

            return $newDiv.attr("id");
        },

        "updateAccDivProp": function updateAccDivProp(id, propObj) {
            if (typeof propObj.points !== "undefined") {
                this.model.get("elemMapping")[id] = propObj.points;
            }
        },

        "drawFocusRect": function drawFocusRect(id) {
            if (typeof id === "undefined" || id === null) {
                return;
            }

            var paperScope = this.model.get("paperScope"),
                isAccessible = this.model.get("isAccessible"),
                points = this.model.get("elemMapping")[id];

            this.removeFocusRect();
            if (isAccessible === true && points) {
                new paperScope.Path({
                    "segments": points,
                    "strokeColor": "black",
                    "dashArray": [4, 2],
                    "name": "canvasAccFocus",
                    "closed": true
                });
                this.redraw();
            }
        },

        "setFocus": function setFocus(id, delay) {
            var accManager = this.model.get("accManager");
            accManager.setFocus(id, delay);
            this.drawFocusRect(id);
        },

        "removeAccDiv": function removeAccDiv(id) {
            var $accDiv = this.$("#" + id);
            $accDiv.remove();
            this.model.get("elemMapping")[id] = null;
        },

        "reFocusElem": function reFocusElem(id, accText, delay) {
            var $accDiv = this.$("#" + id),
                text = $accDiv.find(".acc-read-elem").text(),
                accManager = this.model.get("accManager");

            delay = delay || 10;
            if (accText) {
                if (text === accText) {
                    accText += " ";
                }
                accManager.setAccMessage(id, accText);
            }
            accManager.setFocus("canvas-temp-acc-focus");
            accManager.setFocus(id, delay);
        },

        "removeFocusRect": function removeFocusRect(event) {
            var paperScoepe = this.model.get("paperScope"),
                accFocusRect = paperScoepe.project.activeLayer.children.canvasAccFocus;

            if (accFocusRect) {
                accFocusRect.remove();
            }
        },

        "canvasElemFocusIn": function canvasElemFocusIn(event) {
            var id = $(event.currentTarget).attr("id");
            this.drawFocusRect(id);
            this.trigger("canvasElemFocusIn", event);
        },

        "canvasElemFocusOut": function canvasElemFocusOut(event) {
            this.removeFocusRect();
            this.redraw();
            this.trigger("canvasElemFocusOut", event);
        },

        "onKeyDown": function onKeyPress(event) {
            this.trigger("canvasKeyDown", event);
        },
        "onKeyUp": function onKeyUp(event) {
            this.trigger("canvasKeyUp", event);
        },

        "redraw": function redraw() {
            var paperScope = this.model.get("paperScope");
            paperScope.view.draw();
        },

        "enableFocusRect": function enableDisableFocusRect(id, isEnable) {
            var accManager = this.model.get("accManager");
            accManager.enableTab(id, isEnable);
        }
    });
})(window.MathUtilities);
