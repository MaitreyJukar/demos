(function () {
    'use strict';

    var namespace = MathInteractives.Common.Interactivities.ExponentAccordion.Views,
        equationManagerViewNamespace = MathInteractives.Common.Components.Views.EquationManager,
        equationManagerModelNamespace = MathInteractives.Common.Components.Models.EquationManager;

    /**
    * Interactivity specific EquationManager for Build mode
    *
    * @class EquationManager
    * @constructor
    * @type Object
    * @extends MathInteractives.Common.Components.Views.EquationManager.EquationManager
    * @namespace MathInteractives.Common.Interactivities.ExponentAccordion.Views
    */
    namespace.EquationManager = equationManagerViewNamespace.EquationManager.extend({

        currentLevel : null,

        $changeSignButton: null,

        initialize: function () {
            namespace.FormExpressionEquationManager.__super__.initialize.apply(this, arguments);
        },

        setCurrentLevel: function setCurrentLevel (level) {
            this.currentLevel = level;
        },

        _getExponentTooltipHtml: function _getExponentTooltipHtml(index) {
            var $buttonsContainer = $('<div></div>').attr({ 'id': this.idPrefix + 'exponent-tooltip-buttons-container-' + index, 'class': 'exponent-tooltip-buttons-container' }),
                $applyExponentButton = $('<div></div>').attr({ 'id': this.idPrefix + 'apply-exponent-button-' + index, 'class': 'apply-exponent-button' }).appendTo($buttonsContainer),
                $changeSignButton = $('<div></div>').attr({ 'id': this.idPrefix + 'change-sign-button-' + index, 'class': 'change-sign-button' }).appendTo($buttonsContainer);

            this.$changeSignButton = $changeSignButton;
            this.trigger(namespace.EquationManager.GET_CURRENT_LEVEL);
            return $buttonsContainer;
        },

        _generateButtonsInsideTooltip: function (index, view) {
            this.trigger(namespace.EquationManager.GET_CURRENT_LEVEL);
            var buttonProperties, self = this,
                ButtonClass = MathInteractives.global.Theme2.Button,
                applyExponentViewsLen = this.applyExponentBtnViews.length,
                changeSignViewsLen = this.changeSignBtnViews.length;
            buttonProperties = {
                idPrefix: this.idPrefix,
                player: this.player,
                manager: this.manager,
                path: this.filePath,
                data: {
                    id: this.idPrefix + 'apply-exponent-button-' + index,
                    text: this.getMessage('exponent-parenthesis-tooltip', 'apply-exponent'),
                    type: MathInteractives.global.Theme2.Button.TYPE.TEXT,
                    baseClass: 'white-button',
                    textColor: '#007ebf'
                }
            };
            this.applyExponentBtnViews[index] = new ButtonClass.generateButton(buttonProperties);
            this._createAccDivsOfButtons(buttonProperties.data.id, buttonProperties.data.text, 511);
            this.applyExponentBtnViews[index].$el.off('click').on('click', null, { 'view': view }, function (event) {
                self.applyExponentClick(event);
                self.solveModeSetFocusOnTooltip();
            });


            this.applyExponentBtnViews[index].$el.off('keydown').on('keydown', function (event) {
                var uniCode = event.keyCode ? event.keyCode : event.charCode;

                if (uniCode === 9 && event.shiftKey) {
                    event.preventDefault();
                    var currentAccView = self.getCurrentAccView();
                    //currentAccView.removeAccDiv();
                    currentAccView.startAcc();
                    self.hideAllTooltips();
                    //self.setFocus('change-sign-button-' + index);
                }
                else if (uniCode === 27) {
                    event.preventDefault();
                    var currentAccView = self.getCurrentAccView();
                    //currentAccView.removeAccDiv();
                    currentAccView.startAcc();
                    self.hideAllTooltips();
                }
                else if (uniCode === 9) {
                    if(self.currentLevel <= 4 || self._tutorialMode) {
                        event.preventDefault();
                        self.hideAllTooltips();
                        self.setFocus('solve-mode-replay-btn');
                    }
                }
            });


            if (this.currentLevel === 5) {
                buttonProperties.data.id = this.idPrefix + 'change-sign-button-' + index;
                buttonProperties.data.text = this.getMessage('exponent-parenthesis-tooltip', 'change-sign');
                buttonProperties.data.width = 173;
                this.changeSignBtnViews[index] = new ButtonClass.generateButton(buttonProperties);

                this._createAccDivsOfButtons(buttonProperties.data.id, buttonProperties.data.text, 512);

                this.changeSignBtnViews[index].$el.off('click').on('click', null, { 'view': view }, function (event) {
                    var isSuccess = self.changeSignClick(event);
                    self.solveModeSetFocusOnTooltip();
                    self.hideAllTooltips();
                });

                this.changeSignBtnViews[index].$el.off('keydown').on('keydown', function (event) {
                    var uniCode = event.keyCode ? event.keyCode : event.charCode;

                    if (uniCode === 9 && event.shiftKey) {
                        if(self._tutorialMode) {
                            event.preventDefault();
                            var currentAccView = self.getCurrentAccView();
                            currentAccView.removeAccDiv();
                            currentAccView.startAcc();
                            self.hideAllTooltips();
                        }
                    }
                    else if (uniCode === 27) {
                        event.preventDefault();
                        var currentAccView = self.getCurrentAccView();
                        currentAccView.removeAccDiv();
                        currentAccView.startAcc();
                        self.hideAllTooltips();
                    }
                    else if (uniCode === 9) {
                        if(!self._tutorialMode) {
                            event.preventDefault();
                            var currentAccView = self.getCurrentAccView();
                            currentAccView.continueAcc();
                            self.hideAllTooltips();
                            //self.setFocus('apply-exponent-button-' + index);
                        }
                        else {
                            event.preventDefault();
                            self.hideAllTooltips();
                            self.setFocus('solve-mode-replay-btn');
                        }
                    }
                });
            }

        },


        getLeftOffsetEV: function getLeftOffsetEV () {
            this.trigger(namespace.EquationManager.GET_CURRENT_LEVEL);
            if(this.currentLevel < 3) {
                return {
                    left: 10,
                    width: 0
                };
            }
            else return {
                left: 5,
                width: 8
            };
        },

        /**
        * Updates the context menu rows whenever the focus is changed.
        * Overrides EM updateCtxMenuRows to implement interactive specific ctx menu handling.
        * @method updateCtxMenuRows
        */
        updateCtxMenuRows: function () {
            var model = this.model,
                isParenthesesAllowed = model.get('isParenthesesAllowed'),
                currentAccTile = this.getCurrentAccView(),
                isDenominator = currentAccTile.model.get('bDenominator'),
                CTX_ITEM_ID = equationManagerViewNamespace.EquationManager.CTX_ITEM_ID,
                TYPE = equationManagerModelNamespace.TileItem.BinTileType,
                MODE = equationManagerModelNamespace.EquationManager.MODES,
                OPERATION = equationManagerModelNamespace.EquationComponent.Operations,
                allowedOperation = this.commandFactory.get('allowedOperation'),
                mode = this.model.get('mode'),
                self = this,
                type = null,
                rows = [],
                i = 0;

            if (!currentAccTile) {
                return;
            }
            type = currentAccTile.model.get('type');

            this.ignoreAllCtxRows();
            this.trigger(namespace.EquationManager.GET_CURRENT_LEVEL);

            if (mode === MODE.BuildMode) {
                // TODO : fraction exp
                if (isParenthesesAllowed && type !== TYPE.BIG_PARENTHESIS) {
                    if (this.isPosParensEnabled) {
                        rows.push(CTX_ITEM_ID.ADD_POS_PARENS);
                    }
                    if (this.isNegParensEnabled) {
                        rows.push(CTX_ITEM_ID.ADD_NEG_PARENS);
                    }
                    if (currentAccTile.isInsideParentheses()) {
                        rows.push(CTX_ITEM_ID.REMOVE_PARENS);
                    }
                }

                if (this.toShowDeleteRow()) {
                    rows.push(CTX_ITEM_ID.DELETE_TILE);
                }
            } else {
                if (type === TYPE.BASE_EXPONENT || type === TYPE.BASE_ONLY && !currentAccTile.model.isOne()) {
                    if (!this.isNumeratorEmpty() &&
                        (!isDenominator && this.tilesAvailableForCombine() || isDenominator)) {
                        rows.push(CTX_ITEM_ID.COMBINE_NUM);
                    }
                    if (!this.isDenominatorEmpty() &&
                        (isDenominator && this.tilesAvailableForCombine() || !isDenominator)) {
                        rows.push(CTX_ITEM_ID.COMBINE_DEN);
                    }

                    if (((OPERATION.BREAK_BASE_EXP_1 & allowedOperation) !== 0 || (OPERATION.BREAK_BASE_EXP_ANY & allowedOperation) !== 0) &&
                        Math.abs(currentAccTile.model.get('base')) !== 1) {
                        rows.push(CTX_ITEM_ID.BREAK_BASE);
                    }
                }
                if (type === TYPE.BASE_EXPONENT) {
                    if (Math.abs(currentAccTile.model.get('base')) === 1 || Math.abs(currentAccTile.model.get('exponent')) === 0) {
                        rows.push(CTX_ITEM_ID.APPLY_EXP);
                    } else {
                        rows.push(CTX_ITEM_ID.BREAK_EXP);
                    }
                }

                if (this.currentLevel > 2) {
                    if (type !== TYPE.BASE_ONLY && type !== TYPE.BIG_PARENTHESIS ||
                        type === TYPE.BASE_ONLY && !currentAccTile.model.isOne()) {
                        rows.push(CTX_ITEM_ID.REPOS_ACROSS_VINCULUM);
                    }
                }
            }

            // show allowed rows
            rows = _.map(rows, function (value, list) {
                return self.idPrefix + value;
            });
            this.tileCtxMenu.editContextMenu(rows, false);
        },

        /**
        * Returns a boolean whether there are tiles available for the currentAccTile for combining.
        * @method tilesAvailableForCombine
        * @param {Boolean} True if both numerator & denominator tiles to check. If False, only those
                           with isDenominator same as currentAccTile are checked.
        * @return {Boolean} True if tiles are available for combination. False otherwise.
        */
        tilesAvailableForCombine: function (numAndDenTiles) {
            var currentAccTile = this.getCurrentAccView(),
                isDenominator = currentAccTile.model.get('bDenominator');
            if (numAndDenTiles) {
                return _.difference(_.uniq(this.getAllBaseViews()), [currentAccTile]).length !== 0;
            }
            return _.difference(_.uniq(this.getAllBaseViews(isDenominator)), [currentAccTile]).length !== 0;
        },

        /**
         * Checks if glow allowed
         * @method isGlowAllowed
         * @public
         *
         * @returns {Boolean} [[Description]]
         */
        isZeroGlowAllowed: function isGlowAllowed () {
            this.trigger(namespace.EquationManager.GET_CURRENT_LEVEL);
            if(this.currentLevel === 5) {
                return true;
            }
            return false;
        }

    }, {
        GET_CURRENT_LEVEL : 'get-current-level'

    });

})();
