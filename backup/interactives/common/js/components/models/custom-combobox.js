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
    MathInteractives.Common.Components.Models.CustomCombobox = Backbone.Model.extend({

        defaults: function () {
            return {
                /**
                * @property element
                * @type object
                * @defaults null
                */
                'elementID': null, //holds the refernce of element on which context menu is to be replaced
                /**
                * @property interactivityPrefix
                * @type string
                * @defaults null
                */
                'idPrefix': null, //prefix for id
                /**
                * @property defaultText
                * @type string
                * @defaults null
                */
                'defaultText': null, // default text to show for comboBox
                /**
                * @property selectedItem
                * @type string
                * @defaults null
                */
                'selectedItem': null, //selectedItemID//if null then show default text
                /**
                * @property imagePath
                * @type string
                * @defaults null
                */
                'imagePath': null,//imagePath for comboBoxes

                /**
                * @property isHintEnabled
                * @type boolean
                * @defaults false
                */
                'isHintEnabled': false//show/hide hint for comboBoxes
            }
        },
        /**
        * setter for element
        */
        setElementID: function setElementID(elementID) {
            this.set('elementId', elementID);
        },
        /**
        * setter for interactivity prefix
        */
        setIdPrefix: function setIdPrefix(prefix) {
            this.set('idPrefix', prefix);
        },
        /**
        * setter for defaultText
        */
        setDefaultText: function setDefaultText(defaultText) {
            this.set('defaultText', defaultText);
        },
        /**
        * setter for selectedItem
        */
        setSelectedItem: function setSelectedItem(selectedItem) {
            this.set('selectedItem', selectedItem);
        },
        /**
        * setter for imagePath
        */
        setImagePath: function setImagePath(imagePath) {
            this.set('imagePath', imagePath);
        },


        /**
        * getter for elements
        */
        getElementID: function getElementID() {
            return this.get('elementID');
        },
        /**
        * getter for interactivity prefix
        */
        getIdPrefix: function getIdPrefix() {
            return this.get('idPrefix');
        },
        /**
        * getter for defaultText
        */
        getDefaultText: function getDefaultText() {
            return this.get('defaultText');
        },
        /**
        * getter for selectedItem
        */
        getSelectedItem: function getSelectedItem() {
            return this.get('selectedItem');
        },
        /**
        * getter for imagePath
        */
        getImagePath: function getImagePath() {
            return this.get('imagePath');
        },

        /**
        * produces data for saveState
        */
        produceSavedData: function produceSavedData() {
            var json = {
                'elementID': this.getElementID(),
                'defaultText': this.getDefaultText(),
                'imagePath': this.getImagePath(),
                'selectedItem': this.getSelectedItem()
            }
            return json;
        }

    });

//    MathInteractives.Common.Components.Collections.CustomComboboxes = Backbone.Collection.extend({
//        model: MathInteractives.Common.Components.Models.CustomCombobox,
//        initialize: function () {
//            "use strict";
//            this.model = MathInteractives.Common.Components.Models.CustomCombobox;
//        }
//    });
})();