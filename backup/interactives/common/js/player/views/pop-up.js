
( function () {
    if ( MathInteractives.Common.Player.Views.PopUp ) {
        return;
    }
    'use strict';

    /**
    * View for rendering the pop-up and its related events
    *
    * @class PopUp
    * @constructor
    * @namespace MathInteractives.Common.Player.Views
    **/
    MathInteractives.Common.Player.Views.PopUp = MathInteractives.Common.Player.Views.Base.extend( {
        manager: null,
        player: null,

        /**
        * Holds the model of path for preloading files
        *
        * @property _path
        * @type Object
        * @default null
        */
        _path: null,

        /**
        * Calls render function
        *
        * @method initialize
        **/
        initialize: function () {

            this.manager = this.model.get( 'manager' );
            this.player = this.model.get( 'player' );
            this.idPrefix = this.player.getIDPrefix();
            this._path = this.model.get( 'path' );
            if ( this.player.getModalPresent() ) {
                if ( this._isSamePopupPresent() ) return;
            }
            this.render();
            this.attachEvents();
            var showCallback = this.model.get( 'showCallback' );
            if ( showCallback ) {
                showCallback.fnc.apply( showCallback.scope || this );
            }
        },

        /*Checks whether any popup present with same ID.
        * @method _isSamePopupPresent
        */
        _isSamePopupPresent: function _isSamePopupPresent() {
            var title = this.model.get( 'title' ),
                popupModalArray = this.player.$el.find( '.pop-up-modal' ),
                currentModalId;
            for ( var i = 0; i < popupModalArray.length; i++ ) {
                currentModalId = popupModalArray[0].id;
                if ( currentModalId === ( this.idPrefix + 'pop-up-modal' ) ) {
                    return true;
                }
            }
            return false;
        },

        /**
        * Renders the pop-up
        *
        * @method render
        **/
        render: function () {
            var type = this.type = this.model.get( 'type' );
            var model = this.model;
            var $player = this.player.$el;
            var text = model.get( 'text' ),
                accText = model.get( 'accText' ),
                self = this;
            self.keyDown = {};
            /*Decide title and title icon are passed or use from default one*/


            /* The code below is commented out since it prevents rendering the pop-up in 'No-text; mode

            if (!text) {
            return;
            }
            */


            this.generatePopUp( $player, text, accText, title, type );


            this.player.setModalPresent( true );

            /*Load Screen and acc msg*/
            this.loadScreen( 'player' );
            this.loadScreen( 'pop-up-box' );

            this.$el.off( 'keydown.popupAccessibility' ).on( 'keydown.popupAccessibility', function ( event ) {
                self.keyDown = event;
            } );

            this._setFocusToPopupTitleOnShiftTab = function () {
                if ( self.keyDown.shiftKey === true ) {
                    self.setFocus( 'pop-up-title-text' );
                }
            }

            this._setFocusToPopupTextOnTab = function () {
                if ( self.keyDown.shiftKey === false ) {
                    self.setFocus( 'pop-up-text' );
                }
            }

            this.focusOut( 'pop-up-text', this._setFocusToPopupTitleOnShiftTab, 1, false ); // unbind previous binds and then bind focusout
            this.focusOut( 'pop-up-text', this._setFocusToPopupTitleOnShiftTab, 1 );

            this.focusOut( 'pop-up-title-text', this._setFocusToPopupTextOnTab, 1, false ); // unbind previous binds and then bind focusout
            this.focusOut( 'pop-up-title-text', this._setFocusToPopupTextOnTab, 1 );

            var title = model.get( 'title' );
            var accTitle = model.get( 'accTitle' );
            title = ( title || type.id === 'custom' ) ? title : this.getMessage( 'pop-up-title-text', type.id );
            accTitle = ( accTitle || type.id === 'custom' ) ? accTitle : this.getAccMessage( 'pop-up-title-text', type.id );
            accTitle = accTitle + " " + this.getAccMessage( 'text-append-to-pop-up-title', 0 );

            var titleIcon = model.get( 'titleIcon' );
            titleIcon = titleIcon ? titleIcon : type.titleIcon;

            if ( accText ) {
                this.manager.setAccMessage( this.idPrefix + 'pop-up-text', accText );
            }

            if ( title ) {
                this.manager.setMessage( this.idPrefix + 'pop-up-title-text', title );
            }
            if ( accTitle ) {
                this.manager.setAccMessage( this.idPrefix + 'pop-up-title-text', accTitle );
            }
            this.generateButtons();
            this.setDimensions( $player, type, titleIcon );
            this.manager.setFocus( this.idPrefix + 'pop-up-title-text' );
        },

        /**
        * Holds the html elements and their corresponding event handlers 
        * 
        * @property events
        * @type Object
        */
        events: {

        },

        /*Generates Popup and attach it to DOM
        * @method generatePopUp
        */
        generatePopUp: function ( $player, text, accText, title, type ) {
            //remove title text if blank is passed
            if ( title === '' ) {
                this.$( '.pop-up-title-text' ).remove();

            }

            //pass parameters to template and append it to $el
            this.$el.append( MathInteractives.Common.Player.templates.popUp( {
                popupTitle: title,
                popupText: text,
                idPrefix: this.idPrefix
            } ).trim() );


            //append el to DOM
            $player.append( this.el );
        },

        /**
        * Generates Buttons
        * @method generateButtons
        **/
        generateButtons: function () {
            /*
            * Generate close button if hasCloseBtn pass true by interactivity
            */
            var dynamicHackDivObject = null,
            incrementer = 5;
            if ( this.model.get( 'hasCloseBtn' ) ) {
                var obj = {
                    id: this.idPrefix + 'pop-up-close-btn',
                    type: MathInteractives.Common.Components.Views.Button.TYPE.CLOSE_ORANGE,
                    path: this._path
                };

                MathInteractives.global.Button.generateButton( obj );
            }
            else {
                this.$el.find( '.pop-up-close-btn' ).remove();
            }

            /*
            * Add TTS button to title bar
            */
            var obj = {
                containerId: this.idPrefix + 'pop-up-tts-container',
                messagesToPlay: [this.idPrefix + 'pop-up-text'],
                path: this._path,
                player: this.player,
                idPrefix: this.idPrefix,
                manager: this.manager
            },
        ttsTabIndex = this.getTabIndex( 'pop-up-text' ) + incrementer;
            var view = MathInteractives.global.PlayerTTS.generateTTS( obj );
            view.renderTTSAccessibility( ttsTabIndex );

            /*
            * Add pop-up type specific buttons
            */
            var type = this.model.get( 'type' ),
            btnContainer = this.$( '#' + this.idPrefix + 'pop-up-btns-container' ),
            buttons = this.model.get( 'buttons' );
            buttons = buttons.length > 0 ? buttons : this.type.buttons;
            var buttonsLength = buttons.length;

            for ( var i = 0; i < buttonsLength; i++ ) {
                var btnDiv = $( '<div>', {
                    id: this.idPrefix + buttons[i].id,
                    class: 'pop-up-bottom-btn'
                } );

                btnContainer.append( btnDiv );

                dynamicHackDivObject = {

                    "elementId": buttons[i].id,
                    "tabIndex": ttsTabIndex + incrementer,
                    "role": "button",
                    "acc": buttons[i].text ? buttons[i].text : this.getMessage( buttons[i].id + "-text", "0" )
                };
                incrementer += 5;

                var obj = {
                    id: this.idPrefix + buttons[i].id,
                    type: MathInteractives.Common.Components.Views.Button.TYPE.GENERAL,
                    width: buttons[i].width ? buttons[i].width : null,
                    text: buttons[i].text ? buttons[i].text : this.getMessage( buttons[i].id + "-text", "0" ),
                    path: this._path,
                    btnWidthGroup: 'pop-up-buttons',
                    fixedMinWidth: true

                };

                MathInteractives.global.Button.generateButton( obj );  //  to create dynamic acc object as the divs are created dynamically.           

                this.createAccDiv( dynamicHackDivObject );
                btnDiv.on( 'click', { currentButton: buttons[i] }, $.proxy( this._bottomBtnClickHandler, this ) );
            }


            //this.updateFocusRect("pop-up-yes-btn");
        },

        /* Handler for button click at bottom
        * @method _bottomBtnClickHandler
        */
        _bottomBtnClickHandler: function ( event ) {
            var currentButton = event.data.currentButton;
            MathInteractives.global.SpeechStream.stopReading();

            /*Apply click call back for particular button*/
            if ( currentButton.clickCallBack ) {
                currentButton.clickCallBack.fnc.apply( currentButton.clickCallBack.scope || this, [event] );
            }

            /*Send reponse data*/
            var response = { isPositive: false, buttonClicked: currentButton.id };
            if ( currentButton.response ) {
                response.isPositive = currentButton.response.isPositive;
                response.buttonClicked = currentButton.response.buttonClicked;
            }
            this._triggerCallback( response.isPositive, response.buttonClicked );
        },

        /*Sets Dimensions and other css
        * @method setDimensions
        */
        setDimensions: function ( $player, type, titleIcon ) {
            var width = this.model.get( 'width' );
            //sets user specified width , if any.
            if ( width !== null ) {
                this.$el.find( '.pop-up-dialogue' ).css( {
                    'width': width
                } );
            }
            var $titleLeftBg = this.$el.find( '.pop-up-title-bar-left' );
            var $titleRightBg = this.$el.find( '.pop-up-title-bar-right' );
            var $titleMidBg = this.$el.find( '.pop-up-title-bar-mid' );

            $titleLeftBg.css( { 'background-image': 'url("' + this._path.getImagePath( 'player-lr' ) + '")' } );
            $titleRightBg.css( { 'background-image': 'url("' + this._path.getImagePath( 'player-lr' ) + '")' } );
            $titleMidBg.css( { 'background-image': 'url("' + this._path.getImagePath( 'player-m' ) + '")' } );

            //sets width of title bar
            var sideLen = $titleLeftBg.width() + $titleRightBg.width();
            var dialogueLen = this.$el.find( '.pop-up-dialogue' ).width();
            $titleMidBg.width( dialogueLen - sideLen );

            if ( titleIcon )
                this.$el.find( '#' + this.idPrefix + 'pop-up-title-image' ).css( {
                    'background-image': 'url("' + this._path.getImagePath( 'buttons-icons' ) + '")',
                    'width': titleIcon.width,
                    'height': titleIcon.height
                } ).addClass( titleIcon.iconClass );

            var playerHeight = $player.height(), playerWidth = $player.width(), popUpDialogue = this.$( '.pop-up-dialogue' );
            //sets height of back modal
            $player.find( '.pop-up-modal' ).css( 'height', playerHeight );

            //vertically center popup 
            popUpDialogue.css( { 'margin-top': ( playerHeight - popUpDialogue.height() ) / 2, 'margin-left': ( playerWidth - popUpDialogue.width() ) / 2 } );



            //vertically center header elements
            var $titleImage, $titleText, $ttsCont, $closeBtn, $popUpTitleCont, $popUpBtnsCont;
            $titleImage = this.$( '.pop-up-title-image' );
            $titleText = this.$( '.pop-up-title-text' );
            $ttsCont = this.$( '.pop-up-tts-container' );
            $closeBtn = this.$( '.pop-up-close-btn-old' );
            $popUpTitleCont = this.$( '.pop-up-title' );
            $popUpBtnsCont = this.$( '.pop-up-header-btns-cont' );
            $titleImage.css( { 'margin-top': ( $popUpTitleCont.height() - $titleImage.height() ) / 2 } );
            $titleText.css( { 'margin-top': ( $popUpTitleCont.height() - $titleText.height() ) / 2 } );
            $ttsCont.css( { 'margin-top': ( $popUpBtnsCont.height() - $ttsCont.height() ) / 2 } );
            $closeBtn.css( { 'margin-top': ( $popUpBtnsCont.height() - $closeBtn.height() ) / 2 } );

            this.updateFocusRect( 'pop-up-text' );
        },

        /*Attach events to the buttons under popup
        * @method attachEvents
        */
        attachEvents: function () {
            this.$( '.pop-up-close-btn' ).on( 'click', $.proxy( this._closeClicked, this ) );
        },

        /**
        * Triggers callback function caller with negative reponse
        *
        * @method _closeClicked
        * @private
        **/
        _closeClicked: function _closeClicked() {
            MathInteractives.global.SpeechStream.stopReading();
            this._triggerCallback( false, 'pop-up-close-btn' );
        },

        /**
        * Triggers callback function, if any 
        *
        * @method _triggerCallback
        * @param {Boolean} [isPositive] Type of response
        * @param {String} [buttonClicked] Button clicked
        * @private
        **/
        _triggerCallback: function _triggerCallback( isPositive, buttonClicked ) {
            //Stop TTS Reading
            MathInteractives.global.SpeechStream.stopReading();
            this._removePopup();

            var closeCallback = this.model.get( 'closeCallback' ),
                response = {};

            response.isPositive = isPositive;
            response.buttonClicked = buttonClicked;

            if ( closeCallback ) {
                closeCallback.fnc.apply( closeCallback.scope || this, [response] );
            }
        },

        /**
        * Removes pop-up modal
        *
        * @method _removePopup
        * @private
        **/
        _removePopup: function _removePopup() {
            this.$el.off( 'keydown.popupAccessibility' );
            //this.manager.unloadScreen('player');
            this.remove();
            this.player.setModalPresent( false );
        }

    }, {

        createPopup: function ( options ) {
            if ( options ) {
                var popupModel = new MathInteractives.Common.Player.Models.PopUp( options );
                var popupView = new MathInteractives.Common.Player.Views.PopUp( { model: popupModel } );

                return popupView;
            }
        }

    } );

    MathInteractives.global.PlayerPopup = MathInteractives.Common.Player.Views.PopUp;
} )();