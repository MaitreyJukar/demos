/* globals _, $, MathUtilities, window, tinymce */
/* eslint camelcase:0 */

(function(MathUtilityComponents) {
    'use strict';
    MathUtilityComponents.TinyMCEEditor = {};
    var TextEditor = MathUtilityComponents.TinyMCEEditor,
        eventType;
    TextEditor.Model = (function() {
        var TextEditorModel = null,
            EventTypes = null,
            EventTypesMap = null;
        TextEditorModel = Backbone.Model.extend({ // Instance properties/methods
                "mediaHolderCount": 0,

                "defaults": {
                    "id": null,
                    "parentId": null,
                    "_$container": null,
                    "html": null,
                    "text": null,
                    "_changeInlineEditorButton": false,
                    "isDisabled": false,
                    "baseURL": null,
                    "idPrefix": 'rte-',
                    "contentCSS": null
                },

                "initialize": function(params) {
                    var defaultParams = null,
                        defaultParamConfig = null,
                        parsedParams = null,
                        toolbarSideButtons = null,
                        CONFIG = TextEditor.Config; // Static config settings defined in this model.

                    // Clone params.
                    defaultParams = $.extend(true, {}, params);
                    defaultParamConfig = defaultParams.Config;
                    // Set baseURL.
                    this.setBaseURL(defaultParams.basePath);
                    toolbarSideButtons = defaultParams.toolbar_side_buttons;

                    // Set inline editor config.
                    if (defaultParamConfig === CONFIG.INLINE_EDITOR) {
                        defaultParams = this._setInlineEditorConfig(defaultParams, toolbarSideButtons);
                    }

                    // Merge config parameters with user's defaultParams.
                    parsedParams = this._mergeParams(defaultParams, CONFIG);
                    // Add style parameter to final param Object and reset Defaults.
                    parsedParams = this._setStyleFormat(parsedParams, defaultParams);
                    this._setDefaults(parsedParams);

                    if (defaultParamConfig === CONFIG.SINGLE_LINE || defaultParamConfig === CONFIG.INLINE_EDITOR) {
                        parsedParams.nowrap = true;
                    }

                    parsedParams.setup = _.bind(function(editor) {
                        this._paramSetup(parsedParams, defaultParams, CONFIG, editor);
                    }, this);

                    parsedParams.init_instance_callback = _.bind(this._onEditorInit, this);

                    if (parsedParams.toolbar === false) {
                        delete parsedParams.toolbar1;
                    }

                    this._setRteOptions(parsedParams);
                    this._addToCollection();
                },

                "_paramSetup": function(parsedParams, defaultParams, CONFIG, editor) {
                    var ENTER_KEY_CHARCODE = 13;
                    if (parsedParams.events) {
                        _.each(parsedParams.events,
                            function(callbackFunction, event) {
                                editor.on(event, callbackFunction);
                            });
                    }
                    if (defaultParams.Config === CONFIG.SINGLE_LINE || defaultParams.Config === CONFIG.INLINE_EDITOR) {
                        editor.on('keydown', function(e) {
                            if (e.charCode === ENTER_KEY_CHARCODE || e.keyCode === ENTER_KEY_CHARCODE) { // enter or return key
                                return tinymce.dom.Event.cancel(e);
                            }
                        });
                    }
                },

                "_mergeParams": function(defaultParams, CONFIG) {
                    var Config = defaultParams.Config,
                        initOptions = null,
                        parsedParams = null;

                    initOptions = $.extend(true, {}, TextEditorModel.Settings[CONFIG.DEFAULT]);

                    if (Config !== void 0 && TextEditorModel.Settings.hasOwnProperty(Config)) {
                        initOptions = $.extend(true, initOptions, TextEditorModel.Settings[Config]);
                    }

                    parsedParams = $.extend(true, {}, initOptions, defaultParams);
                    return parsedParams;
                },

                "_setInlineEditorConfig": function(defaultParams, toolbarSideButtons) {
                    var plugins = defaultParams.plugins,
                        toolbar = defaultParams.toolbar1;

                    // Set plugins parameter.
                    if (plugins && plugins !== '') {
                        plugins += ' rteinsertmathquill';
                    }

                    // Set toolbar parameter.
                    if (!toolbar && toolbar !== '') {
                        if (toolbarSideButtons === 'left') {
                            defaultParams.toolbar1 = 'insertmathquill';
                        } else if (toolbarSideButtons === 'none') {
                            defaultParams.toolbar1 = 'false';
                        }
                    }
                    return defaultParams;
                },

                "_setStyleFormat": function(parsedParams, defaultParams) {
                    var styleFormat = null,
                        originalStyleFormat = null; // passed through options.

                    originalStyleFormat = parsedParams.style_formats || null;

                    if (defaultParams.fonts) {
                        // Format originally passed.
                        if (originalStyleFormat !== null) {
                            styleFormat = [{
                                "title": 'Font Sizes',
                                "items": this.getFonts(defaultParams)
                            }];

                            $.extend(true, originalStyleFormat, styleFormat);
                        } else {
                            parsedParams.style_formats = [{
                                "title": 'Font Sizes',
                                "items": this.getFonts(defaultParams)
                            }];
                        }
                    }
                    return parsedParams;
                },

                "getEditorDimensions": function(editorId) {
                    $(this).trigger('updateDimensions', editorId);

                    return {
                        "width": this.get("width"),
                        "height": this.get("height")
                    };
                },

                "getFonts": function(defaultParams) {
                    var defaultCustomFont = defaultParams.customfont_size,
                        customFontSize = defaultCustomFont || null;

                    if (customFontSize !== null) {
                        return this.getFontSize(defaultCustomFont);
                    }
                    return TextEditorModel.DEFAULT_FONT_SIZE;
                },

                "setContent": function(content) {
                    $(this).trigger('changeHTML', content);
                },

                "getFontSize": function(fontObj) {
                    var fonts = null,
                        obj = null;

                    fonts = [];
                    _.each(fontObj, function(element, index) {
                        obj = {
                            "title": element.fontText,
                            "inline": 'span',
                            "styles": {
                                "font-size": element.fontSize
                            }
                        };
                        fonts[index] = obj;
                    });
                    return fonts;
                },

                "getIdPrefix": function() {
                    return this.get('idPrefix');
                },

                "getRteOptions": function() {
                    return this.get('options');
                },

                "getTinyMce": function() {
                    return this.get('tinyMce');
                },

                "getParentId": function() {
                    return this.get('parentId');
                },

                "setTinyMce": function(tinyMce) {
                    return this.set('tinyMce', tinyMce);
                },

                "setIdPrefix": function(idPrefix) {
                    this.set('idPrefix', idPrefix || null);
                },

                "setSelectorId": function(selectorId) {
                    var options = this.get('options');

                    options.selector = selectorId;
                    this.set('options', options);
                },

                "setHtml": function(html) {
                    this.set('html', html);
                    return html;
                },
                "setBaseURL": function(url) {
                    this.set('baseURL', url);
                },
                "getBaseURL": function() {
                    return this.get('baseURL');
                },
                "setIsDisabled": function(flag) {
                    this.set('isDisabled', flag);
                },
                "getIsDisabled": function() {
                    return this.get('isDisabled');
                },

                "_onEditorInit": function(editor) {
                    $(this).trigger('editorInit', editor);
                },

                "_updateModelProperties": function(instance) {
                    this.setTinyMce(instance);
                },

                "_postRender": function(instance) {
                    this._updateModelProperties(instance);
                    this.trigger(TextEditor.Events.TEXTEDITOR_RENDERED);
                },

                "_addToCollection": function() {
                    if (TextEditor.isInitialized === false) {
                        TextEditor.RteCollection = new TextEditor.Collection();
                        TextEditor.isInitialized = true;
                    }
                    TextEditor.RteCollection.add(this);
                },

                "_setContentCSS": function(url) {
                    this.set('contentCSS', url);
                },

                "setInlineEditorButton": function(flag) {
                    this.set('_changeInlineEditorButton', flag);
                },

                "getInlineEditorButton": function() {
                    return this.get('_changeInlineEditorButton');
                },

                "_getContentCSS": function() {
                    return this.get('contentCSS');
                },

                "_setDefaults": function(params) {
                    this.set('parentId', params.id);
                },

                "_setRteOptions": function(rteOptions) {
                    this.set('options', rteOptions);
                },

                "destroyRte": function() {
                    var tinyMce = this.getTinyMce();

                    tinyMce.remove('#' + this.getParentId());
                    this.collection.remove(this);
                    this.trigger(TextEditorModel.TEXTEDITOR_DESTROYED);
                    this.destroy();
                },

                "disable": function(enable) {
                    if (enable) {
                        // enable
                        this._triggerEvent(EventTypes.TEXTEDITOR_ENABLE);
                    } else {
                        // disable
                        this._triggerEvent(EventTypes.TEXTEDITOR_DISABLE);
                    }
                    return this;
                },

                "enable": function() {
                    this.disable(true);
                    return this;
                },

                "show": function() {
                    return this;
                },

                "hide": function() {
                    return this;
                },

                "focus": function() {
                    return this;
                },

                "blur": function() {
                    return this;
                },

                "_triggerEvent": function(event) {
                    var typeOfEvent = null;

                    if (typeof event === 'string') {
                        event = new $.Event(event);
                    }
                    typeOfEvent = event.type;
                    this.trigger(typeOfEvent, event);
                    return this;
                },

                "handleMediaDeleteCallback": function(container) {
                    this.getTinyMce().plugins.teimedia.handleMediaDeleteButton(container);
                }


            },
            // Static properties/methods
            {
                "REPOSITORY_PATH": 'static/vendor/tinymce',

                "DEFAULT_FONT_SIZE": [{
                    "title": 'small',
                    "inline": 'span',
                    "classes": 'font-size-small'
                }, {
                    "title": 'medium',
                    "inline": 'span',
                    "classes": 'font-size-medium'
                }, {
                    "title": 'large',
                    "inline": 'span',
                    "classes": 'font-size-large'
                }],


                "Settings": {
                    "defaults": {
                        "menubar": false,
                        "statusbar": false,
                        "extended_valid_elements": 'div[*],span[*],var[*],sup[*],svg[*],g[*],metadata[*],path[*]',
                        // tags from svg are to support copypaste of arc in tinyMCE
                        "content_css": '/src/core.discoveryeducation.com/core/wwwroot/static/css/math-utilities/components/text-editor/rte-plugins.css',
                        "skin": 'teiskin',
                        "object_resizing": false,
                        "forced_root_block": 'div',
                        "inline_styles": true,
                        "paste_remove_styles_if_webkit": false
                    },
                    "acctext": {
                        "statusbar": true,
                        "resize": true,
                        "plugins": "rteinsertmathquill scienceSymbol rtemathml",
                        "toolbar1": "bold italic underline bullist numlist rtenewsymbol scienceSymbol insertmathquill"
                    },
                    "teibasic": {
                        "statusbar": true,
                        "resize": true,
                        "plugins": "rtemathml rteinsertmathquill scienceSymbol",
                        "toolbar1": "bold italic underline bullist numlist mathml rtenewsymbol scienceSymbol insertmathquill"
                    },
                    "prompt": {
                        "statusbar": true,
                        "resize": true,
                        "plugins": "rtetable rtetwocolumnlayout rtemathml rteinsertmathquill teimedia scienceSymbol",
                        "toolbar1": "bold italic underline bullist numlist alignleft aligncenter alignright rtetable defaulteditor addmedialeft addmediaright teimedia mathml rtenewsymbol scienceSymbol insertmathquill"
                    },
                    "singleline": {
                        "resize": false,
                        "plugins": "rtemathml rteinsertmathquill scienceSymbol",
                        "toolbar1": "bold italic underline mathml rtenewsymbol scienceSymbol insertmathquill"
                    },
                    "inline": {
                        "resize": false,
                        "toolbar_side_buttons": 'both',
                        "plugins": "rteinsertmathquill scienceSymbol",
                        "toolbar1": "insertmathquill | rtenewsymbol scienceSymbol"
                    },
                    "mathonly": {},
                    "plaintext": {},
                    "mediaCaption": {
                        "plugins": "rtemathml rteinsertmathquill scienceSymbol",
                        "toolbar1": "bold italic underline"
                    }
                },
                "Type": {
                    "PLAIN_TEXT": 1,
                    "RICH_TEXT": 2,
                    "RICH_TEXT_WITH_MATH": 3
                }
            }
        );

        for (eventType in EventTypes) {
            if (!EventTypes.hasOwnProperty(eventType)) {
                continue;
            }
            EventTypesMap[EventTypes[eventType]] = eventType;
        }
        return TextEditorModel;
    })();

    TextEditor.Events = {
        "TEXTEDITOR_CREATED": 'texteditor.created',
        "TEXTEDITOR_RENDERED": 'texteditor.rendered',
        "TEXTEDITOR_DESTROYED": 'texteditor.destroyed',
        "TEXTEDITOR_ENABLE": 'texteditor.enable',
        "TEXTEDITOR_DISABLE": 'texteditor.disable'
    };

    TextEditor.Config = {
        "DEFAULT": 'defaults',
        "ACC_TEXT": 'acctext',
        "TEI_BASIC": 'teibasic',
        "QUESTION_PROMPT": 'prompt',
        "MATH_ONLY": 'mathonly',
        "PLAIN_TEXT": 'plaintext',
        "SINGLE_LINE": 'singleline',
        "INLINE_EDITOR": 'inline',
        "MEDIA_CAPTION": 'mediaCaption'
    };

    TextEditor.init = function(options) {
        var textEditorModel = null,
            TextEditorObject = MathUtilities.Components.TinyMCEEditor,
            RteCollection = TextEditorObject.RteCollection,
            textEditorView = null;

        options.browser_spellcheck = options.browser_spellcheck === void 0 || options.browser_spellcheck;
        if (RteCollection && RteCollection.isRtePresent(options.id)) {
            textEditorModel = RteCollection.getEditorModel(options.id);
            textEditorModel.getRteOptions().textToLoad = options.textToLoad;
            if (!textEditorModel.getTinyMce()) {
                textEditorView = new TextEditorObject.View({
                    "model": textEditorModel,
                    "el": '#' + options.id
                });
                return {
                    "model": textEditorModel,
                    "view": textEditorView
                };
            }
            RteCollection.setRteContent(options.id, options.textToLoad);
        } else {
            textEditorModel = new TextEditorObject.Model(options);
            textEditorView = new TextEditorObject.View({
                "model": textEditorModel,
                "el": '#' + options.id
            });
        }
        return {
            "model": textEditorModel,
            "view": textEditorView
        };
    };
})(window.MathUtilities.Components);
