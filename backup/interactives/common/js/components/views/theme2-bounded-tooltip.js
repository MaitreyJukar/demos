
(function (MathInteractives) {
    'use strict';  

    /**
    * View for rendering Tooltip and its related events
    *
    * @class BoundedTooltip 
    * @namespace MathInteractives.Common.Components.Theme2.Views
    **/
    MathInteractives.Common.Components.Views.BoundedTooltip = MathInteractives.Common.Components.Theme2.Views.Tooltip.extend({

        /**        
        * @namespace MathInteractives.Common.Components.Theme2.Views
        * @class Tooltip 
        * @constructor
        */
        initialize: function initialize() {
            this._superwrapper('initialize', arguments);
            var holder = MathInteractives.Common.Components.Theme2.Views.Tooltip.ARROW_TYPE;
            this.model.set('priorityArray', [
                holder.LEFT_MIDDLE,
                holder.TOP_MIDDLE,
                holder.RIGHT_MIDDLE,
                holder.BOTTOM_MIDDLE
            ]);
        },

        /**
        * Checks whether the tool tip is inside the container
        *
        * @method _isInContainer
        * @private 
        * @param $parentDiv {Object} parent div object
        * @param $childDiv {Object} child div object
        * @return {Boolean} containment whether inside or outside
        **/
        _isInContainer: function (containmentArea, $childDiv) {
            var padding = this.model.get('containerPadding'),
                parentLeft = containmentArea.left,
                parentTop = containmentArea.top,
                parentRight = parentLeft + containmentArea.width,
                parentBottom = parentTop + containmentArea.height,
                childLeft = parseFloat($childDiv.offset().left),
                childTop = parseFloat($childDiv.offset().top),
                childRight = childLeft + $childDiv.width(),
                childBottom = childTop + $childDiv.height();
            padding = this._isNullOrUndefined(padding) ?   { left : 0 , top : 0 , right : 0 , bottom : 0 } : padding;
            return (childLeft > parentLeft + padding.left && childTop > parentTop + padding.top &&
                    childRight < parentRight - padding.right && childBottom < parentBottom - padding.bottom);
        },

        showTooltip : function() {            
            this._superwrapper('showTooltip', arguments);                   

            var position = this.model.get('position'),
                dynamicArrowPosition = this.model.get('dynamicArrowPosition'),
                containerHeight = this.model.get('containerHeight'),
                containerWidth = this.model.get('containerWidth'),
                positionArray = this.model.get('positionArray'),
                containerEleId = this.model.get('containerEleId'),
                $tooltip = $(this.$el),                
                containmentArea = this._calculateContainment(containerEleId);

            $tooltip.css({
                width : $tooltip.width(),
                height : $tooltip.height()
            });                  

            if(position){                
                this._applyPosition(position);
                if(dynamicArrowPosition){
                    if(this.isSpaceAvailable(position)){
                        this._bringInContainer();
                        if(!this._isInContainer(containmentArea,$tooltip)){
                            this._applyPositions(positionArray);
                        }
                    }
                }
            }
            if(!this._isInContainer(containmentArea,$(this.$el))){
                this._applyPositions(positionArray);
                if(!this._isInContainer(containmentArea,$(this.$el))){
                   this._superwrapper('showTooltip',arguments);
                }
            }            
            
            if (this.closeOnDocumentClick) {
                this.unbindEventOnDocument();
                this.bindEventOnDocument();
            }
            if (this._isCloseBtnPresent) {
                this.unbindEventOnCloseBtn();
                this.bindEventOnCloseBtn();
            }
        },

        _applyPositions : function _applyPositions(positionArray) {
            var containerEleId = this.model.get('containerEleId'),
                $tooltip = $(this.$el),
                containmentArea = this._calculateContainment(containerEleId),
                isInsideContainer = this._isInContainer(containmentArea,$tooltip),
                priorityArray = this._isNullOrUndefined(positionArray) ? this.model.get('priorityArray') : positionArray;            
            for(var i = 0 ; i < priorityArray.length ; i++ ){
                this.setArrowType(priorityArray[i]);
                if(this.isSpaceAvailable(priorityArray[i])){
                    this.setArrowType(priorityArray[i]);
                    this._superwrapper('showTooltip',arguments);
                    this._applyPosition(priorityArray[i]);
                    this._bringInContainer();
                    $tooltip = $(this.$el);
                    isInsideContainer = this._isInContainer(containmentArea,$tooltip);
                    if(isInsideContainer){
                        break;
                    }
                }
            }
            this._bringInContainer();
            return isInsideContainer;
        },

        _applyPosition : function _applyPosition(arrowType){
            if(this._isNullOrUndefined(arrowType)){
                return;
            }
            this.setArrowType(arrowType);
            this._superwrapper('showTooltip',arguments);
            var containerEleId = this.model.get('containerEleId'),
                $tooltip = $(this.$el),
                containmentArea = this._calculateContainment(containerEleId),
                isInsideContainer = this._isInContainer(containmentArea,$tooltip);             
            return isInsideContainer;
        },

        _bringInContainer : function _bringInContainer(){  
            var containerEleId = this.model.get('containerEleId'),
                $tooltip = $(this.$el),
                containmentArea = this._calculateContainment(containerEleId);
            if(this._isInContainer(containmentArea,$tooltip)){
                return;
            }
            this.displayTooltip();
            var padding = this.model.get('containerPadding'),
                $childDiv = this.$el,
                $el = $('#' + this.elementEl),
                $parentDiv = this.player.$('#' + this.idPrefix + this.model.get('containerEleId')),
                parentLeft = $parentDiv.offset().left,
                parentTop = $parentDiv.offset().top,
                parentRight = parentLeft + $parentDiv.width(),
                parentBottom = parentTop + $parentDiv.height(),
                $arrowDiv = this.$el.find('.arrow-div'),
                $borderDiv = $childDiv.find('.border-div'),
                childLeft = $childDiv.offset().left,
                childTop = $childDiv.offset().top,
                childRight = childLeft + $childDiv.width(),
                childBottom = childTop + $childDiv.height(),
                elLeft = $el.offset().left,
                elRight = $el.outerWidth() + elLeft,
                elTop = $el.offset().top,
                elBottom = $el.outerHeight() + elTop,
                borderArrowLeft = parseFloat($borderDiv.css('left')),
                borderArrowTop = parseFloat($borderDiv.css('top')),
                arrowLeft =  parseFloat($arrowDiv.css('left')),
                arrowTop =  parseFloat($arrowDiv.css('top'));

            padding = this._isNullOrUndefined(padding) ?   { left : 0 , top : 0 , right : 0 , bottom : 0 } : padding;
            if (childRight > parentRight - padding.right) {           
                childLeft = childLeft - ( childRight - elRight);
                arrowLeft = $childDiv.width() - $el.width() / 2 - this.baseWidthOfArrow;
                borderArrowLeft  = arrowLeft;
            }
            if (childBottom > parentBottom - padding.bottom) {
                childTop = childTop - (childBottom - elBottom);
                arrowTop = $childDiv.height() - $el.height() / 2 - this.baseWidthOfArrow; 
                borderArrowTop = arrowTop - 1;     
            }
            if (childLeft <= parentLeft + padding.left) {
                arrowLeft = ($el.width() - this.baseWidthOfArrow) / 2;                
                childLeft = elLeft;
                borderArrowLeft = arrowLeft;
            }
            if (childTop <= parentTop + padding.top) {
                arrowTop = ($el.height() - this.baseWidthOfArrow) / 2;                
                childTop = elTop;
                borderArrowTop = arrowTop + 1;
            }
            $arrowDiv.css({
                left : arrowLeft,
                top : arrowTop
            });
            $borderDiv.css({
                left : borderArrowLeft,
                top : borderArrowTop
            });
            $childDiv.offset({
                left: childLeft,
                top: childTop
            });            
            return true;
        },

        /**
        * It checks whether space is available on specified direction or not
        *
        * @method isSpaceAvailable
        * @public 
        * @param arrowType {String} direction to check for space availablility
        * @return {boolean} whether space available or not
        **/
        isSpaceAvailable: function (arrowType) {
            this._superwrapper('showTooltip',arguments);
            var currentOpenDirection = this.getOpenDirections();
            return currentOpenDirection[arrowType] ? true : false;
        },

        /**
        * It checks in which direction space is available
        *
        * @method getOpenDirections
        * @public        
        * @return {Object} array of direction with space available 
        **/
        getOpenDirections: function () {
            var $childDiv = this.$el,
                $el = $('#' + this.elementEl),
                $parentDiv = this.player.$('#' + this.idPrefix + this.model.get('containerEleId')),
                parentLeft = $parentDiv.offset().left ,
                parentTop = $parentDiv.offset().top ,
                parentRight = parentLeft + $parentDiv.width() ,
                parentBottom = parentTop + $parentDiv.height() ,
                elLeft = $el.offset().left,
                elRight = $el.outerWidth() + elLeft,
                elTop = $el.offset().top,
                elBottom = $el.outerHeight() + elTop,
                holder = MathInteractives.Common.Components.Theme2.Views.Tooltip.ARROW_TYPE,
                openDirections = [],
                childWidth = $childDiv.outerWidth() + this.baseWidthOfArrow,
                childHeight = $childDiv.outerHeight() + this.baseWidthOfArrow;

            if ((elLeft - parentLeft) > (childWidth + this.eleCenter.x)) {
                openDirections[holder.LEFT_MIDDLE] = holder.LEFT_MIDDLE;
            }
            if ((parentRight - elRight) > (childWidth + this.eleCenter.x)) {
                openDirections[holder.RIGHT_MIDDLE] = holder.RIGHT_MIDDLE;
            }
            if ((elTop - parentTop) > (childHeight + this.eleCenter.y)) {
                openDirections[holder.TOP_MIDDLE] = holder.TOP_MIDDLE;
            }
            if ((parentBottom - elBottom) > (childHeight + this.eleCenter.y)) {
                openDirections[holder.BOTTOM_MIDDLE] = holder.BOTTOM_MIDDLE;
            }
            return openDirections;
        },

        _isNullOrUndefined : function _isNullOrUndefined(object){
            return object === null || typeof object === 'undefined';
        },

        _calculateContainment : function _calculateContainment(eleId) {
            var containmentArea = {},
                $containerElement = this.player.$('#' + this.idPrefix + eleId);

            containmentArea.height = $containerElement.height();
            containmentArea.width = $containerElement.width();
            containmentArea.left = $containerElement.offset().left;
            containmentArea.top = $containerElement.offset().top;

            return containmentArea;
        }
    }, {
        /*
        * to generate Tooltip as per the given requirement
        * @method generateTooltip
        * @public
        * @param tooltipProps {object} properties to generate tooltip 
        * @return {Object} generated tooltip's view
        */
        generateBoundedTooltip: function (tooltipProps) {
            var tooltipModel, tooltipView;
            if (tooltipProps) {

                tooltipModel = new MathInteractives.Common.Components.Models.BoundedTooltip(tooltipProps);
                tooltipView = new MathInteractives.Common.Components.Views.BoundedTooltip({ model: tooltipModel });

                return tooltipView;
            }
        },            


        /*
        * Events type
        * @static
        */
        EVENTS: {

        }

    });

    MathInteractives.global.Theme2.BoundedTooltip = MathInteractives.Common.Components.Theme2.Views.BoundedTooltip;
})(window.MathInteractives);
