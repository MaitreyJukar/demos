(function () {
    'use strict';

    var virusDisplayClass = null;
    /**
    * Class for question-answer panel ,  contains properties and methods of question-answer panel
    * @class QuesAnsPanel
    * @module VirusZapper
    * @namespace MathInteractives.Interactivities.VirusZapper.Views
    * @extends MathInteractives.Common.Player.Views.Base
    * @type Object
    * @constructor
    */
    MathInteractives.Common.Interactivities.VirusZapper.Views.VirusDisplayAnimation = MathInteractives.Common.Player.Views.Base.extend({

        /**
        * Stores filepaths for resources , value set on initialize
        *   
        * @property filePath 
        * @type Object
        * @default null
        **/
        filePath: null,

        /**
        * Stores manager instance for using common level functions , value set on initialize
        *
        * @property manager 
        * @type Object
        * @default null
        **/
        manager: null,

        /**
        * Stores reference to player , value set on initialize
        * 
        * @property player 
        * @type Object
        * @default null
        **/
        player: null,

        /**
        * id-prefix of the interactive , value set on initialize
        * 
        * @property idPrefix 
        * @type String
        * @default null
        **/
        idPrefix: null,

        /**
        * Contains virus zapper class events.
        * 
        * @property virusZapperEvents 
        * @type object
        * @default null
        **/
        virusZapperEvents: null,

        /**
       * Contains virus data .
       * 
       * @property virusData 
       * @type Array
       * @default null
       **/
        virusData: null,

        /**
        * stores interactivityType value.
        * 
        * @property interactivityType 
        * @type number
        * @default null
        **/
        interactivityType: null,

        /**
        * Initializes question answer panel
        *
        * @method initialize
        * @public 
        **/
        template: {},
        virusCount: [],
        theme2NumberLineView: null,
        currentScale: null,
        animationStart: false,
        newLeftVirusMargin: [],
        newRightVirusMargin: [],
        position: [],
        index:null,
        $gridWrapper:null,
        validPositions: [],

        initialize: function () {
            this.player = this.model.get('player');
            this.filePath = this.player.getPath();
            this.manager = this.player.getManager();
            this.idPrefix = this.player.getIDPrefix();
            this.interactivityType = this.model.get('interactivityType');
            this.virusCount = [0, 0, 0, 0, 0];
            this.currentScale = 1;
            this.newLeftVirusMargin = [0, 0, 0, 0];
            this.newRightVirusMargin = [0, 0, 0, 0];
            this.virusData = [];
            this.position = [];
            this.validPositions = [];
            this.$gridWrapper = [];
            this.render();


        },

        /**
        * Renders the view.
        *
        * @method initialize
        * @public 
        **/
        render: function () {


            this.$gridWrapper = this.$el.find('.grid-wrapper');


            this.virusZapperEvents = MathInteractives.Common.Interactivities.VirusZapper.Views.VirusZapper.Events;
            var totalVirus = MathInteractives.Common.Interactivities.VirusZapper.Views.VirusDisplayAnimation.TOTAL_VIRUS;

            this.populateValidPositions();
            var virusIndex = 0;
            var currentEl = null;
            for (var index = 0; index < 3; index++) {
                 currentEl = this.$gridWrapper[index];
                this.virusData = [];
                this.virusCount = [0, 0, 0, 0, 0];
                this.virusCount
                this.generateGrid(currentEl, index);

                this.getVirusData();



                for (var i = 0; i < this.virusData.length; i++) {
                    
                    var currentVirus = this.virusData[i];
                    
                    this._placeVirus(currentVirus, virusIndex, index);
                    virusIndex += 1
                    
                    
                }
                this.virusfadeIn();
                this.attachEvent();
            }
        },

        virusfadeIn: function virusfadeIn() {
            var $virus = this.$('.virus');
            
            $virus.css({
                'opacity': '0'
            });
            var cnt = 0, timer = setInterval(function () {

                $virus.css('opacity', cnt);

                if (cnt > 1) {
                    $virus.css({
                        'opacity': '1'
                    });
                    clearInterval(timer)
                }

                cnt += 0.30;

            }, 50);
        },

        populateValidPositions: function populateValidPositions() {
            var temp1 = this.nQueen(0, 0, 8),
                temp2 = this.nQueen(0, 1, 8);
            this.validPositions[0] = this.nQueen(0, 3, 7);
            for (var i = 0; i < temp1.length; i++) {
                var tempArray = temp1.slice();
                tempArray.splice(i, 1);
                this.validPositions.push(tempArray);
            }
            for (var i = 0; i < temp2.length; i++) {
                var tempArray = temp2.slice();
                tempArray.splice(i, 1);
                this.validPositions.push(tempArray);
            }

        },



        attachEvent: function attachEvent() {
            var theme2NumberLine = MathInteractives.Common.Components.Theme2.Views.NumberLine;
            //this.theme2NumberLineView.model.off(theme2NumberLine.Events.ANIMATION_PROGRESS).on(theme2NumberLine.Events.ANIMATION_PROGRESS, $.proxy(this.moveViruses, this));
            this.model.off('animation-progress')
            .on('animation-progress', $.proxy(this.triggerMoveVirus, this));
            this.model.off('animation-complete')
            .on('animation-complete', $.proxy(this.triggerCreateVirus, this));
            this.model.off('fade-in-start')
            .on('fade-in-start', $.proxy(this.triggerFadeOutVirus, this));

        },
        triggerMoveVirus: function triggerMoveVirus(data) {

            if (data.pan === true) {

                this.moveViruses(data.minValue, data.maxValue, data.startVal, data.endVal);
            }
            else {
                this.zoomVirus();
            }
        },
        triggerCreateVirus: function triggerCreateVirus() {
            var self = this;
            self.createVirusOnFadeOut();
        },
        triggerFadeOutVirus: function triggerFadeOutVirus() {

            this.$('.grid-holder').fadeOut("slow", "linear");
        },



        generateGrid: function generateGrid(currentEl, index) {

            
            //for (var index = 0; index < 3; index++) {
            var options = { idPrefix: this.idPrefix },
             grid = [],
             gridRow = MathInteractives.Common.Interactivities.VirusZapper.Views.VirusDisplayAnimation.GRID_ROW_COUNT,
             gridCol = MathInteractives.Common.Interactivities.VirusZapper.Views.VirusDisplayAnimation.GRID_COLUMN_COUNT;

            for (var i = 0; i < gridRow; i++) {
                for (var j = 0; j < gridCol; j++) {
                    grid.push(
                    {
                        idPrefix: this.idPrefix,
                        gridRow: i,
                        gridCol: j,
                        cellNo: i + '-' + j,
                        counter: index
                    }
                    );
                }
            }

            this.grid1 = grid;
            grid = [];
            for (var i = 0; i < gridRow; i++) {
                for (var j = 0; j < gridCol; j++) {
                    grid.push(
                    {
                        idPrefix: this.idPrefix,
                        gridRow: i + 2,
                        gridCol: j,
                        cellNo: (i + 2) + '-' + j,
                        counter: index
                    }
                    );
                }
            }
            this.grid2 = grid;

            var templateData = {

                grid1: this.grid1,
                grid2: this.grid2,
                idPrefix: this.idPrefix,
                counter: index
            };

            $(currentEl).append(MathInteractives.Common.Interactivities.VirusZapper.templates.virusDisplay(templateData).trim());
        },


        nQueen: function nQueen(initialRow, initialCol, cnt) {

            var virusPosition = [],
                currentPosition = {};
            for (var row = 0; row < 4; row++) {
                this.position[row] = [];
                for (var col = 0; col < 4; col++) {
                    this.position[row][col] = false;
                }
            }

            this.position[initialRow][initialCol] = true;
            currentPosition.rowNo = initialRow;
            currentPosition.colNo = initialCol;
            virusPosition.push(currentPosition);

            var counter = 1;
            for (var row = 0; row < 4; row++) {
                for (var col = 0; col < 4; col++) {
                    if (this.position[row][col] === true) {
                        continue;
                    }
                    this.position[row][col] = this.checkValidPosition(row, col);
                    if (this.position[row][col] === true) {
                        counter++;
                        var currentPositionTemp = {};
                        currentPositionTemp.rowNo = row;
                        currentPositionTemp.colNo = col;
                        virusPosition.push(currentPositionTemp);
                        if (counter === cnt) {


                            return virusPosition;
                        }
                    }

                }
            }
            return null;
        },

        checkValidPosition: function checkValidPosition(row, col) {

            if (row !== 0) {
                if (this.position[row - 1][col] === true) {
                    return false;
                }
            }
            if (row < 3) {
                if (this.position[row + 1][col] === true) {
                    return false;
                }
            }
            if (col !== 0) {
                if (this.position[row][col - 1] === true) {
                    return false;
                }
            }
            if (col < 3) {
                if (this.position[row][col + 1] === true) {
                    return false;
                }
            }
            return true;
        },



        getVirusData: function getVirusData() {

            var randomIndex = this.getRandomNumber(0, 16),
            current = this.validPositions[randomIndex];
            this.virusData = current;

        },

        getRandomNumber: function getRandomNumber(min, max) {
            if (typeof min === 'undefined') {
                min = 0;
            }
            if (typeof max === 'undefined') {
                max = 1;
            }

            //// If no. is negative
            //if (min < 0) {
            //    // Randomly either return no. between min to 0 or continue for no. between 0 to max
            //    if (Math.round(Math.random()) === 1) {
            //        no = this.getRandomNumberBetween(0, -min);
            //        return -no;
            //    }
            //}
            // Generate rounded off no. between 0 to max
            var no = Math.round(max * Math.random());
            // If no. is less than minimum value recursively call function again
            if (no < min) {
                no = this.getRandomNumber(min, max);
            }
            return no;
        },


        _placeVirus: function _placeVirus(currentVirus, virusIndex, index) {
            
            var virusRowNo = currentVirus.rowNo,
                virusColumnNo = currentVirus.colNo,

                $virus = $('<div/>', { id: this.idPrefix + 'virus-' + virusIndex + '-' + index, class: 'virus' }),
                $virusWrapper = $('<div/>', { id: this.idPrefix + 'virus-wrapper-' + virusIndex + '-' + index, class: 'virus-wrapper' });

            $virus.append($virusWrapper);
            
            this.$('#' + this.idPrefix + 'grid-element-' + virusRowNo + '-' + virusColumnNo + '-' + index).append($virus);

            $virus.attr({ 'row': virusRowNo, 'col': virusColumnNo });

            var virusNo = this.generateCustomVirus(currentVirus, $virusWrapper, virusIndex, index);

            this.rotateVirus(virusIndex, index);
            //this.scaleVirus(virusIndex);  
        },



        generateCustomVirus: function generateCustomVirus(currentVirus, $virusWrapper, virusIndex, index) {
            var $virus,
                templateData = {
                    idPrefix: this.idPrefix,
                    templateType: this.template,
                    virusNo: virusIndex
                },
                template=this.template,
            virusCheck = this.getRandomNumber(1, 5);

            if (this.virusCount[virusCheck - 1] >= 2) {
                this.generateCustomVirus(currentVirus, $virusWrapper, virusIndex);
                return;
            }

            this.$('#' + this.idPrefix + 'virus-' + virusIndex+'-'+index).attr('virustype', virusCheck);
            switch (virusCheck) {
                case 1: template.Type1 = true;
                    this.virusCount[0]++;
                    break;
                case 2: template.Type2 = true;
                    this.virusCount[1]++;
                    break;
                case 3: template.Type3 = true;
                    this.virusCount[2]++;
                    break;
                case 4: template.Type4 = true;
                    this.virusCount[3]++;
                    break;
                case 5: template.Type5 = true;
                    this.virusCount[4]++;
                    break;
            }
            $virus = MathInteractives.Common.Interactivities.VirusZapper.templates.customVirus(templateData).trim();

            $virusWrapper.append($virus);
            template.Type1 = false;
            template.Type2 = false;
            template.Type3 = false;
            template.Type4 = false;
            template.Type5 = false;
            return virusCheck;

        },


        rotateVirus: function rotateVirus(virusNo, index) {
            var rotateDegree = null,
                plusOrMinus = -1;
            if (Math.random() > .5)
                plusOrMinus = 1;
            rotateDegree = this.getRandomNumber(0, 30);
            rotateDegree = rotateDegree * plusOrMinus;
            var scale = this.getRandomNumber(75, 100);
            scale = scale / 100;
            this.$('#' + this.idPrefix + 'virus-wrapper-' + virusNo + '-' + index).css({
                "-webkit-transform": "rotate(" + rotateDegree + "deg) scale(" + scale + ")",

                "-ms-transform": "rotate(" + rotateDegree + "deg) scale(" + scale + ")",
                "transform": "rotate(" + rotateDegree + "deg) scale(" + scale + ")"
            });
            

        },

        scaleVirus: function scaleVirus(virusNo) {
            var scale = this.getRandomNumber(75, 100);
            scale = scale / 100;
            $('#' + this.idPrefix + virusNo + '-svg-box').css({ "-webkit-transform": "scale(" + scale + ")", "transform": "scale(" + scale + ")", "msTransform": "scale(" + scale + ")", "-webkit-transform-origin": "50% 50%" })
        },



        moveViruses: function moveViruses(minVal, maxVal, startVal, endVal) {

            var centerVal = (startVal + endVal) / 2,
                thisRef = this,
                virusRowNo = null,
                currentCol = null,
                virusNewColumnNo = null,
                virusToAdd = 0,
                i = null,
                virusDataObj = null,
                newVirus = null,
                virusRowNum = null,
                $virus = null,
                virusColumnNo = null,
                virusOrigin=1392,
                currentVirusType = null,
                rightBorderVirus = this.$('.virus[col=3]'),
                leftBorderVirus = this.$('.virus[col=0]'),
                virusLeftPosition = parseInt(this.$el.css('margin-left')),
                animateMargin = this.$('.virus-wrapper').width(),
                signMargin = 1.5;
           

            if (minVal < centerVal) {
                if (signMargin < 0) {
                    signMargin = -signMargin;
                }
                virusLeftPosition = virusLeftPosition + (10 * signMargin);
                
                virusOrigin-=virusLeftPosition;

                this.$el.css({ 'margin-left': virusLeftPosition, '-webkit-transform-origin-x': virusOrigin });
                

            }
            else {
                if (signMargin > 0) {
                    signMargin = -signMargin;
                }
                virusLeftPosition = virusLeftPosition + (10 * signMargin);
                virusOrigin -= virusLeftPosition;
                this.$el.css({ 'margin-left': virusLeftPosition, '-webkit-transform-origin-x': virusOrigin });

            }


        },


        
        zoomVirus: function zoomVirus() {

            var thisRef = this;
            //virusClass = thisRef.$('.grid-holder');
            
            thisRef.currentScale += 0.05;
            thisRef.$el.css({
                '-webkit-transform': 'scale(' + this.currentScale + ')',
                '-moz-transform': 'scale(' + this.currentScale + ')',
                '-ms-transform': 'scale(' + this.currentScale + ')',
                'transform': 'scale(' + this.currentScale + ')'
            });
            

        },
        createVirusOnFadeOut: function createVirusOnFadeOut() {

            this.$el.css({
                '-webkit-transform': 'scale(1)',
                '-moz-transform': 'scale(1)',
                '-ms-transform': 'scale(1)',
                'transform': 'scale(1)'
            });
            this.$el.css({'margin-left':'0px'});
            this.$('.grid-holder').remove();
            this.virusCount = [0, 0, 0, 0, 0];
            this.virusData = [];
            this.validPositions = [];
            this.$gridWrapper = [];
            this.currentScale = 1;
            this.newLeftVirusMargin = [0, 0, 0, 0];
            this.newRightVirusMargin = [0, 0, 0, 0];
            this.animationStart = false;
            
            this.render();

        }





    },
{
    /**
    * total number of viruses 
    * @property TOTAL_VIRUS
    * @type Integer
    * @final
    **/
    TOTAL_VIRUS: 7,
    GRID_ROW_COUNT: 2,
    GRID_COLUMN_COUNT: 4,

    /**
    * Generates the grid for viruses
    * @method generateViruses
    * @param virusDisplayAnimationObj {Object} Model values to be passed to generate virus grid view
    * @return virusDisplayAnimationView {Object} Reference to the generated grid view
    * @public
    */
    generateViruses: function (virusDisplayAnimationObj) {
        if (virusDisplayAnimationObj) {

            var virusDisplayAnimationView, virusZapperModel, el;

            el = virusDisplayAnimationObj.containerId;

            delete virusDisplayAnimationObj.containerId;
            virusZapperModel = new MathInteractives.Common.Interactivities.VirusZapper.Models.VirusZapper(virusDisplayAnimationObj);
            virusDisplayAnimationView = new MathInteractives.Common.Interactivities.VirusZapper.Views.VirusDisplayAnimation({ model: virusZapperModel, el: el });
            return virusDisplayAnimationView;

        }
    }

});
    virusDisplayClass = MathInteractives.Common.Interactivities.VirusZapper.Views.VirusDisplayAnimation;
})()