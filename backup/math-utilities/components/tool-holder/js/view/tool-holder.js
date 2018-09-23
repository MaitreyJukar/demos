(function() {
    'use strict';

    /**
     * Holds functionalities for tool holder.
     * @class Tools
     */
    MathUtilities.Components.ToolHolder.Views.ToolHolder = Backbone.View.extend({

        "_isVisible": true,

        "_toolBars": null,

        "TOOLBARS": {
            "TOP_TOOLBAR": "topToolbar",
            "BOTTOM_TOOLBAR": "bottomToolbar"
        },

        "_containerElement": null,

        "toolSize": {
            "height": null,
            "width": null
        },

        "initialize": function(options) {
            this.options = options || {};
            MathUtilities.Components.ToolHolder.Views.ToolHolder.TOOLID = arguments[0].toolId;
            MathUtilities.Components.Utils.Models.ScreenUtils.init();
            this._addToolbars();

            if (Object.keys(this.options).length > 1) {
                this.setState(this.options.toolbarState);
            }
            this._bindEvents();
            this.$('.math-utilities-components-tool-holder').parents('html').css('background-color', 'transparent');

            this.toolSize.height = this._containerElement.height();
            this.toolSize.width = this._containerElement.width();
        },

        "_addToolbars": function() {
            var ToolHolder = MathUtilities.Components.ToolHolder,
                topToolbar = new ToolHolder.Views.TopToolbar(),
                toolContainer,
                bottomToolbar = new ToolHolder.Views.BottomToolbar(),
                holderHeight, contentHolderHt,
                TOOL_ID = ToolHolder.Views.ToolHolder.TOOLID,
                $toolHolder;

            this.$el.append($(ToolHolder.Templates.toolHolder({
                "tool-id": TOOL_ID
            }).trim()));

            this._toolBars = {};
            this._toolBars.topToolbar = topToolbar;
            $toolHolder = this.$('#tool-holder-' + TOOL_ID);
            $toolHolder.height($(window).height());
            $toolHolder.append(this._toolBars[this.TOOLBARS.TOP_TOOLBAR].getToolbarTemplate());
            topToolbar.initUI();

            toolContainer = this._containerElement = $(this._appendToolContainer());
            $toolHolder.append(toolContainer);
            this._toolBars.bottomToolbar = bottomToolbar;
            $toolHolder.append(this._toolBars[this.TOOLBARS.BOTTOM_TOOLBAR].getToolbarTemplate());
            bottomToolbar.initUI();
            this.$('#math-tool-bottom-container').addClass('default-state');

            holderHeight = $toolHolder.height();
            contentHolderHt = holderHeight - (ToolHolder.Models.TopToolbar.TOP_TOOLBAR_HEIGHT + ToolHolder.Models.BottomToolbar.BOTTOM_TOOLBAR_HEIGHT);

            this.$('.tool-holder-tool-container').css('height', contentHolderHt);
        },

        "_appendToolContainer": function() {
            var toolContainer = new MathUtilities.Components.ToolHolder.Views.ToolContainer();

            return toolContainer.getHTML();
        },

        /**
         * Sets the toolholder's state.
         * @method setState
         * @param {Object} toolBarState, top and bottom toolbar state.
         */
        "setState": function(toolBarState) {
            if (!toolBarState) {
                return;
            }
            var topToolbar = toolBarState.topToolbar,
                bottomToolbar = toolBarState.bottomToolbar;

            if (topToolbar) {
                this._toolBars[this.TOOLBARS.TOP_TOOLBAR].setState(toolBarState.topToolbar);
            }

            if (bottomToolbar) {
                this._toolBars[this.TOOLBARS.BOTTOM_TOOLBAR].setState(toolBarState.bottomToolbar);
            }
        },

        /**
         * Returns toolbar's current state.
         * @method getState
         * @returns {Object} Current state of the toolbar.
         */
        "getState": function() {
            return {
                "topToolbar": this._toolBars[this.TOOLBARS.TOP_TOOLBAR].getState(),
                "bottomToolbar": this._toolBars[this.TOOLBARS.BOTTOM_TOOLBAR].getState()
            };
        },

        /**
         * Returns all the toolholders.
         * @method getToolbars
         * @returns {Object} Returns all the toolbars available.
         */
        "getToolbars": function() {
            return this._toolBars;
        },

        /**
         * Binds events on tool holder.
         * @method _bindEvents
         * @private
         */
        "_bindEvents": function() {
            this._toolBars[this.TOOLBARS.TOP_TOOLBAR].on('topToolbarItemClicked', this._onTopToolbarButtonClickHandler);
            this._toolBars[this.TOOLBARS.BOTTOM_TOOLBAR].on("screenShotNameEntered", _.bind(this._screenShotNameEntered, this))
                .on('bottomToolbarItemClicked', this._onBottomToolbarButtonClickHandler)
                .model.setChildView(this);
            $(window).on('resize', _.bind(this._resizeTool, this));
        },

        "_resizeTool": function(event) {
            if (event && event.target !== window) {
                return;
            }
            this.setToolHolderContainerHeight($(window).height()); //bottom padding 5px
        },

        "getToolSize": function() {
            return this.toolSize;
        },

        "setToolHolderContainerHeight": function(holderHeight) {
            var ToolHolder = MathUtilities.Components.ToolHolder,
                contentHolderHt = holderHeight -
                (ToolHolder.Models.TopToolbar.TOP_TOOLBAR_HEIGHT + ToolHolder.Models.BottomToolbar.BOTTOM_TOOLBAR_HEIGHT);

            $('.tool-holder').height(holderHeight);
            if (!this._containerElement) {
                this._containerElement = $('.tool-holder-tool-container');
            }
            this._containerElement.css('height', contentHolderHt);
            this.toolSize.height = this._containerElement.height();
            this.toolSize.width = this._containerElement.width();
        },

        /**
         * Triggers a topButtonClicked event for every button clicked at the top toolbar.
         * @method _onTopToolbarButtonClickHandler
         * @param {Object} eventData event object
         */
        "_onTopToolbarButtonClickHandler": function(eventData) {
            var toolId = $(eventData.currentTarget).attr('data-toolid');

            if (eventData.currentTarget.id === 'math-tool-btn-help-' + toolId) {
                Tools.DeApi.helpTool({
                    "toolId": toolId
                });
            }
        },

        /**
         * Triggers a bottomButtonClicked event for every button clicked at the bottom toolbar.
         * @method _onBottomToolbarButtonClickHandler
         * @param {Object} eventData event object
         */
        "_onBottomToolbarButtonClickHandler": function(eventData) {
            var str = 'The feature will be available in the final release of the tool.',
                strAPI = 'The feature has been implemented and can be used as soon as DE APIs are available.',
                toolId = $(eventData.currentTarget).attr('data-toolid'),
                deOptions = {},
                childView = this.model.getChildView(),
                saveStateData,
                $file,
                fileType,
                onFileSelect;
            switch (eventData.currentTarget.id) {
                case 'math-tool-btn-screenshot-' + toolId:
                    this.screenShotModal.open();
                    break;

                    /*eslint no-alert:0, no-undef:0 */ // allow the alerts here
                case 'math-tool-btn-open-' + toolId:
                    alert(strAPI);
                    break;
                case 'math-tool-btn-save-' + toolId:
                    saveStateData = childView.saveState();
                    deOptions = {};

                    if (typeof saveStateData === 'string') {
                        saveStateData = JSON.parse(saveStateData);
                    }
                    deOptions.toolId = toolId;
                    deOptions.data = {
                        "toolState": saveStateData
                    };
                    deOptions.success = Tools.DeApi.saveToolStateSuccess;
                    deOptions.error = Tools.DeApi.saveToolStateError;
                    deOptions.complete = Tools.DeApi.saveToolStateComplete;

                    Tools.DeApi.saveState(deOptions);
                    break;
                case 'math-tool-btn-print-' + toolId:
                    alert(str);
                    break;
                case 'math-tool-btn-csv-' + toolId:
                    //code to open file box
                    $file = $('<input type=\'file\'>');
                    fileType = ["csv"];
                    onFileSelect = _.bind(function(event) {
                        if (!window.FileReader) {
                            return;
                        }
                        var files = event.target.files,
                            reader = new window.FileReader(),
                            fileExtension = files[0].name.split('.').pop(),
                            csvObject = null,
                            rowData = null;
                        reader.onload = _.bind(function(frEvent) {
                            var text = frEvent.target.result,
                                columnCount = 0,
                                /*Regex for converting to rows and columns using line format in csv*/
                                data = text.split(/\r\n|\n|\r/),
                                rowCount = data.length,
                                row;

                            for (row in data) {
                                rowData = data[row];
                                data[row] = rowData.split(',');
                                //column count
                                if (data[row].length > columnCount) {
                                    columnCount = data[row].length;
                                }
                            }
                            csvObject = {
                                "rows": rowCount,
                                "cols": columnCount,
                                "data": data
                            };
                            if (typeof childView.setCsvData !== 'undefined') {
                                childView.setCsvData(csvObject);
                            }
                        }, this);
                        if (fileType.indexOf(fileExtension) !== -1) {
                            reader.readAsText(files[0]);
                        } else {
                            alert('File format not supported.');
                        }

                    }, this);

                    $file.hide();
                    $file.on('change', onFileSelect);
                    $file.trigger('click');

                    break;
                case 'math-tool-btn-zoomout-' + toolId:
                    childView.zoomOut(eventData);
                    break;
                case 'math-tool-btn-zoomdefault-' + toolId:
                    childView.zoomDefault(eventData);
                    break;
                case 'math-tool-btn-zoomin-' + toolId:
                    childView.zoomIn(eventData);
                    break;
            }
        },

        "_screenShotNameEntered": function(eventData) {
            if ($.de.loading) {
                $.de.loading($("body"));
                this.processBase64(function(base64Img) {
                    Tools.DeApi.saveImage({
                        "data": {
                            "content": base64Img,
                            "name": eventData
                        }
                    }).always(function(response) {
                        $.de.loadingComplete($("body"));
                        $.de.browse({
                            "actionType": 'add',
                            "assetTitle": eventData.name,
                            "assetGuid": response.assetGuid
                        });
                    });
                });
            } else {
                this.processBase64(function(base64Img) {
                    window.open(base64Img);
                });
            }
        },

        "processBase64": function(callback) {
            var ScreenUtils = MathUtilities.Components.Utils.Models.ScreenUtils;

            ScreenUtils.setVisibilityScreenshotPreparationModal(true);

            if (this.snapshot) {
                this.snapshot(function(data) {
                    ScreenUtils.setVisibilityScreenshotPreparationModal(false);
                    callback(data);
                });
            } else {
                MathUtilities.Components.Utils.Models.ScreenUtils.getScreenShot({
                    "container": this.toolbarState.bottomToolbar.screenCaptureDiv.screenCaptureHolder,
                    "type": MathUtilities.Components.Utils.Models.ScreenUtils.types.BASE64,
                    "complete": function(imageBase64) {
                        callback(imageBase64);
                    }
                });
            }
        },

        /**
         * return toolbar visibility.
         * @method isVisible
         * @return {Boolean} True if the toolbar visible, false otherwise.
         */
        "isVisible": function() {
            return this._isVisible;
        }
    }, {
        "TOOLID": null,
        "BOTTOM_PADDING": 5
    });
})();
