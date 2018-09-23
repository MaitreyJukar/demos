(function () {
    'use strict';

    /**
    * View for new Draggable Ruler
    *
    * @class Ruler
    * @constructor
    * @extends MathInteractives.Common.Player.Views.Base
    * @namespace MathInteractives.Common.Components.Views
    **/
    MathInteractives.Common.Components.Views.Ruler = MathInteractives.Common.Player.Views.Base.extend({

        /**
        * El passed by user
        * @property $ruler
        * @type Object
        * @default null
        **/
        $ruler: null,

        /**
        * Stores the center point of handlers
        * @property  elCenter
        * @type Object
        * @default null
        **/
        elCenter: null,

        /**
        * Stores x and y co-ordinates of clicked handler
        * @property  eventPoint
        * @type Object
        * @default null
        **/
        eventPoint: null,

        /**
        * Stores x and y co-ordinates of previously clicked handler
        * @property  lastEventPoint
        * @type Object
        * @default null
        **/
        lastEventPoint: null,

        /**
        * Degree at which ruler is rotating
        * @property  lastEventPoint
        * @type Object
        * @default 0
        **/
        degree: 0,

        /**
        * Stores origin point
        * @property  origin
        * @type Object
        * @default null
        **/
        origin: null,

        /**
        * Whether the user has clicked or not
        * @property  clicking
        * @type Object
        * @default false
        **/
        clicking: false,

        /**
        * Stores left handler element
        * @property  $pivotLeft
        * @type Object
        * @default null
        **/
        $pivotLeft: null,

        /**
        * Stores right handler element
        * @property  $pivotRight
        * @type Object
        * @default null
        **/
        $pivotRight: null,

        /**
        * Manager object
        * @property manager
        * @type Object
        * @default null
        **/
        manager: null,

        /**
        * Player object
        * @property player
        * @type Object
        * @default null
        **/
        player: null,

        /**
        * File-path object
        * @property filePath
        * @type Object
        * @default null
        **/
        filePath: null,

        /**
        * Font color passed by user
        * @property  fontColor
        * @type Object
        * @default null
        **/
        fontColor: null,

        /**
        * Background color of ruler passed by user
        * @property  backgroundColor
        * @type Object
        * @default null
        **/
        backgroundColor: null,

        /**
        * Whether the ruler should rotate or not
        * @property rotateByDefault
        * @type Object
        * @default true
        **/
        rotateByDefault: true,

        /**
        * Ruler height passed by user
        * @property rulerHeight
        * @type Object
        * @default null
        **/
        rulerHeight: null,

        /**
        * Ruler width passed by user
        * @property rulerWidth
        * @type Object
        * @default null
        **/
        rulerWidth: null,

        idPrefix: null,

        fontSize: null,

        allowmmScale: false,

        lineLength: null,
        tickInterVal: null,

        initialize: function () {
            this.$ruler = this.$el;
            this.manager = this.model.get('manager');
            this.player = this.model.get('player');
            this.filePath = this.model.get('filePath');
            this.idPrefix = this.model.getIdPrefix();
            this.fontColor = this.model.getFontColor();
            this.fontSize = this.model.getFontSize();
            this.allowmmScale = this.model.getAllowmmScale();
            this.backgroundColor = this.model.getBackgroundColor();
            this.lineLength = this.model.getLineLength();
            this.tickInterVal = this.model.getTickInterVal();
            this.rotateByDefault = this.model.get('rotateByDefault');
            this.rulerHeight = this.model.getRulerHeight();
            this.rulerWidth = this.model.getRulerWidth();
            this._render();
            this._attachEvents();
            this._makeRulerDraggable();
        },

        /**
        * Renders the ruler view and displays ruler on screen
        * @method _render
        * @return null
        * @private
        **/
        _render: function () {
            var rulerContext,
                self = this,
                myCanvas = null,
                $ruler = null,
                $canvas = null,
                cmIndex,
                halfLengthIndex,
                mmIndex,
                scaleCounter = 0,
                lineLength = this.lineLength,
                cmLengthInPixels = null,
                scaleLabelOffset = null,
                count = 1,
                tickInterVal = this.tickInterVal;
            $('<canvas>').attr({ id: this.idPrefix + 'myCanvas', height: this.rulerHeight, width: this.rulerWidth }).addClass('ruler-container').appendTo(this.$ruler);

            myCanvas = document.getElementById(this.idPrefix + 'myCanvas');
            $canvas = this.$('#' + this.idPrefix + 'myCanvas');
            rulerContext = myCanvas.getContext('2d');
            $canvas.css({ 'background-color': this.backgroundColor });
            cmLengthInPixels = myCanvas.width / (lineLength + 1);
            scaleLabelOffset = cmLengthInPixels - this.model.get('fontSize') / 2 + 2;
            rulerContext.beginPath();
            for (cmIndex = 0; cmIndex < myCanvas.width; cmIndex += cmLengthInPixels) {//draw centimeter lines
                scaleCounter++;
                rulerContext.moveTo(cmIndex + cmLengthInPixels, 20);
                rulerContext.lineTo(cmIndex + cmLengthInPixels, 0);
                rulerContext.font = '' + this.fontSize + ' Arial';
                rulerContext.fillStyle = this.fontColor;
                if (scaleCounter >= tickInterVal && scaleCounter % tickInterVal === 0) {
                    rulerContext.fillText(scaleCounter, cmIndex + scaleLabelOffset, 35)
                }
                //rulerContext.fillText(scaleCounter, cmIndex + scaleLabelOffset, 35)
                for (halfLengthIndex = cmIndex; Math.round(halfLengthIndex) < Math.round(cmIndex + cmLengthInPixels) ; halfLengthIndex += (cmLengthInPixels / 2)) {//draw five milimeter lines
                    if (halfLengthIndex === 0) {
                        rulerContext.moveTo(halfLengthIndex + (cmLengthInPixels / 2), 13);
                        rulerContext.lineTo(halfLengthIndex + (cmLengthInPixels / 2), 0);
                    }
                    else {
                        rulerContext.moveTo(2 * (halfLengthIndex) + (cmLengthInPixels / 2), 13);
                        rulerContext.lineTo(2 * (halfLengthIndex) + (cmLengthInPixels / 2), 0);
                    }
                    if (this.allowmmScale) {

                        for (mmIndex = halfLengthIndex; Math.round(mmIndex) < Math.round(halfLengthIndex + (cmLengthInPixels / 2)) ; mmIndex += (cmLengthInPixels / 10)) {//draw milimeter lines

                            rulerContext.moveTo(mmIndex + (cmLengthInPixels / 10), 7);
                            rulerContext.lineTo(mmIndex + (cmLengthInPixels / 10), 0);
                            count++;

                            if (count % 4 === 0) {
                                rulerContext.moveTo(2 * (mmIndex + (cmLengthInPixels / 10)), 7);
                                count++;
                            }
                        }
                    }
                }
            }
            rulerContext.stroke();
            $('<div>', { 'class': 'ruler-div', 'id': this.idPrefix + 'rulerDiv', 'height': this.rulerHeight, 'width': this.rulerWidth, 'data-items': '' }).appendTo(this.$ruler);

            if (this.rotateByDefault === true) {
                $('<div>', { 'class': 'pivot-point' }).appendTo(this.$ruler);
                $('<div>', { 'class': 'pivot-point' }).appendTo(this.$ruler);
                this.$pivotLeft = $(this.$('.pivot-point')[0]);
                this.$pivotRight = $(this.$('.pivot-point')[1]);

                $('<div>', { 'class': 'rotate-left-handler ruler-handle' }).appendTo(this.$pivotLeft);
                $('<div>', { 'class': 'rotate-right-handler ruler-handle' }).appendTo(this.$pivotRight);
                this.$ruler.css({
                    'height': this.rulerHeight,
                    'width': this.rulerWidth
                });

                this.$pivotLeft.css({
                    'top': -((this.$ruler.height() / 2) + (this.$pivotLeft.height() / 2) + 5) + 'px',
                    'left': -(this.$pivotLeft.width() / 2) + 'px'
                });

                this.$pivotRight.css({
                    'top': -((this.$ruler.height() / 2) + (this.$pivotLeft.height() / 2) + 5) + 'px',
                    'left': (this.$ruler.width() - this.$pivotRight.width() / 2 - 30) + 'px'
                });
            }
        },

        /**
        * Ruler events and their corresponding handlers
        * @method _attachEvents
        * @return null
        * @private
        **/
        _attachEvents: function () {

            var self = this, $pivotPoint = this.$('.pivot-point'), $myCanvas = $('#' + this.idPrefix + 'myCanvas'), $ruler = $('#' + this.idPrefix + 'rulerDiv'),
                utilsClass = MathInteractives.Common.Utilities.Models.Utils;
            //if (!$.support.touch) {
            $pivotPoint.on('mouseenter', $.proxy(self._pivotMouseEnterHandler, self));
            $ruler.on('mouseenter', $.proxy(self._rulerMouseEnterHandler, self));
            //}



            $pivotPoint.on('mouseleave', $.proxy(self._pivotMouseLeaveHandler, self));
            $ruler.on('mousedown', $.proxy(self._makeRulerDraggable, self));
            $myCanvas.on('mousedown', $.proxy(self._makeRulerDraggable, self));
            //if (this.rotateByDefault === true) {
            //$pivotPoint.on('mousedown', $.proxy(self._allowRulerToRotate, self));
            //$pivotPoint.on('touchstart', $.proxy(self._allowRulerToRotate, self));
            //}
            //if ($.support.touch) {
            this.$el.on({
                'mousedown': $.proxy(this.disallowRotate, this)
                //'touchstart': $.proxy(this.disallowRotate, this)
            });
            $pivotPoint.on({
                'mousedown': $.proxy(this._allowRulerToRotate, self),
                'mousemove': $.proxy(this._startRotateRuler, self)
            });
            //}


            utilsClass.EnableTouch(this.$el, { specificEvents: utilsClass.SpecificEvents.DRAGGABLE });
            utilsClass.EnableTouch($pivotPoint, { specificEvents: utilsClass.SpecificEvents.DRAGGABLE + utilsClass.SpecificEvents.MOUSEMOVE });
            utilsClass.EnableTouch($ruler, { specificEvents: utilsClass.SpecificEvents.DRAGGABLE });

        },

        /**
        * Sets origin and ruler offset when clicked on any handler
        * @method _allowRulerToRotate
        * @return null
        * @private
        **/
        _allowRulerToRotate: function (event) {
            event.preventDefault();
            var self = this, x, y, transform, origin, rulerTop, rulerLeft, diffLeft, diffTop, newRulerLeft, newRulerTop, browserCheck = MathInteractives.Common.Utilities.Models.BrowserCheck;
            rulerTop = this.$ruler.offset().top;
            rulerLeft = this.$ruler.offset().left;

            //if (!$.support.touch) {
            //$(document).on({
            //    'mousemove.rotate-ruler': $.proxy(self._startRotateRuler, self),
            //    'mouseup.rotate-ruler': $.proxy(self._stopRotateRuler, self)
            //});
            //}
            //else {
            //$(document).on({
            //    'touchmove.rotate-ruler': $.proxy(self._startRotateRuler, self),
            //    'touchend': $.proxy(self._stopRotateRuler, self)
            //});
            //}
            this.clicking = true;
            event.stopPropagation();
            self.$el.draggable('option', 'disabled', true);
            if (browserCheck.isMobile) {
                event.clientX = event.originalEvent.touches[0].clientX;
                event.clientY = event.originalEvent.touches[0].clientY;
            }
            this.eventPoint = {
                x: event.clientX,
                y: event.clientY
            };

            transform = self.$el.css('transform');
            
            if (transform === null && (browserCheck.isIE || browserCheck.isIE11)) {
                transform = this.$el.css('-ms-transform');
            }
            if (transform === null && browserCheck.isFirefox) {
                transform = this.$el.css('-moz-transform');
            }
            if (transform === null && (browserCheck.isChrome || browserCheck.isSafari)) {
                transform = this.$el.css('-webkit-transform');
            }

            if ($(event.target).hasClass('rotate-left-handler') || $(event.target).find('.ruler-handle').hasClass('rotate-left-handler')) {

                this.elCenter = {
                    x: this.$pivotRight.offset().left + this.$pivotRight.outerWidth() / 2,
                    y: this.$pivotRight.offset().top + this.$pivotRight.outerHeight() / 2
                }
                origin = {
                    x: this.$ruler.width(),
                    y: this.$ruler.height() / 2
                }
            }
            else {
                this.elCenter = {
                    x: this.$pivotLeft.offset().left + this.$pivotLeft.outerWidth() / 2,
                    y: this.$pivotLeft.offset().top + this.$pivotLeft.outerHeight() / 2
                }

                origin = {
                    x: 0,
                    y: this.$ruler.height() / 2
                }
            }

            x = origin.x + 'px';
            y = origin.y + 'px';

            this.$ruler.css({
                'transform-origin': x + ' ' + y,
                '-ms-transform-origin': x + ' ' + y,
                '-moz-transform-origin': x + ' ' + y,
                '-webkit-transform-origin': x + ' ' + y
            });


            diffTop = rulerTop - this.$ruler.offset().top;
            diffLeft = rulerLeft - this.$ruler.offset().left;
            newRulerLeft = this.$ruler.offset().left + diffLeft;
            newRulerTop = this.$ruler.offset().top + diffTop;
            this.$ruler.offset({ top: newRulerTop, left: newRulerLeft });
        },
        disallowRotate: function disallowRotate(event) {
            this.clicking = false;
        },
        /**
        * Rotates ruler on mouse move when handler is clicked
        * @method _startRotateRuler
        * @return null
        * @private
        **/
        _startRotateRuler: function (event) {
            //event.preventDefault();
            var target, elCenter, lastPointAngle, currentPointAngle, rotationAngle, degree,
                browserCheck = MathInteractives.Common.Utilities.Models.BrowserCheck;
            if (this.clicking === true) {
                this.lastEventPoint = this.eventPoint;
                if (browserCheck.isMobile) {
                    event.clientX = event.originalEvent.touches[0].clientX;
                    event.clientY = event.originalEvent.touches[0].clientY;
                }
                this.eventPoint = {
                    x: event.clientX,
                    y: event.clientY
                };
                target = this.$ruler;
                elCenter = this.elCenter;
                lastPointAngle = Math.atan2(this.lastEventPoint.y - elCenter.y + $(window).scrollTop(), this.lastEventPoint.x - elCenter.x + $(window).scrollLeft()) * 180 / Math.PI;
                currentPointAngle = Math.atan2(event.clientY - elCenter.y + $(window).scrollTop(), event.clientX - elCenter.x + $(window).scrollLeft()) * 180 / Math.PI;
                rotationAngle = currentPointAngle - lastPointAngle;
                degree = (Number(this.degree) + rotationAngle + 360) % 360;
                target.css({
                    'transform': 'rotate(' + degree + 'deg)',
                    '-ms-transform': 'rotate(' + degree + 'deg)',
                    '-moz-transform': 'rotate(' + degree + 'deg)',
                    '-webkit-transform': 'rotate(' + degree + 'deg)'
                });
                this.degree = degree;
            }
        },

        /**
        * Adds hover state class when mouse is over handler
        * @method _pivotMouseEnterHandler
        * @return null
        * @private
        **/
        _pivotMouseEnterHandler: function (event) {
            $(event.currentTarget).find('.ruler-handle').addClass('ruler-handle-hover');
        },

        /**
        * Removes hover state class
        * @method _pivotMouseLeaveHandler
        * @return null
        * @private
        **/
        _pivotMouseLeaveHandler: function (event) {
            $(event.currentTarget).find('.ruler-handle').removeClass('ruler-handle-hover');
        },

        /**
        * Adds pointer css property when mouse is over ruler canvas
        * @method _rulerMouseEnterHandler
        * @return null
        * @private
        **/
        _rulerMouseEnterHandler: function (event) {
            $(event.currentTarget).css({ 'cursor': 'pointer' });
        },

        /**
        * Makes Ruler draggable
        * @method _makeRulerDraggable
        * @return null
        * @private
        **/
        _makeRulerDraggable: function () {

            var self = this, utilsClass = MathInteractives.Common.Utilities.Models.Utils;
            this.$ruler.draggable({

            });

            utilsClass.EnableTouch('.ui-draggable', { specificEvents: utilsClass.SpecificEvents.DRAGGABLE });
            //$.fn.EnableTouch('.ui-draggable');

            //this.$ruler.draggable('option', 'disabled', false)
        },

        /**
        * Detach events on mouseup
        * @method _stopRotateRuler
        * @return null
        * @private
        **/
        _stopRotateRuler: function (event) {
            $(document).off('mousemove.rotate-ruler touchmove.rotate-ruler');
            $(document).off('mouseup.rotate-ruler touchend.rotate-ruler');
            this.eventPoint, this.elCenter, this.lastEventPoint = null;
        }
    }, {

        /**
        * Initializes ruler model with the specified properties, creates ruler view based on 
        * the ruler model and returns ruler view
        * @method createRuler
        * @param rulerProps {Object} Ruler properties
        * @return Newly created ruler view if the properties are passed or null otherwise
        * @public
        * @static
        **/
        createRuler: function (rulerProps) {
            var rulerId;
            if (rulerProps) {
                rulerId = "#" + rulerProps.idPrefix + rulerProps.containerId;
                var rulerModel = new MathInteractives.Common.Components.Models.Ruler(rulerProps);
                var rulerView = new MathInteractives.Common.Components.Views.Ruler({ el: rulerId, model: rulerModel });
                return rulerView;
            }
        }
    });

    MathInteractives.global.Ruler = MathInteractives.Common.Components.Views.Ruler;

})(window.MathInteractives);
