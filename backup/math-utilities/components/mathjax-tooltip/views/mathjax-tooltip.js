/* global _, $, window, MathJax*/
(function(MathUtilities) {
    'use strict';
    MathUtilities.Components.MathJaxTooltip.Views.MathJaxTooltip = Backbone.View.extend({

        "latex": null,

        "initialize": function() {
            this.render();
        },

        "render": function() {
            this.appendTo = this.model.get('appendTo');
            this.idPrefix = this.model.get('idPrefix');
            this.baseClass = this.model.get('baseClass');
            this.arrowPosition = this.model.get('arrowPosition');
            this.playerContainer = this.model.get('playerContainer');
            this.generateTooltipDivStructure();
        },

        "latexToMathjax": function(latexCode, $mathjaxDisplayArea, isRender, callback) {
            var QUEUE, math = null;
            QUEUE = MathJax.Hub.queue;
            /*eslint-disable new-cap*/
            if (isRender) {
                math = MathJax.Hub.getAllJax('mathjax-output')[0];
                QUEUE.Push(['Text', math, latexCode]);
                QUEUE.Push(_.bind(function() {
                    this.toMathML(math, $mathjaxDisplayArea, callback);
                }, this));
            } else {
                math = MathJax.Hub.getAllJax('text-container-tooltip')[0];
                QUEUE.Push(_.bind(this.hideTooltip, this), ['Text', math, "\\displaystyle{" + latexCode + "}"], _.bind(this.displayTooltip, this));
            }
            /*eslint-enable new-cap*/
        },

        "displayTooltip": function() {
            this.$el.show();
            this.adjustTooltipPosition(this.element, this.arrowPosition);
        },

        "toMathML": function(jax, $mathjaxDisplayArea, callback) {
            var mml = jax.root.toMathML('');
            /*eslint-disable new-cap*/
            MathJax.Callback(callback)(mml);
            /*eslint-enable new-cap*/
            $mathjaxDisplayArea.html(mml);

            this.renderMathML(null, callback);
        },


        "renderMathML": function(mathMlWindow, postRenderCallback) {
            var arrMathJaxArgs = null,
                mathJaxHub = null;

            mathMlWindow = mathMlWindow || window;

            arrMathJaxArgs = new mathMlWindow.Array();
            mathJaxHub = mathMlWindow.MathJax.Hub;

            arrMathJaxArgs.push('Typeset', mathJaxHub);
            /*eslint-disable new-cap*/
            mathJaxHub.Queue(arrMathJaxArgs);

            postRenderCallback = postRenderCallback || null;
            if (postRenderCallback) {
                mathJaxHub.Queue(postRenderCallback);
            }
            /*eslint-enable new-cap*/
        },

        "generateTooltipDivStructure": function() {
            var isMathQuillTooltip = this.model.get('isMathQuillTooltip'),
                $textContainer = null,
                $el = this.$el,
                $borderDiv = null,
                id = this.idPrefix + '-mathjax-tooltip',
                $arrowDiv = null;

            $el.addClass('mathjax-tooltip-container ' + this.baseClass).attr('id', id);

            $textContainer = $('<div>', {
                "class": 'mathjax-tooltip-text-container',
                "id": 'text-container-tooltip'
            });
            $borderDiv = $('<div>', {
                "class": 'mathjax-tooltip-border-div'
            });
            $arrowDiv = $('<div>', {
                "class": 'mathjax-tooltip-arrow-div'
            });
            $el.append($textContainer).append($borderDiv).append($arrowDiv);
            this.appendTo.append($el);
            if (isMathQuillTooltip === false) {
                $textContainer.text('${}$');
                this.renderMathML(null, this.oncallBack);
            }
            $el.hide();
        },

        "renderMathJax": function(latexCode, $textContainer, isRender) {
            var $renderTo = $textContainer || this.$('.mathjax-tooltip-text-container');
            this.latexToMathjax(latexCode, $renderTo, isRender);
        },

        "showTooltip": function($element, latex, arrowPosition, isLatex) {
            var isMathQuillTooltip = this.model.get('isMathQuillTooltip'),
                $mathjaxToolTipContainer = this.$('.mathjax-tooltip-text-container');
            this.$el.show();
            if (latex !== this.latex) {
                this.element = $element;
                this.arrowPosition = arrowPosition;
                this.latex = latex;
                if (isMathQuillTooltip === true) {
                    if (isLatex === true) {
                        $mathjaxToolTipContainer.removeClass('mathquill-tooltip-text-container').mathquill()
                            .mathquill('latex', latex).addClass('mathquill-tooltip-text-container');
                    } else {
                        $mathjaxToolTipContainer.text(latex);
                    }
                } else {
                    latex = this._processLatex(latex);
                    this.renderMathJax(latex);
                }
            }
            this.adjustTooltipPosition($element, arrowPosition);
        },

        "hideTooltip": function() {
            this.$el.hide();
        },

        "adjustTooltipPosition": function($element, arrowPosition) {
            var obj,
                $el = this.$el,
                add = 0,
                tooltipLeft = null,
                MAX_LEFT = 10,
                isTopOrBottomArrow = false,
                playerContainer = this.playerContainer,
                tolerance = 0,
                playerWidth = playerContainer.width();
            arrowPosition = arrowPosition || this.determineArrowPosition($element);
            obj = this.calculatePosition(arrowPosition, $element);

            if (this.model.get('hideArrow')) {
                tolerance = 10;
            }
            $el.offset({
                "top": obj.tooltipTop,
                "left": obj.tooltipLeft
            }).css({
                "top": Math.floor($el.position().top + tolerance),
                "left": Math.floor($el.position().left)
            });
            if (arrowPosition === 'top' || arrowPosition === 'bottom') {
                isTopOrBottomArrow = true;
            }
            if ($el.position().left <= MAX_LEFT) {
                tooltipLeft = MAX_LEFT;
                if (isTopOrBottomArrow) {
                    add = $el.position().left - tooltipLeft;
                }
                $el.css({
                    "left": tooltipLeft
                });
            }
            if ($el.position().left + $el.width() > playerWidth) {
                tooltipLeft = playerWidth - MAX_LEFT - $el.width();
                if (isTopOrBottomArrow) {
                    add = $el.position().left - tooltipLeft;
                }
                $el.css({
                    "left": tooltipLeft
                });
            }

            this.$('.mathjax-tooltip-arrow-div').css({
                "top": obj.arrowDivTop + "px",
                "left": obj.arrowDivLeft + add + "px",
                "-webkit-transform": "rotate(" + obj.deg + ")",
                "-ms-transform": "rotate(" + obj.deg + ")",
                "-moz-transform": "rotate(" + obj.deg + ")",
                "transform": "rotate(" + obj.deg + ")"
            });


            this.$('.mathjax-tooltip-border-div').css({
                "top": obj.borderDivTop + "px",
                "left": obj.borderDivLeft + add + "px",
                "-webkit-transform": "rotate(" + obj.deg + ")",
                "-ms-transform": "rotate(" + obj.deg + ")",
                "-moz-transform": "rotate(" + obj.deg + ")",
                "transform": "rotate(" + obj.deg + ")"
            });
            if (this.model.get('hideArrow')) {
                this.$('.mathjax-tooltip-arrow-div, .mathjax-tooltip-border-div').hide();
            }
        },

        "calculatePosition": function(arrowType, $element) {
            var tooltipWidth = this.$el.outerWidth(),
                obj,
                elementWidth = $element.width(),
                elementHeight = $element.height(),
                svgHeightAndWidth,
                borderWidth = (tooltipWidth - this.$el.width()) / 2;
            if ($element[0] instanceof SVGElement) {
                svgHeightAndWidth = $element[0].getBBox();
                elementWidth = svgHeightAndWidth.width;
                elementHeight = svgHeightAndWidth.height;
            }
            obj = this.model.calculateTooltipPosition({
                "elementTop": $element.offset().top,
                "elementLeft": $element.offset().left,
                "elementWidth": elementWidth,
                "elementHeight": elementHeight,
                "tooltipWidth": tooltipWidth,
                "tooltipHeight": this.$el.outerHeight(),
                "borderWidth": borderWidth,
                "arrowType": arrowType
            });
            return obj;

        },

        "renderMathJaxInDiv": function(latexCode, $textContainer) {

            this.renderMathJax(latexCode, $textContainer, true);
        },

        "determineArrowPosition": function($element) {
            var $parentDiv = this.playerContainer,
                parentLeft = $parentDiv.offset().left,
                parentTop = $parentDiv.offset().top,
                parentBottom = parentTop + $parentDiv.height(),
                parentRight = parentLeft + $parentDiv.width(),
                elementTop = $element.offset().top,
                elementRight = $element.offset().left + $element.width(),
                elementBottom = elementTop + $element.height(),
                $el = this.$el,
                tooltipWidth, tooltipHeight, distanceRight,
                distanceTop = null,
                distanceBottom = null,
                ARROW_HEIGHT = 10,
                arrowType = null;

            distanceTop = elementTop - parentTop;
            distanceBottom = parentBottom - elementBottom;
            distanceRight = parentRight - elementRight;
            tooltipWidth = $el.width() + ARROW_HEIGHT;
            tooltipHeight = $el.height() + ARROW_HEIGHT;
            if (tooltipHeight < distanceTop) {
                arrowType = 'top';
            } else {
                if (tooltipHeight < distanceBottom) {
                    arrowType = 'bottom';
                } else {
                    if (tooltipWidth < distanceRight) {
                        arrowType = 'right';
                    } else {
                        arrowType = 'left';
                    }
                }
            }
            return arrowType;
        },

        "_processLatex": function(latex) {
            // regex to find place holder for space
            latex = latex.replace(/\\spacing@/g, '\\text{ }');
            // regex to get 3 parameters of mixed fraction in 3 groups
            latex = latex.replace(/\\mixedfrac{([\w\\\s.]*)}{([\w\\\s.]*)}{([\w\\\s.]*)}/g, function($0, $1, $2, $3) {
                return $1 + '\\frac{' + $2 + '}' + '{' + $3 + '}';
            });
            return latex;
        }

    }, {

        "createTooltip": function(tooltipProps) {
            var tooltipModel, tooltipView;
            if (tooltipProps) {

                tooltipModel = new MathUtilities.Components.MathJaxTooltip.Models.MathJaxTooltip(tooltipProps);
                tooltipView = new MathUtilities.Components.MathJaxTooltip.Views.MathJaxTooltip({
                    "model": tooltipModel
                });

                return tooltipView;
            }
        }
    });

}(window.MathUtilities));
