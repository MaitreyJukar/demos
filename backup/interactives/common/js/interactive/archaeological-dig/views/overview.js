(function () {
    'use strict';

    /**
    * Class for Overview Tab ,  contains properties and methods of Overview tab
    * @class Overview
    * @module ArchaeologicalDig
    * @namespace  MathInteractives.Common.Interactivities.ArchaeologicalDig.Views
    * @extends MathInteractives.Common.Player.Views.Base
    * @type Object
    * @constructor
    */
    MathInteractives.Common.Interactivities.ArchaeologicalDig.Views.Overview = MathInteractives.Common.Player.Views.Base.extend({

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
        * Initializes the overview tab
        *
        * @method initialize
        * @public 
        **/
        initialize: function () {
            this.initializeDefaultProperties();
            this.idPrefix = this.player.getIDPrefix();
            this.loadScreen('overview-tab');
            this.loadScreen('archaeological-dig');            
        }
    })
})();