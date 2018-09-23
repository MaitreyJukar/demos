
(function () {
    'use strict';
    /**
    * A customized Backbone.Model that represents a complete player
    * @class PlayerModel
    * @constructor
    * @namespace MathInteractives.Common.Player.Models
    * @module Common
    * @submodule Player
    * @extends Backbone.Model
    */


    MathInteractives.Common.Player.Models.Player = Backbone.Model.extend({
        /**
        * Sets the default properties of the model
        * @method defaults
        * @returns {Object}
        */
        defaults: function () {
            return {
                tabCollection: null,
                activityAreaCollection: null,
                currentTabView: null,
                defaultTab: 0,
                currentActiveTab: null,

                /**
                * Property to know if 'help'/ pop-up modal is present
                * 
                * @type Array
                * @defaults null
                */
                modals: null,

                isTabSwitchAllowed: true,

                /**
                * Attribute to enable/disable drawer buttons after drawer animation end
                * @attribute isDrawerButtonEnable
                * @type Boolean
                * @defaults true 
                */
                isDrawerButtonEnable: true,
                /**
                * Stores the saved state to be compared to decide whether to show the clear data pop-up or not
                * @attribute previousSaveState
                * @type String
                * @defaults null 
                */
                previousSaveState: null,
                /**
                * Stores the backup save state that it to be used to rollback save state in case any error occurs
                * @attribute backupSaveState
                * @type String
                * @defaults null 
                */
                backupSaveState: null,

                /**
                * Stores the information of whether interactivity has been launched in new popup window or not
                * @attribute isPoppedOut
                * @type Boolean
                * @defaults false 
                */
                isPoppedOut: false

            }
        },

        /**
        * Initialization
        * @method initialize
        */
        initialize: function () {
            /*
            TODO:
            Storing tabs and activity area to a collection
            Preloading the interactive data as well as player data
            Initializing header, tabs and activity area models as per the preloaded data and storing those models to current instances
             
           
            */

            var tabCollection = new MathInteractives.Common.Player.Collections.Tabs();
            this.set('tabCollection', tabCollection);

            var activityAreaCollection = new MathInteractives.Common.Player.Collections.ActivityAreas();
            this.set('activityAreaCollection', activityAreaCollection);

        },


        /**
        * Initialize function for 'modals' property
        * @method initializeModals
        * @param {number} length length of tabs
        */
        initializeModals: function (length) {
            var modals = new Array(length), i = 0;

            for (; i < length; i++) {
                modals[i] = false;
            }
            this.set('modals', modals)
        },

        /**
        * Getter function for 'modals' property
        * @method getModalPresent
        * @return {Boolean} True if modal is present
        */
        getModalPresent: function () {
            return this.get('modals')[this.getCurrentActiveTab()];
        },

        /**
        * Setter function for 'modals' property
        * @method setModalPresent
        * @param value {Boolean} True if modal is present
        */
        setModalPresent: function (value) {
            var modals = this.get('modals');
            modals[this.getCurrentActiveTab()] = value;
            this.set('modals', modals);

        },

        /**
        * getter function for 'currentActiveTab' property
        * @method getCurrentActiveTab
        */
        getCurrentActiveTab: function () {
            return this.get('currentActiveTab');
        },

        /**
        * Ignores a list of attributes while parsing the JSON and returns a string representing the 
        * JSON save state.
        * @method ignoreAttrsForSaveState
        * @param jsonObj {Object} JSON save state object.
        * @param attrsToIgnore {Array} Attributes that should be ignored when returning string representation.
        * @return {String} String representation of JSON save state after the ignored attrs have been removed.
        */
        ignoreAttrsForSaveState: function ignoreAttrsForSaveState(jsonObj, attrsToIgnore) {
            var ignoredAttrs = [
                    'path',
                    'manager',
                    'player',
                    'jsonData',
                    'currentTab',
                    'helpElements',
                    'attributesToIgnore'
                ];

            if (Array.isArray(attrsToIgnore)) {
                ignoredAttrs = ignoredAttrs.concat(attrsToIgnore);
            }

            return JSON.stringify(jsonObj, function (key, value) {
                return ignoredAttrs.indexOf(key) > -1 ? undefined : value;
            });
        },

        /**
        * Returns an array of all `attrForSaveStateComparison` specified in tabsData. If it's not specified, it's
        * populated with `undefined`.
        * @method getAttrsForSaveStateComparison
        * @return {Array} List of all `attrForSaveStateComparison` specified in tabsData.
        */
        getAttrsForSaveStateComparison: function () {
            var attrs = [],
                config = this.get('config'),
                tabs = this.get('tabCollection'),
                i = 0;
            for (i = 0; i < tabs.length; i++) {
                attrs.push(config.tabsData[i].view.attrForSaveStateComparison);
            }
            return attrs;
        },

        /*
        * Clear nested values of an object        
        * @method clearNestedValue
        * @param obj {Object} Object from which the nested value is to be deleted
        * @param key {String} The key to be deleted
        * @param nestedValues {Object} Tree structure for all nested values
        * @param count {Number} Stores the current depth level inside the tree structure
        * @public
        */
        clearNestedValue: function (obj, key, nestedValues, count) {
            if (obj[key][nestedValues[count]] != null) {
                if (count < nestedValues.length - 1) {
                    count++;
                    this.clearNestedValue(obj, key, nestedValues, count)
                }
                else {
                    obj[key][nestedValues[count]] = undefined;
                }
            }
        },


        /*
        * Rollback previous state to it's previous version
        * This is used when some error occurs saving data to DE's server
        * @method rollbackSaveState
        * @public
        */
        rollbackSaveState: function rollbackSaveState() {
            var backupSaveState = this.get('backupSaveState');
            this.set('previousSaveState', backupSaveState);
        },

        /*
        * perform backup operation of previous save state
        * This is used when it is neccessary to backup previous save state in case some error occurs
        * @method performBackupSaveState
        * @public
        */
        performBackupSaveState: function performBackupSaveState() {
            var previousState = this.get('previousSaveState');
            this.set('backupSaveState', previousState);
        }

    }, {
        /**
        * Theme for the player is selected from model of Interactivity preloader
        *
        * @prperty THEME1
        * @static 
        **/
        THEME1: MathInteractives.Common.Player.Models.InteractivityPreloader.PRELOADER_TYPE1,

        /**
        * Theme for the player is selected from model of preloader
        *
        * @prperty THEME2
        * @static 
        **/
        THEME2: MathInteractives.Common.Player.Models.InteractivityPreloader.PRELOADER_TYPE2,

        /**
        * Event triggered before tab switch occurs; could be used to set isTabSwitchAllowed to false and prevent tab
        * switch.
        *
        * @property BEFORE_TAB_SWITCH_EVENT
        * @static
        */
        BEFORE_TAB_SWITCH_EVENT: 'beforeTabSwitch',

        /*
        * Starting tab index for the tab items
        *
        * @property TAB_ITEMS_START_TAB_INDEX
        * @static
        */
        TAB_ITEMS_START_TAB_INDEX: 4710
    });

    MathInteractives.global.PlayerModel = MathInteractives.Common.Player.Models.Player;
})();