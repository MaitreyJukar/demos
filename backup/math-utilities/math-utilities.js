(function () {
    'use strict';

    if (window.MathUtilities) {
		return;
    }
    /**
    * Packages together all classes and instances related to tools.
    * @module MathUtilities
    **/
    var MathUtilities = {};

    /* Initialize MathUtilities Library */

    /**
    * Packages all the components under one namespace
    * @module Components
    * @namespace MathUtilites
    **/
    MathUtilities.Components = {};

    /**
    * Packages all the components under one namespace
    * @module Components
    * @namespace MathUtilites
    **/
    MathUtilities.Tools = {};

    MathUtilities.Preloader = {};

    /* Expose MathUtilities to the global namespace */
    if (!window.MathUtilities) {
        window.MathUtilities = MathUtilities;
    }
} ());
