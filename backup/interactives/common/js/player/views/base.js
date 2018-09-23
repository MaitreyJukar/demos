(function () {
    if (MathInteractives.Common.Player.Views.Base) {
        return;
    }
    'use strict';

    /**
    * Abstracts the call to manager methods
    *
    * @class Base
    * @construtor
    * @extends Backbone.View
    * @namespace MathInteractives.Interactivities.AirTraffic.Views
    */
    MathInteractives.Common.Player.Views.Base = Backbone.View.extend({

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
        * Stores a reference to the sound manager view instance
        *
        * @property soundManager
        * @type Object
        * @default null
        **/
        soundManager: null,

        /**
        * Initialize all the property needed in the view
        *
        * @method initializeDefaultProperties
        * @public
        **/
        initializeDefaultProperties: function initializeDefaultProperties() {
            if (!this.player) {
                this.player = this.model.get('player');
            }
            this.filePath = this.player.getPath();
            this.idPrefix = this.player.getIDPrefix();
            this.manager = this.player.getManager();
            this.soundManager = this.player.getSoundManager();
            this.isMobile=MathInteractives.Common.Utilities.Models.BrowserCheck.isMobile;
        },
        /**
        * Loads the required screen.
        * @method loadScreen
        * @param screenId {String} Id of required screen.
        **/
        loadScreen: function (screenId) {
            if (typeof this.manager !== 'undefined' && this.manager !== null) {
                this.manager.loadScreen(screenId, this.idPrefix);
            }
            else {
                this.log('Error!! :: manager is null or undefined!!');
            }
        },

        /**
        * Unload the screen.
        * @method unloadScreen.
        * @param screenId {String} Id of required screen.
        **/
        unloadScreen: function (screenId) {
            if (typeof this.manager !== 'undefined' && this.manager !== null) {
                this.manager.unloadScreen(screenId, this.idPrefix);
            }
            else {
                this.log('Error!! :: manager is null or undefined!!');
            }
        },

        /**
        * Fetches the tabIndex from the elements model.
        * @method getTabIndex
        * @param accId Element acdcId of required element.
        * @return {Number} Returns null if element is not found.
        *         Returns the tabIndex if element is found.
        **/
        getTabIndex: function (accId) {
            var prefixedAccId, returnedTabIndex;

            prefixedAccId = this.idPrefix + accId;
            if (typeof this.manager !== 'undefined' && this.manager !== null) {
                returnedTabIndex = this.manager.getTabIndex(prefixedAccId);
            }
            else {
                this.log('Error!! :: manager is null or undefined!!');
            }

            return returnedTabIndex;
        },


        /**
        * Sets the tabIndex for element.
        * @method setTabIndex
        * @param accId {Object} Element accId of required element.
        * @param newTabIndex {Number} new value of tabIndex
        **/
        setTabIndex: function (accId, newTabIndex) {
            var prefixedAccId;

            prefixedAccId = this.idPrefix + accId;
            if (typeof this.manager !== 'undefined' && this.manager !== null) {
                this.manager.setTabIndex(prefixedAccId, newTabIndex);
            }
            else {
                this.log('Error!! :: manager is null or undefined!!');
            }
        },


        /**
      * Fetches the path from the paths.
      * @method getPath
      * @param {string} path enum.
      * @return {String} Returns the path
      **/
        getPath: function getPath(path) {
            var returnPath;


            if (typeof this.filePath !== 'undefined' && this.filePath !== null) {
                returnPath = this.filePath.getPath(path);
            }
            else {
                this.log('Error!! :: filePath is null or undefined!!');
            }

            return returnPath;
        },

        /**
      * Fetches the image path from the image dictionaty.
      * @method getImagePath
      * @param idOfIamge image id.
      * @return {String} Returns the path of the image
      **/
        getImagePath: function (idOfIamge) {
            var returnImage;


            if (typeof this.filePath !== 'undefined' && this.filePath !== null) {
                returnImage = this.filePath.getImagePath(idOfIamge);
            }
            else {
                this.log('Error!! :: filePath is null or undefined!!');
            }

            return returnImage;
        },

        /**
      * Fetches the image element from the image dictionaty.
      * @method getImageElement
      * @param idOfIamge image id.
      * @return {String} Returns the path of the image
      **/
        getImageElement: function getImageElement(idOfIamge) {
            var returnImage = null;


            if (typeof this.filePath !== 'undefined' && this.filePath !== null) {
                returnImage = this.filePath.getImageElement(idOfIamge);
            }
            else {
                this.log('Error!! :: filePath is null or undefined!!');
            }

            return returnImage;
        },

        /**
        * Wrapper function for getSpritePartBase64URL in the MathInteractives.Common.Utilities.Models.Utils
        * @method getSpritePartBase64URL
        * @param {String} idOfIamge Image id of the image sprite from the interactivity-config.json
        * @param {Number} left Provides top position of image part from the sprite
        * @param {Number} top Provides left position of image part from the sprite
        * @param {Number} width Provides width of required image
        * @param {Number} height Provides height of the required image
        * @return {String} Returns the base64 data-URL of the desired image
        **/
        getSpritePartBase64URL: function getSpritePartBase64URL(idOfIamge, left, top, width, height) {
            var image = this.getImageElement(idOfIamge);
            if (image !== null && image !== undefined) {
                return MathInteractives.Common.Utilities.Models.Utils.getSpritePartBase64URL(image, left, top, width, height);
            }
            return null;
        },

        /**
        * Sets the acc message for element.
        * @method setFocus
        * @param accId {String} of required element.
        * @param delay {Number} Delay required.
        **/
        setFocus: function (accid, delay) {
            var prefixedAccId;

            prefixedAccId = this.idPrefix + accid;
            if (typeof this.manager !== 'undefined' && this.manager !== null) {
                this.manager.setFocus(prefixedAccId, delay);
            }
            else {
                this.log('Error!! :: manager is null or undefined!!');
            }
        },

        /**
        * Changes the loc message for element.
        * @method changeMessage
        * @param elementId {String} Element id of required element.
        * @param messageId {String} Message id of the required message
        * @param params {Object} Array of values that will replace the placeholder
        **/
        changeMessage: function (elementId, messageId, params) {
            var prefixedElementId;

            prefixedElementId = this.idPrefix + elementId;
            if (typeof this.manager !== 'undefined' && this.manager !== null) {
                this.manager.changeMessage(prefixedElementId, messageId, params);
            }
            else {
                this.log('Error!! :: manager is null or undefined!!');
            }
        },

        /**
        * Changes the acc message for element.
        * @method changeAccMessage
        * @param accId {String} of required element.
        * @param messageId {String} of the required message
        * @param params {Object} Array of values that will replace the placeholder
        **/
        changeAccMessage: function (accId, messageId, params) {
            var prefixedAccId;

            prefixedAccId = this.idPrefix + accId;
            if (typeof this.manager !== 'undefined' && this.manager !== null) {
                this.manager.changeAccMessage(prefixedAccId, messageId, params);
            }
            else {
                this.log('Error!! :: manager is null or undefined!!');
            }
        },

        /**
        * Sets the loc message for element.
        * @method setMessage
        * @param elementId {String} Element id of required element.
        * @param message {String} Localized message string
        * @param params {Object} Array of values that will replace the placeholder
        **/
        setMessage: function (elementId, message, params) {
            var prefixedElementId;

            prefixedElementId = this.idPrefix + elementId;
            if (typeof this.manager !== 'undefined' && this.manager !== null) {
                this.manager.setMessage(prefixedElementId, message, params);
            }
            else {
                this.log('Error!! :: manager is null or undefined!!');
            }
        },

        /**
        * Sets the acc message for element.
        * @method setAccMessage
        * @param accId {String} of required element.
        * @param message {String} accessible message string
        * @param params {Object} Array of values that will replace the placeholder
        **/
        setAccMessage: function (accId, message, params) {
            var prefixedAccId;

            prefixedAccId = this.idPrefix + accId;
            if (typeof this.manager !== 'undefined' && this.manager !== null) {
                this.manager.setAccMessage(prefixedAccId, message, params);
            }
            else {
                this.log('Error!! :: manager is null or undefined!!');
            }
        },

        /**
        * Fetches the localization message from the elements model.
        * @method getMessage
        * @param elementId {String} Element Id of required element.
        * @param messageId {String} Message Id of required message node.
        * @return {String} Returns null if element or message is not found.
        * @param params {Object} Array of values that will replace the placeholder
        * Returns the loc message if element and message node is found.
        **/
        getMessage: function (elementId, messageId, params) {
            var prefixedElementId, returnedMessage;

            prefixedElementId = this.idPrefix + elementId;
            if (typeof this.manager !== 'undefined' && this.manager !== null) {
                returnedMessage = this.manager.getMessage(prefixedElementId, messageId, params);
            }
            else {
                this.log('Error!! :: manager is null or undefined!!');
            }

            return returnedMessage;
        },

        /**
        * Fetches the accessible message from the elements model.
        * @method getAccMessage
        * @param accId {String} of required element.
        * @param messageId {String} Message Id of required message node.
        * @param params {Object} Array of values that will replace the placeholder
        * @return {String} Returns null if element or message is not found.
        *         Returns the acc message if element and message node is found.
        **/
        getAccMessage: function (accId, messageId, params) {
            var prefixedAccId, returnedMessage;

            prefixedAccId = this.idPrefix + accId;
            if (typeof this.manager !== 'undefined' && this.manager !== null) {
                returnedMessage = this.manager.getAccMessage(prefixedAccId, messageId, params);
            }
            else {
                this.log('Error!! :: manager is null or undefined!!');
            }

            return returnedMessage;
        },

        /*
        * Returns the html for rendering the correct minus sign with the proper pronunciation 
        * @method getMinusSignLocText
        * @public
        * @return {string} 
        */
        getMinusSignLocText: function getMinusSignLocText() {
            var locText = '';
            locText = '<span pron="' + this.manager.getAccMessage('comm19', 0) + '">&minus;</span>';
            return locText;
        },

        /**
        * Adds the listener for focusout event.
        * @method focusOut
        * @param accId {String} of required element.
        * @param focusOutHandler {Function} Listener which is to be added for focusout event.
        * @param delay {Number} Time delay after which added listener is executed.
        * @param addOrRemove {Boolean} It tells whether given listener is to be added or removed.
        **/
        focusOut: function (accid, func, delay, addOrRemove) {
            var prefixedAccId;

            prefixedAccId = this.idPrefix + accid;
            if (typeof this.manager !== 'undefined' && this.manager !== null) {
                this.manager.focusOut(prefixedAccId, func, delay, addOrRemove);
            }
            else {
                this.log('Error!! :: manager is null or undefined!!');
            }
        },

        /**
        * Adds the listener for focusin event.
        * @method focusIn
        * @param accId {String} of required element.
        * @param focusInHandler {Function} Listener which is to be added for focusin event.
        * @param delay {Number} Time delay after which added listener is executed.
        * @param addOrRemove {Boolean} It tells whether given listener is to be added or removed.
        **/
        focusIn: function (accid, func, delay, addOrRemove) {
            var prefixedAccId;

            prefixedAccId = this.idPrefix + accid;
            if (typeof this.manager !== 'undefined' && this.manager !== null) {
                this.manager.focusIn(prefixedAccId, func, delay, addOrRemove);
            }
            else {
                this.log('Error!! :: manager is null or undefined!!');
            }
        },

        /**
        * Updates the size of the focus rect if element resized
        * @method updateFocusRect
        * @param accId {String} of the element
        **/
        updateFocusRect: function (accId) {
            var prefixedAccId;

            prefixedAccId = this.idPrefix + accId;
            if (typeof this.manager !== 'undefined' && this.manager !== null) {
                this.manager.updateFocusRect(prefixedAccId);
            }
            else {
                this.log('Error!! :: manager is null or undefined!!');
            }
        },

        /**
        * Makes the tab order for screen cycle properly.
        * @method updatePopupBounds
        * @param screenId {String} Id of required screen.
        **/
        updatePopupBounds: function (screenId) {
            if (typeof this.manager !== 'undefined' && this.manager !== null) {
                this.manager.updatePopupBounds(screenId);
            }
            else {
                this.log('Error!! :: manager is null or undefined!!');
            }
        },

        /**
        * creates accessible div for specified element.
        * @method createAccDiv
        * @param obj {Object} Element Id of required element.
        **/
        createAccDiv: function (obj) {
            obj.elementId = this.idPrefix + obj.elementId;

            if (typeof this.manager !== 'undefined' && this.manager !== null) {
                this.manager.createAccDiv(obj);
            }
            else {
                this.log('Error!! :: manager is null or undefined!!');
            }
        },

        /**
        * sets size of acc div equal to elements size.
        * @method restrictAccDivSize
        * @param accId
        **/
        restrictAccDivSize: function (accId) {
            var prefixedAccId = this.idPrefix + accId;
            if (typeof this.manager !== 'undefined' && this.manager !== null) {
                this.manager.restrictAccDivSize(prefixedAccId);
            }
            else {
                this.log('Error!! :: manager is null or undefined!!');
            }
        },

        /**
        * Enable or disable tab for the element.
        * @method enableTab
        * @param accId {String} of required element.
        * @param bEnable {Boolean} It tells whether tab for the element is to be enabled or disabled.
        **/
        enableTab: function (accId, bEnable) {
            var prefixedAccId = this.idPrefix + accId;

            if (typeof this.manager !== 'undefined' && this.manager !== null) {
                this.manager.enableTab(prefixedAccId, bEnable);
            }
            else {
                this.log('Error!! :: manager is null or undefined!!');
            }
        },

        /*
        * handles logging
        * @method log
        * @public
        * @param {string} logString
        */
        log: function (logString) {
            MathInteractives.Debugger.log(logString);
        },

        /*
        * Returns json data for specified ID
        * @method getJson
        * @public
        * @param {string} jsonId
        * @return {object} json object
        */
        getJson: function getJson(jsonId) {
            return this.model.getJson(jsonId);
        },

        /**
        * Returns the font awesome class
        * @method getFontAwesomeClass
        * @param {String} iconId id of icon
        */
        getFontAwesomeClass: function getFontAwesomeClass(iconId) {
            var fontAwesomeIconData = this.filePath._fontAwesomeIconData;
            return fontAwesomeIconData[iconId];
        },

        /*
        * Returns Accessibility State
        * @method isAccessible
        * @public
        * @return {bool} isAccessible
        */
        isAccessible: function isAccessible() {

            if (typeof this.manager !== 'undefined' && this.manager !== null) {
                return this.manager.model.get('isAccessible');
            }
            else {
                this.log('Error!! :: manager is null or undefined!!');
            }
            return false;
        },

        /*
        * Stops reading text on screen
        * @method stopReading
        * @public
        */
        stopReading: function stopReading() {
            if (MathInteractives.global.SpeechStream) {
                MathInteractives.global.SpeechStream.stopReading();
            }
        },

        /**
        * Refreshes html DOM
        * @method _refreshDOM
        * @private
        */
        refreshDOM: function _refreshDOM() {
            var $span = $('<span>', { class: 'temp-dom-refresh-span' });
            this.$el.append($span);
            $span.remove();
        },

        /**
        * Plays the sound whose id has been passed
        * @method play
        * @param {String} soundId
        * @public
        */
        play: function play(soundId) {
            if (this.soundManager) {
                this.soundManager.play(soundId);
            }
        },

        /**
        * Pause the sound
        * @method pause
        * @public
        */
        pause: function pause() {
            if (this.soundManager) {
                this.soundManager.pause();
            }
        },

        /**
        * Stops all sounds
        * @method stopAllSounds
        * @public
        */
        stopAllSounds: function stopAllSounds() {
            try {
                MathInteractives.Common.Components.Views.AudioManager.stopAllSounds();
            }
            catch (err) { }
            this.stopReading();
        },
        /**
        * Hides the hamburger menu
        * @method hideTabDrawer
        * @public
        */
        hideTabDrawer: function () {
            if (this.player.$el.find('.header-tab-drawer-btn').data('isDrawerVisible') === true) {
                this.player.$el.trigger('click.drawerHide');
            }
        }

    });
})();
