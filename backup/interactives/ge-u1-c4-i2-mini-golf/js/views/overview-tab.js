(function () {
    'use strict';
    /**
    * Class for Overview Tab ,  contains properties and methods of Overview tab
    * @class Overview
    * @module MiniGolf
    * @namespace MathInteractives.Interactivities.MiniGolf.Views
    * @extends MathInteractives.Common.Player.Views.Base
    * @type Object
    * @constructor
    */
    MathInteractives.Interactivities.MiniGolf.Views.OverviewTab = MathInteractives.Common.Player.Views.Base.extend({
        /**
        * Unique interactivity id prefix
        * @property _idprefix
        * @default null
        * @private
        */
        idPrefix: null,

        /**
        * Model of path for preloading files
        * @property filePath
        * @type Object
        * @default null
        */
        filePath: null,

        /**
        * Manager object 
        * @property manager
        * @type Object
        * @default null
        */
        manager: null,

        /**
        * Reference to player object
        * @property player
        * @type Object
        * @default null
        */
        player: null,

        /**
        * Initializer function of view.
        * @method initialize
        * @constructor
        */
        initialize: function () {
            this.filePath = this.model.get('path');
            this.manager = this.model.get('manager');
            this.player = this.model.get('player');
            this.idPrefix = this.player.getIDPrefix();
            this.render();
        },

        /**
        * Renders the view of overview tab
        *
        * @method initialize
        * @public 
        **/
        render: function render() {
            this.loadScreen('title-screen');
            this.listenTo(this.player, MathInteractives.Common.Components.Theme2.Views.OverviewTab.GO_BUTTON_CLICKED, this.onGoButtonClicked);
        },

        /*
        * takes user to next tab
        *
        * @method _nextTab
        * @private 
        **/
        onGoButtonClicked: function onGoButtonClicked() {
            this.player.switchToTab(1);
        }
    });
})();