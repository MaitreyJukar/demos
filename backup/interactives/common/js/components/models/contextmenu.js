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
    MathInteractives.Common.Components.Models.ContextMenu = Backbone.Model.extend({

        defaults: function () {
            return {
                /**
                * @property elements
                * @type Array
                * @default null
                */
                'elements': null, //holds the array of element refrences on which context menu is to be created
                /**
                * @property ignoreScreenElementIds
                * @type Array
                * @default array
                */
                'ignoreScreenElementIds': [], //elements to ignore while loading contextMenuScreen
                /**
                * @property onSelectCallback
                * @type function reference
                * @default null
                */
                'onSelectCallback': null, //function to be called on selection of context menu item
                /**
                * @property onRemoveCallback
                * @type function reference
                * @default null
                */
                'onRemoveCallback': null, //function to be called on removal/hiding of context menu
                /**
                * @property onDisplayCallback
                * @type function reference
                * @default null
                */
                'onDisplayCallback': null, //function to be called on display of context menu
                /**
                * @property contextMenuCount
                * @type int
                * @default null
                */
                'contextMenuCount': null, //count of context menu items
                /**
                * @property screenId
                * @type int
                * @default null
                */
                'screenId': null, //screenId to load
                /**
                * @property interactivityPrefix
                * @type string
                * @default null
                */
                'interactivityPrefix': null, //prefix for id
                /**
                * @property manager
                * @type object
                * @default null
                */
                'manager': null,
                /**
                * @property nestedMenuData
                * @type object
                * @default null
                */
                'nestedMenuData': null,
                /**
                * @property maxItemCount
                * @type int
                * @default null
                */
                'maxItemCount': null
            }
        },
        /**
        * check whether element contains child menu
        * @public
        * @method isParentToChildMenu
        **/
        isParentToChildMenu: function isParentToChildMenu(id) {
            var result = this.get('nestedMenuData')[id];
            if (result) {
                return true;
            } else {
                return false;
            }
        },

        /**
        * check whether element is present in ignore id
        * @public
        * @method isIgnored
        * @param {String} id Id of the element
        * @return {Boolean} If it is ignored
        **/
        isIgnored: function isIgnored(id) {
            var ignored = $.inArray(id, this.getIgnoreIds());
            if (ignored === -1) {
                return false;
            } else {
                return true;
            }
        },
        /**
        * Setter for elements
        * @method setElements
        * @public
        * @param {Array} elementsArray An array of elements
        */
        setElements: function setElements(elementsArray) {
            this.set('elements', elementsArray);
        },
        /**
        * setter for select callback
        * @method setSelectCallback
        * @public
        * @param {Object} fncRef reference to the callback function
        */
        setSelectCallback: function setSelectCallback(fncRef) {
            this.set('onSelectCallback', fncRef);
        },
        /**
        * setter for remove callback
        * @method setRemoveCallback
        * @public
        * @param {Object} fncRef reference to the callback function
        */
        setRemoveCallback: function setRemoveCallback(fncRef) {
            this.set('onRemoveCallback', fncRef);
        },
        /**
        * setter for display callback
        * @method setDisplayCallback
        * @public
        * @param {Object} fncRef reference to the callback function
        */
        setDisplayCallback: function setDisplayCallback(fncRef) {
            this.set('onDisplayCallback', fncRef);
        },
        /**
        * setter for contextMenu item Count
        * @method setContextMenuCount
        * @public
        * @param {Number} number the count of context menu
        */
        setContextMenuCount: function setContextMenuCount(number) {
            this.set('contextMenuCount', number);
        },
        /**
        * setter for screenId
        * @method setScreenID
        * @public
        * @param {String} The screen id
        */
        setScreenID: function setScreenID(screenID) {
            this.set('screenId', screenID);
        },
        /**
        * setter for interactivity prefix
        * @method setInteractivityPrefix
        * @public
        * @param {String} prefix the id prefix
        */
        setInteractivityPrefix: function setInteractivityPrefix(prefix) {
            this.set('interactivityPrefix', prefix);
        },
        /**
        * setter for manager
        * @method setManager
        * @public
        * @param {Object} manager the manager
        */
        setManager: function setManager(manager) {
            this.set('manager', manager);
        },

        /**
        * setter for nestedMenu data
        * @method setNestedMenuData
        * @public
        * @param {Object} List of options
        */
        setNestedMenuData: function setNestedMenuData(options) {
            if (typeof options === 'undefined' || options === null) return;
            var keys = Object.keys(options), i = 0,
            newNestedMenuData = {},
            idPrefix = this.getInteractivityPrefix(),
            screenID = this.getScreenID();
            for (; i < keys.length; i++) {
                newNestedMenuData[idPrefix + screenID + '-' + keys[i]] = options[keys[i]];
            }
            this.set('nestedMenuData', newNestedMenuData);
        },


        /**
        * getter for elements
        * @method getElements
        * @public
        * @return {Array} elements
        */
        getElements: function getElements() {
            return this.get('elements');
        },
        /**
        * getter for select callback
        * @method getSelectCallback
        * @public
        * @return {Object} selectCallback reference
        */
        getSelectCallback: function getSelectCallback() {
            return this.get('onSelectCallback');
        },

        /**
        * getter for remove callback
        * @method getRemoveCallback
        * @public
        * @return {object} removeCallback reference
        */
        getRemoveCallback: function getRemoveCallback() {
            return this.get('onRemoveCallback');
        },

        /**
        * getter for display callback
        * @method getDisplayCallback
        * @public
        * @return {Object} DisplayCallBack reference
        */
        getDisplayCallback: function getDisplayCallback() {
            return this.get('onDisplayCallback');
        },
        /**
        * getter for contextMenu item Count
        * @method getContextMenuCount
        * @public
        * @return {number} Context menu count
        */
        getContextMenuCount: function getContextMenuCount() {
            return this.get('contextMenuCount');
        },
        /**
        * getter for screenId
        * @method getScreenID
        * @public
        * @return {string} the Screen ID
        */
        getScreenID: function getScreenID() {
            return this.get('screenId');
        },

        /**
        * getter for interactivity prefix
        * @method getInteractivityPrefix
        * @public
        * @return {string} interactive ID Prefix
        */
        getInteractivityPrefix: function getInteractivityPrefix() {
            return this.get('interactivityPrefix');
        },
        /**
        * getter for manager
        * @method getManager
        * @public
        * @return {object} manager
        */
        getManager: function getManager() {
            return this.get('manager');
        },
        /**
        * getter for ignoreIds
        * @method getIgnoreIds
        * @public
        * @return {array} array of ignored screen element ids
        */
        getIgnoreIds: function getIgnoreIds() {
            return this.get('ignoreScreenElementIds');
        },

        /**
        * push one id into ignoreIds
        * @method addIntoIgnoreIds
        * @public
        * @param {string} id id of element to be ignored
        * @return {boolean} whether it was added into ignoreIds successfully
        */
        addIntoIgnoreIds: function addIntoIgnoreIds(id) {
            var isPresent = $.inArray(id, this.getIgnoreIds());
            if (isPresent === -1) { // if element not present in Array
                this.getIgnoreIds().push(id);
                return true; //added
            } else {
                return false; //already added
            }
        },


        /**
        * edit Ignore Ids
        * @method editIgnoreIds
        * @public
        * @param {array} elementIds
        * @param {boolean} ignore
        * @return {array} ignored elements ids
        */
        editIgnoreIds: function editIgnoreIds(elementIds, ignore) {
            if (elementIds.length === 0) return;
            var elements = this.getIgnoreIds(),
            menuCount;
            if (ignore === true) { // ignore elements
                for (var i = 0; i < elementIds.length; i++) {
                    if (this.get('nestedMenuData')[elementIds[i]]) {
                        continue; //you can't add remove elements containing childMenu from outside
                    }
                    var added = this.addIntoIgnoreIds(elementIds[i]);
                    if (added == true) {
                        //check whether all siblings hidden if(yes) then hide parent element
                        this._checkAndDisableParentHierarchy(elementIds[i]);
                    }
                }
            } else { // stop ignoring these elements
                for (var i = 0; i < elementIds.length; i++) {
                    if (this.get('nestedMenuData')[elementIds[i]]) {
                        continue; //you can't add remove elements containing childMenu from outside
                    }
                    var isPresent = $.inArray(elementIds[i], elements);
                    if (isPresent >= 0) { // if element present in Array
                        elements.splice(isPresent, 1);
                        //console.log(elementIds);
                        this._checkAndEnableParentHierarchy(elementIds[i]);
                    }
                }
            }
            return elements;
        },

        /**
        * disable parent hierarchy if all sibling elements are removed
        * @method _checkAndDisableParentHierarchy
        * @private
        * @param {string} elementID
        */
        _checkAndDisableParentHierarchy: function _checkAndDisableParentHierarchy(elementID) {
            var lastIndex = elementID.lastIndexOf('-'),
            prefix = elementID.substring(0, lastIndex),
            postfix = elementID.substring(lastIndex + 1),
            hideParent = true, i = 0, isInArray,
            siblingCount;

            if (this.get('nestedMenuData')[prefix])
                siblingCount = this.get('nestedMenuData')[prefix]['menuCount'];
            else
                return;

            if (this.isParentToChildMenu(prefix) === false) return;
            for (; i < siblingCount; i++) {
                isInArray = $.inArray(prefix + '-' + i, this.get('ignoreScreenElementIds'));
                if (isInArray === -1) hideParent = false; //as all childs not removed yet
            }

            if (hideParent === true) {
                var added = this.addIntoIgnoreIds(prefix);
                if (added === true) {
                    this._checkAndDisableParentHierarchy(prefix);
                }
            }

        },

        /**
        * enable parent hierarchy if one element added into context menu
        * @method _checkAndEnableParentHierarchy
        * @private
        * @param {string} elementID
        */
        _checkAndEnableParentHierarchy: function _checkAndEnableParentHierarchy(elementID) {
            var lastIndex = elementID.lastIndexOf('-'),
            prefix = elementID.substring(0, lastIndex),
            postfix = elementID.substring(lastIndex + 1), isInArray,
            ignoreIDs = this.get('ignoreScreenElementIds');

            isInArray = $.inArray(prefix, ignoreIDs);

            if (isInArray !== -1) {
                ignoreIDs.splice(isInArray, 1);
                this._checkAndEnableParentHierarchy(prefix);
            }
        },


        /**
        * add reference into elements array
        * @method addRefToElementsArray
        * @public
        * @param {object} jQref
        */
        addRefToElementsArray: function addRefToElementsArray(jQRef) {
            var modelElements = this.get('elements'),
                isPresent = false;

            for (var i = 0; i < modelElements.length; i++) {
                if (modelElements[i][0] === jQRef[0]) {
                    isPresent = true;
                }
            }

            if (isPresent === false) {
                modelElements.push(jQRef);
            }
        },
        /**
        * remove reference from elemets array
        * @method removeRefFromElementsArray
        * @public
        * @param {object} jQRef
        */
        removeRefFromElementsArray: function removeRefFromElementsArray(jQRef) {
            var modelElements = this.get('elements'),
                position = null;

            for (var i = 0; i < modelElements.length; i++) {
                if (modelElements[i][0] === jQRef[0]) {
                    position = i;
                }
            }
            if (position >= 0) {
                modelElements.splice(position, 1);
            }
        }

    });
})();