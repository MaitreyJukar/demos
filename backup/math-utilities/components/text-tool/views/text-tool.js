/* globals _, $, window, tinymce, tinyMCE  */

(function(MathUtilities) {
    'use strict';

    /**
     * A customized Backbone.Views that initialize text tool.
     * @class TextTool
     * @constructor
     * @namespace Components.TextTool.Views
     * @module TextTool
     * @extends Backbone.View
     */
    MathUtilities.Components.TextTool.Views.TextTool = Backbone.View.extend({
        /**
         * Flag is true if VMK is open
         *
         * @property _isKeyBoardOpen
         * @type Boolean
         * @default null
         */
        "_isKeyBoardOpen": null,
        /**
         * Stores data related to the TinyMCE editor
         *
         * @property editorData
         * @type Object
         * @default null
         */
        "editorData": null,
        /**
         * Flag is true if TinyMCE is initialized
         *
         * @property editorInitialized
         * @type Boolean
         * @default null
         */
        "editorInitialized": null,
        /**
         * Flag is true if resize hotkey is down
         *
         * @property isResizeKeyDown
         * @type Boolean
         * @default null
         */
        "isResizeKeyDown": null,
        /**
         * Flag is true if already present text is being re-edited
         *
         * @property isReEdit
         * @type Boolean
         * @default null
         */
        "isReEdit": null,

        /**
         * @method initialize
         */
        "initialize": function() {
            this.isKeyBoardOpen = false;
            this.editorInitialized = false;
            this.isResizeKeyDown = false;
            this.isReEdit = false;

            if (this.$('#holderDiv').length === 0) {
                this.$el.append(MathUtilities.Components.TextTool.templates['holder-data']().trim());
            }
            if (this.options.canvasBounds) {
                this.model.setCanvasProp(this.options.canvasBounds);
            }
            this.createFnReference();
        },

        "createFnReference": function() {
            this.onKeyBoardOpenFn = _.bind(this.onKeyBoardOpen, this);
            this.onKeyboardCloseFn = _.bind(this.onKeyboardClose, this);
            this.onKeyDownFn = _.bind(this._onKeyDown, this);
            this.onKeyUpFn = _.bind(this._onKeyUp, this);
            this.onModalCloseFn = _.bind(this.onModalClose, this);
        },

        /**
         * loads text editor
         * @method  loadEditor
         * @param {Object} options, text editor options
         *
         * @param {Integer} options.height, Height of the text editor.
         * @param {Integer} options.width, Width of the text editor.
         * @param {String}  options.text, Text to be loaded in the text editor.
         * @param {Integer} options.counter, Counter of the added text editor.
         * @param {Object}  options.topLeft, position of the text editor.
         * @param {Boolean} options.openModal, check already open.
         * @param {String}  options.basePath, append basepath if any.
         * @param {Object}  options.offset, set offset of the text editor.
         * @param {String}  options.csvData, set CSV data in case of retrieving from saved state.
         * @param {Boolean} options.isAccessible, set accessibility true for text editor.
         * @param {Object}  options.canvasBounds, canvas Limits to restrict text-tool resize.
         * @param {Boolean} options.isEdit, to check is reEdit.
         */
        "loadEditor": function(options) {

            var ht = options.height,
                wd = options.width,
                text = options.text,
                counter = options.counter,
                topLeft = options.topLeft,
                basePath = options.basePath,
                offset = options.offset,
                bgcolor,
                $tempInputHolder = $('<div>'),
                csvData = options.csvData,
                isAccessible = options.isAccessible,
                canvasBounds = options.canvasBounds,
                isReEdit = options.isReEdit,
                textToolDimension,
                jsonPath = basePath,
                textEditor = null,
                $el = this.$el;

            basePath = "/";

            $tempInputHolder.html(text);

            if (options.backgroundColor) {
                bgcolor = options.backgroundColor;
            } else {
                bgcolor = $(":first", $tempInputHolder).attr("backgroundcolor");
            }

            if (!bgcolor) {
                bgcolor = "transparent";
            }

            this.isReEdit = isReEdit;
            if (isReEdit) {
                //As there is no left and right padding for screen-shot div,
                //and tinymce editor has padding of 8px on both side
                //we need to add that padding to width, when re-editing as tool sends width as per screenshot div
                wd += 2 * MathUtilities.Components.TextTool.Views.TextTool.EDITOR_PADDING;
            }

            if (canvasBounds) {
                this.model.setCanvasProp(canvasBounds);
            }
            if (this.$('#holderDiv').length === 0) {
                $el.append(MathUtilities.Components.TextTool.templates['holder-data']().trim());
            }
            this.model.set({
                "counter": counter,
                "left": topLeft.x,
                "top": topLeft.y,
                "width": wd,
                "height": ht,
                "offset": offset
            });
            textToolDimension = this.getProperPosition(false, text);

            this.model.set('newDimension', textToolDimension);
            $el.append(MathUtilities.Components.TextTool.templates['popup-rte']({
                "_counter": counter
            }).trim());

            this.$('#text-tool-editor-modal-' + counter)
                .css({
                    "top": textToolDimension.top,
                    "left": textToolDimension.left
                })
                .parent('.text-tool-editor-modal-holder').show();

            $('.tool-holder.math-utilities-components-tool-holder.text-tool-drop-in').show();

            textEditor = MathUtilities.Components.TinyMCEEditor.init({
                "id": 'rte-holder-' + counter,
                "fonts": true,
                "customfont_size": [{
                    "fontText": 'small',
                    "fontSize": '12pt'
                }, {
                    "fontText": 'medium',
                    "fontSize": '16pt'
                }, {
                    "fontText": 'large',
                    "fontSize": '24pt'
                }, {
                    "fontText": 'extra-large',
                    "fontSize": '36pt'
                }],
                "width": textToolDimension.width,
                "height": textToolDimension.height,
                "isTools": true,
                "basePath": basePath,
                "engineJsonPath": jsonPath,
                "resize": false,
                "statusbar": false,
                "textToLoad": text,
                "isAccessible": isAccessible,
                "$keyboardParentHolder": $('#math-utilities-text-tool-math-editor'),
                "scrollOnKeyboardOverlap": false, //To prevent addion of dummy div for tools.
                "csvData": csvData,
                "plugins": 'rteinsertmathquill textcolor rtetable',
                "editorInitCallback": _.bind(function(editor) {
                    this._onEditorInitialize(textEditor, editor);
                    this._setInitialResizingData(editor);

                    if (this.editorData && this.editorData.$body) {
                        this.editorData.$body.css({
                            "background-color": bgcolor
                        });
                    }
                }, this)
            });
            this._onEditorInitialize(textEditor);
            this.textEditor = textEditor;

            if (this.editorData && this.editorData.$body) {
                this.editorData.$body.css({
                    "background-color": bgcolor
                });
            }

            $('body').off('expressionPanelRendered', '.keyboard', this.onKeyBoardOpenFn)
                .on('expressionPanelRendered', '.keyboard', this.onKeyBoardOpenFn)
                .off('keyboardClose', '.keyboard', this.onKeyBoardOpenFn)
                .on('keyboardClose', '.keyboard', this.onKeyboardCloseFn);
        },

        "_onEditorInitialize": function(textEditor, editor) {
            editor = editor || tinyMCE.activeEditor;
            // delay is used because TintMCE editor takes time to be rendered on the DOM after initialization
            _.delay(_.bind(function() {
                if (editor && !this.editorInitialized) {
                    this.editorInitialized = true;
                    if (!MathUtilities.Components.Utils.Models.BrowserCheck.isMobile) {
                        editor.focus();
                    }
                    editor.off('keydown', this.onKeyDownFn)
                        .on('keydown', this.onKeyDownFn)
                        .off('keyup', this.onKeyUpFn)
                        .on('keyup', this.onKeyUpFn);
                    this.setupDefaultValues();
                    this._bindModalCloseEvent();

                    $(editor.getWin()).bind("resize", _.bind(function(e) {
                        //No scroll is provided for iFrame in Ipad
                        //We need to manually update height of resizable div's for Ipad
                        if (MathUtilities.Components.Utils.Models.BrowserCheck.isIOS) {
                            this.editorData.$resizable.height($('#' + editor.id + "_ifr").height() + this.editorData.currentHeaderHeight);
                            this.editorData.$resizableGhost.height($('#' + editor.id + "_ifr").height() + this.editorData.currentHeaderHeight + MathUtilities.Components.TextTool.Views.TextTool.RESIZABLE_BORDER);
                        }
                    }, this));
                }
            }, this), 500);

            if (textEditor && textEditor.views) {
                textEditor.views.$(".mce-path").addClass("rte-path");
            }
        },

        "_bindModalCloseEvent": function() {
            $('.tool-holder.math-utilities-components-tool-holder.text-tool-drop-in')
                .off('click.modalClose', this.onModalCloseFn)
                .on('click.modalClose', this.onModalCloseFn);
        },

        "_setInitialResizingData": function(editor) {
            var TextTool = MathUtilities.Components.TextTool.Views.TextTool,
                canvasProp = this.model.get('canvasProp'),
                newDimension = this.model.get('newDimension'),
                top = newDimension.top,
                left = newDimension.left,
                editorWidth = newDimension.width,
                currentHeaderHeight = this._getEditorHeaderHeight(editorWidth),
                editorHeight = newDimension.height + currentHeaderHeight,
                $modalHolder = this.$('.text-tool-editor-modal-' + this.model.get('counter') + '-holder'),
                $resizables = $modalHolder.find('.resizable-ghost'),
                $resizable = this.$('#text-tool-editor-modal-' + this.model.get('counter')),
                $resizableGhost = this.$('#rte-resizable-ghost-' + this.model.get('counter')),
                $handle = $resizable.find('.resizable-ghost-handle'),
                maxEditorWidth = canvasProp.width + canvasProp.left - left,
                maxEditorHeight = canvasProp.height + canvasProp.top - top + TextTool.CANVAS_TOP_MARGIN,
                MIN_RESIZE_WIDTH = TextTool.MIN_RESIZE_WIDTH,
                MIN_RESIZE_HEIGHT = TextTool.MIN_RESIZE_HEIGHT,
                RESIZABLE_BORDER = TextTool.RESIZABLE_BORDER,
                $dropIn = $('.tool-holder.math-utilities-components-tool-holder.text-tool-drop-in');

            this.editorData = {
                "$body": $(editor.getBody()),
                "$resizables": $resizables,
                "$resizable": $resizable,
                "$resizableGhost": $resizableGhost,
                "$handle": $handle,
                "maxEditorWidth": maxEditorWidth,
                "maxEditorHeight": maxEditorHeight,
                "currentHeaderHeight": currentHeaderHeight
            };

            $resizables.css({
                "width": editorWidth,
                "min-width": MIN_RESIZE_WIDTH,
                "max-width": maxEditorWidth
            });

            $resizable.css({
                "height": editorHeight,
                "min-height": MIN_RESIZE_HEIGHT
            });

            $resizableGhost.css({
                "height": editorHeight + RESIZABLE_BORDER,
                "min-height": MIN_RESIZE_HEIGHT + RESIZABLE_BORDER
            });
            if (!MathUtilities.Components.Utils.Models.BrowserCheck.isIOS) {
                //No scroll for iframe in ipad, no max-height Limits
                $resizable.css({
                    "max-height": maxEditorHeight - RESIZABLE_BORDER
                });

                $resizableGhost.css({
                    "max-height": maxEditorHeight
                });
            }

            //Bind resize events on handle
            $handle.off('mousedown.editorResizeStart touchstart.editorResizeStart')
                .on('mousedown.editorResizeStart touchstart.editorResizeStart', _.bind(function(event) {
                    if ("ontouchstart" in window || event.which === 1) {
                        $resizableGhost.show(0);
                        event.preventDefault();

                        $(window).off('mousemove.editorResize touchmove.editorResize')
                            .on('mousemove.editorResize touchmove.editorResize', _.bind(function(eventObj) {
                                this._onResize(false, eventObj);
                            }, this))
                            .off('mouseup.editorResize touchend.editorResize')
                            .on('mouseup.editorResize touchend.editorResize', _.bind(this._onResizeStop, this));
                        $dropIn.addClass('text-tool-resize-cursor');

                        $(editor.getWin()).off('mousemove.editorResize touchmove.editorResize')
                            .on('mousemove.editorResize touchmove.editorResize', _.bind(function(eventObj) {
                                this._onResize(true, eventObj);
                            }, this))
                            .off('mouseup.editorResize touchend.editorResize')
                            .on('mouseup.editorResize touchend.editorResize', _.bind(this._onResizeStop, this));
                        $dropIn.addClass('text-tool-resize-cursor');
                    }
                }, this));

            $handle.show(0, _.bind(function() {
                this.editorData.resizableOffset = $resizable.offset();
                this._onResizeStop();
            }, this));
        },
        "updateResizingData": function(canvasProp) {
            if (!this.editorData) {
                return;
            }
            var $modalHolder = this.$('.text-tool-editor-modal-' + this.model.get('counter') + '-holder'),
                $resizables = $modalHolder.find('.resizable-ghost'),
                $resizable = this.$('#text-tool-editor-modal-' + this.model.get('counter')),
                $resizableGhost = this.$('#rte-resizable-ghost-' + this.model.get('counter')),
                TextTool = MathUtilities.Components.TextTool.Views.TextTool,
                maxEditorWidth = canvasProp.width + canvasProp.left - this.model.get('newDimension').left,
                maxEditorHeight = canvasProp.height + canvasProp.top - this.model.get('newDimension').top + TextTool.CANVAS_TOP_MARGIN,
                RESIZABLE_BORDER = TextTool.RESIZABLE_BORDER;

            this.editorData.maxEditorWidth = maxEditorWidth;
            this.editorData.maxEditorHeight = maxEditorHeight;
            this.model.setCanvasProp(canvasProp);
            $resizables.css({
                "max-width": maxEditorWidth
            });

            if (!MathUtilities.Components.Utils.Models.BrowserCheck.isIOS) {
                //No scroll for iframe in ipad, no max-height Limits
                $resizable.css({
                    "max-height": maxEditorHeight - RESIZABLE_BORDER
                });

                $resizableGhost.css({
                    "max-height": maxEditorHeight
                });
            }
        },

        "_onResize": function(isTinyMCEWindow, event) {
            event = this.simulateMouseEvent(event);
            var top = this.editorData.resizableOffset.top,
                left = this.editorData.resizableOffset.left,
                editorWidth = isTinyMCEWindow ? event.pageX : event.pageX - left,
                editorHeight = isTinyMCEWindow ? event.pageY + this.editorData.currentHeaderHeight : event.pageY - top;

            event.preventDefault();
            this.resizeEditor(editorWidth, editorHeight);
        },

        "resizeEditor": function(editorWidth, editorHeight) {
            var $resizables = this.editorData.$resizables,
                $resizable = this.editorData.$resizable,
                $resizableGhost = this.editorData.$resizableGhost;

            $resizables.css({
                "width": editorWidth
            });

            $resizable.css({
                "height": editorHeight
            });

            $resizableGhost.css({
                "height": editorHeight + MathUtilities.Components.TextTool.Views.TextTool.RESIZABLE_BORDER
            });

        },


        "_onResizeStop": function() {
            $(window).off('.editorResize');
            $(tinyMCE.activeEditor.getWin()).off('.editorResize');
            $('.tool-holder.math-utilities-components-tool-holder.text-tool-drop-in').removeClass('text-tool-resize-cursor');

            var $resizable = this.editorData.$resizable,
                editorWidth = $resizable.width(),
                currentHeaderHeight = this._getEditorHeaderHeight(editorWidth),
                editorHeight = $resizable.height() - currentHeaderHeight;

            this.editorData.currentHeaderHeight = currentHeaderHeight;
            this.editorData.$resizableGhost.hide(0);
            tinyMCE.activeEditor.theme.resizeTo(editorWidth, editorHeight);
        },

        /**
         * Handle Accessibility of text-tool.
         * @method _onKeyDown
         * @private
         * @param {Object} event objcet
         */
        "_onKeyDown": function(event) {
            var keyCode = event.keyCode,
                TextTool = MathUtilities.Components.TextTool.Views.TextTool;

            switch (keyCode) {
                case TextTool.ESCAPE_KEY:
                    this.onModalClose();
                    break;

                case TextTool.TAB_KEY:
                    event.preventDefault();
                    return false;

                case TextTool.RESIZE_HOTKEY:
                    if (event.altKey) {
                        this.isResizeKeyDown = true;
                    }
                    break;

                case TextTool.ARROW_KEY_LEFT:
                case TextTool.ARROW_KEY_UP:
                case TextTool.ARROW_KEY_RIGHT:
                case TextTool.ARROW_KEY_DOWN:
                    if (event.altKey && this.isResizeKeyDown) {
                        event.preventDefault();
                        this.handleArrowKeyResize(keyCode);
                    }
                    break;
            }
        },

        "handleArrowKeyResize": function(keyCode) {
            var TextTool = MathUtilities.Components.TextTool.Views.TextTool,
                $resizable = this.editorData.$resizable,
                editorWidth = $resizable.width(),
                editorHeight = $resizable.height(),
                resizeOffset = TextTool.RESIZE_OFFSET;

            switch (keyCode) {
                case TextTool.ARROW_KEY_LEFT:
                    editorWidth -= resizeOffset;
                    break;

                case TextTool.ARROW_KEY_UP:
                    editorHeight -= resizeOffset;
                    break;

                case TextTool.ARROW_KEY_RIGHT:
                    editorWidth += resizeOffset;
                    break;

                case TextTool.ARROW_KEY_DOWN:
                    editorHeight += resizeOffset;
                    break;
            }

            this.resizeEditor(editorWidth, editorHeight);
            this._onResizeStop();
        },

        /**
         * Handle Accessibility of text-tool.
         * @method _onKeyUp
         * @private
         * @param {Object} event objcet
         */
        "_onKeyUp": function(event) {
            if (event.keyCode === MathUtilities.Components.TextTool.Views.TextTool.RESIZE_HOTKEY) {
                this.isResizeKeyDown = false;
            }
        },

        /**
         * close text editor
         * @method  onModalClose
         * @private
         */
        "onModalClose": function() {
            var counter = this.model.get('counter'),
                tinyMCEBody = MathUtilities.Components.TinyMCEEditor.RteCollection.getTinyMceBody('rte-holder-' + counter),
                textEditorContent = null,
                parentDiv = this.$('#rte-holder-' + counter).parents('.text-tool-modal-body'),
                top = this.model.get('top'),
                left = this.model.get('left'),
                editorWidth;

            if (this.getTextNodesIn(tinyMCEBody, this.isNonEmptyTextNode).length > 0) {
                textEditorContent = MathUtilities.Components.TinyMCEEditor.RteCollection.getRteContent('rte-holder-' + counter, null, true);
            } else {
                textEditorContent = '';
            }
            editorWidth = this.getMaxWidthIn(tinyMCEBody);

            this.$('#text-tool-editor-modal-' + counter).parent('.text-tool-editor-modal-' + counter + '-holder').hide();
            $('.tool-holder.math-utilities-components-tool-holder.text-tool-drop-in').hide().off('.modalClose');
            this.editorInitialized = false;

            parentDiv.find('.el-rte').remove();

            this._getBase64(textEditorContent, editorWidth + 2 * MathUtilities.Components.TextTool.Views.TextTool.HOLDER_PADDING);

        },

        "isNonEmptyTextNode": function(node, elem) {
            return node.textContent.trim().length !== 0;
        },

        "simulateMouseEvent": function(event) {
            switch (event.type) {
                case 'touchstart':
                case 'touchmove':
                    event.pageX = event.originalEvent.touches[0].pageX;
                    event.pageY = event.originalEvent.touches[0].pageY;
                    break;

                case 'touchend':
                    event.pageX = event.originalEvent.changedTouches[0].pageX;
                    event.pageY = event.originalEvent.changedTouches[0].pageY;
                    break;
            }
            return event;
        },

        /**
         * trigger when keyboard open
         * @method onKeyBoardOpen
         * @private
         */
        "onKeyBoardOpen": function() {
            this._isKeyBoardOpen = true;
            var counter = this.model.get('counter'),
                top = this.getProperPosition(true).top;

            this.$('#text-tool-editor-modal-' + counter).css({
                "top": top
            });

            this.editorData.$handle.hide(0);
        },
        /**
         * trigger when keyboard close
         * @method onKeyboardClose
         * @private
         */
        "onKeyboardClose": function() {
            var counter = this.model.get('counter'),
                top = this.getProperPosition(false).top;
            this._isKeyBoardOpen = false;
            this.$('#text-tool-editor-modal-' + counter).css({
                "top": top
            });
            this._isKeyBoardOpen = false;
            this.editorData.$handle.show();
            if (tinyMCE.activeEditor) {
                this._onResizeStop();
            }
        },

        /**
         * Calculate position of text-tool
         * @method getProperDimension
         * @param {Boolean} isKeyBoardOpen, boolean to check keyboard visibility.
         * @param {String} content, Text editors HTML converted in string format.
         * @private
         */
        "getProperPosition": function(isKeyBoardOpen, content) {
            var TextTool = MathUtilities.Components.TextTool.Views.TextTool,
                MIN_HEIGHT = TextTool.MIN_HEIGHT,
                MIN_WIDTH = TextTool.MIN_WIDTH,
                model = this.model,
                height = model.get('height') || 0,
                width = model.get('width') || 0,
                top = model.get('top') || 0,
                left = model.get('left') || 0,
                offset = model.get('offset') || 0,
                newDimension = {
                    "left": left,
                    "top": top,
                    "width": width,
                    "height": height
                },
                headerHeight;

            if (this.isReEdit) {
                newDimension = this._updateDimensions(content, newDimension);
            } else {
                //check if dimension is smaller than min value
                if (newDimension.width < MIN_WIDTH) {
                    newDimension.width = MIN_WIDTH;
                }
                if (newDimension.height < MIN_HEIGHT) {
                    newDimension.height = MIN_HEIGHT;
                }
            }

            newDimension.top += offset;

            headerHeight = this._getEditorHeaderHeight(newDimension.width);
            newDimension.top -= headerHeight;

            if (newDimension.top < offset) {
                newDimension.top = offset;
            }

            this._getEditorInVisibleArea(newDimension, isKeyBoardOpen);
            return newDimension;
        },

        "_updateDimensions": function(content, options) {
            var $container = $(':first', $('<div>').html(content));

            if ($container.attr('use-dimensions')) {
                options.width = Number($container.attr('width'));
                options.height = Number($container.attr('height'));
                options.backgroundColor = $container.attr('backgroundcolor');
            }

            return options;
        },

        /**
         * Returns an array of the matching text nodes in the specified element.
         * @param {Element} elem The DOM element which will be traversed.
         * @param {function} filterFunction
         *     Optional function that return true if text node is to be added to the array
         *     The first argument passed is the text node
         *     The second is the parent of the text node
         * @return {Array} Array of the matching text nodes contained by the specified element.
         */
        "getTextNodesIn": function(elem, filterFunction) {
            var textNodes = [],
                nodes,
                node,
                nodeType,
                nodeCounter,
                NODE_TYPES = MathUtilities.Components.TextTool.Views.TextTool.NODE_TYPES;

            if (elem) {
                for (nodes = elem.childNodes, nodeCounter = nodes.length; nodeCounter--;) {
                    node = nodes[nodeCounter];
                    nodeType = parseInt(node.nodeType, 10);
                    if (nodeType === NODE_TYPES.TEXT_NODE) {
                        if (!filterFunction || filterFunction(node, elem)) {
                            textNodes.push(node);
                        }
                    } else if (nodeType === NODE_TYPES.ELEMENT_NODE || nodeType === NODE_TYPES.DOCUMENT_NODE || nodeType === NODE_TYPES.DOCUMENT_FRAGMENT_NODE) {
                        textNodes = textNodes.concat(this.getTextNodesIn(node, filterFunction));
                    }
                }
            }
            return textNodes;
        },

        /**
         * Enables MathQuill equations rendering inside the div
         *
         * @method renderMathQuill
         * @param {JQuery Object} JQuery object of the div that contains MathQuill equations
         */
        "renderMathQuill": function($selector) {
            var curLatex = null,
                $equationHolder = null;

            $selector.find(".rte-equation-holder").each(function() {
                $equationHolder = $(this);
                curLatex = $equationHolder.attr("data-mathquill-latex") ||
                    $equationHolder.attr("math-utilities-text-editor-equation-data-latex") || '';

                $equationHolder.removeClass("mathquill-editable-size mathquill-editable")
                    .mathquill()
                    .mathquill("latex", curLatex)
                    .off("mousedown");
            });
        },

        /**
         * Generate base64 of text.
         * @method _generateBase64
         * @param content {string}, text whose base-64 to be generate
         * @param textWidth {Number}, width of editor.
         * @param isInternalCall {Boolean}, to check if call is from text-tool private function _getBase64 or not.
         * @private
         */
        "_generateBase64": function(content, textWidth, isInternalCall) {
            var TextTool = MathUtilities.Components.TextTool.Views.TextTool,
                model = this.model,
                counter = model.get('counter'),
                holderDiv = this.$('#holderDiv'),
                $editorContent = this.$('#editorContent'),
                top = model.get('top') || 0,
                left = model.get('left') || 0,
                properPosition = this.getProperPosition(false),
                holderPadding = 2 * TextTool.HOLDER_PADDING,
                data = null,
                actualWidth,
                bgcolor = null,
                PADDING = 1, //This padding is for backword compatibility
                width = textWidth || TextTool.MIN_WIDTH,
                emptyContentRegex = /^(<div>)?(<br[^>]*>)?(<\/div>)?$/i; //to check if cell content is empty or not

            $editorContent.css('width', 'auto');

            //replace text with empty string if its content is blank
            if (content.replace(emptyContentRegex, '') === '') {
                content = '';
            }

            holderDiv.css({
                "top": properPosition.top,
                "left": properPosition.left < 0 ? 0 : properPosition.left
            }).hide();

            $editorContent.text('').html('')
                .append(this.cleanHTML(content));

            holderDiv.detach()
                .appendTo('body')
                .show();

            this.renderMathQuill($editorContent);

            $editorContent.find('.selectable').remove();
            $editorContent.find('.mathquill-editable').css('box-shadow', 'none');
            $editorContent.find('.rte-equation-holder').removeClass('active-mathml');

            if ($(":first", $editorContent).attr('use-dimensions')) {
                width = Number($(":first", $editorContent).attr('width')) - holderPadding;
                bgcolor = $(":first", $editorContent).attr('backgroundcolor');
            } else {
                width += PADDING;
            }

            if (!bgcolor || bgcolor === '' || bgcolor === 'transparent') {
                bgcolor = "transparent";
            }
            holderDiv.css({
                "background-color": bgcolor
            });

            $editorContent.css({
                "max-width": width
            });

            actualWidth = Number(window.getComputedStyle($editorContent[0]).width.replace('px', ''));
            if (actualWidth !== parseInt(actualWidth, 10)) {
                $editorContent.width(Math.ceil(actualWidth));
            }

            MathUtilities.Components.Utils.Models.ScreenUtils.getScreenShot({
                "container": holderDiv,
                "type": MathUtilities.Components.Utils.Models.ScreenUtils.types.BASE64,
                "complete": _.bind(function(imageBase64) {
                    data = {
                        "base64": imageBase64,
                        "editorText": content,
                        "top": top,
                        "left": left,
                        "counter": counter
                    };
                    holderDiv.appendTo(this.$el);
                    holderDiv.hide();
                    this.trigger('_generateBase64', data);
                    if (!isInternalCall) {
                        this.trigger('generateBase64', data);
                    }
                    this.$('.text-tool-editor-modal-' + counter + '-holder').remove();
                }, this)
            });
        },

        "_getBase64": function(text, editorWidth) {
            if (typeof text === 'undefined' || text === null) {
                return null;
            }
            var onGenerateBase64 = _.bind(function(data) {
                this.off('_generateBase64');
                this.trigger('getBase64', data);
            }, this);
            this._generateBase64(text, editorWidth, true);
            this.off('_generateBase64')
                .on('_generateBase64', onGenerateBase64);
        },

        "cleanHTML": function(input) {
            this.generateRegexToTrim();
            return input.replace(MathUtilities.Components.TextTool.Views.TextTool.REGEX_TO_TRIM, '');
        },

        "generateRegexToTrim": function() {
            if (MathUtilities.Components.TextTool.Views.TextTool.REGEX_TO_TRIM === '') {
                var TextTool = MathUtilities.Components.TextTool.Views.TextTool,
                    keyCodeBOMChar = TextTool.BOM_CHAR_CODE,
                    keyCodeZeroWidthJoiner = TextTool.ZERO_WIDTH_JOINER,
                    charsToBeRemoved = [keyCodeBOMChar, keyCodeZeroWidthJoiner],
                    regexString = '[',
                    charCounter;

                for (charCounter = charsToBeRemoved.length - 1; charCounter >= 0; charCounter--) {
                    regexString += '\\' + String.fromCharCode(charsToBeRemoved[charCounter]);
                }
                regexString += ']';

                TextTool.REGEX_TO_TRIM = new RegExp(regexString, "g");
            }
        },

        /**
         * Adjust the editor in visible area.
         * @method _getEditorInVisibleArea
         * @param textToolDimension {object}, Contains position and size
         * @param isKeyBoardOpen {Boolean}, Whether key board is open or not
         * @private
         */
        "_getEditorInVisibleArea": function(textToolDimension, isKeyBoardOpen) {
            var canvasProp = this.model.get('canvasProp'),
                boundLeft = canvasProp.left,
                boundTop = canvasProp.top,
                boundWidth = canvasProp.width,
                boundHeight = canvasProp.height,
                boundRight = boundLeft + boundWidth,
                boundBottom = boundTop + boundHeight,
                left = textToolDimension.left,
                top = textToolDimension.top,
                width = textToolDimension.width,
                height = textToolDimension.height,
                right, bottom,
                TOP_OFFSET = 10,
                OFFSET = 5,
                editorHeaderHeight, keyboardHeight, editor, $keyboard, newHeight, currWidth;

            boundTop += OFFSET;
            boundHeight -= OFFSET;

            // Make width of the editor, visible area bound.
            if (width > boundWidth) {
                width = boundWidth - OFFSET;
            }

            // Get the header height of editor.
            editorHeaderHeight = this._getEditorHeaderHeight(width);

            // Change height of the editor if its out of visible area and change the top respectively.
            if (height + editorHeaderHeight + OFFSET >= boundHeight) {
                height = boundHeight - editorHeaderHeight - TOP_OFFSET;
                top = boundTop;
            }

            // Set the new right and bottom of editor.
            right = left + width;
            bottom = top + height + editorHeaderHeight;

            // Reposition the editor horizontally if it is out of visible area.
            if (right > boundRight) {
                left -= (right - boundRight) - OFFSET;
            }

            // Reposition the editor vertically if it is out of visible area.
            if (bottom >= boundBottom && top !== boundTop) {
                top -= (bottom - boundBottom) - TOP_OFFSET;
            }

            // If left or top is out of bound then make it range bound.
            if (left < boundLeft) {
                left = boundLeft;
            }
            if (top < boundTop) {
                top = boundTop;
            }

            // Update new bottom.
            bottom = top + height + editorHeaderHeight;

            // Get the tinyMCE editor object.
            editor = tinymce.activeEditor;

            if (isKeyBoardOpen) {
                $keyboard = this.$('.keyboardHolder');
                keyboardHeight = $keyboard.height();
                boundBottom -= keyboardHeight;

                // If keyboard is open then squeeze the Editor into the visible area.
                if (bottom > boundBottom) {
                    top -= bottom - boundBottom - OFFSET;
                }
                if (top < boundTop) {
                    top = boundTop;
                }
                bottom = top + height + editorHeaderHeight;
                if (bottom >= boundBottom && editor) {
                    newHeight = height - (bottom - boundBottom) - OFFSET;
                    currWidth = $(editor.getContentAreaContainer()).width();
                    // Resize the editor.
                    editor.theme.resizeTo(currWidth, newHeight);
                }
            } else if (this._isKeyBoardOpen) {
                if (editor) {
                    currWidth = $(editor.getContentAreaContainer()).width();
                    // Reset the editor.
                    editor.theme.resizeTo(currWidth, height);
                }
            }

            textToolDimension.left = left;
            textToolDimension.top = top;
            textToolDimension.width = width;
            textToolDimension.height = height;

            this.closeOpenDropDowns();
        },

        "closeOpenDropDowns": function() {
            this.$('.mce-menubtn.mce-active, .mce-colorbutton.mce-active').click();
        },

        "putCursorAtEnd": function(editor) {
            var editorBody = editor.getBody();
            editor.selection.select(editorBody, true);
            editor.selection.collapse(false);
            editorBody.scrollTop = 999999;
        },

        "getMaxWidthIn": function(elem) {
            if (elem.scrollWidth > elem.offsetWidth) {
                return elem.scrollWidth - MathUtilities.Components.TextTool.Views.TextTool.EDITOR_PADDING;
            }
            return elem.scrollWidth - 2 * MathUtilities.Components.TextTool.Views.TextTool.EDITOR_PADDING;

        },

        "setupDefaultValues": function() {
            this.removeTinyMCETitle();
        },

        "removeTinyMCETitle": function() {
            var ed = tinymce.activeEditor,
                ifr = tinymce.DOM.get(ed.id + '_ifr');
            ed.dom.setAttrib(ifr, 'title', '');
        },

        "uncheckRowHeader": function() {
            var rowHeaderOption = tinyMCE.activeEditor.menuItems.rowheaderoption;
            if (rowHeaderOption.isSelected) {
                rowHeaderOption.onclick();
            }
        },

        "_getEditorHeaderHeight": function(width) {
            var headerHeight = 30,
                numberOfRows = 1,
                TextTool = MathUtilities.Components.TextTool.Views.TextTool;

            // Set the header height according to the width of the editor.
            if (width < TextTool.MIN_WIDTH_FOR_FIVE_ROW_HEADER) {
                numberOfRows = 5;
            } else if (width < TextTool.MIN_WIDTH_FOR_FOUR_ROW_HEADER) {
                numberOfRows = 4;
            } else if (width < TextTool.MIN_WIDTH_FOR_THREE_ROW_HEADER) {
                numberOfRows = 3;
            } else if (width < TextTool.MIN_WIDTH_FOR_TWO_ROW_HEADER) {
                numberOfRows = 2;
            }

            return headerHeight * numberOfRows;
        }
    }, {
        "MIN_HEIGHT": 164,
        "MIN_WIDTH": 455,
        "EDITOR_WIDTH": 0,
        "ESCAPE_KEY": 27,
        "TAB_KEY": 9,
        "ARROW_KEY_LEFT": 37,
        "ARROW_KEY_UP": 38,
        "ARROW_KEY_RIGHT": 39,
        "ARROW_KEY_DOWN": 40,
        "CANVAS_LEFT": 0,
        "CANVAS_TOP": 64,
        "CANVAS_WIDTH": 990,
        "CANVAS_HEIGHT": 491,
        "MIN_WIDTH_FOR_FIVE_ROW_HEADER": 125,
        "MIN_WIDTH_FOR_FOUR_ROW_HEADER": 136,
        "MIN_WIDTH_FOR_THREE_ROW_HEADER": 224,
        "MIN_WIDTH_FOR_TWO_ROW_HEADER": 377,
        "CANVAS_TOP_MARGIN": -10,
        "MIN_RESIZE_WIDTH": 226,
        "MIN_RESIZE_HEIGHT": 196,
        "EDITOR_PADDING": 8,
        "RESIZABLE_BORDER": 1,
        "RESIZE_HOTKEY": 81,
        "RESIZE_OFFSET": 5,
        "HOLDER_PADDING": 8,
        "REGEX_TO_TRIM": '',
        "NODE_TYPES": {
            "ELEMENT_NODE": 1,
            "TEXT_NODE": 3,
            "DOCUMENT_NODE": 9,
            "DOCUMENT_FRAGMENT_NODE": 11
        },
        "BOM_CHAR_CODE": 65279,
        "ZERO_WIDTH_JOINER": 8205
    });
}(window.MathUtilities));
