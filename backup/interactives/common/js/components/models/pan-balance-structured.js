(function () {
    'use strict';

    /**
    * Conatins pan balance data
    * @class PanBalanceStructured
    * @construtor
    * @extends Backbone.Model
    * @namespace MathInteractives.Common.Components.Models
    */
    MathInteractives.Common.Components.Models.PanBalanceStructured = Backbone.Model.extend({

        defaults: function () {
            return {
                /*
                * Stores equations coefficients
                * @type Object
                * @default { a: 0, b: 0, c: 0 }
                */
                equationData: { a: 4, b: 11, c: -1 },

                /*
                * Draggable
                * @type Bool
                * @default false
                */
                isDraggable: false,

                /*
                * weather to show dispenser or not
                * @type Bool
                * @default false
                */
                enableDispenser: false,

                /*
                * Weather to fill the pan on generating
                * @type Bool
                * @default true
                */
                isFilled: true,

                /*
                * Stores Draggable items of dispensers
                * @type Array
                * @default []
                */
                dispenserData: [
                {
                    type: 'Var',
                    text: 'x',
                    value: 1,
                    isVarNegative: true
                },
                {
                    type: 'Num',
                    text: '1',
                    value: 1,
                    isVarNegative: true
                },
                {
                    type: 'Var',
                    text: 'x',
                    value: 0
                },
                {
                    type: 'Num',
                    text: '1',
                    value: 1
                }

                ],

                /* Stores weight of left pan
                * @type Number
                * @default 0
                */
                leftPanWeight: 0,

                /* 
                * Stores weight of right pan
                * @type Number
                * @default 0
                */
                rightPanWeight: 0,

                /* 
                * Stores Current Pans data ie left and right pan details
                * useful on restoring from save state
                * @type Object
                * @default null
                */
                currentPansData: null,

                /* 
                * weather to show x in pan
                * @type bool
                * @default true
                */
                showX: false,

                /* 
                * weather to show x in pan
                * @type bool
                * @default true
                */
                xValue: 0,

                /* 
                * prepend id 
                * @type string
                * @default ''
                */
                prependID: '',

                /**
                * A boolean to force animate pan-balance ignoring 'x' state
                *
                * @property forceAnimate
                * @type boolean
                * @default null
                */
                forceAnimate: false,

                /* 
                * weather to animation is in progress or not
                * @type bool
                * @default false
                * @property isAnimation
                */
                isAnimation: false,
                /* 
                * Stores initial rotate angle
                * @type object
                * @default {rotate:0}
                * @property stepRotateObject
                */
                stepRotateObject: { rotate: 0 },

                draggableVariableValue: 1,

                tabIndex: null,

                panTilesTabIndexes: new Object(),

                equationToModel: null,

                /* 
                * boolean for whether to add negative tiles or not
                * @type boolean
                * @default true
                * @property negativeTiles
                */
                negativeTiles:true

            }
        },

        /*
        * Stores value of X
        */
        xValue: null,

        /*
        * Initializes model
        * @method initialize
        */
        initialize: function initialize() {
            var equationData = this.getEquationData();
            var currentData = {
                left: {
                    a: equationData.a,
                    b: equationData.b,
                    c: 0

                }, right: {
                    a: 0,
                    b: 0,
                    c: equationData.c
                }
            }
            if (this.getCurrentPansData() === null) {
                this.setCurrentPansData(currentData);
            }

            this.on('change:xValue', $.proxy(this._xValueChange, this));

        },

        /*
        * Returns equation data
        * @public
        * @method getEquationData
        * @return
        */
        getEquationData: function getEquationData() {
            return this.get('equationData');
        },

        /*
        * sets equation data
        * @public
        * @method setEquationData
        */
        setEquationData: function setEquationData(equationData) {
            this.set('equationData', equationData);
        },

        /*
        * Returns Value of X data
        * @public
        * @method getXValue
        * @return
        */
        getXValue: function getXValue() {
            if (this.get('showX')) {
                return this.get('xValue');
            }
            else {
                return '<i>x</i>';
            }
        },


        /*
        * Returns bool for x to show
        * @public
        * @method getShowX
        * @return
        */
        getShowX: function getShowX() {
            return this.get('showX');
        },

        /*
        * sets bool for x to show
        * @public
        * @method setShowX
        * @return
        */
        setShowX: function setShowX(show) {
            this.set('showX', show);
            this.trigger('pan-showX-change');
        },

        /*
        * Sets Value of X data
        * @public
        * @method setXValue
        * @return
        */
        setXValue: function setXValue(xValue) {
            this.set('xValue', xValue);
        },

        /*
        * gets weight of left pan data
        * @public
        * @method getLeftPanWeight
        */
        getLeftPanWeight: function getLeftPanWeight() {
            return this.get('leftPanWeight');
        },

        /*
        * sets weight of left pan data
        * @public
        * @method setLeftPanWeight
        */
        setLeftPanWeight: function setLeftPanWeight(leftPanData) {
            var weight = leftPanData.a * this.get('xValue') + leftPanData.b;
            this.set('leftPanWeight', weight);
        },

        /*
        * gets weight of right pan data
        * @public
        * @method getRightPanWeight
        */
        getRightPanWeight: function getRightPanWeight() {
            return this.get('rightPanWeight');
        },

        /*
        * sets weight of right pan data
        * @public
        * @method setRightPanWeight
        */
        setRightPanWeight: function setRightPanWeight(rightPanData) {
            var weight = rightPanData.a * this.get('xValue') + rightPanData.b + rightPanData.c;
            this.set('rightPanWeight', weight);
        },

        /*
        * gets current pans data
        * @public
        * @method getCurrentPansData
        */
        getCurrentPansData: function getCurrentPansData() {
            return this.get('currentPansData');
        },

        /*
        * sets current pans data
        * @public
        * @method setCurrentPansData
        */
        setCurrentPansData: function setCurrentPansData(currentPansData) {
            this.set('currentPansData', currentPansData);

            this.setLeftPanWeight(currentPansData.left);
            this.setRightPanWeight(currentPansData.right);

            this.trigger('pan-data-change');
        },

        /*
        * returns Heavier Pan
        * @public
        * @method getHeavierPan
        */
        getHeavierPan: function (ignoreShowX) {
            var showX = ignoreShowX ? ignoreShowX : this.get('showX'),
                heavierPan = 'RIGHT';
            if (this.getLeftPanWeight() > this.getRightPanWeight()) {
                heavierPan = 'LEFT';
            }
            else if (this.getLeftPanWeight() === this.getRightPanWeight()) {
                heavierPan = 'CENTRE';
            }


            if (!this.getIsForceAnimation() && !showX) {
                heavierPan = 'CENTRE';
            }

            return heavierPan;
        },

        /*
        * event fires when x changes
        * @public
        * @method _xValueChange
        * @event
        */
        _xValueChange: function _xValueChange() {
            this.setCurrentPansData(this.getCurrentPansData());
        },

        setForceAnimate: function setForceAnimate(forceAnimate) {
            if (typeof (forceAnimate) === 'undefined') {
                this.set('forceAnimate', false);
                return;
            }
            this.set('forceAnimate', forceAnimate);

        },

        getIsForceAnimation: function getIsForceAnimation() {
            return this.get('forceAnimate');
        },

        setPanTilesTabIndexes: function setPanTilesTabIndexes(tabIndexes) {
            
            var tempObj = $.extend(true, {}, tabIndexes);
            this.set('panTilesTabIndexes', tempObj);
        },

        getPanTilesTabIndexes: function getPanTilesTabIndexes() {
            return this.get('panTilesTabIndexes');
        }


    });
})();