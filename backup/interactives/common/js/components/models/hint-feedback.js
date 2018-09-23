(function () {
    'use strict';

    /**
    * Conatins button data
    *
    * @class Button
    * @construtor
    * @extends Backbone.Model
    * @namespace MathInteractives.Common.Components.Models
    */
    MathInteractives.Common.Components.Models.HintFeedback = Backbone.Model.extend({

        defaults: function () {
            return {
                /**
                * @property type
                * @type int
                * @defaults 2 - For Horizontal Feedback
                */
                'type': '2',

                /**
                * @property title
                * @type string
                * @defaults ""
                */
                'title': "",

                /**
                * @property locText
                * @type string
                * @defaults null
                */
                'locText': null,

                /**
                * @property accText
                * @type string
                * @defaults null
                */
                'accText': null,

                /**
                * @property width
                * @type int
                * @defaults undefined  
                */
                'width': undefined,

                /**
                * @property height
                * @type int
                * @defaults null
                */
                'height': undefined,

                /**
                * @property crossButton
                * @type boolean
                * @defaults undefined
                */
                'crossButton': undefined,

                /**
                * @property tabIndex
                * @type int
                * @defaults null
                */
                'tabIndex': null,

                /**
                * @property containerId
                * @type string
                * @defaults null
                */
                'containerId': null,

                /**
                * @property buttons
                * @type Array of string
                * @defaults null
                */
                'buttons': undefined,

                /**
                * @property screenId
                * @type string
                * @defaults null
                */
                'screenId': null,

                /**
                * @property manager
                * @type string
                * @defaults null
                */
                'manager': null,

                /**
                * @property path
                * @type string
                * @defaults null
                */
                'path': null,

                /**
                * @property idPrefix
                * @type string
                * @defaults null
                */
                'idPrefix': null,

                /**
                * @property player
                * @type string
                * @defaults null
                */
                'player': null,

                /**
                * @property isTabsCovered
                * @type boolean
                * @defaults false
                */
                'isTabsCovered': false,

                /**
                * @property messageId
                * @type string
                * @defaults 0
                */
                'messageId': '0',

                /**
                * @property arrParams
                * @type array
                * @defaults []
                */
                'arrParams': [],

                /**
                * @property showModal
                * @type Boolean
                * @defaults undefined
                */
                'showModal': undefined


            }
        },

        initialize: function () {
            if (typeof this.get('buttons') !== 'undefined' && typeof this.get('crossButton') === 'undefined') {
                this.setCrossButton(false);
            }
        },
        /**
        * getter for containerId
        */
        getContainerId: function getType() {
            return this.get('containerId');
        },

        /**
        * getter for type
        */
        getType: function getType() {
            return this.get('type');
        },

        /**
        * getter for title
        */
        getTitle: function getTitle() {
            return this.get('title');
        },

        /**
        * getter for locText
        */
        getLocText: function getLocText() {
            return this.get('locText');
        },

        /**
        * getter for accText
        */
        getAccText: function getAccText() {
            return this.get('accText');
        },

        /**
        * getter for width
        */
        getWidth: function getWidth() {
            return this.get('width');
        },

        /**
        * getter for height
        */
        getHeight: function getHeight() {
            return this.get('height');
        },

        /**
        * getter for crossButton
        */
        getCrossButton: function getCrossButton() {
            return this.get('crossButton');
        },

        /**
        * getter for getTabIndex
        */
        getTabIndex: function () {
            return this.get('tabIndex');
        },

        /**
        * getter for buttons
        */
        getButtons: function getButtons() {
            return this.get('buttons');
        },

        /**
        * getter for screenId
        */
        getScreenId: function getScreenId() {
            return this.get('screenId');
        },

        /**
        * getter for manager
        */
        getManager: function getManager() {
            return this.get('manager');
        },

        /**
        * getter for idPrefix
        */
        getIdPrefix: function getIdPrefix() {
            return this.get('idPrefix');
        },

        /**
        * getter for tabindex
        */
        getPath: function getPath() {
            return this.get('path');
        },

        /**
        * getter for player
        */
        getPlayer: function getPlayer() {
            return this.get('player');
        },

        /**
        * getter for HintFeedback type
        */
        getHintFeedbackType: function (type) {
            return MathInteractives.Common.Components.Models.HintFeedback.HINT_FEEDBACK_TYPE;
        },

        /**
        * getter for message ID 
        */
        getMessageID: function () {
            return this.get('messageId');
        },

        /**
        * getter for arrParams (for text)
        */
        getArrParams: function () {
            return this.get('arrParams');
        },

        /**
        * getter for hideModal (to show modal or not)
        */
        getModalDisplayStatus: function () {
            return this.get('showModal');
        },


        /**
        * setter for containerId
        */
        setContainerId: function setContainerId(containerId) {
            this.set('containerId', containerId);
        },

        /**
        * setter for type
        */
        setType: function setType(type) {
            this.set('type', type);
        },

        /**
        * setter for title
        */
        setTitle: function setTitle(title) {
            this.set('title', title);
        },

        /**
        * setter for locText
        */
        setLocText: function setLocText(locText) {
            this.set('locText', locText);
        },

        /**
        * setter for accText
        */
        setAccText: function setAccText(accText) {
            this.set('accText', accText);
        },

        /**
        * setter for width
        */
        setWidth: function setWidth(width) {
            this.set('width', width);
        },

        /**
        * setter for width
        */
        setHeight: function setHeight(height) {
            this.set('height', height);
        },

        /**
        * setter for crossButton
        */
        setCrossButton: function setCrossButton(crossButton) {
            this.set('crossButton', crossButton);
        },

        /**
        * setter for tabindex
        */
        setTabindex: function setTabindex(tabindex) {
            this.set('tabindex', tabindex);
        },

        /**
        * setter for buttons
        */
        setButtons: function setButtons(buttons) {
            this.set('buttons', buttons);
        },

        /**
        * setter for buttons
        */
        setScreenId: function setScreenId(screenId) {
            this.set('screenId', screenId);
        },

        /**
        * setter for buttons
        */
        setManager: function setManager(manager) {
            this.set('manager', manager);
        },

        /**
        * setter for buttons
        */
        setPath: function setPath(path) {
            this.set('path', path);
        },

        /**
        * setter for idPrefix
        */
        setIdPrefix: function setIdPrefix(idPrefix) {
            this.set('idPrefix', idPrefix);
        },

        /**
        * setter for player
        */
        setPlayer: function setPlayer(player) {
            this.set('player', player);
        }


    }, {
        /**
        * Feedback Types
        */
        HINT_FEEDBACK_TYPE: {
            HINT: "1",
            FEEDBACK_WITH_RIGHT_PADDING: "2",
            FEEDBACK_WITH_TOP_PADDING: "3"
        }

    });
})();