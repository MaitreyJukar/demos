(function () {
    'use strict';

    /**
    * View for rendering Local Instruction
    *
    * @class LocalInstructions
    * @constructor
    * @extends MathInteractives.Common.Player.Views.Base
    * @namespace MathInteractives.Common.Components.Views
    **/
    MathInteractives.Common.Components.Views.LocalInstruction = MathInteractives.Common.Player.Views.Base.extend({
        /**
        * jQuery object of localInstruction 
        * @property $localInstruction
        * @type Object
        * @defaults null
        */
        $localInstruction: null,

        /**
        * Holds the model of path for preloading files
        * @property filePath
        * @type Object
        * @default null
        */
        filePath: null,

        /**
        * Holds the interactivity id prefix
        * @property idPrefix
        * @default null
        * @private
        */
        idPrefix: null,

        /**
        * Calls render
        * @method initialize
        **/
        initialize: function initialize() {
            this.filePath = this.model.get('path');
            this.idPrefix = this.model.get('idPrefix');
            this.manager = this.model.get('manager');
            this.player = this.model.get('player');
            this.render();
        },

        /**
        * Renders the local Instruction component
        * @method render
        **/
        render: function render() {
            var $leftChild, $midChild, $rightChild, newIdPrefix, ttsProps;

            newIdPrefix = this.model.getId();

            this.$localInstruction = this.$el.addClass('local-instructions');

            $leftChild = $('<div>', { 'class': 'local-instruction-left' }).appendTo(this.$el)
                .css({ 'background-image': 'url("' + this.filePath.getImagePath('player-lr') + '")' });
            $midChild = $('<div>', { 'class': 'local-instruction-mid' }).appendTo(this.$el)
                .css({ 'background-image': 'url("' + this.filePath.getImagePath('player-m') + '")' });
            $rightChild = $('<div>', { 'class': 'local-instruction-right' }).appendTo(this.$el)
                .css({ 'background-image': 'url("' + this.filePath.getImagePath('player-lr') + '")' });

            $('<div>', {
                'id': newIdPrefix + '-instruction',
                'class': 'text-div'    
            }).appendTo(this.$el);       

            $('<div>', { 'id': newIdPrefix + '-tts-div' }).appendTo(this.$el).css({
                'position': 'absolute',
                'right': '10px'
            }).addClass('instruction-bar-tts-div');

            ttsProps = {
                idPrefix: this.idPrefix,
                manager : this.manager,
                containerId: newIdPrefix + '-tts-div',
                messagesToPlay: [newIdPrefix + '-instruction'],
                path: this.filePath,
                player: this.player
            };
            this.ttsView = MathInteractives.global.PlayerTTS.generateTTS(ttsProps);
            this.showLocalInstruction();
        },

        /*
        * Shows the localInstruction
        * @method showLocalInstruction
        **/
        showLocalInstruction: function showLocalInstruction() {
            this.$localInstruction.show();
            this.loadScreen(this.model.getScreenId());
            var instructionTextDivId = this.model.getId() + '-instruction',
                instructionTextDivAccId = instructionTextDivId.slice(this.idPrefix.length, instructionTextDivId.length),
                ttsDivId = this.model.getId() + '-tts-div',
                ttsDivIdWithoutIdPrefix = ttsDivId.slice(this.idPrefix.length, ttsDivId.length);
            //this.loadScreen('tts-button-component');
            this.ttsView.renderTTSAccessibility(this.getTabIndex(instructionTextDivAccId) + 2);
        },

        /*
        * Hides the localInstruction
        * @method hideLocalInstruction
        **/
        hideLocalInstruction: function hideLocalInstruction() {
            MathInteractives.global.SpeechStream.stopReading();
            this.unloadScreen(this.model.getScreenId());
            this.$localInstruction.hide();
        }
    }, {
        /**
        * Creates a model & view object for the local instruction given default model properties as a parameter and
        returns the view object.
        * @method generateLocalInstruction
        * @param options {Object} The initial properties of the model - instruction-bar ID, interactivity idPrefix,
        screen ID, path, manager instance.
        * @return {Object} The local instruction view object.
        */
        generateLocalInstruction: function (options) {
            if (options) {
                var id, localInstruction, localInstructionView;

                id = '#' + options.id;
                localInstruction = new MathInteractives.Common.Components.Models.LocalInstruction(options);
                localInstructionView = new MathInteractives.Common.Components.Views.LocalInstruction({ el: id, model: localInstruction });

                return localInstructionView;
            }
        }
    });

    MathInteractives.global.LocalInstruction = MathInteractives.Common.Components.Views.LocalInstruction;

})();