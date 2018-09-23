
(function () {
    'use strict';

    /**
    * View for rendering legend button and its related events
    *
    * @class LegendButton
    * @constructor
    * @namespace MathInteractives.Common.Components.Views
    **/
    MathInteractives.Common.Components.Views.LegendButton = MathInteractives.Common.Components.Views.Button.extend({
        /**
        * to maintain legend button state
        * @property isLegendDown
        * @type boolean
        * @defaults false
        */
        _isLegendDown: false,

        /**
        * button view
        * @property _buttonView
        * @type backbone view
        * @defaults false
        */
        _buttonView: null,

        /**
        * manager
        * @property _manager
        * @defaults null
        */
        _manager: null,

        /**
        * Calls render and attach events
        *
        * @method initialize
        **/
        initialize: function initialize() {
            this.$el.off('click.graphlegend');
            this.$el.on('click.graphlegend', $.proxy(this._legendClick, this));
        },

        /**
        * set state of legend button
        *
        * @method setButtonState
        **/
        setButtonState: function setButtonState(state) {
            this._buttonView.setButtonState(state);
        },

        /**
        * set legend text
        *
        * @method setLegendText
        **/
        setLegendText: function setLegendText(text) {
            this.$el.parent().find('.legendButtonText').html(text);
//            if (this._manager !== null) { 
            //            //this._manager.setMessage();
//            }
        },

        /**
        * get state of legend button
        *
        * @method getButtonState
        **/
        getButtonState: function getButtonState() {
            return this._buttonView.getButtonState();
        },

        /**
        * set down state for graph 
        *
        * @method setDownState
        **/
        setDownState: function setDownState(isDown) {
            if (isDown === true) {
                this.$el.children().addClass('down');
                this._isLegendDown = true;
            } else {
                this.$el.children().removeClass('down');
                this._isLegendDown = false;
            }
        },

        /**
        * function fired on click of legend btn
        *
        * @method legendClick
        **/
        _legendClick: function _legendClick(event) {
            event.preventDefault();
            event.stopPropagation();

            if (this.model.get('customEvent') === true) {
                this.setDownState(!this._isLegendDown);
                this.$el.trigger(MathInteractives.global.LegendButton.LEGEND_CLICK);
                return;
            }

            var legendModel = {
                'chart': $('#' + this.model.get('chartContainerID')).highcharts(),
                'seriesID': this.model.get('seriesID')
            }, series = legendModel['chart'].get(legendModel['seriesID']);

            if (series.visible === true) {
                series.hide();
                this.$el.children().removeClass('down');
                //this.setButtonState(MathInteractives.global.Button.BUTTON_STATE_DISABLED);
            } else {
                series.show();
                this.$el.children().addClass('down');
                //this.setButtonState(MathInteractives.global.Button.BUTTON_STATE_ACTIVE);
            }
        }

    }, {

        /**
        * Active State string
        *
        * @static 
        **/
        BUTTON_STATE_ACTIVE: MathInteractives.global.Button.BUTTON_STATE_ACTIVE,

        /**
        * Selected State string
        *
        * @static 
        **/
        BUTTON_STATE_SELECTED: MathInteractives.global.Button.BUTTON_STATE_SELECTED,

        /**
        * Disabled State string
        *
        * @static 
        **/
        BUTTON_STATE_DISABLED: MathInteractives.global.Button.BUTTON_STATE_DISABLED,

        /**
        * Legend Button click event string
        *
        * @static 
        **/
        LEGEND_CLICK: 'legend_click',

        /**
        * render single legend button
        *
        * @method _renderLegend
        **/
        _renderLegend: function _renderLegend(options, legendContainerID, counter) {
            var btnID;
            if (options) {
                btnID = legendContainerID + 'Legend' + counter;
                $('.de-mathematics-interactive #' + legendContainerID).append('<div id="legendButtonHolder' + counter + '" class="legendButtonHolder">');
                $('.de-mathematics-interactive #' + legendContainerID + ' #legendButtonHolder' + counter)
                        .append('<div id="' + btnID + '" class="legendButton legendButton' + counter + '" ></div>')
                    .append('<div id="' + btnID + 'Text" class="legendButtonText typography-body-text legendButtonText' + counter + '" >' + options['labelText'] + '</div>');
                options = $.extend(options, { 'id': btnID });

                var buttonView = new MathInteractives.global.Button.generateButton(options),
                    buttonModel = buttonView.model,
                    legendModel = new MathInteractives.Common.Components.Models.LegendButton(options),
                    legendView = new MathInteractives.Common.Components.Views.LegendButton({ el: '#' + btnID, model: legendModel });

                legendView._buttonView = buttonView;
                //                var buttonModel = new MathInteractives.Common.Components.Models.Button(options);
                //                var buttonView = new MathInteractives.Common.Components.Views.Button({ el: btnID, model: buttonModel });

                var $btnIcon = legendView.$el.find('.button-icon'), iconPadding = parseInt((legendView.$el.width() - options['icon']['width']) / 2) + 2;

                if ($btnIcon !== null && typeof $btnIcon !== 'undefined') {
                    $btnIcon.css({
                        'background-image': 'url(' + options['path'].getImagePath(options['icon']['pathId']) + ')',
                        'margin-left': iconPadding,
                        'width': options['icon']['width']
                    });
                }
                legendView.setDownState(true);
                return legendView;
            }
        },

        /*
        * to generate legend button as per the given requirement for graph
        * @method generateLegend
        * @param {object} buttonProps
        */
        generateLegend: function generateLegend(options) {

//            var options = {
//                'legendContainerID': 'expon-log-legend-container',
//                'path': this.filePath,
//                'manager': this.manager,
//                //'player' : this._player,
//                //'chartContainerID' :'chartContainerID',
//                'legends': [{
//                    icon: { pathId: 'expon-legend', height: 10, width: 10 },
//                    //'tooltipText' : 'text',
//                    //'tooltipPosition' : 'text',
//                    'labelText': 'label1',
//                    //'seriesID': ''
//                    'customEvent': true
//                }, {
//                    icon: { pathId: 'log-legend', height: 10, width: 10 },
//                    //'tooltipText' : 'text',
//                    //'tooltipPosition' : 'text',
//                    'labelText': 'label2',
//                    //'seriesID': ''
//                    'customEvent': true
//                }]
//            }

            /* button properties
            options = {
            'legendContainerID': 'legendContainerID',
            'path' : 'path',
            'player' : 'player',
            'chartContainerID' :'chartContainerID'
            'legends' : [{
            'icon' : { pathId: 'path-id-of-image', height: **, width: ** }
            'tooltipText' : 'text'
            'tooltipPosition' : 'text',
            'labelText': 
            'seriesID'
            'customEvent'
            },{}]
            }
            */
            var player = options['player'],
                path = options['path'],
                legendContainerID = options['legendContainerID'],
                chartContainerID = options['chartContainerID'],
                legendCount = options['legends'].length,
                i = 0;
            this._manager = options['manager'];
            var defaults = {
                'type': MathInteractives.Common.Components.Views.Button.TYPE.ACTION,
                'baseClass': 'graphLegends',
                //'toggleButton' : true,
                'width': 51,
                'height': 33,
                'padding': 5,
                'imagePathIds': [],
                'isDraggable': false,
                'cornerSliceImgWidth': 5,
                //'btnWidthGroup' : 'graphLegends',//because this is causing images of icon to resize in width
                'text': '',
                'isLegend': true,
                'player': player,
                'path': path,
                'chartContainerID': chartContainerID,
                'customEvent': false

            }, btnID, btnOptions, legendView, legendArray = [];

            //$('#' + legendContainerID).empty();

            for (; i < legendCount; i++) {
                btnOptions = $.extend(defaults, options['legends'][i]);
                legendView = MathInteractives.global.LegendButton._renderLegend(btnOptions, legendContainerID, i);
                legendArray.push(legendView);
            }

            return legendArray;
        }
    });

    MathInteractives.global.LegendButton = MathInteractives.Common.Components.Views.LegendButton;
})();