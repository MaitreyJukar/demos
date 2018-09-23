(function () {
    'use strict';

    /*
	*
	*   D E S C R I P T I O N
	*	
	* @class CanvasRasterLoader
	* @namespace MathInteractives.Common.Utilities.Models.CanvasRasterLoader
    * @extends Backbone.Model.extend
	* @constructor
	*/

    MathInteractives.Common.Utilities.Models.CanvasRasterLoader = Backbone.Model.extend({

        /**
        * Container in which the loading screen will be shown. Provide idPrefix too.
        *          
        * @attribute containerId
        * @type String
        * @default null
        */
        containerId : null,

        /**
        * name space of the current view.
        *          
        * @attribute nameSpace
        * @type Object
        * @default null
        */

        nameSpace : null,

        /**
        * PaperScope of the target canvas on which the paper items will be loaded.
        *          
        * @attribute paperScope
        * @type Object
        * @default null
        */
        
        paperScope : null ,

        /**
        * Holds the number of rasters loaded so far.
        *          
        * @attribute count
        * @type Number
        * @default 0
        */
        
        count : 0 ,

        startTime : null,

        endTime : null,

        /**
        * Container for loading dialog
        *          
        * @attribute dialogDiv
        * @type Object
        * @default null
        */        
        dialogDiv : null,

        /**
        * Width of the progress bar
        *          
        * @attribute progressBarWidth
        * @type Number
        * @default 500
        */        
        progressBarwidth : 500,

        /**
        * Height of the progress bar
        *          
        * @attribute progressBarHeight
        * @type Number
        * @default 30
        */
        progressBarHeight : 30,

        /**
        * Visibility of the dialog.
        *          
        * @attribute dialogVisible
        * @type Boolean
        * @default false
        */
        dialogVisible : false,

        $progressDiv : null,

        /**
        * Loaded rasters so far.
        *          
        * @attribute loadedRasters
        * @type Boolean
        * @default false
        */
        loadedRasters : null,

        /**
        * Initialises CanvasTooltip
        *
        * @method initialize
        **/
        initialize: function (options) {
            var self = this;
            this._initVariables(options);
            this._renderDialog();
            this._bindEvents();
            this._loadRasters(self.rasterSources);
        },

        /**
        * Initialises variables
        *
        * @method _initVariables
        **/
        _initVariables : function _initVariables(options) {
            this.paperScope = options.paperScope;
            this.rasterSources = options.rasterSources;
            this.nameSpace = MathInteractives.Interactivities.ToolTipTest.Views.CanvasRasterLoader;
            this.containerId = '#' + options.containerId;
            this.dialogVisible = options.dialogVisible;
        },

        /**
        * Binds events.
        *
        * @method _bindEvents
        **/
        _bindEvents : function _bindEvents() {
            this.listenTo(this,this.nameSpace.EVENTS._LOADING_STARTED,this._showDialog);
            this.listenTo(this,this.nameSpace.EVENTS._LOADING_PROGRESSED,$.proxy(this._changeProgress,this,this.count));
            this.listenTo(this,this.nameSpace.EVENTS._LOADING_FINISHED,this._closeDialog);
        },

        /**
         * Load rasters from the source values provided.
         * @param {Object} will contain source and id as a attribute
         */
        _loadRasters : function _loadRasters(rasterSources){
            var tempObj,
                self = this,
                paperScope = this.paperScope;
            this._emitStartEvent();
            this.loadedRasters = [];
            for(var i = 0 ; i < rasterSources.length ; i++){
                if(this._isNullOrUndefined(rasterSources[i].source)){
                    continue;
                }
                tempObj = new paperScope.Raster({
                    source : rasterSources[i].source 
                });
                tempObj.on('load',$.proxy(this._onLoad,this));
                this.loadedRasters.push({raster : tempObj , id : rasterSources[i].id});
            }
        },

        _onLoad : function(event) {
            this._emitProgressEvent();
        },

        /**
         * Emits start event of raster loading
         */
        _emitStartEvent : function _emitStartEvent(){
            this.count = 0 ;
            this.startTime = new Date();
            this.trigger(this.nameSpace.EVENTS._LOADING_STARTED,{ count : this.count });
            this.trigger(this.nameSpace.EVENTS.LOADING_STARTED,{ count : this.count });
        },

        /**
         * Fires event when a new raster is loaded from the list.
         */
        _emitProgressEvent : function _emitProgressEvent(){
            this.count++;
            this.trigger(this.nameSpace.EVENTS._LOADING_PROGRESSED,{ count : this.count });
            this.trigger(this.nameSpace.EVENTS.LOADING_PROGRESSED,{ count : this.count });
            if(this.count === this.rasterSources.length){
                this._emitFinishedEvent();   
            }            
        },

        /**
         * Emits end event on all the rasters successfully loaded.
         */
        _emitFinishedEvent : function _emitFinishedEvent() {            
            this.endTime = new Date();
            this.trigger(this.nameSpace.EVENTS._LOADING_FINISHED,{ count : this.count });
            this.trigger(this.nameSpace.EVENTS.LOADING_FINISHED,{ count : this.count });
        },

        _emitInvalidSource : function _emitInvalidSource() {
            this.trigger(this.nameSpace.EVENTS.INVALID_SOURCE,{ count : this.count });
        },

        _isNullOrUndefined : function _isNullOrUndefined(object){
            return object === null || typeof object === 'undefined';
        },

        /**
         * Renders the dialog
         */
        _renderDialog : function _renderDialog() {
            var styles = this.nameSpace.STYLES;
            this.dialogDiv = $('<div style="'+ styles.BACKGROUND + '"></div>', { id: 'paperjs-canvas-loader-popup-de-common' });
            this.$progressDiv = $('<div style="'+ styles.PROGRESS_BAR + '"></div>', 
                                  { id: 'paperjs-canvas-loader-popup-de-common-progress-bar' });
            this.$throbber = $('<div class="throbber-holder throbber-container throbber-active type2" style="' + styles.THROBBER + '"></div>');
            this.$text = $('<div style="' + styles.TEXT + '"> Rasters Loading....</div>"');
            this.dialogDiv.append(this.$progressDiv);
            this.dialogDiv.append(this.$throbber);
            this.dialogDiv.append(this.$text);
            this.dialogDiv.hide();
            $(this.containerId).append(this.dialogDiv);
        },

        /**
         * Show dialog is dialogVisible is true.
         */
        _showDialog : function _showDialog() {
            if(this.dialogVisible){
                this.dialogDiv.show();
            }
        },

        /**
         * Returns the rasters loaded so far. This method should be called once the finish event is fired.
         * @returns {[[Type]]} [[Description]]
         */
        getRasters : function getRasters(){
            return this.loadedRasters;  
        },

        /**
         * Changes the progress bar value and width
         */
        _changeProgress : function _changeProgress() {            
            var width  = this.count / this.rasterSources.length;
            width = width * this.progressBarwidth;
            this.$progressDiv.css({
                width : width
            });
        },

        /**
         * Close the dialog
         */
        _closeDialog : function _closeDialog() {
            this.dialogDiv.hide();
        },

        /**
         * Destroy the view.
         * @public
         * @method destroy
         */
        destroy : function destroy(){
            this.dialogDiv.empty();
            this.unbind();
            this.dialogDiv.remove();

        }
    },{          
        EVENTS : {
            _LOADING_STARTED : 'private-loading-started',
            _LOADING_PROGRESSED : 'private-loading-progressed',
            _LOADING_FINISHED : 'private-loading-finished',
            _LOADING_FAILED : 'private-loading-failed',
            _INVALID_SOURCE : 'private-invalid-source',            
            LOADING_STARTED : 'loading-started',
            LOADING_PROGRESSED : 'loading-progressed',
            LOADING_FINISHED : 'loading-finished',
            LOADING_FAILED : 'loading-failed',
            INVALID_SOURCE : 'invalid-source'
        },
        STYLES : {
            BACKGROUND : 'position:absolute;left:0;top:0;width:928px;height:599px;z-index:2000;background:#391165;',
            PROGRESS_BAR : 'position:absolute;left:214px;bottom:150px;width:500px;height:30px;background:#391165;',
            THROBBER : 'position:absolute;mragin:auto;left:473px;top:322px;',
            TEXT : 'position:absolute;text-align:center;font-weight:bold;font-size:12px;font-family:Montserrat;left:436px;top:354px;'
        }
    });
})();