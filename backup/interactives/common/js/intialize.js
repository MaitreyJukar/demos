(function () {
    'use strict';


    /**
     * Adds _superwrapper function to the Backbone framework. You can call the function of the parent class
     * through this._superwrapper()
     */
    (function () {

        /** The super method takes two parameters: a method name
        * and an array of arguments to pass to the overridden method.
        * This is to optimize for the common case of passing 'arguments'.
        */
        function _superwrapper(methodName, args) {

            // Keep track of how far up the prototype chain we have traversed,
            // in order to handle nested calls to _super.
            this._superCallObjects || (this._superCallObjects = {});
            var currentObject = this._superCallObjects[methodName] || this,
                parentObject = findSuper(methodName, currentObject);
            this._superCallObjects[methodName] = parentObject;

            var result = parentObject[methodName].apply(this, args || []);
            delete this._superCallObjects[methodName];
            return result;
        }

        // Find the next object up the prototype chain that has a
        // different implementation of the method.
        function findSuper(methodName, childObject) {
            var object = childObject;
            while (object[methodName] === childObject[methodName]) {
                object = object.constructor.__super__;
            }
            return object;
        }

        _.each(["Model", "Collection", "View", "Router"], function (klass) {
            Backbone[klass].prototype._superwrapper = _superwrapper;
        });

    })();

    //Detect touch support and save it in support
    $.extend($.support, {
        touch: "ontouchend" in document
    });

    // Use this function to get the text width for the container holding text
    // Works for containers holding a single line of text
    // Syntax $('#' + YourContainerID ).GetTextWidth();
    // Returns the width without the units in px.

    $.fn.getTextWidth = function (bDebug) {
        if (bDebug) {
            $('body').append($(this));
        }
        var html_org = $(this).html();
        var html_calc = $('<span class="width-height-span">' + html_org + '</span>', { 'style': 'float:initial;  min-height: initial;margin-left: initial;line-height:normal;' })
        $(this).html(html_calc);

        var width = $(this).find('span:first').width();
        $(this).html(html_org);
        if (bDebug) {
            $(this).detach();
        }
        return width;
    };

    // Use this function to get the text height for the container holding text
    // Works for containers holding a single line of text
    // Syntax $('#' + YourContainerID ).GetTextHeight();
    // Returns the height without the units in px.

    $.fn.getTextHeight = function (bDebug) {
        if (bDebug) {
            $('body').append($(this));
        }
        var html_org = $(this).html();
        var html_calc = $('<span class="width-height-span">' + html_org + '</span>', { 'style': 'float:initial;  min-height: initial;margin-left: initial; line-height:normal;' })
        $(this).html(html_calc);

        var height = $(this).find('span:first').height();
        $(this).html(html_org);
        if (bDebug) {
            $(this).detach();
        }
        return height;
    };

    /**
    Packages together all classes and instances related to MathInteractives.
    @module MathInteractives
    **/
    var MathInteractives = (typeof window.MathInteractives!=='undefined') ? window.MathInteractives : {};


    //Initializing the Common
    /**
    Packages together all the common classes under one namespace
    @module Common
    @namespace MathInteractives
    **/
    MathInteractives.Common = (typeof MathInteractives.Common !== 'undefined') ? MathInteractives.Common : {};;

    /**
    Packages together all the classes of player under one namespace
    @module Player
    @namespace MathInteractives.Common
    **/
    MathInteractives.Common.Player = {};

    /**
    Packages models of player under Player namespace
    @module Models
    @namespace MathInteractives.Common.Player
    **/
    MathInteractives.Common.Player.Models = {};

    /**
    Packages views of player under Player namespace
    @module Views
    @namespace MathInteractives.Common.Player
    **/
    MathInteractives.Common.Player.Views = {};


    /**
    Packages collections of player under Player namespace
    @module Collections
    @namespace MathInteractives.Common.Player
    **/
    MathInteractives.Common.Player.Collections = {};

    //Initializing the Interactivities
    /**
    Packages all the Interactivities under one namespace
    @module Interactivities
    @namespace MathInteractives
    **/
    MathInteractives.Interactivities = {};

    /**
    Packages all the utilities under one namespace
    @module Utilities
    @namespace MathInteractives.Common
    **/
    MathInteractives.Common.Utilities = {};
    MathInteractives.Common.Utilities.Models = {}; //package all models in Utilities
    MathInteractives.Common.Utilities.Views = {}; //package all views in Utilities

    /**
    Packages all the Components under one namespace
    @module Components
    @namespace MathInteractives.Common
    **/
    MathInteractives.Common.Components = {};
    MathInteractives.Common.Components.Models = {}; //package all models in Components
    MathInteractives.Common.Components.Views = {}; //package all views in Components

    /**
    Packages all the common interactivities under one namespace
    @module Components
    @namespace MathInteractives.Common
    **/
    MathInteractives.Common.Interactivities = {};
    /**
    Packages all theme 2 Components under one namespace
    @module Components
    @namespace MathInteractives.Common.Components
    **/
    MathInteractives.Common.Components.Theme2 = {};
    MathInteractives.Common.Components.Theme2.Models = {}; //package all models in Components
    MathInteractives.Common.Components.Theme2.Views = {}; //package all views in Components
    MathInteractives.Common.Components.Theme2.Collections = {};

    /**
    Packages all the Components under one namespace
    @module Components
    @namespace MathInteractives.Common
    **/

    MathInteractives.Common.Components.Models.MathUtilitiesGraph = {};
    MathInteractives.Common.Components.Models.MathUtilitiesGraph.EquationEngine = {};
    MathInteractives.Common.Components.Views.MathUtilitiesGraph = {};

    MathInteractives.Common.Components.Models.MathUtilitiesGraphNew = {};
    MathInteractives.Common.Components.Models.MathUtilitiesGraphNew.EquationEngine = {};
    MathInteractives.Common.Components.Views.MathUtilitiesGraphNew = {};

    MathInteractives.Common.Components.Models.EquationManager = {};
    MathInteractives.Common.Components.Views.EquationManager = {};

    /**
    Contains all the global variables under one object
    @type {object} global
    @namespace MathInteractives
    **/
    MathInteractives.global = {};

    /**
    Contains all the global variables under one object
    @type {object} Theme2
    @namespace MathInteractives
    **/
    MathInteractives.global.Theme2 = {};

    /* Expose MathInteractives to the global namespace */
    window.MathInteractives = MathInteractives;

})();
