/*global Tools:false, DETools:false, de:false, Handlebars:false, console:false */
/*eslint max-len:0*/
define('js/tools/client/client', [
    'dist/templates/math/menu-math-tools',
    'dist/templates/math/modal-math-tools',
    'js/tools/client/modal-tool-save-name',
    'js/de/ToolsWindow'
], function (toolsMenu, toolsModal, ToolSaveNameModal) {
    'use strict';

    var client = {

        "toolWindows": {},

        "toolData": {
            "1": {
                "toolId": 4,
                "longKey": "CalculatorGraphing",
                "longName": "Graphing Calculator",
                "toolContainer": "modal-tool-4",
                "initialState": null
            },
            "2": {
                "toolId": 1,
                "longKey": "CalculatorScientific",
                "longName": "Scientific Calculator",
                "toolContainer": "modal-tool-1",
                "initialState": {
                    "ndefaultView": 2
                }
            },
            "3": {
                "toolId": 1,
                "longKey": "CalculatorTraditional",
                "longName": "Calculator",
                "toolContainer": "modal-tool-1",
                "initialState": null
            },
            "4": {
                "toolId": 8,
                "longKey": "DynamicGeometryTool",
                "longName": "Geometry",
                "toolContainer": "modal-tool-8",
                "initialState": null
            },
            "5": {
                "toolId": 9,
                "longKey": "Construction",
                "longName": "Construction",
                "toolContainer": "modal-tool-9",
                "initialState": null
            },
            "6": {
                "toolId": 2,
                "longKey": "UnitConverter",
                "longName": "Unit Converter",
                "toolContainer": "modal-tool-2",
                "initialState": null
            },
            "7": {
                "toolId": 10,
                "longKey": "NBADataTool",
                "longName": "Data Analysis",
                "toolContainer": "modal-tool-10",
                "initialState": null
            },
            "8": {
                "toolId": 7,
                "longKey": "WhiteBoardAnnotation",
                "longName": "Whiteboard",
                "toolContainer": "modal-tool-7",
                "initialState": null
            },
            "9": {
                "toolId": 6,
                "longKey": "MatrixTool",
                "longName": "Matrix Solver",
                "toolContainer": "modal-tool-6",
                "initialState": null
            }
        },

        "toolSaveNameModal": null,

        "api": {
            "saveImage": '/api:images/createFromBase64',
            "retrieveToolSaveState": '/api:state/find',
            "saveToolState": '/api:state/create'
        },

        "init": function(options) {
            // if( client.isInitialized() === false ){
            var params = {
                "onSuccess": client.initSuccess,
                "onError": client.initError,
                "onComplete": client.initComplete,
                "basePath": "/static/",
                "strPathToCommon": ""
            };
            $.extend(true, params, options);
            // init the engine and coach mode on call back
            window.DETools = new Tools(params);
            // } else {
            // Else just go to mode.engineLoadSuccess
            //    client.initSuccess();
            // }
            return;
        },

        "getToolData": function(){
            return client.toolData;
        },

        "loadTool": function(options) {
            // add spinner
            $.de.loading($('body'), {
                "left": $(window).width() / 2 - 20,
                "top": $('.techbook-content').offset().top + 2,
                "color": '#978ee4'
            });
            //console.log("DEToolsClient.loadTool");
            var params = {
                "onSuccess": client.loadToolSuccess,
                "onError": client.loadToolError,
                "onComplete": client.loadToolComplete
            };
            $.extend(true, params, options);
            DETools.loadTool(params);
        },

        "loadToolSuccess": function(callbackData) {
            // remove spinner
            $.de.loadingComplete($('body'));
            client.centerContainer(callbackData);
        },

        "loadToolError": function(callbackData){
            //console.log( "DEToolsClient.loadToolError");
        },

        "loadToolComplete": function(callbackData){
            //console.log( "DEToolsClient.loadToolComplete");
        },

        "unloadTool": function(options){
            //console.log( "DEToolsClient.unloadTool");
            var params = {
                "onSuccess": client.unloadToolSuccess,
                "onError": client.unloadToolError,
                "onComplete": client.unloadToolComplete,
                "callbackData": {}
            };
            $.extend(true, params, options);
            DETools.unloadTool(params);
        },

        "unloadToolSuccess": function(callbackData) {
            //console.log( "DEToolsClient.unloadToolSuccess");
        },

        "unloadToolError": function(callbackData) {
            //console.log( "DEToolsClient.unloadToolError");
        },

        "unloadToolComplete": function(callbackData) {
            //console.log( "DEToolsClient.unloadToolComplete");
        },

        "closeTool": function(options){
            var tool = client.getToolById(options.toolId);
            client.unloadTool(options);
            $('#' + tool.toolContainer).remove();
        },

        "saveToolState": function(options) {
            var saveOptions = $.extend(true, {
                "type": "POST",
                "url": client.api.saveToolState
            }, options);

            saveOptions.data = {
                'jsonData': JSON.stringify(options.data.toolState),
                'typeId': options.toolId
            };

            if (!this.toolSaveNameModal) {
                this.toolSaveNameModal = new ToolSaveNameModal(saveOptions);
                this.toolSaveNameModal.render();
            }

            this.toolSaveNameModal.showModal();
        },

        "retrieveToolSaveState": function(options) {
            /*eslint no-console:0 */
            //console.log("DEToolsClient.retrieveToolSaveState");
            // TODO method to update UI
            var params = {
                "url": client.api.retrieveToolSaveState,
                "success": client.retrieveToolSaveStateSuccess,
                "error": client.retrieveToolSaveStateError,
                "complete": client.retrieveToolSaveStateComplete,
                "data": {
                    "toolState": 'value undefined'
                },
                "callbackData": {
                    "toolGuid": 'value undefined',
                    "action": function() { console.log('undefined action'); }
                }
            };
            $.extend(true, params, options);
            $.ajax(params);
        },

        "retrieveToolSaveStateSuccess": function(callbackData) {
            //console.log( "DEToolsClient.retrieveToolSaveStateSuccess");
        },

        "retrieveToolSaveStateError": function(callbackData) {
            //console.log( "DEToolsClient.retrieveToolSaveStateError");
        },

        "retrieveToolSaveStateComplete": function(callbackData) {
            //console.log( "DEToolsClient.retrieveToolSaveStateComplete");
        },

        "saveImage": function(options) {
            return $.ajax({
                "url": client.api.saveImage,
                "data": options.data,
                "method": "POST"
            });
        },

        "renderMenu": function(options) {
            var trigger = $(options.container),
                target = 'menu-tools',
                data = client.getToolData(),
                isNewMath = false;

            if (options && options.isNewMath === true){
                isNewMath = true;
            }

            if (trigger.children('#' + target).length === 0) {
                trigger.append('<div id="' + target + '"></div>');

                var html = toolsMenu({
                    "TOOLS": data,
                    "isNewMath": isNewMath
                });

                $('#' + target).prepend(html);

                /*temporarily make the Equation Solver disabled*/
                $('.tool-3').on('click', function(){
                    return false;
                });

                $('.loadTool:not(.tool-3)').on('click', function(e) {
                    /*eslint no-unused-vars:0 */
                    var el = $(this),
                        toolId = el.attr('data-tool-id'),
                        toolContainer = el.attr('data-target'),
                        toolData = data[el.attr('data-id')],
                        params = {
                            "modalId": toolContainer,
                            "objToolData": {
                                "toolId": toolId,
                                "strBasePath": '',
                                "containerId": toolContainer + '-body',
                                "callbackData": {
                                    "toolId": toolId
                                }
                            },
                            "toolName": el.text().trim()
                        };

                    if (jQuery.isNumeric(el.data('view'))) {
                        params.objToolData.initialState = {
                            "ndefaultView": Number(el.data('view'))
                        };
                    }
                    de.ToolsWindow.closeInstanceOf(params.toolName);
                    client.getToolWindow(params.toolName).openTool();

                    $(document).trigger('deTrack', {
                        "actionType": "click",
                        "category": 'math techbook',
                        "subCategory": $(document.body).data('item'),
                        "target": "math tools",
                        "type": toolData.longName.toLowerCase()
                    });
                });
            } else {
                if ($("#" + target).is(":visible")) {
                    trigger.trigger("math-tools-menu:hide");
                }

                $('#' + target).toggle();
            }
        },

        "getToolById": function(id) {
            var item;
            $.each(client.toolData, function(idx, value){
                if (id.toString() === value.toolId.toString()) {
                    item = value;
                }
            });
            return item;
        },

        "centerContainer": function(callbackData){
            var container = $('div#' + callbackData[0].modalId + '.tool-container'),
                left = $(window).width() / 2 - container.width() / 2,
                top = $(window).height() / 2 - container.height() / 2 + $(window).scrollTop();
            top = top > 0 ? top : 0;
            container.css("top", top + "px").css("left", left + "px");
        },

        "renderTool": function(options){
            var toolId = options.objToolData.toolId;

            if ($.find("#" + options.modalId).length < 1) {

                options.objToolData.callbackData = {
                    "toolId": toolId,
                    "modalId": options.modalId
                };

                $('#container').append('<div id="' + options.objToolData.callbackData.modalId + '" data-id="' +
                    toolId + '" tabindex="-1" data-backdrop="false" data-keyboard="false" class="tool-container tools-wrapper"></div>');

                var container = $('#' + options.objToolData.callbackData.modalId);
                container.draggable({
                    "handle": '.modal-tool-' + toolId + '-title',
                    "stack": '.tools-wrapper',
                    "containment": 'document'
                });

                var html = toolsModal({
                    "ID": options.modalId,
                    "TOOLID": toolId
                });
                $('#' + options.objToolData.callbackData.modalId).append(html);

                client.loadTool(options.objToolData);
            }
        },

        "getToolWindow": function(toolName){
            return de.ToolsWindow.getInstanceOf(toolName);
        }
    };

    window.DEToolsClient = client;

    return client;
});
