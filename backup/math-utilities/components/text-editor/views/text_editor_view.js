/* globals window, _, Backbone, MathUtilities, tinyMCE, $  */
/* eslint no-shadow: 0, dot-notation: 0 */
(function(TinyMCEEditor) {
    "use strict";
    if (TinyMCEEditor.View) {
        return;
    }
    TinyMCEEditor.View = Backbone.View.extend({
        "_$rte": null,
        "_$rteContainer": null,
        "$popup": null,
        "$mathKeyboard": null,
        "$mathKeyboardButton": null,
        "reRendered": null,

        "initialize": function() {
            this.reRendered = false;
            this.attachListeners();
            this.render();
        },

        "render": function() {
            var isTools = false,
                rteOptions = null,
                Components = MathUtilities.Components;

            this.createSelectorDiv();
            rteOptions = this.model.getRteOptions();
            // Add default editor class to each editor holder.
            this.$el.addClass("rte-default-editor");
            isTools = !!rteOptions.isTools;
            // Handle char counter in paste event .
            rteOptions.paste_preprocess = _.bind(this._pastePreProcess, this);
            // Handle char counter in paste event .
            rteOptions.paste_postprocess = _.bind(this._pastePostProcess, this);

            if (isTools) {
                tinyMCE.baseURL = this.model.getBaseURL() + TinyMCEEditor.Model.REPOSITORY_PATH;
                Components.ToolsEditor.initialize(rteOptions);
            } else if (typeof tinyMCE !== "undefined") {
                tinyMCE.baseURL = this.model.getBaseURL() + TinyMCEEditor.Model.REPOSITORY_PATH;
                Components.TEIEditor.initialize(rteOptions);
            } else if (rteOptions.byPassTinyMceLazyLoading) {
                require(["TinyMCEAutoload"], _.bind(function() {
                    tinyMCE.baseURL = this.model.getBaseURL() + TinyMCEEditor.Model.REPOSITORY_PATH;
                    Components.TEIEditor.initialize(rteOptions);
                }, this));
            } else { //add rendered div here
                this.addTinyMcePlayerDisplayDiv(rteOptions);
            }
            this.model.trigger(TinyMCEEditor.Events.TEXTEDITOR_CREATED);
        },

        "addTinyMcePlayerDisplayDiv": function(rteOptions) {
            var $displayDiv,
                $displayDivContainer,
                defaultDivHeight = 100,
                displayDiv = MathUtilities.Components.templates['tiny-mce-modal']({
                    "displayDivId": rteOptions.id + '-display-div'
                }).trim();

            this.$(rteOptions.selector).parent().append(displayDiv);
            $displayDivContainer = this.$('#' + rteOptions.id + '-display-div');
            $displayDiv = $displayDivContainer.find('.tinymce-display-div');
            $displayDivContainer.data("rteOptions", rteOptions).height(rteOptions.height || defaultDivHeight).width(rteOptions.width);
            $displayDiv.html(rteOptions.textToLoad);
            if (!rteOptions.readonly) {
                $displayDivContainer.off("click.tinyMceDummyDiv").on("click.tinyMceDummyDiv", _.bind(this.dummyDivClicked, this));
            } else {
                $displayDivContainer.addClass('read-only');
            }
        },

        "dummyDivClicked": function() {
            $(".tinymce-display-container").each(_.bind(function(index, dummyDiv) {
                var rteOptions = $(dummyDiv).data("rteOptions");

                if (!rteOptions.readonly) {
                    this.loadTinyMCEFiles(dummyDiv);
                }
            }, this));
        },

        "loadTinyMCEFiles": function(target) {
            var spinner = new Spinner().spin(target),
                $target = $(target);

            $target.data("spinner", spinner);
            require(["TinyMCEAutoload"], _.bind(function() {
                tinyMCE.baseURL = this.model.getBaseURL() + TinyMCEEditor.Model.REPOSITORY_PATH;
                MathUtilities.Components.TEIEditor.initialize($target.data("rteOptions"));
                $target.data("spinner").stop();
                $target.remove();
            }, this));
        },

        "_pastePreProcess": function(plugin, args) {
            var editor = args.target,
                $selectedNode,
                $editorBody = $(editor.getBody()),
                isInline = this.isEditorInline(editor),
                $holder = $("<div/>"),
                $listItems, $lastListItem,
                $holderLastNode,
                $newMathquillHolder,
                $selectableSpan,
                maxLengthLimitPlugin = editor.plugins.maxlength,
                numericRegex = /^[+\-]?\d+(?:\.\d+)?$/g, //Regex to check for number
                numericOnlyPlugin = editor.plugins.numericOnly;

            if (tinymce.isIE) {
                editor.selection.lastFocusBookmark = null;
            }

            $selectedNode = $(editor.selection.getNode());
            if (isInline) {
                // Block elements when pasted creates new line.
                $holder.html(args.content);
                $holder.find("br").remove();
                if ($holder.children("div").length) {
                    args.content = $holder.children("div").eq(0).html();
                }
            }

            $holder.html(args.content);
            // if the editor supports only number and user has pasted text other than number,
            // make content of paste empty
            if (numericOnlyPlugin && !numericRegex.test($holder.text())) {
                args.content = '';
                return;
            }

            // In case of firefox when user copy content the holder div also gets' copied
            // We need to strip off the outer div so that the text can be pasted in between line/text content
            if ($holder[0].childNodes.length === 1 && $holder[0].childNodes[0].nodeName.toUpperCase() === "DIV") {
                $holder = $holder.children().eq(0);
            }
            $selectableSpan = $holder.children("span.selectable");
            // If there is only mathquill in editor and user copies the content using ctrl+a
            // and paste in the editor only the inner part of the mathquill holder is copied for chrome
            if ($selectableSpan.length) {
                $newMathquillHolder = $("<span/>", {
                    "class": "rte-equation-holder mathquill-rendered-math",
                    "contenteditable": "false",
                    "data-mathquill-latex": $selectableSpan.attr("data-mathquill-latex")
                }).append(args.content);
                args.content = $newMathquillHolder[0].outerHTML;
                // check if the selected node contains
                if ($selectedNode.find("br").length && $selectedNode.text() === "") {
                    args.content += "<br/>";
                }
            } else {
                // If mathquill is present in a list item at the end, when copy pasting an empty list item is inserted
                // and an extra line is added to an UL or OL.
                $holderLastNode = $holder.children().eq(-1);
                if ($holderLastNode.length && ($holderLastNode[0].nodeName.toUpperCase() === "OL" || $holderLastNode[0].nodeName.toUpperCase() === "UL")) {
                    $listItems = $holderLastNode.children();
                    $lastListItem = $listItems.eq(-1);
                    if ($lastListItem.text() === "" &&
                        $listItems.eq(-2).children().eq(-1).hasClass("rte-equation-holder")) {
                        $listItems.eq(-2).append("<br/>");
                        $lastListItem.remove();
                    }
                } else {
                    // check if the selected node contains
                    if ($selectedNode.find("br").length && $selectedNode.text() === "") {
                        $holder.append("<br/>");
                    }
                }
                args.content = $holder.html();
            }

            args.content = this.getTinyMceCompatibleContent(args.content);
            this.removeUnwantedElementOnPaste($editorBody);

            if (maxLengthLimitPlugin) {
                maxLengthLimitPlugin.handleCounterForPaste(args);
            }
        },

        "getTinyMceCompatibleContent": function(htmlContent) {
            var $holder = $("<div/>"),
                htmlPara;

            $holder.html(htmlContent);
            $holder.find('p').replaceWith(function() {
                htmlPara = $(this).html() === '&nbsp;' ? '<br>' : $(this).html();
                return $("<div data-paste=\'prepaste\'/>").html(htmlPara);
            });
            return $holder.html();
        },

        "isEditorInline": function(editor) {
            return ["singleline", "inline"].indexOf(editor.settings.Config) !== -1;
        },

        "removeUnwantedElementOnPaste": function($holder) {
            // Ref: MATHTB-2672
            // In chrome while copy pasting text and mathquill content, a div is created before paste process
            // that contains only mathquill div with structure
            // <div><span class="rte-equation-holder">...<var>...<br>...</var>...</span></div> or
            // <div><var>...<br>...</var></div>

            var $appendedElements = $holder.find("div:has(>span.rte-equation-holder br),div:has(>span[mathquill-command-id] br), div:has(>var br), li:has(div>span[mathquill-block-id] br)");

            $appendedElements.each(function() {
                var $appendedElement = $(this);
                if ($appendedElement.children().length === 1 && $appendedElement.text() === "") {
                    $appendedElement.remove();
                }
            });
        },

        "_pastePostProcess": function(plugin, args) {
            var editor = tinyMCE.activeEditor,
                $node = $(args.node),
                maxLengthLimitPlugin = editor.plugins.maxlength,
                isInline = this.isEditorInline(editor);

            this.removeUnwantedElementOnPaste($node);
            if (maxLengthLimitPlugin) {
                // Update character counter.
                editor.fire('keyUp');
            }
            // make mathquill and mathjax element content editable false
            $node.find(".rte-equation-holder,.rte-mathjax-holder").attr("contenteditable", false);

            if (isInline) {
                // In-line editor are single line
                // Firefox add extra br tag are added so we need to remove the br tags
                $(editor.getBody()).remove("br");
            }

        },

        "createSelectorDiv": function() {
            var $el = this.$el,
                selectorId = this.model.getIdPrefix() + $el.attr("id");

            $el.append($("<div/>", {
                "id": selectorId
            }));
            this.model.setSelectorId("#" + selectorId);
        },

        "attachListeners": function() {
            this.listenTo(this.model, "change:isDisabled", this._disableEditor)
                .listenTo(this.model, "updateDimensions", this._updateEditorDimension);

            $("#" + this.model.getParentId()).on("remove", _.bind(function() {
                this.model.destroyRte();
            }, this));
            $(this.model).off("editorInit").on("editorInit", _.bind(this._onEditorInit, this))
                .off("changeHTML").on("changeHTML", _.bind(this._updateHtml, this))
                .off("updateDimensions").on("updateDimensions", _.bind(this._updateEditorDimension, this));
        },

        "_updateEditorDimension": function(event, editorId) {
            var $body = $(this.model.collection.getTinyMceBody(editorId));
            this.model.set({
                "height": $body.outerHeight(),
                "width": $body.outerWidth()
            });
        },

        "_onEditorInit": function(event, editor) {
            var editorId = editor.id,
                config = null,
                isResizable = null,
                CONFIG = TinyMCEEditor.Config,
                $doc = editor.getDoc(),
                $html = $("html", $doc),
                $body = $(editor.getBody()),
                settings = editor.settings,
                options = this.model.getRteOptions(),
                textToLoad = options.textToLoad || "",
                $inputHolder = $('<div>').html(textToLoad),
                csvData = options.csvData,
                IMAGE_PATH = "static/img/math-utilities/components/text-editor/text-editor-images.png",
                innerText = null,
                $iframe = null,
                keyCode,
                DELAY_DURATION = 150,
                keyCodes;

            // To handle deletion of content editable false containers on backspace.
            editor.on("keyDown", _.bind(this._handleCursor, this, editor))
                .on("keyUp", _.bind(this.onEditorKeyUp, this, editor))
                .on("undo redo", _.bind(this._handleUndoRedo, this, editor))
                .on("mouseDown", _.bind(this._onEditorMousedown, this, editor))
                .on("counterBtnAdded", _.bind(this._onCounterBtnAddSuccess, this));

            if (options.showCharacterCounter) {
                editor.on("updateTextCount", _.bind(this._updateCharacterCounter, this, editor));
            }
            config = this.model.get("options");
            isResizable = config.resize;
            // Append CSS classes for editor's HTML and body.

            if (config.isTools) {
                $body.addClass("tools-rte-editor");
            }

            this.$(".toolbar-button").css({
                "background-image": "url(" + settings.basePath + IMAGE_PATH + ")"
            });

            // Apply smallest font size.
            this._applyFontSize(config, $body);
            $html.addClass("rte-html");
            $body.addClass("rte-body");

            if (config.isPlayerAnswerField) {
                $body.addClass("tei-player-editor");
            }

            $iframe = this.$("#" + editorId + "_ifr");
            this.model._updateModelProperties(editor);
            this._applyUIForEditor(CONFIG, this.$el, $body, $iframe, settings);

            if (config.statusbar && isResizable || isResizable === "both") {
                // Remove path node from the editor.
                this.$(".mce-path").addClass("rte-path");
            }

            this.model.set("Config", config);
            // Remove MathJax Message Element from editor body.
            editor.setContent("");

            if (textToLoad !== "") {
                if (textToLoad !== void 0) {
                    $inputHolder.find(".rte-equation-holder[math-utilities-text-editor-equation-data-latex]").each(function() {
                        // Replacing the attribute
                        var $this = $(this);

                        $this.attr("data-mathquill-latex", $this.attr("math-utilities-text-editor-equation-data-latex"))
                            .removeAttr("math-utilities-text-editor-equation-data-latex");
                    });
                }

                textToLoad = $inputHolder.html();
                this.model.setContent(textToLoad);
            }
            if (csvData) {
                editor.plugins.rtetable.insertTable(csvData.cols, csvData.rows, csvData.data);
            }
            if (options.editorInitCallback) {
                options.editorInitCallback(editor);
            }
            if (options.readonly) {
                $(editor.getBody()).addClass('rte-readonly-mode');
            }
            if (options.inputTextChange) {
                innerText = null;
                editor.on('change', _.bind(function(event) {
                        if (this.model.get('editorDisabled')) {
                            event.preventDefault();
                            event.stopPropagation();
                            return;
                        }
                        options.inputTextChange(editor);
                    }, this))
                    .on('keydown paste', _.bind(function(event) {
                        if (this.model.get('editorDisabled')) {
                            event.preventDefault();
                            event.stopPropagation();
                            return;
                        }
                        keyCode = event.keyCode;
                        keyCodes = [8, 46]; // 8 for backspace and 46 for delete
                        if (_.indexOf(keyCodes, keyCode) === -1) {
                            innerText = event.currentTarget.innerHTML;
                        } else {
                            // As the deletion of content happens after this event is triggered
                            // and "key-up" event does not fire for "backspace",
                            // had to add a delay so that the content is updated before the
                            // textChange event is triggered.
                            _.delay(function() {
                                options.inputTextChange(editor);
                            }, 10);
                        }
                    }, this))
                    .on('keyup paste', _.bind(function(event) {
                        if (this.model.get('editorDisabled')) {
                            event.preventDefault();
                            event.stopPropagation();
                            return;
                        }
                        if (event.type === "paste") {
                            // In case of mozila firefox, the event is fired before the content in pasted renders
                            // tinymce editor.
                            _.delay(function() {
                                options.inputTextChange(editor);
                            }, DELAY_DURATION);
                        } else if (event.currentTarget && innerText !== event.currentTarget.innerHTML) {
                            options.inputTextChange(editor);
                        }
                    }, this))
                    .on('onVMKFieldInsert', _.bind(function(event) {
                        if (this.model.get('editorDisabled')) {
                            event.preventDefault();
                            event.stopPropagation();
                            return;
                        }
                        options.inputTextChange(editor);
                    }, this));
            }
            editor.on('load', _.bind(this._renderMathquillInEditor, this, editor))
                .on('load', _.bind(this.triggerLoad, this, editor));
            editor.on("equationRenderSuccess", _.bind(this._onEquationRender, this, editor));
            this.listenTo(this, "changeEditorWidth", _.bind(this._changeEditorWidth, this, editor))
                .listenTo(this, "showHideCharCounter", _.bind(this._showHideCharCounter, this, editor));
        },

        "_onEquationRender": function(editor) {
            var options = this.model.getRteOptions();

            if (options.equationRenderSuccess) {
                options.equationRenderSuccess(editor);
            }
            this.trigger("equationRenderSuccess", editor);
        },

        "_onEditorMousedown": function(editor) {
            var BrowserCheck = MathUtilities.Components.Utils.Models.BrowserCheck;

            if (BrowserCheck.isIE11 || BrowserCheck.isIE) {
                this.setFocusIntoEditor(editor);
            }
        },

        "setFocusIntoEditor": function(editor) {
            var currentEditor = editor || this.model.getTinyMce(),
                body = currentEditor.getBody(),
                $body = $(body),
                selection = currentEditor.selection,
                lastElementChild = null,
                textNodeCount = 0,
                brNodeCount = 0,
                brNode = null,
                cursorOffset = 0;

            if (typeof tinyMCE !== 'undefined' && tinyMCE.isGecko) {

                if ($body.find('div, ol, ul').length && !currentEditor.isFocus) {

                    // find focus div.
                    $body.children('div[style]').remove();

                    lastElementChild = body.lastElementChild;

                    if (['UL', 'OL'].indexOf(lastElementChild.nodeName.toUpperCase()) > -1) {
                        lastElementChild = lastElementChild.lastElementChild;
                    }

                    // Find text node count.
                    $(lastElementChild).contents().filter(function() {
                        if (this.nodeType === 3) { // Check whether node type is text (3 === Text type)
                            textNodeCount++;
                        }
                    });

                    // Check if BR node is present.
                    brNode = lastElementChild.lastElementChild;
                    if (brNode && brNode.nodeName.toUpperCase() === "BR") {
                        brNodeCount = 1;
                    }

                    cursorOffset = lastElementChild.children.length + textNodeCount - brNodeCount;

                    selection.setCursorLocation(lastElementChild, cursorOffset);

                    currentEditor.focus();

                    currentEditor.getWin().scrollTo(0, body.scrollHeight);
                }
            } else {
                currentEditor.focus();
            }
        },

        "triggerLoad": function(editor) {
            this.trigger('load', editor);
        },

        "_updateCharacterCounter": function(editor, event) {
            // Trigger the updateTextCount event with updated counter value.
            this.trigger('updateCharacterCounter', event.counter);
        },

        "_handleUndoRedo": function(editor) {
            this.trigger('changeUndoRedo', editor);
        },

        "_onCounterBtnAddSuccess": function() {
            this.trigger("counterBtnAddSuccess");
        },

        "_changeEditorWidth": function(editor, editorWidth) {
            $(editor.editorContainer).width(editorWidth);
        },

        "_showHideCharCounter": function(editor, isShowCounter) {
            $(editor.editorContainer).find(".counter-btn-container").toggle(isShowCounter);
        },

        "_applyUIForEditor": function(CONFIG, $el, $body, $iframe, settings) {
            var editorHeight = null,
                mode = this.model.get("Config") || CONFIG.DEFAULT,
                EDITOR_MAX_HEIGHT = 100;

            // Only if a request for an single line editor.
            if (mode === CONFIG.SINGLE_LINE) {
                editorHeight = TinyMCEEditor.View.SINGLE_LINE_HEIGHT;
                $el.addClass("rte-single-line-editor");
                $iframe.css({
                    "height": editorHeight
                });
                $body.addClass("single-line-body");
            } else if (mode === CONFIG.INLINE_EDITOR) { // Only if a request for an inline editor.
                editorHeight = this.model.get('height') || TinyMCEEditor.View.INLINE_EDITOR_HEIGHT;
                $iframe.parent().css({
                    "overflow": "auto",
                    "-webkit-overflow-scrolling": "touch",
                    "height": editorHeight
                });
                $iframe.css({
                    "height": editorHeight
                });
                $body.addClass("single-line-body inline-editor-body");
                this._addScopeForInlineEditor();
            } else { // Any other config.
                editorHeight = settings.height;
                if (editorHeight <= EDITOR_MAX_HEIGHT) {
                    $iframe.css({
                        "height": editorHeight
                    });
                }
                $body.addClass(mode + "-editor-body");
            }
        },

        "_applyFontSize": function(config, $body) {
            if (config.fonts) {
                _.each(config.style_formats, function(styleFormat) {
                    if (styleFormat.title === "Font Sizes") {
                        // Apply style to body.
                        $body.css(styleFormat.items[0].styles);
                    }
                });
            }
        },

        "onEditorKeyUp": function(editor, event) {
            var selection = editor.selection.getNode(),
                ENTER_KEY = 13,
                $selectionContent = $(selection).contents(),
                $equationHolder = $selectionContent.length ? $selectionContent.closest(".rte-equation-holder") : $(selection).closest(".rte-equation-holder");

            if (event.keyCode === ENTER_KEY && $equationHolder.length && $equationHolder.text() === "") {
                $equationHolder.remove();
            }
            this.trigger("equationRenderSuccess", editor);
        },

        "_handleCursor": function(editor, event) {
            if (this.model.get('editorDisabled')) {
                event.preventDefault();
                event.stopPropagation();
                return;
            }
            var selection = editor.selection,
                insertmathquillPlugin = editor.plugins.rteinsertmathquill,
                focusNode = selection.getSel().focusNode,
                keyCode = event.keyCode,
                startOffset = selection.getRng().startOffset,
                nodeToRemove = null,
                focusDivContents = $(selection.getNode()).contents(),
                BACKSPACE_KEYCODE = 8,
                DELETE_KEYCODE = 46;

            if (keyCode === BACKSPACE_KEYCODE || keyCode === DELETE_KEYCODE) {
                // Tinymce removes non-editable spans before entering into key event handler hence recounting after update.
                if (MathUtilities.Components.Utils.Models.BrowserCheck.isChrome && insertmathquillPlugin) {
                    insertmathquillPlugin.setEquationsCount($(editor.getBody()).find('.rte-equation-holder').length);
                }
                if (keyCode === BACKSPACE_KEYCODE &&
                    focusNode.nodeType === focusNode.TEXT_NODE &&
                    focusNode.nodeValue.length === 1 &&
                    $(focusNode).prev().hasClass("rte-equation-holder")) {
                    // In firefox if previous node is mathquill and contains space at the end,
                    // on pressing backspace adds space in mathquill, this is inserted by tinyMCE itself.
                    $(focusNode).remove();
                    event.preventDefault();

                }

                if (focusNode.nodeType === focusNode.TEXT_NODE) {
                    return;
                }
                focusDivContents.filter(function() {
                    // Check if contains only empty textnode.
                    if (this.nodeType === this.TEXT_NODE && this.nodeValue.trim() === "") {
                        $(this).remove();
                    }
                });
                if (keyCode === BACKSPACE_KEYCODE) {
                    nodeToRemove = focusDivContents[startOffset - 1];
                } else if (keyCode === DELETE_KEYCODE) {
                    // For checking if cursor is at the last position of the node.
                    if (startOffset === focusNode.length) {
                        nodeToRemove = focusNode.nextSibling;
                    } else {
                        nodeToRemove = focusDivContents[startOffset];
                    }
                }
                if (nodeToRemove && nodeToRemove.nodeType !== nodeToRemove.TEXT_NODE && nodeToRemove.isContentEditable === false) {
                    // Update equation count.
                    if (nodeToRemove.className.search('mathquill') && insertmathquillPlugin) {
                        insertmathquillPlugin.updateEquationCount(true);
                    }
                    $(nodeToRemove).remove();
                    event.preventDefault();
                }
            }
        },

        "_updateHtml": function(event, content) {
            var editor = this.model.getTinyMce(),
                body,
                $body,
                $container = null,
                editorSettings,
                isTwoColumnLayout = false,
                isLeftMedia = false,
                plugins,
                options = this.model.getRteOptions(),
                $displayDiv = this.$('#' + options.id + '-display-div .tinymce-display-div'),
                twoColumnPlugin,
                mathMLPlugin;

            if (!editor) {
                $displayDiv.html(content);
                return;
            }
            body = editor.getBody();
            $body = $(body);
            editorSettings = editor.settings;
            plugins = editor.plugins;
            twoColumnPlugin = plugins.rtetwocolumnlayout;
            mathMLPlugin = plugins.rtemathml;
            if (content.length === 0) {
                $body.empty();
                return;
            }

            $body.html(content);
            if (twoColumnPlugin) {
                isTwoColumnLayout = $body.find(".rte-two-column-layout-container").length > 0;
                //Add contenteditable attribute to content cell
                $body.find(".rte-two-column-layout-container .rte-content-cell").prop("contenteditable", true);
                if (isTwoColumnLayout) {
                    isLeftMedia = $body.find(".rte-two-column-left-media").length > 0;
                    if (isLeftMedia) {
                        twoColumnPlugin.activateLeftMediaButton();
                    } else {
                        twoColumnPlugin.activateRightMediaButton();
                    }
                }
            }

            this._renderMathquillInEditor(editor);
            if (mathMLPlugin && $body.find('.rte-mathjax-holder').length) {
                mathMLPlugin.loadMathJaxFile();
                mathMLPlugin.renderMathMLInsideEditor(editor.contentWindow, body);
            }

            $container = $body.find(".media-holder");

            if (editorSettings.mediaButtonCallback && $container.length > 0) {
                editorSettings.mediaButtonCallback($container, true);
            }

            // For max length counter update.
            if (plugins.maxlength) {
                editor.fire('keyUp');
            }
        },

        "_renderMathquillInEditor": function(editor) {
            var options = this.model.getRteOptions(),
                textToLoad = options.textToLoad,
                $inputHolder = $('<div>').html(textToLoad),
                $rteEquationHolder = $inputHolder.find('.rte-equation-holder'),
                regExForLatexToReRendered = /\\(?:longrightarrow|leftrightarrow|frown)/g,
                latexToBeRendered = $rteEquationHolder.attr("data-mathquill-latex") ||
                $rteEquationHolder.attr("math-utilities-text-editor-equation-data-latex") || '';

            /*Re-rendering the latex again in case of frown, long right arrow & left right arrow symbol*/
            if (!this.reRendered && regExForLatexToReRendered.test(latexToBeRendered)) {
                _.delay(_.bind(function() {
                    this.reRendered = true;
                    $(editor.getBody()).html('');
                    if (textToLoad !== "") {
                        if (textToLoad !== void 0) {
                            $inputHolder.find(".rte-equation-holder[math-utilities-text-editor-equation-data-latex]").each(function() {
                                $(this).attr("data-mathquill-latex", $(this).attr("math-utilities-text-editor-equation-data-latex"))
                                    .removeAttr("math-utilities-text-editor-equation-data-latex");
                            });
                        }
                        textToLoad = $inputHolder.html();
                        this.model.setContent(textToLoad);
                        if (editor.plugins.rteinsertmathquill) {
                            editor.plugins.rteinsertmathquill.renderMathquillInEditor();
                        }
                        $(editor.getBody()).find('.selectable').text('$$');
                    }
                }, this), 500);
            }

            if (editor.plugins.rteinsertmathquill) {
                editor.plugins.rteinsertmathquill.renderMathquillInEditor();
            }
            $(editor.getBody()).find('.selectable').text('$$');
        },

        "_addScopeForInlineEditor": function() {
            var $el = $('#' + this.$el.attr("id")),
                toolbarSideButton = this.model.getTinyMce().settings.toolbar_side_buttons;

            $el.removeClass("rte-default-editor");

            if (toolbarSideButton === "both") {
                $el.addClass("rte-inline-editor rte-toolbar-side-buttons rte-toolbar-both-buttons");
            } else if (toolbarSideButton === "left") {
                $el.addClass("rte-inline-editor rte-toolbar-side-buttons rte-toolbar-left-button");
            } else if (toolbarSideButton === "none") {
                $el.addClass("rte-inline-editor rte-toolbar-no-button");
            }
        },

        "disableMouseDown": function(event) {
            if (event.target.nodeName === "HTML") {
                return;
            }
            event.preventDefault();
            event.stopPropagation();
        },

        /**
         * Disables editor based on disable param
         * @method _disableEditor
         * @param textEditorModel tinymce activeEditor instance.
         * @param disable {Boolean} if true method disables editor, if false toggles the disable state of editor.
         */
        "_disableEditor": function(textEditorModel, disable) {
            var editor = this.model.getTinyMce(),
                body,
                $body,
                $rteEquations,
                options = this.model.getRteOptions(),
                $displayDiv = this.$('#' + options.id + '-display-div');

            if ($displayDiv.length) {
                options.readonly = disable;
                $displayDiv.data("rteOptions", options);
                if (!disable) {
                    $displayDiv.off("click.tinyMceDummyDiv").on("click.tinyMceDummyDiv", _.bind(this.dummyDivClicked, this)).removeClass('read-only');
                }
                return;
            }
            editor = textEditorModel.getTinyMce();
            body = editor.getBody();
            $body = $(body);
            $rteEquations = $body.find('.rte-equation-holder');

            if (disable) {
                editor.on("mouseDown", this.disableMouseDown);
                $body.addClass('rte-readonly-mode');
            } else {
                editor.off("mouseDown", this.disableMouseDown);
                $body.removeClass('rte-readonly-mode');
            }

            editor.theme.panel.find('toolbar *').disabled(disable);
            body.setAttribute("contenteditable", String(!disable));

            if ($rteEquations.length > 0) {
                if (disable) {
                    _.each($rteEquations, function(rteEquation) {
                        $(rteEquation).off('mousedown').addClass('rte-readonly-mode');
                    });
                } else {
                    _.each($rteEquations, function(rteEquation) {
                        $(rteEquation).removeClass('rte-readonly-mode');
                    });
                }
            }

            textEditorModel.set('editorDisabled', disable);

            if (editor.plugins.rteinsertmathquill) {
                editor.plugins.rteinsertmathquill.enableMathquillClick(!disable);
            }
        },

        "destroyTextEditor": function(event) {
            var $destroy = null;

            $destroy = $(event.target);
            $destroy.hide();
            this._$rteContainer.remove();
        }
    }, { // Static properties/methods

        "getTextWidth": function(text) {
            var width = null,
                $widthCalcSpan = null;

            $widthCalcSpan = $("<span>").appendTo(document.body);
            $widthCalcSpan.html(text);
            width = $widthCalcSpan.width();
            $widthCalcSpan.remove();
            return width;
        },

        "INLINE_EDITOR_HEIGHT": 35,
        "SINGLE_LINE_HEIGHT": 55
    });
})(MathUtilities.Components.TinyMCEEditor);
