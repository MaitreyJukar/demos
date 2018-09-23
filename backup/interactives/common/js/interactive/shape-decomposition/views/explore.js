( function () {
    'use strict';

    /*
	*
	*   D E S C R I P T I O N
	*
	* @class ExploreClass
	* @namespace MathInteractives.Common.Interactivities.ShapeDecomposition.Views
    * @extends MathInteractives.Common.Player.Views.Base
	* @constructor
	*/

    MathInteractives.Common.Interactivities.ShapeDecomposition.Views.ExploreClass = MathInteractives.Common.Player.Views.Base.extend( {
        /**
        * Stores view of next button
        * @property nextButtonView
        * @type object
        * @default null
        **/
        nextButtonView: null,
        /**
        * Stores view of check button
        * @property checkButtonView
        * @type object
        * @default null
        **/
        checkButtonView: null,
        /**
        * Stores view of done button
        * @property doneButtonView
        * @type object
        * @default null
        **/
        doneButtonView: null,
        /**
        * Stores view of left panel
        * @property leftPanelView
        * @type object
        * @default null
        **/
        leftPanelView: null,
        /**
        * Stores view of right panel
        * @property rightPanelView
        * @type object
        * @default null
        **/
        rightPanelView: null,
        /**
        * Stores view of undo button
        * @property undoButtonView
        * @type object
        * @default null
        **/
        undoButtonView: null,
        /**
        * Stores view of cut button
        * @property cutButtonView
        * @type object
        * @default null
        **/
        cutButtonView: null,
        /**
        * Stores view of copy button
        * @property copyButtonView
        * @type object
        * @default null
        **/
        copyButtonView: null,
        /**
        * Stores view of reflect button
        * @property reflectButtonView
        * @type object
        * @default null
        **/
        reflectButtonView: null,
        /**
        * Stores view of rotate button
        * @property rotateButtonView
        * @type object
        * @default null
        **/
        rotateButtonView: null,
        /**
        * Stores view of cut line button that moves with line.
        * @property cutLineButtonView
        * @type object
        * @default null
        **/
        cutLineButtonView: null,
        /**
        * Holds model namespace
        * @property modelNamespace
        * @type Object
        * @default null
        **/
        modelNamespace: MathInteractives.Common.Interactivities.ShapeDecomposition.Models.ShapeDecompositionData,
        /**
        * Initialises Explore Class
        *
        * @method initialize
        **/
        initialize: function () {
            this.initializeDefaultProperties();
            this.bindListener();
            this.render();
            this.player.bindTabChange( function () {
                this.stopReading();
                if ( this.directionTextView2.$el.css( 'display' ) === 'block' ) {
                    this.setFocus( 'explore-instruction-bar-2-direction-text-text' );
                }
                else if ( this.directionTextView1.$el.css( 'display' ) === 'block' ) {
                    this.setFocus( 'explore-instruction-bar-1-direction-text-text' );
                }
                else if ( this.directionTextView0.$el.css( 'display' ) === 'block' ) {
                    this.setFocus( 'explore-instruction-bar-0-direction-text-text' );
                }
            }, this, 1 );
        },

        /**
        * Renders the view of explore tab
        * @method render
        * @public
        **/
        render: function render() {
            var containerId = this.idPrefix + 'left-panel-screen';
            this.$el.css( { 'background-image': 'url("' + this.getImagePath( 'bg-image' ) + '")' } );
            this.loadScreen( 'explore-screen' );
            this._initializeDirectionText();
            this._createButtons();
            this._setHelpElements();
            this.leftPanelView = new MathInteractives.Common.Interactivities.ShapeDecomposition.Views.CanvasAccessibility( {
                model: this.model,
                el: '#' + containerId
            } );

            containerId = this.idPrefix + 'right-panel-screen';
            this.rightPanelView = new MathInteractives.Common.Interactivities.ShapeDecomposition.Views.RightPanel( {
                model: this.model,
                el: '#' + containerId
            });
            if (this.model.get('type') === 1) {
                //this.player.enableHelpElement('explore-instruction-bar-1-direction-text-buttonholder', '0', false);
                this.$('#shape-decomposition-1-explore-instruction-bar-1-direction-text-buttonholder').hide();
            }

        },

        /**
        * Bind event listener on model
        * @method bindListener
        * @private
        **/
        bindListener: function bindListener() {
            this.listenTo( this.model, this.modelNamespace.EVENTS.HIDE_BUTTON, this._hideButton );
            this.listenTo( this.model, this.modelNamespace.EVENTS.DISABLE_BUTTON, this._disableButton );
            this.listenTo( this.model, this.modelNamespace.EVENTS.CHANGE_DIRECTION_TEXT, this._updateDirectionText );
        },

        /**
        * Generates the direction text
        * @method _initializeDirectionText
        * @private
        **/
        _initializeDirectionText: function _initializeDirectionText() {
            var directionTextButtonProperties, directionProperties, options;
            directionTextButtonProperties = {
                buttonTabIndex: 2000,
                showButton: true,
                buttonText: this.getMessage( 'explore-texts', '0' ),
                btnColorType: MathInteractives.global.Theme2.Button.COLORTYPE.BLUE,
                btnBaseClass: 'buttonBaseClass',
                clickCallback: {
                    fnc: this._generateTryanotherPopup,
                    scope: this
                }
            };
            directionProperties = {
                text: this.getMessage( 'direction-texts', '0' ),
                accText: this.getAccMessage( 'direction-texts', '0' ),
                idPrefix: this.idPrefix,
                containerId: this.idPrefix + 'explore-instruction-bar-0',
                manager: this.manager,
                player: this.player,
                path: this.filePath,
                tabIndex: 1200,
                containmentBGcolor: 'rgba(0,0,0,.14) ',
                ttsBaseClass: 'tts-base-class'
            };
            this.directionTextView0 = MathInteractives.global.Theme2.DirectionText.generateDirectionText( directionProperties );

            directionProperties.containerId = this.idPrefix + 'explore-instruction-bar-1';
            directionProperties.text = this.getMessage( 'direction-texts', '1' );
            directionProperties.accText = this.getAccMessage( 'direction-texts', '1' );
            options = directionProperties;
            if ( this.model.get( 'type' ) === 2 ) {
                options = $.extend( true, {}, directionProperties, directionTextButtonProperties );
            }
            this.directionTextView1 = MathInteractives.global.Theme2.DirectionText.generateDirectionText(options);
            
            directionProperties.containerId = this.idPrefix + 'explore-instruction-bar-2';
            directionProperties.text = this.getMessage( 'direction-texts', '2' );
            directionProperties.accText = this.getAccMessage( 'direction-texts', '2' );
            options = $.extend( true, {}, directionProperties, directionTextButtonProperties );
            this.directionTextView2 = MathInteractives.global.Theme2.DirectionText.generateDirectionText( options );

            this.directionTextView1.$el.hide();
            this.directionTextView2.$el.hide();
        },

        /**
        * Updates the direction text by displaying the direction text required and hiding the other direction texts.
        *
        * @method _updateDirectionText
        * @param directionTextNumber {String} Number indicating the direction text view to be displayed
        * @private
        */
        _updateDirectionText: function _updateDirectionText( directionTextNumber ) {
            this.$( '.explore-instruction-bars' ).hide();
            this.$( '.explore-instruction-bar-' + directionTextNumber ).show();
        },

        /**
        * Generates try another popup
        * @method _generateTryanotherPopup
        * @private
        **/
        _generateTryanotherPopup: function () {
            this.stopReading();
            var changed = false;
            if ( changed === false ) {
                MathInteractives.global.Theme2.PopUpBox.createPopup( {
                    manager: this.manager,
                    player: this.player,
                    path: this.filePath,
                    idPrefix: this.idPrefix,
                    title: this.getMessage( 'explore-texts', '1' ),
                    accTitle: this.getAccMessage( 'explore-texts', '1' ),
                    text: this.getMessage( 'explore-texts', '2' ),
                    accText: this.getAccMessage( 'explore-texts', '2' ),
                    type: MathInteractives.global.Theme2.PopUpBox.CONFIRM,
                    buttons: [
                        {
                            id: 'pop-up-yes',
                            type: MathInteractives.global.Theme2.Button.TYPE.TEXT,
                            text: this.getMessage( 'explore-texts', 'yes-button-text' ),
                            clickCallBack: {
                                fnc: this.onTryAnotherClick,
                                scope: this
                            },
                            response: { isPositive: true, buttonClicked: 'pop-up-yes' }
                        },
                        {
                            id: 'pop-up-cancel',
                            type: MathInteractives.global.Theme2.Button.TYPE.TEXT,
                            text: this.getMessage( 'explore-texts', 'cancel-button-text' ),
                            clickCallBack: {
                                fnc: this.onTryAnotherCancelClick,
                                scope: this
                            },
                            response: { isPositive: true, buttonClicked: 'pop-up-cancel' }
                        }
                    ]
                } );
            }
            else {
                this.onTryAnotherClick();
            }
        },

        /**
        * Gives a call to generate buttons
        * @method _createButtons
        * @private
        **/
        _createButtons: function _createButtons() {
            var idName,
                buttonType = MathInteractives.global.Theme2.Button.TYPE.FA_ICON,
                iconObject,
                text,
                tooltipText;
            //Call for Undo Button
            idName = 'undo-button-container';
            iconObject = { 'faClass': this.getFontAwesomeClass( 'fixed-undo' ), 'fontColor': '#ffffff', 'width': 44 };
            tooltipText = this.getMessage( 'explore-texts', 'undo-button-text' );
            this.undoButtonView = this._generateButton( idName, buttonType, iconObject, text, tooltipText );

            //Call for cut Button
            idName = 'cut-button-container';
            iconObject = { 'faClass': this.getFontAwesomeClass( 'fixed-cut' ), 'fontColor': '#ffffff', 'width': 44 };
            tooltipText = this.getMessage( 'explore-texts', 'cut-button-text' );
            this.cutButtonView = this._generateButton( idName, buttonType, iconObject, text, tooltipText );

            //Call for cut Button
            idName = 'cut-line-button';
            iconObject = { 'faClass': this.getFontAwesomeClass( 'fixed-cut' ), 'fontColor': '#ffffff', 'width': 44 };
            tooltipText = this.getMessage( 'explore-texts', 'cut-button-text' );
            this.cutLineButtonView = this._generateButton( idName, buttonType, iconObject, text, tooltipText );

            //Call for copy Button
            idName = 'copy-button-container';
            iconObject = { 'faClass': this.getFontAwesomeClass( 'fixed-copy' ), 'fontColor': '#ffffff', 'width': 44 };
            tooltipText = this.getMessage( 'explore-texts', 'copy-button-text' );
            this.copyButtonView = this._generateButton( idName, buttonType, iconObject, text, tooltipText );

            //Changing Button Type
            buttonType = MathInteractives.global.Theme2.Button.TYPE.ICON;

            //Call for Reflect Button
            idName = 'reflect-button-container';
            iconObject = {
                'iconPath': this.getImagePath( 'reflect' ),
                'height': 18,
                'width': 22
            };
            tooltipText = this.getMessage( 'explore-texts', 'reflect-button-text' );
            this.reflectButtonView = this._generateButton( idName, buttonType, iconObject, text, tooltipText );

            //Call for Rotate Button
            idName = 'rotate-button-container';
            iconObject = {
                'iconPath': this.getImagePath( 'rotate' ),
                'height': 18,
                'width': 18
            };
            tooltipText = this.getMessage( 'explore-texts', 'rotate-button-text' );
            this.rotateButtonView = this._generateButton( idName, buttonType, iconObject, text, tooltipText );

            // Changing Button TYpe
            buttonType = MathInteractives.global.Theme2.Button.TYPE.TEXT;

            //Call for Done Button
            idName = 'done-button-container';
            iconObject = {};
            text = this.getMessage( 'explore-texts', 'done-button-text' );
            this.doneButtonView = this._generateButton( idName, buttonType, iconObject, text );

            //Call for Check Button
            idName = 'check-button-container';
            iconObject = {};
            text = this.getMessage( 'explore-texts', 'check-button-text' );
            this.checkButtonView = this._generateButton( idName, buttonType, iconObject, text );

            // Changing Button Type
            buttonType = MathInteractives.global.Theme2.Button.TYPE.FA_ICONTEXT;

            //Call for Next Button
            idName = 'next-button-container';
            text = this.getMessage( 'explore-texts', 'next-button-text' );
            iconObject = { 'faClass': this.getFontAwesomeClass( 'fixed-next' ), 'fontColor': '#ffffff', 'width': 15, 'height': 15 };
            this.nextButtonView = this._generateButton( idName, buttonType, iconObject, text );
        },

        /**
        * Generates buttons and returns a view
        * @method _generateButton
        * @private
        **/
        _generateButton: function _generateButton( idName, buttonType, iconObject, text, tooltipText ) {
            var data = {
                id: this.idPrefix + idName,
                type: buttonType,
                fixedMinWidth: true,
                height: 38,
                baseClass: 'buttonBaseClass',
                textColor: '#ffffff'
            };

            if ( buttonType === MathInteractives.global.Theme2.Button.TYPE.FA_ICON || buttonType === MathInteractives.global.Theme2.Button.TYPE.ICON ) {
                data['width'] = 44;
                data['icon'] = iconObject;
                data['tooltipText'] = tooltipText;
                data['tooltipType'] = MathInteractives.Common.Components.Theme2.Views.Tooltip.ARROW_TYPE.RIGHT_MIDDLE;
            }
            else if ( buttonType === MathInteractives.global.Theme2.Button.TYPE.TEXT ) {
                data['text'] = text;
            }
            else {
                data['width'] = 115;
                data['icon'] = iconObject;
                data['text'] = text;
                data['textPosition'] = 'left';
            }

            var btnView = MathInteractives.global.Theme2.Button.generateButton( {
                data: data,
                path: this.filePath,
                player: this.player,
                manager: this.manager,
                idPrefix: this.idPrefix
            } );

            return btnView;
        },

        /**
        * Hides the specified Button if value is true else if false then shows button
        * @method _hideButton
        * @private
        **/
        _hideButton: function _hideButton( buttonName, bool ) {
            var actionEnum = this.modelNamespace.ACTION_ENUM;
            if ( bool ) {
                ( buttonName === actionEnum.UNDO ) ? this.undoButtonView.hideButton() : ( buttonName === actionEnum.CUT ) ? this.cutButtonView.hideButton() : ( buttonName === actionEnum.COPY ) ? this.copyButtonView.hideButton() : ( buttonName === actionEnum.REFLECT ) ? this.reflectButtonView.hideButton() : ( buttonName === actionEnum.ROTATE ) ? this.rotateButtonView.hideButton() : ( buttonName === actionEnum.DONE ) ? this.doneButtonView.hideButton() : ( buttonName === actionEnum.NEXT ) ? this.nextButtonView.hideButton() : ( buttonName === actionEnum.TRY_ANOTHER ) ? this.directionTextView.tryAnotherView.hideButton() : ( buttonName === actionEnum.CUT_LINE ) ? this.cutLineButtonView.hideButton() : this.checkButtonView.hideButton();
            }
            else {
                ( buttonName === actionEnum.UNDO ) ? this.undoButtonView.showButton() : ( buttonName === actionEnum.CUT ) ? this.cutButtonView.showButton() : ( buttonName === actionEnum.COPY ) ? this.copyButtonView.showButton() : ( buttonName === actionEnum.REFLECT ) ? this.reflectButtonView.showButton() : ( buttonName === actionEnum.ROTATE ) ? this.rotateButtonView.showButton() : ( buttonName === actionEnum.DONE ) ? this.doneButtonView.showButton() : ( buttonName === actionEnum.NEXT ) ? this.nextButtonView.showButton() : ( buttonName === actionEnum.TRY_ANOTHER ) ? this.directionTextView.tryAnotherView.showButton() : ( buttonName === actionEnum.CUT_LINE ) ? this.cutLineButtonView.showButton() : this.checkButtonView.showButton();
            }
        },

        /**
        * Disables the specified Button if value is true else if false then enables button.
        * @method _disableButton
        * @private
        **/
        _disableButton: function _disableButton( buttonName, bool ) {
            var state,
                actionEnum = this.modelNamespace.ACTION_ENUM;
            if ( bool ) {
                state = MathInteractives.global.Theme2.Button.BUTTON_STATE_DISABLED;
                ( buttonName === actionEnum.UNDO ) ? this.undoButtonView.setButtonState( state ) : ( buttonName === actionEnum.CUT ) ? this.cutButtonView.setButtonState( state ) : ( buttonName === actionEnum.COPY ) ? this.copyButtonView.setButtonState( state ) : ( buttonName === actionEnum.REFLECT ) ? this.reflectButtonView.setButtonState( state ) : ( buttonName === actionEnum.ROTATE ) ? this.rotateButtonView.setButtonState( state ) : ( buttonName === actionEnum.DONE ) ? this.doneButtonView.setButtonState( state ) : ( buttonName === actionEnum.NEXT ) ? this.nextButtonView.setButtonState( state ) : ( buttonName === actionEnum.CUT_LINE ) ? this.cutLineButtonView.setButtonState( state ) : this.checkButtonView.setButtonState( state );
            }
            else {
                state = MathInteractives.global.Theme2.Button.BUTTON_STATE_ACTIVE;
                ( buttonName === actionEnum.UNDO ) ? this.undoButtonView.setButtonState( state ) : ( buttonName === actionEnum.CUT ) ? this.cutButtonView.setButtonState( state ) : ( buttonName === actionEnum.COPY ) ? this.copyButtonView.setButtonState( state ) : ( buttonName === actionEnum.REFLECT ) ? this.reflectButtonView.setButtonState( state ) : ( buttonName === actionEnum.ROTATE ) ? this.rotateButtonView.setButtonState( state ) : ( buttonName === actionEnum.DONE ) ? this.doneButtonView.setButtonState( state ) : ( buttonName === actionEnum.NEXT ) ? this.nextButtonView.setButtonState( state ) : ( buttonName === actionEnum.CUT_LINE ) ? this.cutLineButtonView.setButtonState( state ) : this.checkButtonView.setButtonState( state );
            }
        },

        /**
        * sets up help screen elements.
        * @method _setHelpElements
        * @private
        */
        _setHelpElements: function _setHelpElements() {
            this.loadScreen( 'help-screen' );
            var helpElements = this.model.get( 'helpElements' );
            if ( helpElements.length === 0 ) {
                helpElements.push(
                    /*{
                        elementId: 'work-canvas',
                        helpId: 'explore-help',
                        fromElementCenter: true,
                        hideArrowDiv: true,
                        msgId: 1,
                        positionArray: ['top']
                    },*/
                    {
                        elementId: 'cut-button-container',
                        helpId: 'explore-help',
                        fromElementCenter: false,
                        hideArrowDiv: false,
                        msgId: 9,
                        positionArray: ['right']
                    },
                    {
                        elementId: 'copy-button-container',
                        helpId: 'explore-help',
                        fromElementCenter: false,
                        hideArrowDiv: false,
                        msgId: 10,
                        positionArray: ['right']
                    },
                    {
                        elementId: 'reflect-button-container',
                        helpId: 'explore-help',
                        fromElementCenter: false,
                        hideArrowDiv: false,
                        msgId: 11,
                        positionArray: ['right']
                    },
                    {
                        elementId: 'rotate-button-container',
                        helpId: 'explore-help',
                        fromElementCenter: false,
                        hideArrowDiv: false,
                        msgId: 12,
                        positionArray: ['right']
                    },
                    {
                        elementId: 'undo-button-container',
                        helpId: 'explore-help',
                        fromElementCenter: false,
                        hideArrowDiv: false,
                        msgId: 13,
                        positionArray: ['right']
                    },
                    {
                        elementId: 'actual-shape-table-wrapper',
                        helpId: 'explore-help',
                        fromElementCenter: false,
                        hideArrowDiv: false,
                        msgId: 3
                    },
                    {
                        elementId: 'left-panel-canvas-acc-container',
                        helpId: 'explore-help',
                        fromElementCenter: true,
                        hideArrowDiv: true,
                        msgId: 0,
                        positionArray: ['top']
                    },
                    {
                        elementId: 'check-button-container',
                        helpId: 'explore-help',
                        fromElementCenter: false,
                        hideArrowDiv: false,
                        msgId: 8,
                        positionArray: ['top']
                    },/*
                    {
                        elementId: 'work-canvas',
                        helpId: 'explore-help',
                        fromElementCenter: true,
                        hideArrowDiv: true,
                        //tooltipWidth: 276,
                        msgId: 4,
                        positionArray: ['top']
                    },*/
                    {
                        elementId: 'done-button-container',
                        helpId: 'explore-help',
                        fromElementCenter: false,
                        hideArrowDiv: false,
                        msgId: 5,
                        positionArray: ['top']
                    },
                    {
                        elementId: 'next-button-container',
                        helpId: 'explore-help',
                        fromElementCenter: false,
                        hideArrowDiv: false,
                        msgId: 7,
                        positionArray: ['top']
                    },
                    //{
                    //    elementId: 'explore-instruction-bar-0-direction-text-buttonholder',
                    //    helpId: 'explore-help',
                    //    fromElementCenter: false,
                    //    hideArrowDiv: false,
                    //    msgId: 6
                    //},
                    {
                        elementId: 'explore-instruction-bar-1-direction-text-buttonholder',
                        helpId: 'explore-help',
                        fromElementCenter: false,
                        hideArrowDiv: false,
                        msgId: 6
                    },
                    {
                        elementId: 'explore-instruction-bar-2-direction-text-buttonholder',
                        helpId: 'explore-help',
                        fromElementCenter: false,
                        hideArrowDiv: false,
                        msgId: 6
                    }
                );
            }
        },

        /**
        * Calls On Try another cancel click
        * @method onTryAnotherCancelClick
        * @private
        **/
        onTryAnotherCancelClick: function onTryAnotherCancelClick() {
            this.stopReading();
            this.setFocus( 'explore-instruction-bar-1-direction-text-buttonholder' );
            this.setFocus( 'explore-instruction-bar-2-direction-text-buttonholder' );
        },

        /**
        * Calls On Try another yes click
        * @method onTryAnotherClick
        * @private
        **/
        onTryAnotherClick: function onTryAnotherClick() {
            this.stopReading();
            this.model.trigger( this.modelNamespace.EVENTS.TRY_ANOTHER_CLICK );
        }
    } );
} )();
