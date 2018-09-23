
(function () {
    'use strict';

    /**
    * View for rendering score meter
    *
    * @class ScoreMeter
    * @constructor
    * @namespace MathInteractives.Common.Components.Views
    **/
    MathInteractives.Common.Components.Views.ScoreMeter = Backbone.View.extend({

        /**
        * Loads the score in the meter.
        * 
        * @constructor
        * @method loadScore
        **/
        initialize: function initialize(options) {
            // ------------------------------- TODO ---- Load template here ------------------------
            //var data = {
            //    id: this.model.get('id')
            //};
            //scoreMeterHTML = MathInteractives.Common.Components.templates.scoremeter(data).trim();
            //--------------------------------------------------------------------------------------

            var html = '<div class="de-mathematics-interactive-score-meter">' +
                            '<div class="score-meter-base"></div>' +
                            '<div class="score-meter-value"></div>' +
                            '<div class="score-meter-grids-mask"></div>' +
                       '</div>';
            this.$el.html(html);

            var innerHTML = '';
            for (var i = 0; i < 10; i++) {
                innerHTML += '<div class="score-box"></div>';
            }
            var scoreMask = this.$el.find('.score-meter-grids-mask');
            scoreMask.append(innerHTML);

            var $scoreBoxes = this.$el.find('.score-box');
            var totalWidthToMinus = parseFloat($scoreBoxes.css('border-left-width')) + parseFloat($scoreBoxes.css('border-right-width')) + parseFloat($scoreBoxes.css('margin-right')) + parseFloat($scoreBoxes.css('margin-left'));
            $scoreBoxes.width(scoreMask.width() / 10 - totalWidthToMinus);
        },

        /**
        * Loads the score in the meter.
        *
        * @method loadScore
        **/
        loadScore: function (score) {
            if (score > 1) {
                console.error('Score = ' + score + ' cant be greater than 1.');
            }

            //            var widthPerCent = 100 * score;
            //            this.$el.find('.score-meter-value').width(widthPerCent + '%');

            var $scoreBoxes = this.$el.find('.score-box');
            var widthPerCent = $scoreBoxes.width() * 10 * score;
            this.$el.find('.score-meter-value').width(widthPerCent + 'px');
            var scoreMeterCurrWidth = this.$el.find('.score-meter-value').width();
            if (scoreMeterCurrWidth > $scoreBoxes.width()) {
                var quotient = scoreMeterCurrWidth / $scoreBoxes.width();
                var totalWidthToMinus = parseFloat($scoreBoxes.css('border-left-width')) + parseFloat($scoreBoxes.css('border-right-width')) + parseFloat($scoreBoxes.css('margin-right')) + parseFloat($scoreBoxes.css('margin-left'));
                scoreMeterCurrWidth = scoreMeterCurrWidth + totalWidthToMinus * Math.floor(quotient);
                this.$el.find('.score-meter-value').width(scoreMeterCurrWidth + 'px');

                if (this.$el.find('.score-meter-value').width() >= this.$el.width()) {
                    this.$el.find('.score-meter-value').width((scoreMeterCurrWidth - totalWidthToMinus) + 'px');
                }
            }
        }

    }, {});

    MathInteractives.global.ScoreMeter = MathInteractives.Common.Components.Views.ScoreMeter;
})();