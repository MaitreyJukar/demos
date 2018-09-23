(function () {
    'use strict';
    if (MathInteractives.Common.Interactivities.ShapeSlicer.Views.Overview) {
        return;
    }
    var eventManagerModel = MathInteractives.Common.Interactivities.ShapeSlicer.Models.ShapeSlicer.EVENT_MANAGER_MODEL;

    /*
	*
	*   D E S C R I P T I O N
	*	
	* @class Overview
	* @namespace MathInteractives.Interactivities.ShapeSlicer.Views
    * @extends MathInteractives.Common.Player.Views.Base.extend
	* @constructor
	*/

    MathInteractives.Common.Interactivities.ShapeSlicer.Views.Overview = MathInteractives.Common.Player.Views.Base.extend({

        /**
        * Initialises Overview        
        * @method initialize
        */
        initialize: function () {
            var browserCheck = MathInteractives.Common.Utilities.Models.BrowserCheck,
                isIE9 = browserCheck.isIE && Number(browserCheck.browserVersion) === 9;

            this.initializeDefaultProperties();
            if (!isIE9) {
                this.eventManager = this.model.get('eventManager');
                this.loadScreen("title-screen");
                this.render();
                this.player.bindTabChange(function (event) {
                    this.model.set('currentTab', 0);
                    this.eventManager.trigger(eventManagerModel.TAB_CHANGED, 0);
                }, this, 0);
            }
            else {
                var $player = this.player.$el,
                    $ie9Text = $('<div>').attr('id', this.idPrefix + 'three-js-ie-9-text')
                    .addClass('three-js-ie-9-text').css({
                        'position': 'absolute',
                        'top': '50%',
                        'left': '50%',
                        'transform': 'translate(-50%,-50%)',
                        'font': 'bold 16px Montserrat',
                        'text-align': 'center',
                        'line-height': '2'
                    }),
                    $emptyModal = $('<div>').addClass('three-js-ie-9-empty-modal').css({
                        'position': 'absolute',
                        'height': 644,
                        'width': 930,
                        'top': 0,
                        'left': 0,
                        'background-color': 'rgba(0,0,0,0.8)'
                    }).append($ie9Text);
                //append el to DOM
                $player.append($emptyModal);
                this.loadScreen("ie-9-pop-up-screen");
                this.player.enableAllHeaderButtons(false);
                this.player.setModalPresent(true);
                this.enableTab('header-subtitle', false);
                this.enableTab('overview-header', false);
                this.enableTab('overview-header-tts-sound-btn', false);
                this.enableTab('overview-text', false);
                this.enableTab('overview-submit-button', false);
                this.enableTab('overview-readable-text-region', false);                
            }
        },
        /**
        * Renders the view of overview tab
        *
        * @method initialize
        * @public 
        **/
        render: function render() {
            var galleryObject = this.model.get('galleryObject');
            if (galleryObject.length === 0) {
                this.player.enableTab(false, 2);
            }

        },
    });
})();