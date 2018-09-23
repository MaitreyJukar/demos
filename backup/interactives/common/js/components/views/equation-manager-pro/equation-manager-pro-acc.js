(function (MathInteractives) {
    'use strict';

    var viewNameSpace = MathInteractives.Common.Components.Views.EquationManagerPro,
        modelClassNameSpace = MathInteractives.Common.Components.Models.EquationManagerPro;
    /*
	*
	*   This is the derived class from the common class of equation manger pro. basically used for interactive level validation.
	*
	* @class EquationManagerProAcc
	* @namespace MathInteractives.Common.Components.Views.EquationManagerProAcc
    * @extends MathInteractives.Common.Components.Views.EquationManagerPro
	* @constructor
	*/

    viewNameSpace.EquationManagerProAcc = viewNameSpace.EquationManagerPro.extend({

        firstTileAccId: null,
        
        lhsFocusDiv: null,

        rhsFocusDiv: null,

        leftTileArray: [],

        rightTileArray: [],

        leftTileIndex: -1,

        rightTileIndex: -1,

        lastTabIndex: 0,

        allElemIds: null,

        isCircularModeOn: false,
        $selectedTile: null,

        prevTileIndex: -1,

        contextMenuView: null,

        termTileContextMenuView: null,

        isSpaceKeyDown: false,

        tooltipData: {
            isTooltipVisible: false
        },

        exponentParenthesisView: null,

        termTileContextMenuAllIds: [],

        termTileContextMenuFirstId: [],

        binTileContextMenuFirstId: [],

        enableTabOnContainer: false,

        isMarqueeStep: false,

        isIgnoreCombine: null,

        fullExpressionSelected: false,

        ignoreIndexForTutorial: null,

        prevAccText: '',

        prevTileAccText: '',

        initialize: function () {
            viewNameSpace.EquationManagerProAcc.__super__.initialize.apply(this, arguments);
            this._attachAccEvents();
            this.loadScreen('miscellaneous-screen');
            this.binTileContextMenuFirstId.push(this.idPrefix + 'bin-tiles-context-menu-0');
        },

        render: function render() {
            viewNameSpace.EquationManagerProAcc.__super__.render.apply(this, arguments);
            // As EM is created again generate acc again
            this._updateTileArray();
            this._generateAccScreen();
            this.loadScreen('equation-manager-acc-screen');
            this._enableDisableTabOnBinTiles(false);
            this._createFocusDivs();
            this._bindKeyDownOnExpressions();
            this.attachLhsContFocusIn();
            this._createBinTilesContextMenu();
            this._createTermTilesContextMenu();
            this._setTermTileContextMenuAllIds();
            if (this.ignoreChangeSignForTextTile === true) {
                this._ignoreBinTileSignChangeRow(true);
            }
        },

        attachAccEvents: function attachAccEvents() {
            this._attachAccEvents();
        },

        _getAllLeafViews: function _getAllLeafViews(node) {

            var nodeArr = modelClassNameSpace.EquationManagerPro.Utils.getAllLeaves(node, true),
                nodeArrLength = nodeArr.length,
                viewArr = [];

            for (var i = 0; i < nodeArrLength; i++) {
                if (typeof nodeArr[i].data === 'object') {
                    viewArr.push(this.equationView.getViewFromNode(nodeArr[i]));
                }
                else {
                    // When it is an exponent - Store the parentheses as it is not available when exponent is clicked
                    viewArr.push('.parentheses-exponent');
                    this.exponentParenthesisView = this.equationView.getViewFromNode(nodeArr[i].parent);
                }
            }

            return viewArr;

        },
        _getPointForDummyMarquee: function _getPointForDummyMarquee(nodeArr) {

            var nodeArrLength = nodeArr.length,
                obj = {},
                view = null,
                viewPos = null,
                viewArr = [];

            for (var i = 0; i < nodeArrLength; i++) {
                viewArr.push(this.equationView.getViewFromNode(nodeArr[i]));
            }

            viewPos = viewArr[0].el.getBoundingClientRect();
            obj.top = viewPos.top;
            obj.left = viewPos.left;

            viewPos = viewArr[viewArr.length - 1].el.getBoundingClientRect();
            obj.bottom = viewPos.bottom;
            obj.right = viewPos.right;

            return obj;

        },


        _updateTileArray: function _updateTileArray(binArray, isSpacePressed) {
            this.leftTileArray = [];
            this.rightTileArray = [];

            this.leftTileArray = binArray ? binArray : this._getAllLeafViews(this.root.children[0]);
            if (!isSpacePressed) {
                this.rightTileArray = binArray ? binArray : this._getAllLeafViews(this.root.children[1]);
            }
        },

        _generateAccScreen: function _generateAccScreen() {

            var accScreen = {
                id: 'equation-manager-acc-screen',
                name: 'equation-manager-acc-screen'
            },

                id = this.$binTileContainment ? this._getAccId(this.$binTileContainment) : '',
                $tiles = null,
                tabIndex = this.tabIndex + 20,
                accDivOffset = this.accDivOffset,
                elementObj = null,
                $lhsExpression = null,
                $rhsExpression = null,
                tilesLength = 0,
                elements = [],
                allElemIds = [],
                accText = null,
                equationView = this.equationView;

            if (id !== '') {
                accText = this.getAccMessage('bin-section-text', 0);
                elements.push(this._createElementObj(id, tabIndex, accText));
                allElemIds.push(id);
                $tiles = this.$binTileContainment.find('.bin-tiles')
                tilesLength = $tiles.length;

                this.firstTileAccId = this._getAccId($($tiles[0]));

                for (var i = 0; i < tilesLength; i++) {
                    tabIndex = tabIndex + 5;
                    id = this._getAccId($($tiles[i]));
                    elements.push(this._createElementObj(id, tabIndex, $($tiles[i]).data('tilevalue')));
                    allElemIds.push(id);
                }
            }

            if (!this.onlyLHS) {
                id = this._getAccId(this.$equationCOntainer);
                allElemIds.push(id);
                tabIndex = tabIndex + 10;

                accText = this.getAccMessage('equation-reading-text', 0);
                elementObj = this._createElementObj(id, tabIndex, accText, accDivOffset);
                elements.push(elementObj);
            }

            $lhsExpression = this.$el.find('.lhs-expression-view');
            accText = equationView.tileViews[0].getAccString();

            accText = this._handleTSEmptySlot(accText);

            id = $lhsExpression ? this._getAccId($lhsExpression) : '';
            allElemIds.push(id);
            if (id !== '') {
                tabIndex = tabIndex + 20;
                if (this.onlyLHS === true) {
                    accText = this.getAccMessage('equation-reading-text', 7, [accText]);
                }
                else {
                    accText = this.getAccMessage('equation-reading-text', 2, [
                        this.getAccMessage('equation-reading-text', 4),
                        accText
                    ]);
                }
                elementObj = this._createElementObj(id, tabIndex, accText, accDivOffset);
                elements.push(elementObj);
            }

            if (equationView.tileViews[1]) {
                accText = equationView.tileViews[1].getAccString();
            }
            $rhsExpression = this.$el.find('.rhs-expression-view');
            id = $rhsExpression ? this._getAccId($rhsExpression) : '';
            allElemIds.push(id);
            if (id !== '') {
                tabIndex = tabIndex + 100;
                accText = this.getAccMessage('equation-reading-text', 2, [
                    this.getAccMessage('equation-reading-text', 5),
                    accText
                ]);
                elementObj = this._createElementObj(id, tabIndex, accText, accDivOffset);
                elements.push(elementObj);
            }

            accScreen.elements = elements;
            this.manager.model.parse([accScreen]);
            this.allElemIds = allElemIds;
            //this.updatefocusrectOfAllElems();
        },

        _handleTSEmptySlot: function _handleTSEmptySlot(accText) {

            var $lhsExpression = this.$el.find('.lhs-expression-view'),
                index = null,
                options = null;

            if ($lhsExpression.find('.drop-t-case-empty').length > 0) {
                // Bugfix #61694 - Paint like an ant - initial empty slot not being read as it does not have a view and getAccString methode does not return anything

                index = accText.indexOf(this.getAccMessage('operators-text', 2));
                options = {
                    isLHS: true,
                    operator: '*'
                }
                accText = accText.substr(0, index) + this._getDummyEmptySlotAccString(options) + ' ' + accText.substr(index);

            }

            return accText;
        },

        _getDummyEmptySlotAccString: function _getDummyEmptySlotAccString(options, avoidOperator) {

            var currentString = '',
                operator = options.operator,
                isLHS = options.isLHS;

            if (!avoidOperator) {
                switch (operator) {
                    case '*':
                        currentString += this.getAccMessage('operators-text', 0);
                        break;
                    case '+':
                        currentString += this.getAccMessage('operators-text', 1);
                        break;
                    case '/':
                        currentString += this.getAccMessage('operators-text', 2);
                        break;
                    default:
                        currentString += '';
                        break;
                }
            }

            //currentString += ' ' + this.getAccMessage('prefixed-statements', 6, [this.getAccMessage('equation-reading-text', isLHS ? 4 : 5)]);

            currentString += ' ' + this.getAccMessage('prefixed-statements', 13);    //Bugfix #65923

            return currentString;
        },


        updateFocusRectOfSpecificElem: function updateFocusRectOfSpecificElem(elemId) {
            this.updateFocusRect(elemId);
        },

        updatefocusrectOfAllElems: function updatefocusrectOfAllElems() {
            var counter = 0,
                setOfElems = this.allElemIds,
                endValue = setOfElems.length;

            for (; counter < endValue; counter++) {
                this.updateFocusRectOfSpecificElem(setOfElems[counter]);
            }
        },

        _bindKeyDownOnExpressions: function _bindKeyDownOnExpressions() {

            var $lhsExpr = this.$el.find('.lhs-expression-view'),
                $rhsExpr = this.$el.find('.rhs-expression-view'),
                self = this;

            if ($lhsExpr.length > 0) {
                $lhsExpr.off('.acc').on('keydown.acc', $.proxy(this._keydownHandler, this, true))
                        .on('keyup.acc', $.proxy(this._keyupHandler, this, true));

                this.focusOut('lhs-expression-view', function () {
                    self.removeHighlightTilesImmediate();
                });
            }

            if ($rhsExpr.length > 0) {
                $rhsExpr.off('.acc').on('keydown.acc', $.proxy(this._keydownHandler, this, false))
                        .on('keyup.acc', $.proxy(this._keyupHandler, this, false));

                this.focusOut('rhs-expression-view', function () {
                    self.removeHighlightTilesImmediate();
                });
            }

            this.focusOut('workspace-expression-area-equation-view', function () {
                self.removeHighlightTilesImmediate();
            });


        },

        _createFocusDivs: function _createFocusDivs() {

            var $lhsFocusDiv = $('<div>', { 'class': 'lhs-focus-div dummy-acc-focus-div' }),
                $rhsFocusDiv = $('<div>', { 'class': 'rhs-focus-div dummy-acc-focus-div' });

            $lhsFocusDiv.css(modelClassNameSpace.EquationManagerPro.FOCUS_DIV_STYLE);
            $rhsFocusDiv.css(modelClassNameSpace.EquationManagerPro.FOCUS_DIV_STYLE);

            this.$el.find('.lhs-expression-view-holder').append($lhsFocusDiv);
            this.$el.find('.rhs-expression-view-holder').append($rhsFocusDiv);

            this.lhsFocusDiv = $lhsFocusDiv;
            this.rhsFocusDiv = $rhsFocusDiv;

            $lhsFocusDiv.hide();
            $rhsFocusDiv.hide();

        },


        setTreeRoot: function setTreeRoot() {
            viewNameSpace.EquationManagerProAcc.__super__.setTreeRoot.apply(this, arguments);
            this._updateTileArray();
            this.trigger(viewNameSpace.EquationManagerPro.EVENTS.TREE_ROOT_SET, this.equationView.getAccString());
        },

        _keyupHandler: function _keyupHandler(left, event) {
            var KEY = viewNameSpace.EquationManagerPro.KEY,
                keyCode = event.keyCode ? event.keyCode : event.charCode;

            switch (keyCode) {
                case KEY.LEFTARROW:
                case KEY.RIGHTARROW:
                    if (this.getFirstTileDrop() === true && !this.onlyLHS) {
                        this._setDropSlotsForBinTiles();
                    }
                    break;
            }
        },



        _keydownHandler: function _keydownHandler(left, event) {

            var KEY = viewNameSpace.EquationManagerPro.KEY,
                currTilePos = null,
                $lhsExpr = this.$el.find('.lhs-expression-view'),
                $rhsExpr = this.$el.find('.rhs-expression-view'),
                keyCode = event.keyCode ? event.keyCode : event.charCode;

            switch (keyCode) {
                case KEY.LEFTARROW:
                    this._handleResizeOfContainer(true, event);

                    break;
                case KEY.RIGHTARROW:
                    this._handleResizeOfContainer(false, event);
                    break;

                case KEY.SPACE:
                    this.stopReading();
                    this.removeHighlightTilesImmediate();
                    if (!$(event.target).hasClass('dummy-acc-focus-div')) { //To Stop Propagation
                        this._updateTileArray();
                        this._bindKeyDownOnFocusDiv(left ? this.lhsFocusDiv : this.rhsFocusDiv, left);
                        this.lastTabIndex = this.getTabIndex(left ? this._getAccId($lhsExpr) : this._getAccId($rhsExpr));
                        this._goToNextTile(left, event);
                    }
                    break;
            }

        },

        _handleResizeOfContainer: function _handleResizeOfContainer(left, event) {

            var $equalSign = this.$el.find('.equals-sign-container'),
                isVisible = $('.equals-sign-container').is(':visible'),
                ui = {},
                $dragHandleContainment = this.$el.find('.drag-handle-containment'),
                counter = 10,
                isLHSFocused = event.target.id.indexOf('lhs') > -1,
                minLeft = isVisible ? $dragHandleContainment.position().left + counter : 400,
                maxLeft = isVisible ? minLeft + $dragHandleContainment.width() - $equalSign.width() - counter : 400;

            if (isVisible) {
                event.stopPropagation();    // To Prevent Browser Scroll
                event.preventDefault();

                ui.helper = $equalSign;
                ui.position = $equalSign.position();


                if (left) {
                    if (ui.position.left < minLeft) {
                        this._setResizeAccText({
                            isLHSFocused: isLHSFocused,
                            leftKeyPressed: left,
                            limitReached: true
                        });
                        return;
                    }
                    ui.position.left -= counter;
                }
                else {
                    if (ui.position.left > maxLeft) {
                        this._setResizeAccText({
                            isLHSFocused: isLHSFocused,
                            leftKeyPressed: left,
                            limitReached: true
                        });
                        return;
                    }
                    ui.position.left += counter;
                }

                this._handleDragHandler(event, ui);
                if (left) {
                    $equalSign.css({ 'left': $equalSign.position().left - counter });
                }
                else {
                    $equalSign.css({ 'left': $equalSign.position().left + counter });
                }
                this._setResizeAccText({
                    isLHSFocused: isLHSFocused,
                    leftKeyPressed: left,
                    limitReached: false
                });
                this.updateFocusRect(this._getAccId(this.$lhsExprView));
                this.updateFocusRect(this._getAccId(this.$rhsExprView));
                if (this.getFirstTileDrop() === true) {
                    this._setDropSlotsForBinTiles();
                }
            }


        },

        /**
        * Sets the resized container's accessibility text to be read out.
        *
        * @method _setResizeAccText
        * @param options {Object} A single object to pass a number of parameters to the method.
        * @param options.isLHSFocused {Boolean} True, if the LHS was focused; else false.
        * @param options.leftKeyPressed {Boolean} True, if the user pressed left key to resize the container. False, if
        * the user pressed right key.
        * @param options.limitReached {Boolean} True, if the container can't be resized as it's upper or lower limit is
        * reached.
        * @private
        */
        _setResizeAccText: function _setResizeAccText(options) {
            var isLHSFocused = options.isLHSFocused,
                leftKeyPressed = options.leftKeyPressed,
                resizeLimitReached = options.limitReached,
                accId, accText, expressionString;
            if (isLHSFocused) {
                accId = this._getAccId(this.$lhsExprView);
                expressionString = this.getAccMessage('equation-reading-text', 4);
                if (leftKeyPressed) {
                    if (resizeLimitReached) { // LHS min width reached
                        accText = this.getAccMessage('equation-reading-text', 18);
                    }
                    else {  // LHS width decreased
                        accText = this.getAccMessage('equation-reading-text', 16, [expressionString]);
                    }
                }
                else {
                    if (resizeLimitReached) { // LHS max width reached
                        accText = this.getAccMessage('equation-reading-text', 17);
                    }
                    else {  // LHS width increased
                        accText = this.getAccMessage('equation-reading-text', 15, [expressionString]);
                    }
                }
            }
            else {
                accId = this._getAccId(this.$rhsExprView);
                expressionString = this.getAccMessage('equation-reading-text', 5);
                if (leftKeyPressed) {
                    if (resizeLimitReached) { // RHS max width reached
                        accText = this.getAccMessage('equation-reading-text', 17);
                    }
                    else {  // RHS width increased
                        accText = this.getAccMessage('equation-reading-text', 15, [expressionString]);
                    }
                }
                else {
                    if (resizeLimitReached) { // RHS min width reached
                        accText = this.getAccMessage('equation-reading-text', 18);
                    }
                    else {  // RHS width decreased
                        accText = this.getAccMessage('equation-reading-text', 16, [expressionString]);
                    }
                }
            }

            if (accText === this.prevAccText && accText !== '') {
                this.prevAccText = accText + " ";
            } else {
                this.prevAccText = accText;
            }
            this.setAccMessage(accId, this.prevAccText);
            this.setFocus(this._getAccId(this.$equationCOntainer));
            this.setFocus(accId);
            isLHSFocused ? this._setLHSAccText() : this._setRHSAccText();
        },

        _bindKeyDownOnFocusDiv: function _bindKeyDownOnFocusDiv(div, left) {
            $(div).off('keydown.focusDiv').on('keydown.focusDiv', $.proxy(this._keyDownOnFocusDiv, this, left));
            $(div).off('keyup.focusDiv').on('keyup.focusDiv', $.proxy(this._keyUpOnFocusDiv, this, left));

        },

        _keyDownOnFocusDiv: function _keyDownOnFocusDiv(left, event) {


            var KEY = viewNameSpace.EquationManagerPro.KEY;

            switch (event.which) {
                case KEY.LEFTARROW:
                case KEY.RIGHTARROW:
                    event.stopPropagation();
                    event.preventDefault();
                    if (!this.$selectedTile) {
                        this.handleMarqueeAcc(event, left);
                    }
                    break;

                case KEY.ESCAPE:
                    this._handleEscapeOnFocusDiv(left);
                    this.isIgnoreCombine = false;
                    break;

                case KEY.TAB:
                    this.stopReading();
                    this.removeHighlightTilesImmediate();
                    this._goToNextTile(left, event);
                    break;
                case KEY.SPACE:
                    if (!event.shiftKey) {
                        this.stopReading();
                        this.removeHighlightTilesImmediate();
                        this._handleSpaceOnFocusDiv(left, event);
                    }
                    break;
            }


        },

        _keyUpOnFocusDiv: function _keyUpOnFocusDiv(left, event) {

            var KEY = viewNameSpace.EquationManagerPro.KEY;

            switch (event.which) {

                case KEY.SPACE:
                    this.stopReading();
                    this.removeHighlightTilesImmediate();
                    this.isSpaceKeyDown = false;
                    break;
            }


        },

        _handleSpaceOnFocusDiv: function _handleSpaceOnFocusDiv(left, event) {

            var droppableView = left ? this.leftTileArray[this.leftTileIndex] : this.rightTileArray[this.rightTileIndex],
                currTilePos = null,
                $selectedTile = null,
                $selectedTileEl = null,
                accTextOptions = null,
                fromAcc;

            if (!this.isSpaceKeyDown) {

                if (event) {
                    event.stopPropagation();
                    event.preventDefault();
                }

                this.isSpaceKeyDown = true;

                if (this.$selectedTile) {
                    //Dropping of Tile

                    if (this.$selectedTile.model && this.$selectedTile.model.get('type') !== modelClassNameSpace.TileItem.TileType.BIN_TILE) {

                        // Drop tile in the expression
                        this._handleTileDropInExpression(event, left);
                        this._updateTileArray();
                    }
                    else {
                        //Dropped bin tile

                        if (this.getTileAddedInExpression() === null) {
                            //First Drop of bin tile
                            this._droppedTileFromBin(event, droppableView, left);
                        }
                        else {
                            //Second Drop of Bin tile
                            //Dropped on Null tile
                            fromAcc = {
                                target: this.$selectedTile,
                                tilevalue: isNaN(+this.$selectedTile.attr('data-tilevalue')) ?
                                this.$selectedTile.attr('data-tilevalue') :
                                +this.$selectedTile.attr('data-tilevalue'),
                                "cur-draggable": this.$selectedTile,
                                tiletype: modelClassNameSpace.TileItem.TileType.BIN_TILE,
                            };
                            droppableView.onTileDrop(event, null, fromAcc);
                        }
                        accTextOptions = { binTileDrop: true, left: left };
                    }

                    this._setFocus(accTextOptions);
                    this._resetParametersOnFocusOutOfLastElement();
                    this.$selectedTile = null;
                    this.prevTileIndex = -1;

                }
                else {
                    //Dragging of Tile from Expression


                    $selectedTile = this.marqueeSelectedItems.length > 0 ? this.marqueeSelectedItems[0] : (left ? this.leftTileArray[this.leftTileIndex] : this.rightTileArray[this.rightTileIndex]);
                    $selectedTileEl = $selectedTile instanceof Backbone.View ? $selectedTile.$el : $($selectedTile);

                    if (!(this.fullExpressionSelected && this.onlyLHS)) {
                        if ($selectedTileEl.is('.ui-draggable') || this.marqueeSelectedItems.length > 0) {
                            this.$selectedTile = $selectedTile;
                            this.prevTileIndex = left ? this.leftTileIndex : this.rightTileIndex;    //Use if Focus Must Go Back to Previous Tile
                            this._bindKeyDownOnFocusDiv(event.currentTarget, left);
                            this.lastTabIndex = this.getTabIndex(left ? this._getAccId(this.$lhsExprView) : this._getAccId(this.$rhsExprView));
                            this.leftTileIndex = -1;
                            this.rightTileIndex = -1;

                            if (this.$binTileContainment) {
                                this.isCircularModeOn = true;
                                //Add null operator in alternate expression
                                if (!left) {
                                    this.leftTileArray.unshift('.null-operator-container');
                                }
                                else {
                                    this.rightTileArray.unshift('.null-operator-container');
                                }

                            }
                            else {
                                this.isCircularModeOn = false;
                            }

                            this._goToNextTile(left, event);
                        }
                    }
                    else {
                        this.isSpaceKeyDown = false;
                    }
                }
            }
        },

        _handleEscapeOnFocusDiv: function _handleEscapeOnFocusDiv(left) {

            var index = this.prevTileIndex !== -1 ? this.prevTileIndex : (left ? this.leftTileIndex : this.rightTileIndex),
                isMarqueeLeft = null,
                dropOnLeft = null,
                $selectedTile = null;

            if (this.marqueeNodes.length > 0) {

                if (this.prevTileIndex !== -1) {
                    //When Marquee is selected
                    this._handleFocusOutOnFocusDiv(left);
                    isMarqueeLeft = this.marqueeNodes[0].getPath()[0] === 0;
                    //To Fix Tab from Last Element
                    if (isMarqueeLeft) {
                        this.leftTileIndex = this.prevTileIndex;
                    }
                    else {
                        this.rightTileIndex = this.prevTileIndex;
                    }
                    this.$selectedTile = null;
                    this._setPositionOfFocusDiv(this.getMarqueeDiv(isMarqueeLeft), isMarqueeLeft);
                }
                else {
                    // When marquee is not selected

                    this.removeMarquee();
                    this._setPositionOfFocusDiv(left ? this.leftTileArray[index].$el : this.rightTileArray[index].$el, left);

                }
            }
            else {

                this._handleFocusOutOnFocusDiv(left);
                if (this.$selectedTile) {
                    // When tile is selected on space and then escape

                    $selectedTile = this.$selectedTile instanceof Backbone.View ? this.$selectedTile.$el : this.$selectedTile;


                    if (($selectedTile.data('tiletype') !== modelClassNameSpace.TileItem.TileType.BIN_TILE)) {
                        dropOnLeft = $selectedTile.parents('.lhs-expression-view').length > 0;


                        if (dropOnLeft) {
                            this.leftTileIndex = this.prevTileIndex;
                        }
                        else {
                            this.rightTileIndex = this.prevTileIndex;
                        }
                        this.$selectedTile = null;
                        this._setPositionOfFocusDiv(dropOnLeft ? this.leftTileArray[index].$el : this.rightTileArray[index].$el, dropOnLeft);
                    }
                    else {
                        this._handleBinTileFocus(left, event, $selectedTile);
                    }
                }
                else {
                    //When tile is not selected
                    this._setFocusOnExpression(left);
                    this._resetParametersOnFocusOutOfLastElement();
                }
            }
            this.isCircularModeOn = false;
            this.$selectedTile = null;
            this.prevTileIndex = -1;
            this._showHideDropslots(this.equationView.$el, false);
            this._updateTileArray();

        },

        _handleTileDropInExpression: function _handleTileDropInExpression(event, left) {

            var droppedOn = left ? this.leftTileArray[this.leftTileIndex] : this.rightTileArray[this.rightTileIndex],
                expression = left ? this.equationView.tileViews[0] : this.equationView.tileViews[1],
                selectedTile = this.$selectedTile, fromAcc = null;

            if (droppedOn !== ".parentheses-exponent") {
                if (typeof droppedOn === 'string') {
                    //Dropped on Operator
                    fromAcc = {
                        target: expression.$el.find(droppedOn),
                        tilevalue: this.$selectedTile.model.get('base'),
                        "cur-draggable": this.$selectedTile,
                        length: this.marqueeSelectedItems.length
                    }
                    expression.onDropOperator(event, null, fromAcc);
                }
                else {
                    //Dropped on tile

                    fromAcc = {
                        tilevalue: this.$selectedTile.model.get('base'),
                        "cur-draggable": this.$selectedTile,
                        length: this.marqueeSelectedItems.length
                    }
                    droppedOn.onTileDrop(event, null, fromAcc);

                }
            }
            this._resetParametersOnFocusOutOfLastElement();

            if (!this.onlyLHS) {
                this._setFocus();
            }
        },

        _setFocus: function _setFocus(options) {
            options = options || {};
            var tooltipData = this.tooltipData,
                equationViewAccId = this.onlyLHS ? this._getAccId(this.$lhsExprView) : this._getAccId(this.$equationCOntainer),
                equationView = this.equationView,
                operationPerformed = null,
                operators = modelClassNameSpace.TileItem.OPERATORS,
                equationString = this._getContainerText() ,//equationView.getAccString(),
                droppedTileText, expressionSide,
                accString;

            if (!tooltipData.isTooltipVisible && !this.player.getModalPresent()) {
                if (!this.isMarqueeStep) {
                    this.removeMarquee();
                }
                accString = equationString;
                if (options.binTileDrop) {
                    operationPerformed = this.model.get('operationPerformed');
                    droppedTileText = this._getTileText(this.$selectedTile).replace(this.getAccMessage('equation-reading-text', 9), '');
                    expressionSide = this.getAccMessage('equation-reading-text', options.left ? 4 : 5);
                    if (operationPerformed.operation === operators.ADDITION) { // added
                        accString = this.getAccMessage('prefixed-statements', 7, [droppedTileText, expressionSide, equationString]);
                    }
                    else if (operationPerformed.isDenominator) { // divided
                        accString = this.getAccMessage('prefixed-statements', 9, [expressionSide, droppedTileText, equationString]);
                    }
                    else { // multiplied
                        accString = this.getAccMessage('prefixed-statements', 8, [droppedTileText, expressionSide, equationString]);
                    }
                }
                else if (options.resetClicked) {
                    accString = this.getAccMessage('equation-reading-text', 1, [equationString]);
                }

                this.setAccMessage(equationViewAccId, accString);

                this._setLHSAccText();
                this._setRHSAccText();


                this.setFocus(equationViewAccId);
                this.trigger(viewNameSpace.EquationManagerPro.EVENTS.FOCUS_SET_LHS);
                if (options.binTileDrop || options.resetClicked) {
                    this.setAccMessage(equationViewAccId, equationString);
                }
            }
            else {
                this._showHideDropslots(this.equationView.$el, false);
            }


        },

        _getContainerText:function _getContainerText(){
            var equationView = this.equationView.tileViews,
                accText = null;

            accText = this._handleTSEmptySlot(equationView[0].getAccString());

            if (equationView[1]) {
                accText +=  this.getAccMessage('prefixed-statements', 0) + equationView[1].getAccString();
            }

            return accText;
        },

        _getAccId: function _getAccId($elem) {
            return $elem && $elem.attr('id') ? $elem.attr('id').split(this.idPrefix)[1] : '';
        },

        /**
        * Sets the LHS expression's readable text string for JAWS.
        *
        * @method _setLHSAccText
        * @private
        */
        _setLHSAccText: function _setLHSAccText() {
            var accString = this.equationView.tileViews[0].getAccString();
            if (this.onlyLHS === true) {
                accString = this.getAccMessage('equation-reading-text', 7, [accString]);
            } else {
                accString = this.getAccMessage('equation-reading-text', 4) + '. ' + accString;
            }

            this.setAccMessage(this._getAccId(this.$lhsExprView), this._handleTSEmptySlot(accString));
        },

        /**
        * Sets the RHS expression's readable text string for JAWS.
        *
        * @method _setLHSAccText
        * @private
        */
        _setRHSAccText: function _setRHSAccText() {
            var equationView = this.equationView,
                accString;
            if (equationView.tileViews.length > 1) {
                accString = equationView.tileViews[1].getAccString();
                this.setAccMessage(this._getAccId(this.$rhsExprView), this.getAccMessage('equation-reading-text', 5) + '.' + accString);
            }
        },

        _setFocusOnExpression: function _setFocusOnExpression(left) {
            this.setFocus(left || this.onlyLHS ? this._getAccId(this.$lhsExprView) : this._getAccId(this.$rhsExprView));
        },

        setFocusOnPreviousElement: function setFocusOnPreviousElement(event) {

            var tooltipData = this.tooltipData,
                $selectedTile = tooltipData.selectedTile,
                $selectedTileEL = $selectedTile instanceof Backbone.View ? $selectedTile.$el : $selectedTile,
                prevTileIndex = tooltipData.lastIndex,
                left = null;


            this._resetParametersOnFocusOutOfLastElement();

            if ($selectedTile) {
                this.isSpaceKeyDown = false;
                if ($selectedTileEL.data('tiletype') === modelClassNameSpace.TileItem.TileType.BIN_TILE) {
                    this._enableDisableTabOnBinTiles(true);
                    this.setFocus(this._getAccId($selectedTile));
                }
                else {

                    if ($selectedTileEL.parents('.lhs-expression-view').length > 0) {
                        this.leftTileIndex = prevTileIndex;
                        left = true;
                    }
                    else if ($selectedTileEL.parents('.rhs-expression-view').length > 0) {
                        this.rightTileIndex = prevTileIndex;
                        left = false;
                    }

                    if (tooltipData.isMarquee) {
                        this._setPositionOfFocusDiv(this.getMarqueeDiv(left), left, {
                            isMarquee: true
                        });
                    }
                    else {
                        this._setPositionOfFocusDiv($selectedTileEL, left);

                    }

                }

                this.prevTileIndex = -1;
                this.$selectedTile = null;

                this.tooltipData = {
                    isTooltipVisible: false
                };
            }

        },

        /*********************************** Enable Disable Tab Functions Start ************************************/

        enableDisableTabOnEquationContainer: function enableDisableTabOnEquationContainer(enable) {
            this.enableTab(this._getAccId(this.$equationCOntainer), enable);
        },

        enableDisableTabOnLHSContainer: function enableDisableTabOnLHSContainer(enable) {
            this.enableTab(this._getAccId(this.$lhsExprView), enable);
        },

        enableDisableTabOnRHSContainer: function enableDisableTabOnRHSContainer(enable) {
            this.enableTab(this._getAccId(this.$rhsExprView), enable);
        },

        enableDisableTabOnBinContainement: function enableDisableTabOnBinContainement(enable) {
            this.enableTab(this._getAccId(this.$binTileContainment), enable);
        },

        enableDisableTabAllBinTiles: function enableDisableTabAllBinTiles(enable) {
            this._enableDisableTabOnBinTiles(enable);
        },

        enableDisableBinTile: function enableDisableBinTile($id, enable) {
            this.enableTab(this._getAccId($id), enable);
        },

        enableDisableTabOnAllContainers: function enableDisableTabOnAllContainers(enable) {
            this.enableDisableTabOnEquationContainer(enable);
            this.enableDisableTabOnLHSContainer(enable);
            this.enableDisableTabOnRHSContainer(enable);
            this.enableDisableTabOnBinContainement(enable);
            this.enableDisableTabAllBinTiles(enable);
        },

        _enableDisableTabOnBinTiles: function _enableDisableTabOnBinTiles(enable) {

            if (this.$binTileContainment) {
                var $tiles = this.$binTileContainment.find('.bin-tiles'),
                    $tile = null,
                    tilesLength = $tiles.length,
                    isFirstEnabledTile = false;

                this.firstTileAccId = null;

                for (var i = 0; i < tilesLength; i++) {
                    $tile = $($tiles[i]);

                    if ((enable === true) && ($tile.hasClass('disable') === false)) {
                        this.enableDisableBinTile($tile, true);

                        if (!isFirstEnabledTile) {
                            this.firstTileAccId = this._getAccId($tile);
                            isFirstEnabledTile = true;
                        }
                    }
                    else {
                        this.enableDisableBinTile($tile, false);
                    }
                }
            }
        },

        /*********************************** Enable Disable Tab Functions End ************************************/



        _droppedTileFromBin: function _droppedTileFromBin(event, droppableView, isLHS) {
            var expression = isLHS ? this.equationView.tileViews[0] : this.equationView.tileViews[1], data = {}, index,
                result,
                fromAcc = {
                    target: expression.$el.find(droppableView),
                    tilevalue: isNaN(+this.$selectedTile.attr('data-tilevalue')) ? this.$selectedTile.attr('data-tilevalue') : +this.$selectedTile.attr('data-tilevalue'),
                    tiletype: modelClassNameSpace.TileItem.TileType.BIN_TILE,
                    "cur-draggable": this.$selectedTile
                };

            if (droppableView === '.null-operator-container') {
                // add tile with addition
                expression.onDropOperator(event, null, fromAcc);
            }
            else if (droppableView === '.virtual-numerator' || droppableView.indexOf('.virtual-denominator') || droppableView.indexOf('.absolute-denominator')) {
                // add tile with multiplication or division
                expression.onTileDrop(event, null, fromAcc);
            }

        },

        _resetParametersOnFocusOutOfLastElement: function _resetParametersOnFocusOutOfLastElement() {

            this.lhsFocusDiv.hide();
            this.rhsFocusDiv.hide();
            this.rightTileIndex = -1;
            this.leftTileIndex = -1;
            this.isCircularModeOn = false;
            this.$selectedTile = null;
        },

        _goToNextTile: function _goToNextTile(left, event) {

            var KEY = viewNameSpace.EquationManagerPro.KEY,
                currTilePos = null, view = null,
                $selectedTile;

            if (!this.$selectedTile) {
                this.removeMarquee();
            }

            this._showHideDropslots(this.equationView.$el, false);

            if (left) {

                if (event && event.shiftKey) {
                    do {
                        this.leftTileIndex--;
                    } while (this._checkLimit(left, false));
                }
                else {
                    do {
                        this.leftTileIndex++;
                    } while (this._checkLimit(left, true));
                }

                if (this._getEndCondition(left, true)) {
                    // End circular from last tile
                    this.isCircularModeOn = false;
                }

                if (this.leftTileIndex >= 0 && this.leftTileIndex < this.leftTileArray.length) {
                    if (event) {
                        event.stopPropagation();
                        event.preventDefault();
                    }
                    view = this.leftTileArray[this.leftTileIndex];
                    currTilePos = typeof view === 'string' ? this.$lhsExprView.find(view) : view.$el;
                    this._currentFocusedElement(view, left);
                    this._setPositionOfFocusDiv(currTilePos, left);
                }
                else if (this._getEndCondition(left, false)) {
                    //Handle shift tab from first element of left div
                    $selectedTile = this.$selectedTile instanceof Backbone.View ? this.$selectedTile.$el : this.$selectedTile;
                    if (($selectedTile.data('tiletype') !== modelClassNameSpace.TileItem.TileType.BIN_TILE)) {
                        event.stopPropagation();
                        event.preventDefault();
                        this._updateTileArray();
                        this.leftTileIndex = this.prevTileIndex;
                        this.prevTileIndex = -1;
                        this.rightTileIndex = -1;
                        this.$selectedTile = null;
                        this.isCircularModeOn = false;
                        this._goToNextTile(true, event);
                    }
                    else {
                        this._handleBinTileFocus(left, event);
                    }
                }
                else {

                    if (!(this.fullExpressionSelected && this.onlyLHS && event.which === KEY.SPACE)) { // Bugfix #61533 - Focus must not go on conatainer in Test solution when whole expression is selected
                        if (!this.isCircularModeOn) {
                            if (event.shiftKey) {    //To Fix shift Tab from first element the focus must be on its container when tile is not selected
                                event.stopPropagation();
                                event.preventDefault();
                            }
                            this.removeMarquee();
                            this.$selectedTile = null;
                            this._updateTileArray();

                            if (this.prevTileIndex !== -1 && this.rightTileArray.length > 0 && this.prevTileIndex !== this.rightTileArray.length - 1) {
                                event.stopPropagation();
                                event.preventDefault();
                                this.rightTileIndex = this.prevTileIndex;
                                this.prevTileIndex = -1;
                                this.leftTileIndex = -1;
                                this.$selectedTile = null;
                                this._goToNextTile(false, event);
                            }
                            else {
                                /* If a tile is selected then send focus on next container or else on same container -
                                as default is not prevented one more tab will get fired*/
                                this._setFocusOnExpression(this.prevTileIndex === -1);
                            }
                        }

                        this._handleFocusOutOnFocusDiv(left);

                        if (this.isCircularModeOn) {
                            $selectedTile = this.$selectedTile instanceof Backbone.View ? this.$selectedTile.$el : this.$selectedTile;
                            if (event && $selectedTile.data('tiletype') !== modelClassNameSpace.TileItem.TileType.BIN_TILE) {
                                event.stopPropagation();
                                event.preventDefault();
                            }
                            this.rhsFocusDiv.show();
                            this._bindKeyDownOnFocusDiv(this.rhsFocusDiv, false);

                            this.rightTileIndex = !event.shiftKey ? -1 : this.rightTileArray.length;
                            this._goToNextTile(false, event);

                        }
                    }
                    else {
                        this.$selectedTile = null;  //Bugfix #65940 - Empty selected tile when whole expression is selected in test solution
                    }
                }
            }
            else {
                if (event && event.shiftKey) {
                    do {
                        this.rightTileIndex--;
                    } while (this._checkLimit(left, false))
                }
                else {
                    do {
                        this.rightTileIndex++;
                    } while (this._checkLimit(left, true));
                }

                if (this._getEndCondition(left, true)) {
                    //Handle Tab from right div last element
                    this.isCircularModeOn = false;
                    $selectedTile = this.$selectedTile instanceof Backbone.View ? this.$selectedTile.$el : this.$selectedTile;
                    if (($selectedTile.data('tiletype') === modelClassNameSpace.TileItem.TileType.BIN_TILE)) {
                        this._handleBinTileFocus(left, event);
                        this._resetParametersOnFocusOutOfLastElement();
                        this.$selectedTile = null;
                        return;
                    }
                }

                if (this.rightTileIndex >= 0 && this.rightTileIndex < this.rightTileArray.length) {
                    if (event) {
                        event.stopPropagation();
                        event.preventDefault();
                    }
                    view = this.rightTileArray[this.rightTileIndex];
                    currTilePos = typeof view === 'string' ? this.$rhsExprView.find(view) : view.$el;
                    this._currentFocusedElement(view, left);
                    this._setPositionOfFocusDiv(currTilePos, left);
                }
                else if (this._getEndCondition(left, false)) {
                    //Handle shift tab from first element of same div
                    event.stopPropagation();
                    event.preventDefault();

                    this._updateTileArray();
                    this.rightTileIndex = this.prevTileIndex;
                    this.prevTileIndex = -1;
                    this.leftTileIndex = -1;
                    this.$selectedTile = null;
                    this.isCircularModeOn = false;
                    this._goToNextTile(false, event);

                }
                else {
                    if (!this.isCircularModeOn) {
                        if (event.shiftKey) {   //To Fix shift Tab from first element the focus must be on its container when tile is not selected
                            event.stopPropagation();
                            event.preventDefault();
                        }
                        this.removeMarquee();
                        this.$selectedTile = null;
                        this._updateTileArray();

                        if (this.prevTileIndex !== -1 && this.leftTileArray.length > 0 && this.prevTileIndex !== this.leftTileArray.length - 1) {
                            event.stopPropagation();
                            event.preventDefault();
                            this.leftTileIndex = this.prevTileIndex;
                            this.prevTileIndex = -1;
                            this.rightTileIndex = -1;
                            this.$selectedTile = null;
                            this._goToNextTile(true, event);
                        }
                        else {
                            this._setFocusOnExpression(this.prevTileIndex !== -1);
                        }
                    }

                    this._handleFocusOutOnFocusDiv(left);

                    if (this.isCircularModeOn) {
                        $selectedTile = this.$selectedTile instanceof Backbone.View ? this.$selectedTile.$el : this.$selectedTile;
                        if (event && $selectedTile.data('tiletype') !== modelClassNameSpace.TileItem.TileType.BIN_TILE) {
                            event.stopPropagation();
                            event.preventDefault();
                        }

                        this.lhsFocusDiv.show();
                        this._bindKeyDownOnFocusDiv(this.lhsFocusDiv, true);
                        this.leftTileIndex = !event.shiftKey ? -1 : this.leftTileArray.length;
                        this._goToNextTile(true, event);

                    }
                }
            }
        },

        _handleBinTileFocus: function _handleBinTileFocus(left, event, $tile) {

            var $tile = $tile || this._getNextPrevEnabledTile(left),
                index = -1;

            this._updateTileArray();
            index = this.numericTileArray.indexOf(this.$selectedTile.data('tilevalue'));

            if ($tile.data('tiletype') !== modelClassNameSpace.TileItem.TileType.BIN_TILE) {

                //Set Focus on same tile and rest is handled as event propagation is not stopped in this case

                this.enableTab(this._getAccId(this.$selectedTile), true);   //Enable Tab as in some cases the selected tile does not have tab index
                this.setFocus(this._getAccId(this.$selectedTile));
                // this.enableTab(this._getAccId(this.$selectedTile), false);  //Again disable Tab as the event has propagated and no now longer the bin can tak tab
            }
            else {
                event.stopPropagation();
                event.preventDefault();
                this._enableDisableTabOnBinTiles(true);
                this.setFocus(this._getAccId($tile));
            }

            this._resetParametersOnFocusOutOfLastElement();
            this.prevTileIndex = -1;
            this.$selectedTile = null;
        },

        _getNextPrevEnabledTile: function _getNextPrevEnabledTile(left) {

            var $nextTile = this.$selectedTile;

            while (true) {

                if (left) {
                    $nextTile = $nextTile.prev();
                }
                else {
                    $nextTile = $nextTile.next();
                }

                if ($nextTile.data('tiletype') !== modelClassNameSpace.TileItem.TileType.BIN_TILE ||
                    (!$nextTile.hasClass('disable'))) {
                    break;
                }
            }

            return $nextTile;
        },

        _getEndCondition: function _getEndCondition(left, upperLimit) {

            var array = left ? this.leftTileArray : this.rightTileArray,
                arrayLength = array.length,
                index = left ? this.leftTileIndex : this.rightTileIndex,
                $selectedTile = this.$selectedTile instanceof Backbone.View ? this.$selectedTile.$el : this.$selectedTile,
                parentName = upperLimit === left ? '.rhs-expression-view' : '.lhs-expression-view',
                currentValue = array[index];

            return ((upperLimit ? index === arrayLength : index === -1)
                    && $selectedTile
                    && (($selectedTile.parents(parentName).length > 0)
                        || ($selectedTile.data('tiletype') === modelClassNameSpace.TileItem.TileType.BIN_TILE) && (upperLimit !== left)));

            // Handle Shift Tab and Tab from first and last element respectively, Also in cases of Bin tile
        },


        _checkLimit: function _checkLimit(left, upperLimit) {

            var array = left ? this.leftTileArray : this.rightTileArray,
                index = left ? this.leftTileIndex : this.rightTileIndex,
                currentValue = array[index];

            return (this._checkTileInsideMarquee(currentValue)
                    || this.$selectedTile === currentValue
                    || (this.$selectedTile && this.$selectedTile.model && this.$selectedTile.model.get('type') === 'PARENTHESES' && currentValue === '.parentheses-exponent'))    //Bugfix #61533 - Exponent Tile inside marquee should not get focus
                && (upperLimit ? index < array.length : index >= 0);

        },

        /**
* Repositions the focus DIV onto the element passed, resizes it to the element's size and resets focus on the
* DIV so that text can be read on it.
*
* @method _setPositionOfFocusDiv
* @param el {Object} jQuery object of the HTML element on which the focus DIV is to be shown.
* @param left {Boolean} True, if the element is in the left expression. Else false.
* @param [options] {Object} A data object to pass additional data.
* @param [options.isMarquee] {Boolean} True, if the focus DIV is highlighting a marquee.
* @private
*/
        _setPositionOfFocusDiv: function _setPositionOfFocusDiv(el, left, options) {
            options = options || {};

            var currTilePos = el.offset(),
                secondPart = null,
                accOffset = 2,
                offset = {
                    'left': currTilePos.left - accOffset + (!el.hasClass('marquee-div') ? 0 : 1),        // To fix marquee focus Rect UI issue
                    'top': currTilePos.top - accOffset + (!el.hasClass('marquee-div') ? 0 : 1)
                },
                size = {
                    'width': el.width() + 2 * accOffset,
                    'height': el.height() + 2 * accOffset
                },
                accText, text,
                focusDiv = left ? this.lhsFocusDiv : this.rhsFocusDiv,
                currentSide = left ? this.getAccMessage('prefixed-statements', 1) : this.getAccMessage('prefixed-statements', 2),
                tileText = this._getTileText(el, left),
                marqueeSelectedItemsLength = this.marqueeSelectedItems.length,
                maxTerms = this._getMaxTermsPerSide(left);

            if (options.isMarquee) {
                accText = (options.cannotExpand) ?
                    this.getAccMessage('equation-reading-text', options.cannotExpand) : this._getMarqueeAccText();
            }
            else if (this.onlyLHS && !el.hasClass('parentheses-exponent')) {    //Test solution check
                //  accText = this.getAccMessage('equation-reading-text', 11, ['', this.leftTileArray[this.leftTileIndex].getAccString(true)]);
                accText = this.leftTileArray[this.leftTileIndex].getAccString(true);        //Reading without the tile word
            }
            else {
                if (this.isTutorialMode) {
                    this.termTileContextMenuView.updateMaxItemCount(1);
                }
                else {
                    //if (tileText === 'x' || tileText === '-x' || tileText === 't' || tileText === '-t') {
                    //    this.termTileContextMenuView.updateMaxItemCount(2);
                    //}
                    //else {
                    //    this.termTileContextMenuView.updateMaxItemCount(3);
                    //}
                }
                if (el.hasClass('operator-container') === true) {
                    accText = this.getAccMessage('prefixed-statements', 3, [currentSide]);
                }
                else if (el.hasClass('virtual-numerator') === true) {
                    accText = this.getAccMessage('prefixed-statements', 4, [currentSide]);
                }
                else if ((el.hasClass('virtual-denominator') === true) || (el.hasClass('absolute-denominator') === true)) {
                    accText = this.getAccMessage('prefixed-statements', 5, [currentSide]);
                }
                else {
                    text = this._getTileText(el);

                    if (text.match(/\d+/g) || text.match(/\s+[x,t]$/g) || text.match(/^[x,t]\s+/g) || text.length === 1) {      // Check if its a number or x,t,-x,-t
                        // this.onlyLHS - Test solution check as no side is present
                        secondPart = this.isMarqueeStep && !this.$selectedTile ? this._getMarqueeAccText() : this._getTileText(el);
                        if (!this.isTutorialMode) {
                            if (!text.match(/\d+/g)) {
                                this.termTileContextMenuView.updateMaxItemCount(2);
                                this.ignoreMultipleTermTileRows(false, 7);
                                this.ignoreMultipleTermTileRows(true, 1);
                            }
                            else {
                                this.termTileContextMenuView.updateMaxItemCount(3);
                                this.ignoreMultipleTermTileRows(false, 1);
                            }
                        }
                        else {

                            if (!this.$selectedTile) {
                                this.ignoreMultipleTermTileRows(false, 7);
                                if (left == true) {
                                    //this.ignoreMultipleTermTileRows(false, 5);
                                    this.ignoreMultipleTermTileRows(true, this.ignoreIndexForTutorial);
                                }
                                else {
                                    //this.ignoreMultipleTermTileRows(false, 3);
                                    this.ignoreMultipleTermTileRows(true, this.ignoreIndexForTutorial);
                                }
                            }
                        }
                        //Reading without the tile word - onlyLHS check
                        accText = this.onlyLHS ? secondPart : this.getAccMessage('equation-reading-text', 11, [this.getAccMessage('equation-reading-text', left ? 4 : 5), secondPart]);
                        accText = this._appendTutorialText(el, accText, left);
                    }
                    else {
                        accText = this._getTileText(el, left);
                    }

                }
            }
            if (el.hasClass('empty-dropslot') === true || el.hasClass('ignore-marquee') === true || this.$selectedTile) {
                this._handleContextMenuOpenEvent(false);
            }
            else {
                if (!this.isTutorialMode && !this.isIgnoreCombine) {
                    if (text && text.match(/\d+/g)) {
                        this.termTileContextMenuView.updateMaxItemCount(3);
                        this._handleContextMenuOpenEvent(true);
                    }
                }
            }

            if (!this.$selectedTile) { // if a tile is selected, then context menu shouldn't appear
                if (marqueeSelectedItemsLength > 0) {
                    if (this.isTutorialMode === true) {
                        this.termTileContextMenuView.updateMaxItemCount(1);
                        if (this.ignoreIndexForTutorial === 7) { //Patch for tutorial step while creating marquee
                            this.ignoreMultipleTermTileRows(true, this.ignoreIndexForTutorial);
                        }
                    }
                    else {
                        if (marqueeSelectedItemsLength === maxTerms) {
                            this.termTileContextMenuView.updateMaxItemCount(1);
                            this._ignoreCombineOption(left, true);
                        }
                        else {
                            this.termTileContextMenuView.updateMaxItemCount(2);
                            this.ignoreMultipleTermTileRows(true, 1);
                        }
                    }
                }
                else if (el.hasClass('parentheses-exponent') === true) {
                    this._createContextMenuAgain(1);
                    this.ignoreMultipleTermTileRows(false, 1);
                    this.ignoreMultipleTermTileRows(true, 14);
                }
                else {
                    this._createContextMenuAgain();
                }
            }

            focusDiv.show();
            focusDiv.offset({   //Bugfix #61387 - Reseting focus div offset as directly setting focus gives incorrect position
                'left': 0,
                'top': 0
            });
            focusDiv.offset(offset);
            focusDiv.css(size);
            focusDiv.attr('tabindex', -1);
            if (this.prevTileAccText.trim() === accText.trim() && accText !== '') {
                this.prevTileAccText = accText + ". ";
            } else {
                this.prevTileAccText = accText;
                if(this.prevTileAccText.charAt(0) === ' '){
                    this.prevTileAccText = this.prevTileAccText.substring(1);
                }
            }

            focusDiv.text(this.prevTileAccText);
            this.player._refreshDOM();
            if(this.onlyLHS){
                this.setFocus('practice-lhs-expression-view');
                this.setFocus('lhs-expression-view');
            } else {
                this.setFocus(this._getAccId(this.$equationCOntainer));
            }
//            focusDiv[0].blur();
            focusDiv[0].focus();

        },

        _appendTutorialText: function _appendTutorialText(el, accText, left) {

            return accText;
        },

        _getTileText: function _getTileText(tile, left) {

            var value = tile.attr('data-tilevalue') || tile.text().trim(),          // If jquery elemnt is passed take data-tilevalue or if its el take its innertext as expression tiles dont have tilevalue saved
                selectedTileText = '',
                minusText = this.getAccMessage('comm19', 0) + ' ';

            if (this.$selectedTile) { // text when any other tile is selected
                selectedTileText = ' ' + this.getAccMessage('equation-reading-text', 9);
            }

            if (typeof value === 'string') {
                if (value === '') {
                    value = this.getAccMessage('prefixed-statements', 6, [this.getAccMessage('equation-reading-text', left ? 4 : 5)]) + ' ';

                    if (!this.$selectedTile) { // text of blank tile when no tile is selected
                        selectedTileText = ' ' + this.getAccMessage('equation-reading-text', 8);
                    }

                    //  return value;
                }
                else if (value === '0') {

                    if (!this.$selectedTile && !tile.is('.ui-draggable')) {
                        selectedTileText = ' ' + this.getAccMessage('equation-reading-text', 8);
                    }
                    else {
                        //             return value
                    }

                }
                else if (value.indexOf('−') !== -1) {
                    value.replace('−', minusText);
                }
                else if (value.indexOf('-') !== -1) {
                    value.replace('-', minusText);
                }
                else if (tile.hasClass('parentheses-exponent')) {
                    value = this.getAccMessage('exponent-text', 0) + value;
                    selectedTileText = ' ' + this.getAccMessage('equation-reading-text', 19);
                }
            }

            return value + selectedTileText;


        },

        _currentFocusedElement: function _currentFocusedElement(elementClass, isLHS) {
            if (typeof elementClass === 'string') {
                var $expresssion = isLHS ? this.equationView.tileViews[0].$el : this.equationView.tileViews[1].$el;
                if (elementClass === '.null-operator-container') {
                    this._showHideDropslots(this.equationView.$el, false);
                    $expresssion.find(elementClass).find('.insertion-cursor, .add-sign-in-null-operator').show();
                }
                else if (elementClass === '.virtual-numerator') {
                    this._showHideDropslots($expresssion, true, true);
                }
                else if (elementClass.indexOf('.virtual-denominator') || elementClass.indexOf('.absolute-denominator')) {
                    this._showHideDropslots($expresssion, true, false);
                }
            }
        },


        _handleFocusOutOnFocusDiv: function _handleFocusOutOnFocusDiv(left) {

            if (left) {
                this.leftTileIndex = -1;
                this.lhsFocusDiv.hide();
            }
            else {
                this.rightTileIndex = -1;
                this.rhsFocusDiv.hide();
            }


        },

        _createElementObj: function _createElementObj(id, tabIndex, accText, accDivOffset) {

            var elementObj = {
                type: 'text',
                accId: id,
                id: id,
                tabIndex: tabIndex,
                messages: [{
                    id: 0,
                    isAccTextSame: false,
                    message: {
                        acc: (accText) ? accText : '%@$%'
                    }
                }]
            }

            if (accDivOffset) {
                elementObj.offsetTop = accDivOffset.offsetTop;
                elementObj.offsetLeft = accDivOffset.offsetLeft;
            }

            return elementObj;
        },


        /**
* Handles selection of marquee in acc using arrow keys.
* @method handleMarqueeAcc
* @param {Object} Keydown event object
* @param {Boolean} isLeftExpression A boolean indicating if the focused tile is in LHS or RHS.
*/
        handleMarqueeAcc: function (event, isLeftExpression) {
            var KEY = viewNameSpace.EquationManagerPro.KEY;
            switch (event.which) {
                case KEY.LEFTARROW:
                    if (event.shiftKey) {
                        this._expandMarqueeToLeft(isLeftExpression);
                    }
                    break;
                case KEY.RIGHTARROW:
                    if (event.shiftKey) {
                        this._expandMarqueeToRight(isLeftExpression);
                    }
                    break;
            }
        },

        /**
* Using the 'marqueeNodes' array, determines the next node to be added inside marquee and updates the array.
*
* @method _expandMarqueeToRight
* @param {Boolean} isLeftExpression A boolean indicating if the focused tile is in LHS or RHS.
* @private
*/
        _expandMarqueeToRight: function _expandMarqueeToRight(isLeftExpression) {
            var marqueeNodesBeforeExpanding = $.extend(true, [], this.marqueeNodes),
                cannotExpand, fullExpressionSelected,
                marqueeNodes = this.marqueeNodes,
                marqueeNodesLen = marqueeNodes.length,
                endNode, nextNode, parentNode,
                operators = modelClassNameSpace.TileItem.OPERATORS;
            if (marqueeNodesLen === 0) {
                this._addTileToEmptyMarquee(isLeftExpression);
            }
            else {
                endNode = marqueeNodes[marqueeNodesLen - 1];
                nextNode = endNode.next();
                parentNode = endNode.parent;

                // if next node is null, then level up and find next node at that level
                while (nextNode === null && parentNode.data !== operators.EQUAL) {
                    if (_.difference(this._getMarqueeSelectableNodesArrayFromNode(parentNode), marqueeNodes).length === 0) {
                        if (parentNode.parent.data === operators.EQUAL) {
                            break;
                        }
                        nextNode = parentNode.next();
                        parentNode = parentNode.parent;
                    }
                    else {
                        if (parentNode.parent.data !== operators.EQUAL) {
                            marqueeNodes = _.difference(marqueeNodes, this._getMarqueeSelectableNodesArrayFromNode(parentNode, false, true));
                            if (parentNode.parent.data === operators.PARENTHESES) { // another level up
                                parentNode = parentNode.parent;
                            }
                            Array.prototype.push.apply(marqueeNodes, this._getMarqueeSelectableNodesArrayFromNode(parentNode));
                        }
                        break;
                    }
                }

                if (nextNode !== null && endNode.parent.data !== operators.EQUAL) {
                    Array.prototype.push.apply(marqueeNodes, this._getMarqueeSelectableNodesArrayFromNode(nextNode));
                    // level up
                    if (_.difference(this._getMarqueeSelectableNodesArrayFromNode(parentNode), marqueeNodes).length === 0) {
                        marqueeNodes = _.difference(marqueeNodes, this._getMarqueeSelectableNodesArrayFromNode(parentNode));
                        if (parentNode.parent.data === operators.PARENTHESES) { // another level up
                            parentNode = parentNode.parent;
                        }
                        Array.prototype.push.apply(marqueeNodes, this._getMarqueeSelectableNodesArrayFromNode(parentNode));
                    }
                    else if (parentNode.data === operators.DIVISION && this._isWholeFractionToBeSelected(marqueeNodes, parentNode)) {
                        marqueeNodes = _.difference(marqueeNodes, this._getMarqueeSelectableNodesArrayFromNode(parentNode.children[0]));
                        marqueeNodes = _.difference(marqueeNodes, this._getMarqueeSelectableNodesArrayFromNode(parentNode.children[1]));
                        if (parentNode.parent.data === operators.PARENTHESES) { // another level up
                            parentNode = parentNode.parent;
                        }
                        Array.prototype.push.apply(marqueeNodes, this._getMarqueeSelectableNodesArrayFromNode(parentNode));
                    }
                }
                this.marqueeNodes = marqueeNodes;
            }
            if (this.marqueeNodes.length > 0) {
                this._redrawMarquee(isLeftExpression);
                fullExpressionSelected = this._compareNodesArraysEquality(marqueeNodes,
                                                                          this._getMarqueeSelectableNodesArrayFromNode(this.root.children[isLeftExpression ? 0 : 1]));
                if (fullExpressionSelected) {
                    // TODO: trigger event to remove combine entry from context menu
                    this._ignoreCombineOption(isLeftExpression, true);
                    //this.ignoreMultipleTermTileRows(true, 3);
                    //this.termTileContextMenuView.updateContextMenuHeight(1);
                    this.termTileContextMenuView.updateMaxItemCount(1);
                }
                else {
                    this._ignoreCombineOption(isLeftExpression, false);
                    //this.ignoreMultipleTermTileRows(false, 3);
                    this.termTileContextMenuView.updateMaxItemCount(3);
                }
                if (this._compareNodesArraysEquality(marqueeNodes, marqueeNodesBeforeExpanding)) {
                    // couldn't expand
                    cannotExpand = 13;
                    if (fullExpressionSelected) { // whole expression selected
                        cannotExpand = 14;
                    }
                }
                this.fullExpressionSelected = fullExpressionSelected;
                this._setPositionOfFocusDiv(this.getMarqueeDiv(isLeftExpression), isLeftExpression, {
                    isMarquee: true,
                    cannotExpand: cannotExpand
                });
                this._scrollToShowMarquee(isLeftExpression);

            }
        },

        /**
* Using the 'marqueeNodes' array, determines the next node to the left of the current marquee that is to be
* added inside marquee and updates the array.
*
* @method _expandMarqueeToLeft
* @param {Boolean} isLeftExpression A boolean indicating if the focused tile is in LHS or RHS.
* @private
*/
        _expandMarqueeToLeft: function _expandMarqueeToLeft(isLeftExpression) {
            var marqueeNodesBeforeExpanding = $.extend(true, [], this.marqueeNodes),
                cannotExpand, fullExpressionSelected,
                marqueeNodes = this.marqueeNodes,
                marqueeNodesLen = marqueeNodes.length,
                endNode, nextNode, parentNode,
                operators = modelClassNameSpace.TileItem.OPERATORS;
            if (marqueeNodesLen === 0) {
                this._addTileToEmptyMarquee(isLeftExpression);
            }
            else {
                endNode = marqueeNodes[0];
                nextNode = endNode.prev();
                parentNode = endNode.parent;

                // if next node is null, then level up and find next node at that level
                while (nextNode === null && parentNode.data !== operators.EQUAL) {
                    if (_.difference(this._getMarqueeSelectableNodesArrayFromNode(parentNode, true), marqueeNodes).length === 0) {
                        if (parentNode.parent.data === operators.EQUAL) {
                            break;
                        }
                        nextNode = parentNode.prev();
                        parentNode = parentNode.parent;
                    }
                    else {
                        if (parentNode.parent.data !== operators.EQUAL) {
                            marqueeNodes = _.difference(marqueeNodes, this._getMarqueeSelectableNodesArrayFromNode(parentNode, true, true));
                            if (parentNode.parent.data === operators.PARENTHESES) { // another level up
                                parentNode = parentNode.parent;
                            }
                            Array.prototype.unshift.apply(marqueeNodes,
                                                          this._getMarqueeSelectableNodesArrayFromNode(parentNode, true).reverse());
                        }
                        break;
                    }
                }

                if (nextNode !== null && endNode.parent.data !== operators.EQUAL) {
                    Array.prototype.unshift.apply(marqueeNodes,
                                                  this._getMarqueeSelectableNodesArrayFromNode(nextNode, true).reverse());
                    // level up
                    if (_.difference(this._getMarqueeSelectableNodesArrayFromNode(parentNode, true), marqueeNodes).length === 0) {
                        marqueeNodes = _.difference(marqueeNodes, this._getMarqueeSelectableNodesArrayFromNode(parentNode, true));
                        if (parentNode.parent.data === operators.PARENTHESES) { // another level up
                            parentNode = parentNode.parent;
                        }
                        Array.prototype.unshift.apply(marqueeNodes,
                                                      this._getMarqueeSelectableNodesArrayFromNode(parentNode, true).reverse());
                    }
                    else if (parentNode.data === operators.DIVISION && this._isWholeFractionToBeSelected(marqueeNodes, parentNode)) {
                        marqueeNodes = _.difference(marqueeNodes, this._getMarqueeSelectableNodesArrayFromNode(parentNode.children[0]));
                        marqueeNodes = _.difference(marqueeNodes, this._getMarqueeSelectableNodesArrayFromNode(parentNode.children[1]));
                        if (parentNode.parent.data === operators.PARENTHESES) { // another level up
                            parentNode = parentNode.parent;
                        }
                        Array.prototype.unshift.apply(marqueeNodes,
                                                      this._getMarqueeSelectableNodesArrayFromNode(parentNode, true).reverse());
                    }
                }
                this.marqueeNodes = marqueeNodes;
            }
            if (this.marqueeNodes.length > 0) {
                this._redrawMarquee(isLeftExpression);
                fullExpressionSelected = this._compareNodesArraysEquality(marqueeNodes,
                                                                          this._getMarqueeSelectableNodesArrayFromNode(this.root.children[isLeftExpression ? 0 : 1]));
                if (fullExpressionSelected) {
                    // TODO: trigger event to remove combine entry from context menu
                    this._ignoreCombineOption(isLeftExpression, true);
                    //this.ignoreMultipleTermTileRows(true, 5);
                    //this.termTileContextMenuView.updateContextMenuHeight(1);
                    this.termTileContextMenuView.updateMaxItemCount(1);
                }
                else {
                    this._ignoreCombineOption(isLeftExpression, false);
                    //this.ignoreMultipleTermTileRows(false, 5);
                    this.termTileContextMenuView.updateMaxItemCount(3);
                }
                if (this._compareNodesArraysEquality(marqueeNodes, marqueeNodesBeforeExpanding)) {
                    // couldn't expand
                    cannotExpand = 12;
                    if (fullExpressionSelected) { // whole expression selected
                        cannotExpand = 14;
                    }
                }
                this.fullExpressionSelected = fullExpressionSelected;
                this._setPositionOfFocusDiv(this.getMarqueeDiv(isLeftExpression), isLeftExpression, {
                    isMarquee: true,
                    cannotExpand: cannotExpand
                });
                this._scrollToShowMarquee(isLeftExpression);
            }
        },

        /**
* Add focused tile to an empty marquee.
*
* @method _addTileToEmptyMarquee
* @param {Boolean} isLeftExpression A boolean indicating if the focused tile is in LHS or RHS.
* @private
*/
        _addTileToEmptyMarquee: function _addTileToEmptyMarquee(isLeftExpression) {
            var tileModel;
            tileModel = (isLeftExpression) ? this.leftTileArray[this.leftTileIndex].model :
            this.rightTileArray[this.rightTileIndex].model;
            if (!tileModel || (tileModel.get('base') === 0 && tileModel.get('isDraggable') === false)) {
                // can't be marquee selected
                // probably a message is to be read out.
            }
            else {
                this.marqueeNodes.push(tileModel.get('treeNodeRef'));
            }
        },

        /**
* Draws the marquee on the terms whose nodes are included in the updated 'marqueeNodes' array.
*
* @method _redrawMarquee
* @param isLeftExpression {Boolean} If true, marquee is to be drawn in LHS; else false.
* @private
*/
        _redrawMarquee: function _redrawMarquee(isLeftExpression) {
            var marqueeView = this.marqueeViews[isLeftExpression ? 0 : 1],
                marqueeDiv = marqueeView.getMarqueeDiv(),
                $marqueeDiv = $(marqueeDiv),
                $scrollCntr = isLeftExpression ? this.$('.lhs-expression-view-holder') :
            this.$('.rhs-expression-view-holder'),
                marqueeNodes = this.marqueeNodes,
                nodeArrLength = marqueeNodes.length,
                index,
                tileView, viewArr = [];

            this._showMarqueeSelectedItems();
            this.$el.find('.' + viewNameSpace.EquationManagerPro.TILE_CLASS)
                .removeClass(viewNameSpace.EquationManagerPro.TILE_CLASS);

            for (index = 0; index < nodeArrLength; index++) {
                tileView = this.equationView.getViewFromNode(marqueeNodes[index]);
                tileView.$el.addClass(viewNameSpace.EquationManagerPro.TILE_CLASS);
                if (!(tileView.$el.find('.base-container').hasClass('disable'))) {
                    viewArr.push(tileView);
                }
            }
            marqueeView.drawMarqueeOn(viewArr);
            this.marqueeSelectedItems = viewArr;
            this.marqueeView = marqueeView;
            this.marqueeSelectedItems = this._validateMarqueeItems(this.marqueeSelectedItems, {
                clientX: 10, // if clientX is less than marqueeStartX, then marquee is drawn from right to left
                marqueeStartX: 0
            });
            $marqueeDiv.html('');
            this._groupSelectedTileItems($marqueeDiv, $scrollCntr);
            this._hideMarqueeSelectedItems();
        },

        /**
* Fetches the accessibility text for marquee by looping through each element inside marqueeSelectedItems array.
*
* @method _getMarqueeAccText
* @return {String} The accessibility text for the expression selected inside marquee.
* @private
*/
        _getMarqueeAccText: function _getMarqueeAccText() {
            var marqueeSelectedItems = this.marqueeSelectedItems,
                subEquation = '',
                index = 0,
                marqueeSelectedItems = this.marqueeSelectedItems,
                endValue = marqueeSelectedItems.length,
                avoidOperator = null;

            for (; index < endValue; index++) {
                avoidOperator = (index === 0) ? true : false;
                subEquation += marqueeSelectedItems[index].getAccString(avoidOperator);
            }

            return this.getAccMessage('equation-reading-text', 6, [subEquation]);
        },

        /**
* Given a node, the method called recursively returns an array of nodes that marquee would have stored on
* selecting the node. In case of addition or multiplication node, returns array of child nodes; else the node
* itself is returned in an array.
*
* @method _getMarqueeSelectableNodesArrayFromNode
* @param parentNode {Object} The node to be processed.
* @param [reverse] {Boolean} If passed as true, will generate the array of nodes in reverse.
* @param [deep] {Boolean} If passed as true, will return marquee selectable nodes inside a fraction along with
* the fraction.
* @return {Array} An array of nodes that the marquee would have stored in case the given node was marquee
* selected.
* @private
*/
        _getMarqueeSelectableNodesArrayFromNode: function _getMarqueeSelectableNodesArrayFromNode(parentNode, reverse, deep) {
            var returnArray = [], index,
                operators = modelClassNameSpace.TileItem.OPERATORS,
                isNotSingleTerm = [operators.ADDITION, operators.MULTIPLICATION].indexOf(parentNode.data) > -1,
                fractionSpecialCase = deep && parentNode.data === operators.DIVISION;
            if (isNotSingleTerm || fractionSpecialCase) {
                for (index = 0; index < parentNode.children.length; index++) {
                    if (reverse) {
                        Array.prototype.unshift.apply(returnArray,
                                                      this._getMarqueeSelectableNodesArrayFromNode(parentNode.children[index], reverse));
                    }
                    else {
                        Array.prototype.push.apply(returnArray,
                                                   this._getMarqueeSelectableNodesArrayFromNode(parentNode.children[index]));
                    }
                }
            }
            if (!isNotSingleTerm || fractionSpecialCase) {
                if (reverse)
                    returnArray.unshift(parentNode);
                else returnArray.push(parentNode);
            }
            return returnArray;
        },

        /**
* Helper method to check if the passed fraction node is to be included inside the marquee node.
*
* @method _isWholeFractionToBeSelected
* @param marqueeNodes {Object} The current list of nodes in the marquee; may contain few terms from the
* fraction's numerator and few from the denominator.
* @param fractionNode {Object} The tree node object of the fraction whose numerator & denominator terms are
* suspected to be in the marqueeNodes array.
* @return {Boolean} True, if fraction is to be included in the marquee selected nodes array. Else, false.
* @private
*/
        _isWholeFractionToBeSelected: function _isWholeFractionToBeSelected(marqueeNodes, fractionNode) {
            var numeratorNodes, denominatorNodes;
            numeratorNodes = this._getMarqueeSelectableNodesArrayFromNode(fractionNode.children[0]);
            denominatorNodes = this._getMarqueeSelectableNodesArrayFromNode(fractionNode.children[1]);
            return (_.difference(numeratorNodes, marqueeNodes).length < numeratorNodes.length &&
                    _.difference(denominatorNodes, marqueeNodes).length < denominatorNodes.length);
        },

        /**
* Scrolls the EM workspace to the tile passed.
* @method scrollToShowMarquee
* @param isLeftExpression {Boolean} If true, marquee is in LHS; else false.
* @private
*/
        _scrollToShowMarquee: function _scrollToShowMarquee(isLeftExpression) {
            var $scrollable,
                containerScrollLeft, containerLeft, containerWidth,
                marqueeDiv, marqueeDivLeft, marqueeDivRight,
                leftScrollAmount, rightScrollAmount,
                BUFFER;

            $scrollable = (isLeftExpression === false) ? this.$('.rhs-expression-view-holder') :
            this.$('.lhs-expression-view-holder');
            marqueeDiv = this.getMarqueeDiv(isLeftExpression);
            marqueeDivLeft = marqueeDiv.offset().left;
            marqueeDivRight = marqueeDivLeft + marqueeDiv.width();
            containerLeft = $scrollable.offset().left;
            containerScrollLeft = $scrollable.scrollLeft();
            containerWidth = $scrollable.width();
            leftScrollAmount = 0;
            rightScrollAmount = 0;
            BUFFER = 13;    // To account for EM padding.

            if (marqueeDivLeft < containerLeft) {
                leftScrollAmount = containerScrollLeft + marqueeDivLeft - containerLeft - BUFFER;
            }
            if (marqueeDivRight - containerLeft > containerWidth) {
                rightScrollAmount = containerScrollLeft + marqueeDivRight - containerWidth - containerLeft + BUFFER;
            }

            if (leftScrollAmount === 0) {
                if (rightScrollAmount) {
                    $scrollable.scrollLeft(rightScrollAmount);
                }
            }
            else {
                if (rightScrollAmount) {
                    $scrollable.scrollLeft(leftScrollAmount > rightScrollAmount ? leftScrollAmount : rightScrollAmount);
                }
                else {
                    $scrollable.scrollLeft(leftScrollAmount);
                }
            }

            marqueeDiv.css('z-index', 0);
        },

        /**
* Compares two array of models, and returns whether the 2 are equal.
*
* @method _compareNodesArraysEquality
* @param array1 {Array} Array of backbone models
* @param array2 {Array} Array of backbone models to be compared.
* @return {Boolean} True if the two arrays are equal.
*/
        _compareNodesArraysEquality: function _compareNodesArraysEquality(array1, array2) {
            var isEqual = true,
                index, nodeCid, cidArray1 = [], cidArray2 = [],
                length1, length2;
            length1 = array1.length;
            length2 = array2.length;
            if (length1 === length2) {
                for (index = 0; index < length1; index++) {
                    cidArray1.push(array1[index].cid);
                }
                for (index = 0; index < length2; index++) {
                    cidArray2.push(array2[index].cid);
                }
                isEqual = _.isEqual(cidArray1, cidArray2);
            }
            else {
                isEqual = false;
            }
            return isEqual;
        },

        _getViewFromNode: function _getViewFromNode() {
            if (node.collectionData || typeof node.data !== 'string') {
                return this.equationView.getViewFromIndex(this.equationView.model.getIndexFromItemModel(node.collectionData || node.data));
            }
        },


        _attachAccEvents: function _attachAccEvents() {
            var self = this,
                lastTileIndex = null,
                allBinTiles = null;
            if (this.$binTileContainment) {
                allBinTiles = this.$binTileContainment.find('.bin-tiles');
                lastTileIndex = allBinTiles.length - 1;
                this.$binTileContainment.off('focusin.dm').on('focusin.dm', function (event) {
                    if (event.target.id.indexOf('container') > -1) {
                        self._enableDisableTabOnBinTiles(false);
                    }
                });
                this.$binTileContainment.off('keyup.binTilesContainerKeyUp').on('keyup.binTilesContainerKeyUp', function (event, ui) {
                    self._binTilecontainerKeyUpHandler(event, ui);
                });

                $(allBinTiles[0]).off('keydown.firstBinTileKeyDown').on('keydown.firstBinTileKeyDown', function (event, ui) {
                    self._firstBinTileKeyDownHandler(event, ui);
                });

                //$(allBinTiles[lastTileIndex]).off('keydown.lastBinTileKeyDown').on('keydown.lastBinTileKeyDown', function (event, ui) {
                //self._lastBinTileKeyDownHandler(event, ui, false);
                //});

                //this.$('.lhs-expression-view').off('focusin.lshContainerFocusIn').on('focusin.lshContainerFocusIn', function () {
                //    self._enableDisableTabOnBinTiles(false);
                //});

                this.attachDetachKeyDownOnBinTile(allBinTiles, true);
            }
        },

        attachDetachKeyDownOnBinTile: function attachDetachKeyDownOnBinTile($tile, attach) {

            var self = this;
            $tile.off('keydown.binTilesKeyDown');

            if (attach) {
                $tile.on('keydown.binTilesKeyDown', function (event, ui) {
                    self._binTilesKeyDownHandler(event, ui);
                });
            }
        },

        attachLhsContFocusIn: function attachLhsContFocusIn() {
            var self = this;
            this.$lhsExprView.off('focusin.lhsContainerFocusIn').on('focusin.lhsContainerFocusIn', function () {
                self._enableDisableTabOnBinTiles(false);
                self.isIgnoreCombine = false;
            });
            this.$equationCOntainer.off('focusin.totalContainerFocusIn').on('focusin.totalContainerFocusIn', function () {
                self._enableDisableTabOnBinTiles(false);
            });
            this.$rhsExprView.off('focusin.rhsContainerFocusIn').on('focusin.rhsContainerFocusIn', function () {
                self.isIgnoreCombine = false;
            });
        },

        _binTilecontainerKeyUpHandler: function (event, ui) {
            var keyCode = event.keyCode,
                KEY = viewNameSpace.EquationManagerPro.KEY;

            if (keyCode === KEY.SPACE) {
                this.stopReading();
                this.removeHighlightTilesImmediate();
                this._enableDisableTabOnBinTiles(false);
                this._enableDisableTabOnBinTiles(true);
                if (this.firstTileAccId !== null) {
                    this.setFocus(this.firstTileAccId);
                }
            }
        },

        _firstBinTileKeyDownHandler: function _firstBinTileKeyDownHandler(event, ui) {
            var keyCode = event.keyCode ? event.keyCode : event.charCode,
                KEY = viewNameSpace.EquationManagerPro.KEY,
                binTileContainerAccid = this.$binTileContainment.find('.bin-tiles').parent().attr('id').split(this.idPrefix)[1];

            if (keyCode === KEY.TAB && event.shiftKey === true) {
                event.stopPropagation();
                event.preventDefault();
                this._enableDisableTabOnBinTiles(false);
                this.removeHighlightTilesImmediate();
                this.stopReading();
                this.setFocus(binTileContainerAccid);
            }
            else if (keyCode === KEY.SPACE) {
                event.stopPropagation();
                event.preventDefault();
            }
        },

        //_lastBinTileKeyDownHandler: function _lastBinTileKeyDownHandler(event, ui) {
        //    var keyCode = event.keyCode ? event.keyCode : event.charCode;

        //    if (keyCode === 9 && event.shiftKey !== true) {
        //        this._enableDisableTabOnBinTiles(false);
        //    }

        //},

        _binTilesKeyDownHandler: function _binTilesKeyDownHandler(event, ui) {
            var keyCode = event.keyCode,
                KEY = viewNameSpace.EquationManagerPro.KEY;

            switch (keyCode) {

                case KEY.SPACE:
                    this.stopReading();
                    this.removeHighlightTilesImmediate();
                    this._handleSpaceOnBinTile(event);
                    break;

                case KEY.ESCAPE:
                    this._handleEscapeOnBinTile(event);

                case KEY.ENTER:
                    event.preventDefault();
                    event.stopPropagation();
                    break;

                case KEY.TAB:
                    this.stopReading();
                    this.removeHighlightTilesImmediate();
                    //To handle Tab on bin tile while animation
                    //if (!this.getEnableTabOnContainer()) {
                    //    event.stopPropagation();
                    //    event.preventDefault();
                    //    return;
                    //}

                    break;
            }

        },


        setEnableTabOnContainer: function setEnableTabOnContainer(value) {
            this.enableTabOnContainer = value;
        },

        getEnableTabOnContainer: function getEnableTabOnContainer(value) {
            return this.enableTabOnContainer;
        },

        _handleSpaceOnBinTile: function _handleSpaceOnBinTile(event) {

            var tileAddedInExpression = this.getTileAddedInExpression();

            event.stopPropagation();
            event.preventDefault();
            this.$selectedTile = $(event.currentTarget);

            if (tileAddedInExpression === null) {
                if (this.getFirstTileDrop() === true) {

                    /* on space
LHS:
1. show inertion cursor
2. show numerator
3. show denominator
RHS:
1. show inertion cursor
2. show numerator
3. show denominator
*/

                    this._updateTileArray(['.null-operator-container', '.virtual-numerator', '.virtual-denominator,.absolute-denominator']);
                }
                else {
                    this._updateTileArray(['.virtual-numerator'], true);
                }
                this._bindKeyDownOnFocusDiv(this.lhsFocusDiv, true);
                this.lastTabIndex = this.getTabIndex(this._getAccId(this.$binTileContainment));
                this.isCircularModeOn = true;
                this._goToNextTile(true);
            }
            else {
                this.lastTabIndex = this.getTabIndex(this._getAccId(this.$binTileContainment));

                if (tileAddedInExpression) {
                    // If Dropped on left expression focus must go to right side
                    this.rightTileArray = [this.containsNullTile()];
                    this.leftTileArray = [];
                    this._bindKeyDownOnFocusDiv(this.rhsFocusDiv, false);
                    this.isCircularModeOn = true;
                    this._goToNextTile(false);
                }
                else {
                    // If Dropped on right expression focus must go to left side
                    this.leftTileArray = [this.containsNullTile()];
                    this.rightTileArray = [];
                    this._bindKeyDownOnFocusDiv(this.lhsFocusDiv, true);
                    this.isCircularModeOn = true;
                    this._goToNextTile(true);
                }
            }

        },

        _handleEscapeOnBinTile: function _handleEscapeOnBinTile(event) {

            this.setFocus(this._getAccId(this.$binTileContainment));
            this._enableDisableTabOnBinTiles(false);
            this._resetParametersOnFocusOutOfLastElement();
            this.prevTileIndex = -1;
            this.$selectedTile = null;

        },

        _createBinTilesContextMenu: function _createBinTilesContextMenu() {
            if (this.$binTileContainment) {
                var self = this,
model = this.model,
derivedContextMenu = viewNameSpace.DerivedContextMenu,
_CONTEXTMENU = derivedContextMenu,
//_CONTEXTMENU = MathInteractives.global.ContextMenu,
strSelectEvent = _CONTEXTMENU.CONTEXTMENU_SELECT,
strHideEvent = _CONTEXTMENU.CONTEXTMENU_HIDE,
strOpenEvent = _CONTEXTMENU.CONTEXTMENU_OPEN,
options,
$contextMenuItem = this.$binTileContainment.find('.bin-tiles'),
counter = 0,
endValue = 7,
contextMenuCount = 7,
maxItemCount = this.isTutorialMode ? 1 : 7;

                options = {
                    el: this.player.$el,
                    prefix: this.idPrefix,
                    elements: [$contextMenuItem],
                    screenId: 'bin-tiles-context-menu',
                    contextMenuCount: contextMenuCount,
                    maxItemCount: maxItemCount,
                    manager: this.manager,
                    thisView: this
                };

                if (this.contextMenuView) {
                    this.contextMenuView = null;
                }

                this.contextMenuView = _CONTEXTMENU.initContextMenu(options);

                $contextMenuItem.off(strSelectEvent).on(strSelectEvent, function (event, ui) {
                    self._handleContextMenuSelect(event, ui);
                });

                $contextMenuItem.off(strHideEvent).on(strHideEvent, function (event, ui) {
                    self.setFocus(self._getAccId($(this)));
                });

                $contextMenuItem.off(strOpenEvent).on(strOpenEvent, function (event, ui) {
                    self.setFocus('bin-tiles-context-menu-0');
                });
            }
        },

        _handleContextMenuSelect: function _handleContextMenuSelect(event, ui) {
            var dropId = $(ui.currentTarget).attr('id'),
contextMenuRowNumber = parseInt(dropId.split(this.idPrefix + 'bin-tiles-context-menu-')[1]),
selectedTile = event.currentTarget,
tilevalue = $(event.currentTarget).attr('data-tilevalue'),
tilevalue = (isNaN(parseInt(tilevalue, 10))) ? tilevalue : parseInt(tilevalue, 10),
tileData = {
    fractionAdded: false,
    index: null,
    isDenominator: false,
    isLHS: null,
    operation: null,
    parenthesesAdded: false,
    tileValue: tilevalue,
    tilesToAddInFraction: 1
},
lhsExprViewHolder = this.$lhsExprView.find('.lhs-expression-view-holder'),
rhsExprViewHolder = this.$rhsExprView.find('.rhs-expression-view-holder'),
customEvent = {
    type: 'drop',
    target: null
},
fromAcc = {
    'cur-draggable': null,
    'tiletype': modelClassNameSpace.TileItem.TileType.BIN_TILE,
    'tilevalue': tilevalue,
    'target': null
},
isTileAddedInExpr = this.getTileAddedInExpression(),
nullTile = this.containsNullTile(),
nullTileIndex = (nullTile) ? nullTile.parent.getIndex(nullTile) : '',
operationPerformed = this.model.get('operationPerformed');

            this.setEnableTabOnContainer(false);

            switch (contextMenuRowNumber) {
                case 0:
                    this._onBinTileClick(selectedTile);
                    this.setFocus(this._getAccId($(selectedTile)));
                    break;
                case 1:
                    //tileData.operation = '+';
                    //if (isTileAddedInExpr === null) {
                    //    tileData.index = '0.0';
                    //    tileData.isLHS = true;
                    //    this.onAddTile(tileData);
                    //    tileData.tilesToAddInFraction = 0;
                    //    this.equationView.tileViews[0].addNullTileCase(tileData.operation, tileData.tileValue);
                    //}
                    //else if (isTileAddedInExpr === false) {
                    //    debugger
                    //    //left side null tile present
                    //    tileData.index = nullTileIndex
                    //    tileData.isLHS = false;
                    //    tileData.parenthesesAdded = true;
                    //    this.onReplaceTile(tileData);
                    //}
                    //else {
                    //    this.equationNotBalancedFeedback();
                    //}
                    this.$selectedTile = $(selectedTile);
                    customEvent.target = lhsExprViewHolder;
                    fromAcc['cur-draggable'] = event.currentTarget;
                    fromAcc['target'] = lhsExprViewHolder.find('.operator-container.null-operator-container');
                    //this.equationView.tileViews[0].onTileDrop(customEvent, null, fromAcc);
                    if (nullTile && nullTileIndex.split('.')[0] === '0' && operationPerformed.operation === '+') {
                        nullTile.onTileDrop(customEvent, null, fromAcc);
                    }
                    else {
                        this.equationView.tileViews[0].onDropOperator(customEvent, null, fromAcc);
                    }
                    this._setFocus({ binTileDrop: true, left: true });
                    break;
                case 2:
                    this.$selectedTile = $(selectedTile);
                    tileData.isLHS = true;
                    customEvent.target = lhsExprViewHolder;
                    fromAcc['cur-draggable'] = event.currentTarget;
                    fromAcc['target'] = lhsExprViewHolder.find('.virtual-numerator');
                    fromAcc['isDenominator'] = false;
                    if (nullTile && nullTileIndex.split('.')[0] === '0' && operationPerformed.operation === '*' && operationPerformed.isDenominator === false) {
                        nullTile.onTileDrop(customEvent, null, fromAcc);
                    }
                    else {
                        this.equationView.tileViews[0].onTileDrop(customEvent, null, fromAcc);
                    }
                    this._setFocus({ binTileDrop: true, left: true });
                    break;
                case 3:
                    this.$selectedTile = $(selectedTile);
                    tileData.isLHS = true;
                    customEvent.target = lhsExprViewHolder;
                    fromAcc['cur-draggable'] = event.currentTarget;
                    fromAcc['target'] = lhsExprViewHolder.find('.virtual-denominator, .absolute-denominator');
                    fromAcc['isDenominator'] = true;
                    if (nullTile && nullTileIndex.split('.')[0] === '0' && operationPerformed.operation === '*' && operationPerformed.isDenominator === true) {
                        nullTile.onTileDrop(customEvent, null, fromAcc);
                    }
                    else {
                        this.equationView.tileViews[0].onTileDrop(customEvent, null, fromAcc);
                    }
                    this._setFocus({ binTileDrop: true, left: true });
                    break;
                case 4:
                    //tileData.operation = '+';
                    //if (this.getTileAddedInExpression() === null) {
                    //    tileData.index = '1.0';
                    //    tileData.isLHS = false;
                    //    this.onAddTile(tileData);
                    //    tileData.tilesToAddInFraction = 0;
                    //    this.equationView.tileViews[1].addNullTileCase(tileData.operation, tileData.tileValue);
                    //}
                    //else if (isTileAddedInExpr === true) {
                    //    debugger
                    //    //Right side null tile present
                    //    tileData.index = nullTileIndex;
                    //    tileData.isLHS = true;
                    //    tileData.parenthesesAdded = true;
                    //    tileData.tilesToAddInFraction = 0;
                    //    this.onReplaceTile(tileData);
                    //}
                    //else {
                    //    this.equationNotBalancedFeedback();
                    //}
                    this.$selectedTile = $(selectedTile);
                    customEvent.target = rhsExprViewHolder;
                    fromAcc['cur-draggable'] = event.currentTarget;
                    fromAcc['target'] = rhsExprViewHolder.find('.operator-container.null-operator-container');
                    //this.equationView.tileViews[1].onTileDrop(customEvent, null, fromAcc);
                    if (nullTile && nullTileIndex.split('.')[0] === '1' && operationPerformed.operation === '+') {
                        nullTile.onTileDrop(customEvent, null, fromAcc);
                    }
                    else {
                        this.equationView.tileViews[1].onDropOperator(customEvent, null, fromAcc);
                    }
                    this._setFocus({ binTileDrop: true, left: false });
                    break;
                case 5:
                    this.$selectedTile = $(selectedTile);
                    tileData.isLHS = false;
                    customEvent.target = rhsExprViewHolder;
                    fromAcc['cur-draggable'] = event.currentTarget;
                    fromAcc['target'] = rhsExprViewHolder.find('.virtual-numerator');
                    fromAcc['isDenominator'] = false;
                    if (nullTile && nullTileIndex.split('.')[0] === '1' && operationPerformed.operation === '*' && operationPerformed.isDenominator === false) {
                        nullTile.onTileDrop(customEvent, null, fromAcc);
                    }
                    else {
                        this.equationView.tileViews[1].onTileDrop(customEvent, null, fromAcc);
                    }
                    this._setFocus({ binTileDrop: true, left: false });
                    break;
                case 6:
                    this.$selectedTile = $(selectedTile);
                    tileData.isLHS = false;
                    customEvent.target = rhsExprViewHolder;
                    fromAcc['cur-draggable'] = event.currentTarget;
                    fromAcc['target'] = rhsExprViewHolder.find('.virtual-denominator, .absolute-denominator');
                    fromAcc['isDenominator'] = true;
                    if (nullTile && nullTileIndex.split('.')[0] === '1' && operationPerformed.operation === '*' && operationPerformed.isDenominator === true) {
                        nullTile.onTileDrop(customEvent, null, fromAcc);
                    }
                    else {
                        this.equationView.tileViews[1].onTileDrop(customEvent, null, fromAcc);
                    }
                    this._setFocus({ binTileDrop: true, left: false });
                    break;
                default:
                    break
            }

            this._resetParametersOnFocusOutOfLastElement();
        },

        _createTermTilesContextMenu: function _createTermTilesContextMenu() {
            var self = this,
                model = this.model,
                derivedContextMenu = viewNameSpace.DerivedContextMenu,
                //_CONTEXTMENU = MathInteractives.global.ContextMenu,
                _CONTEXTMENU = derivedContextMenu,
                strSelectEvent = _CONTEXTMENU.CONTEXTMENU_SELECT,
                strHideEvent = _CONTEXTMENU.CONTEXTMENU_HIDE,
                strOpenEvent = _CONTEXTMENU.CONTEXTMENU_OPEN,
                options,
                $contextMenuItem = this.$equationCOntainer.find('.dummy-acc-focus-div'),
                counter = 0,
                endValue = 3,
                //contextMenuCount = this.isTutorialMode ? 1 : 3,
                contextMenuCount = 3,
                maxItemCount = this.isTutorialMode ? 1 : 2;

            options = {
                el: this.player.$el,
                prefix: this.idPrefix,
                elements: [$contextMenuItem],
                screenId: this.termTileContextMenuScreenId ? this.termTileContextMenuScreenId : 'term-tiles-context-menu',
                contextMenuCount: contextMenuCount,
                maxItemCount: maxItemCount,
                manager: this.manager,
                thisView: this
            };

            if (this.termTileContextMenuView) {
                this.termTileContextMenuView = null;
            }

            this.termTileContextMenuView = _CONTEXTMENU.initContextMenu(options);

            $contextMenuItem.off(strSelectEvent).on(strSelectEvent, function (event, ui) {
                self._handleTermTileContextMenuSelect(event, ui);
            });

            $contextMenuItem.off(strHideEvent).on(strHideEvent, function (event, ui) {
                var currentTileIndex = null,
                      view = null,
                    $requiredTile = $(this),
                    currTilePos = $requiredTile.offset(),
                    isMarquee = self.marqueeSelectedItems.length > 0,
                    accOffset = 2,
                    offset = {
                        'left': currTilePos.left + accOffset - (isMarquee ? 0 : 1),
                        'top': currTilePos.top + accOffset - (isMarquee ? 0 : 1)
                    },
                    size = {
                        'width': $requiredTile.width() - 2 * accOffset,
                        'height': $requiredTile.height() - 2 * accOffset
                    };

                $requiredTile.offset(offset);
                $requiredTile.css(size);

                if ($(this).hasClass('lhs-focus-div') === true) {
                    //currentTileIndex = self.leftTileIndex;
                    //$requiredTile = self.leftTileArray[currentTileIndex].$el;
                    view = self.leftTileArray[self.leftTileIndex];
                    if (!isMarquee) {
                        self._setPositionOfFocusDiv(typeof view === 'string' ? self.$lhsExprView.find(view) : view.$el, true);
                    }
                    else {
                        self._setPositionOfFocusDiv($requiredTile, true, { isMarquee: true });
                    }
                }
                else {
                    //currentTileIndex = self.rightTileIndex;
                    //$requiredTile = self.rightTileArray[currentTileIndex].$el;
                    view = self.rightTileArray[self.rightTileIndex];
                    if (!isMarquee) {
                        self._setPositionOfFocusDiv(typeof view === 'string' ? self.$rhsExprView.find(view) : view.$el, false);
                    }
                    else {
                        self._setPositionOfFocusDiv($requiredTile, false, { isMarquee: true });
                    }
                }
            });

            $contextMenuItem.off(strOpenEvent).on(strOpenEvent, function (event, ui) {
                var contextMenuHolder = self.player.$('.contextMenuHolder'),
                    contextMenuHeight = parseInt(contextMenuHolder.css('height'));

                contextMenuHolder.css('height', contextMenuHeight + 1);
                //self.termTileContextMenuView.updateContextMenuHeight();
                self.setFocus('term-tiles-context-menu-0');
            });
        },

        _handleTermTileContextMenuSelect: function _handleTermTileContextMenuSelect(event, ui) {
            var dropId = $(ui.currentTarget).attr('id'),
                contextMenuRowNumber = parseInt(dropId.split(this.idPrefix + 'term-tiles-context-menu-')[1]),
                currentTarget = event.currentTarget,
                selectedTileView = null,
                requiredIndex = null,
                left = null;

            if ($(currentTarget).hasClass('lhs-focus-div') === true) {
                requiredIndex = this.leftTileIndex;
                selectedTileView = this.leftTileArray[requiredIndex];
                left = true;
            }
            else {
                requiredIndex = this.rightTileIndex;
                selectedTileView = this.rightTileArray[requiredIndex];
                left = false;
            }
            //

            switch (contextMenuRowNumber) {
                case 0:
                    this.$selectedTile = selectedTileView;
                    this.prevTileIndex = requiredIndex;
                    if (typeof selectedTileView !== 'string') {
                        selectedTileView._onBaseClick();
                    }
                    else {
                        this.onExponentClick(this.exponentParenthesisView);
                    }
                    this._updateTileArray();
                    this._resetParametersOnFocusOutOfLastElement();
                    this._setFocus();
                    break;
                case 1:
                    //Send Focus On left side first element

                    if (left) {
                        // If selected tile is on left side
                        this._handleSpaceOnFocusDiv(true, event);
                    }
                    else {
                        // If selected tile is on right side
                        this._handleSpaceOnFocusDiv(false, event);
                        this._handleFocusOutOnFocusDiv(false);
                        this.leftTileIndex = -1;
                        this.rightTileIndex = this.rightTileArray.length - 1;
                        this._goToNextTile(true);
                        this._bindKeyDownOnFocusDiv(this.lhsFocusDiv, true);
                    }

                    this.isSpaceKeyDown = false;
                    break;
                case 2:
                    //Send Focus on right side first element

                    if (!left) {
                        // If selected tile is on right side
                        this._handleSpaceOnFocusDiv(false, event);
                    }
                    else {
                        // If selected tile is on left side
                        this._handleSpaceOnFocusDiv(true, event);
                        this._handleFocusOutOnFocusDiv(true);
                        this.leftTileIndex = this.leftTileArray.length - 1;
                        this.rightTileIndex = -1;
                        this._goToNextTile(false);
                        this._bindKeyDownOnFocusDiv(this.rhsFocusDiv, false);
                    }

                    this.isSpaceKeyDown = false;

                    break;
            }
        },

        _handleContextMenuOpenEvent: function _handleContextMenuOpenEvent(isBind) {
            var $contextMenuItem = this.$equationCOntainer.find('.dummy-acc-focus-div'),
                strOpenEvent = MathInteractives.global.ContextMenu.CONTEXTMENU_OPEN,
                self = this;

            if (isBind === true) {
                this.termTileContextMenuView.editContextMenu(this.termTileContextMenuAllIds, false);
            }
            else {
                this.termTileContextMenuView.editContextMenu(this.termTileContextMenuAllIds, true);
            }
        },

        _setTermTileContextMenuAllIds: function _setTermTileContextMenuAllIds() {
            var counter = 0,
                endValue = 3,
                idPrefix = this.idPrefix;

            this.termTileContextMenuAllIds.length = 0;
            this.termTileContextMenuFirstId.length = 0;
            this.termTileContextMenuFirstId.push(idPrefix + 'term-tiles-context-menu-0');
            for (; counter < endValue; counter++) {
                this.termTileContextMenuAllIds.push(idPrefix + 'term-tiles-context-menu-' + counter);
            }
        },

        _ignoreBinTileSignChangeRow: function _ignoreBinTileSignChangeRow(isIgnoreFirstRow) {
            if (isIgnoreFirstRow === true) {
                this.contextMenuView.editContextMenu(this.binTileContextMenuFirstId, true);
            }
            else {
                this.contextMenuView.editContextMenu(this.binTileContextMenuFirstId, false);
            }
        },

        ignoreMultipleBinTileRows: function ignoreMultipleBinTileRows(isIgnore, ignoredAttributesIndexes) {
            var counter = 0,
                //endValue = ignoredAttributesIndexes.length,
                endValue = Math.ceil(Math.log(ignoredAttributesIndexes) / Math.log(2)),
                ignoredAttributes = [],
                partialId = this.idPrefix + 'bin-tiles-context-menu-';

            for (; counter < endValue; counter++) {
                if (ignoredAttributesIndexes & Math.pow(2, counter)) {
                    //ignoredAttributes.push(partialId + ignoredAttributesIndexes[counter]);
                    ignoredAttributes.push(partialId + counter);
                }
            }

            if (isIgnore === true) {
                this.contextMenuView.editContextMenu(ignoredAttributes, true);
            }
            else {
                this.contextMenuView.editContextMenu(ignoredAttributes, false);
            }
        },

        ignoreMultipleTermTileRows: function ignoreMultipleTermTileRows(isIgnore, ignoredAttributesIndexes) {
            var counter = 0,
                //endValue = ignoredAttributesIndexes.length,
                endValue = Math.ceil(Math.log(ignoredAttributesIndexes) / Math.log(2)),
                ignoredAttributes = [],
                partialId = this.idPrefix + 'term-tiles-context-menu-';

            for (; counter <= endValue; counter++) {
                if (ignoredAttributesIndexes & Math.pow(2, counter)) {
                    //ignoredAttributes.push(partialId + ignoredAttributesIndexes[counter]);
                    ignoredAttributes.push(partialId + counter);
                }
            }

            if (isIgnore === true) {
                this.termTileContextMenuView.editContextMenu(ignoredAttributes, true);
            }
            else {
                this.termTileContextMenuView.editContextMenu(ignoredAttributes, false);
            }
        },

        _createContextMenuAgain: function _createContextMenuAgain() {
            //EMPTY FUNCTION. DO NOT REMOVE.
        },

        _ignoreCombineOption: function _ignoreCombineOption(isLeftSide, isIgnore) {
            if (isLeftSide === true) {
                this.termTileContextMenuView.editContextMenu([this.idPrefix + 'term-tiles-context-menu-0', this.idPrefix + 'term-tiles-context-menu-1'], isIgnore);
            }
            else {
                this.termTileContextMenuView.editContextMenu([this.idPrefix + 'term-tiles-context-menu-0', this.idPrefix + 'term-tiles-context-menu-2'], isIgnore);
            }
            this.isIgnoreCombine = isIgnore;
        },

        setTutorialIgnoreIndex: function setTutorialIgnoreIndex(index) {
            this.ignoreIndexForTutorial = index;
        }

    }, {

    });
})(window.MathInteractives);
