(function () {
   
    'use strict';
    /***
    *
    *
    ***/
    MathInteractives.Common.Player.Views.CanvasAccExt = MathInteractives.Common.Player.Views.CanvasAcc.extend({

        /* set focus to same element through to temp div so text can be read by screen reader
        * @method _setSelfFocus
        * @private
        */
        _setSelfFocuse: function () {

            if (this.player.getModalPresent()) {
                return;
            }
            //console.log("+++++++++++++++++++++++ :  " + this.lastTriggeredEvent);
            var selfFocusDisableEvents = this.model.get('selfFocusDisableEvents');
            if (selfFocusDisableEvents && this.lastTriggeredEvent) {
                var eventCount = selfFocusDisableEvents.length;
                for (var i = 0; i < eventCount; i++) {
                    if (this.lastTriggeredEvent === selfFocusDisableEvents[i]) {
                        this.lastTriggeredEvent = null;
                        return;
                    }
                }
            }
            this.lastTriggeredEvent = null;

            var id = this.el.id,
                canvasHolderID = this.model.get('canvasHolderID'),
                currentTextElement = this.$('#' + id + '-acc-elem');

            /*Space appended if same text set again as jaws doesn't read same text again on setfocus*/
            if (currentTextElement.length > 0) {
                var currentText = currentTextElement.text(),
                    accId = id.replace(this.idPrefix, '');

                if (currentText === this.prevText && currentText !== '') {
                    this.prevText = currentText + " ";
                    this.setAccMessage(accId, this.prevText);
                }
                else {
                    this.prevText = currentText;
                }
            }

            this.setFocus(canvasHolderID.replace(this.idPrefix, '') + 'temp-focus-div');

        }
    }, {

        /*
       * Initialize canvas acc for the interactive
       * @param {object} options
       * @return {object} canvasAccView
       */
        intializeCanvasAcc: function intializeCanvasAcc(options) {
            var canvasAccModel = options.model || null,
                canvasAccView = null;

            var canvasHolderID = '#' + options.canvasHolderID;

            if (canvasAccModel === null) {
                canvasAccModel = new MathInteractives.Common.Player.Models.CanvasAcc(options);
            }

            canvasAccView = new MathInteractives.Common.Player.Views.CanvasAccExt({ model: canvasAccModel, el: canvasHolderID });

            return canvasAccView;
        }

    });
    
    MathInteractives.global.CanvasAccExt = MathInteractives.Common.Player.Views.CanvasAccExt;
})();
