(function (MathUtilities) {
    'use strict';
    if (MathUtilities.Components.Manager.Models.Manager) {
        return;
    }
    /**    * Model for Manager class. This model is responsible for setting / updating / removing of
    * element's localized and accessible text. It also provides many utility functions to manage accessibility needs.
    * @module Models
    * @class Manager
    * @constructor
    * @extends Backbone.Model
    * @namespace MathUtilities.Components.Manager.Models
    **/
    MathUtilities.Components.Manager.Models.Manager = Backbone.Model.extend({
        /** 
        * @property defaults {Object} Default values of properties of the manager model.
        **/
        defaults: {
            /** 
            * Is accessibility enabled or disabled
            **/
            isAccessible: true,
            screens: null,
            elementViews: null,
            accScreen: null,
            debug: false,
            isWrapOn: true,
            startTabindex: null,
            noTextMode: false,
        },
        /**
        * Initialize the manager. And instantiate a few required properties.
        * @method initialize
        **/
        initialize: function () {
            var self = this,
                startTab = this.get('startTabindex');
            self.isAccessible = self.get('isAccessible');
            self.nodes = new MathUtilities.Components.Manager.Collections.Nodes();
            self.elements = new MathUtilities.Components.Manager.Collections.Elements();
            self.elementsByAccId = {};
            self.elementsById = {};
            self.set('nodes', self.nodes);
            self.elements = self.get('elements');
            self.screens = {};
            self.elementViews = {};

            self.set('accScreen', [{ 'id': 'accScreen', 'elements': [] }]);

            if (startTab !== null) {
                this.startTab = startTab;
            }
        },
        getIsWrapOn: function () {
            return this.get('isWrapOn');
        },
        setIsWrapOn: function (isWrapOn) {
            this.set('isWrapOn', isWrapOn);
        },
        startTab: 0,
        parse: function (data) {
            return this.parseJSON(data);
        },
        parseJSON: function (data) {
            var self = this;
            self.nodes.addNodes(data, self);

            return self;
        },
        getNoTextMode: function () {
            return this.get('noTextMode');
        },
        setNoTextMode: function (noTextMode) {
            this.set('noTextMode', noTextMode);
        }
    }, {
        Screen: {
            Type: {
                NORMAL: 'normal',
                MODAL: 'modal'
            }
        },
        Template: {
            ACCESSIBLE_TEXT: 'element-template-acc',
            DEFAULT_TEXT: 'element-template-no-acc'
        }
    });
}(window.MathUtilities));
