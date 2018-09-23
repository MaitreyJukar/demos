(function () {
    'use strict';
    MathInteractives.Interactivities.ConicSectionExplorer.Views.OverviewTab = MathInteractives.Common.Player.Views.Base.extend({

        /**
        * Initializer function of view.
        * @method initialize
        * @constructor
        */
        initialize: function () {
            this.initializeDefaultProperties();
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

        /**
        * Takes user to next tab
        *
        * @method onGoButtonClicked
        * @private 
        **/
        onGoButtonClicked: function onGoButtonClicked() {
            this.player.switchToTab(1);
        }
    });
})();