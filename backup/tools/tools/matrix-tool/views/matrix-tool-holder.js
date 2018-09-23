(function (MathUtilities) {
    'use strict';

    /**
    * A customized Backbone.View that represents Matrix Tool.
    * @class MatrixTool
    * @constructor
    * @namespace Tools.MatrixTool.Views
    * @module MatrixTool
    * @extends Backbone.View
    */
    MathUtilities.Tools.MatrixTool.MatrixToolHolder.Views.MatrixToolHolder = MathUtilities.Components.ToolHolder.Views.ToolHolder.extend({

        /**
        * @property _resultView
        * @type Object
        * @default null
        */
        _resultView: null,
        /**
        * @property _stepByStepView
        * @type Object
        * @default null
        */
        _stepByStepView: null,
        /**
        * @property _chooseTaskView
        * @type Object
        * @default null
        */
        _chooseTaskView: null,

        /**
        * Holds undoRedoManager model Object
        * @property _undoRedoManager
        * @type {Object}
        */
        _undoRedoManager: null,

        /**
        * Holds undoRedoManager view Object
        * @property _undoManagerView
        * @type {Object}
        */
        _undoManagerView: null,

        /**
       * Stores accesibility manager view object.
       * @property accManagerView
       * @type object
       * @default: null
       */
        accManagerView: null,

        /**
        * Stores accesibility manager model object.
        * @property accManagerModel
        * @type object
        * @default: null
        */
        accManagerModel: null,

        /**
        * Condition to check if accesibility is on.
        * @property isAccesibilityOn
        * @type {Boolean} true if accessibility is on, otherwise false
        * @default null
        */
        isAccesibilityOn: false,

        /**
        * Holds error messages for input values
        * @property  _ERROR_MESSAGE
        * @type {Object}
        */
        _ERROR_MESSAGE: {
            //_EMPTY_CELL: 'Enter a value for all the elements.',
            //_SCALAR_INVALID: 'Scalar can only be a rational number.',
            //_MATRIX_NO_INVALID: 'Elements of matrix can only be a rational number.',
            //_RESULT_OUT_OF_RANGE: 'The values in the result have exceeded the limit and cannot be used for further calculations.'
        },

        /**
        * @property toolbarState
        * @type Object
        */
        toolbarState: {
            topToolbar: {
                isVisible: true,
                buttonProperty: {
                    help: {
                        isVisible: true,
                        isDisabled: false,
                        isPressed: false
                    }
                },
                title: {
                    titleText: ''
                },
                toolIcon: {
                    toolIconCSS: 'tool-icon-data'
                },
                toolId: {
                    toolIdText: '6'
                }
            },
            bottomToolbar: {
                isVisible: true,
                buttonProperty: {
                    save: {
                        isVisible: true,
                        isDisabled: false,
                        isPressed: false
                    },
                    open: {
                        isVisible: true,
                        isDisabled: false,
                        isPressed: false
                    },
                    screenShot: {
                        isVisible: true,
                        isDisabled: false,
                        isPressed: false
                    },
                    print: {
                        isVisible: true,
                        isDisabled: false,
                        isPressed: false
                    },
                    csv: {
                        isVisible: false,
                        isDisabled: false,
                        isPressed: false
                    }
                },
                toolId: {
                    toolIdText: '6'
                },
                screenCaptureDiv: {
                    screenCaptureHolder: '#matrixToolHolder'
                }
            }
        },
        events: {
            'click #undo': '_callUndo',
            'click #redo': '_callRedo',
            'click #save': '_saveMatrixToolState',
            'click #retrieve': '_retrieveMatrixToolState',
            'keydown .value-holder': '_valueKeyPressHandler'
        },

        /**
        * Instantiates chooseTask,result and stepByStep models and views.
        * @method initialize
        */
        initialize: function initialize() {
            arguments[0].toolId = '6';
            MathUtilities.Tools.MatrixTool.MatrixToolHolder.Views.MatrixToolHolder.__super__.initialize.apply(this, arguments);

            var el = $("#matrixToolHolder"),
                self = this,
                $el,
                resultModel,
                resultView,
                chooseTaskModel,
                chooseTaskView,
                stepByStepModel,
                stepByStepView,
                useResultView,
                basePath,
                accData = this.options.accJsonData,
                screeenCounter,
                buttonScreenElements,
                elementsCounter, elementsLength, goBtnText = '', useBtnText = '',
                taskDropDownData,
                tooltipElems = null,
                tooltipElemsLength = null,
                iLooper=null,
                undoOptions = null,
                tooltipView=null,
                elemId=null;

            $('.math-utilities-tools-matrix').append(el);

            this._containerElement.append($('.math-utilities-tools-matrix'));

            this.$el = el;

            $el = this.$el;
            resultModel = null;
            resultView = null;
            chooseTaskModel = null;
            chooseTaskView = null;
            stepByStepModel = null;
            stepByStepView = null;
            useResultView = null;
            basePath = MathUtilities.Tools.MatrixTool.MatrixToolHolder.Models.MatrixToolHolder.BASEPATH;

            $el.html(MathUtilities.Tools.MatrixTool.templates.matrixToolContentHolder().trim());
            
            //get custom button text from accessibility data
            for (screeenCounter = 0; screeenCounter < accData.length; screeenCounter++) {
                if (accData[screeenCounter].id === "buttons") {
                    buttonScreenElements = accData[screeenCounter].elements;
                    elementsLength = buttonScreenElements.length;
                    for (elementsCounter = 0; elementsCounter < elementsLength; elementsCounter++) {
                        if (buttonScreenElements[elementsCounter].id === "go-btn") {
                            goBtnText = buttonScreenElements[elementsCounter].messages[0].message.loc;
                            buttonScreenElements[elementsCounter].messages[0].message.loc = '';
                        }
                        else if (buttonScreenElements[elementsCounter].id === "use-result-btn") {
                            useBtnText = buttonScreenElements[elementsCounter].messages[0].message.loc;
                            buttonScreenElements[elementsCounter].messages[0].message.loc = '';
                        }
                    }
                }
                else if (accData[screeenCounter].id === "combobox") {
                    taskDropDownData = accData[screeenCounter].elements[0];
                }
            }


            chooseTaskModel = new MathUtilities.Tools.MatrixTool.MatrixToolHolder.Models.ChooseTask();
            this._chooseTaskView = new MathUtilities.Tools.MatrixTool.MatrixToolHolder.Views.ChooseTask({
                model: chooseTaskModel,
                el: el.find('.choose-task-holder'),
                bAllowAccessibility: this.options.bAllowAccessibility,
                goBtnText: goBtnText,
                taskDropDownText: taskDropDownData
            });

            resultModel = new MathUtilities.Tools.MatrixTool.MatrixToolHolder.Models.Result();
            this._resultView = new MathUtilities.Tools.MatrixTool.MatrixToolHolder.Views.Result({
                model: resultModel,
                el: el.find('.result-holder')
            });

            stepByStepModel = new MathUtilities.Tools.MatrixTool.MatrixToolHolder.Models.StepByStep();
            this._stepByStepView = new MathUtilities.Tools.MatrixTool.MatrixToolHolder.Views.StepByStep({
                model: stepByStepModel,
                el: el.find('.step-by-step-holder')
            });


            useResultView = MathUtilities.Components.Button.generateButton({
                'id': 'use-result-btn',
                'imagePathIds': [basePath + 'img/tools/common/tools/matrix-tool/button-left-right.png',
                                 basePath + 'img/tools/common/tools/matrix-tool/button-middle.png'],
                'isCustomButton': true,
                'text': useBtnText,
                'height': 39,
                'padding': 11
            });

            this.model.set('useResultView', useResultView);
            useResultView.setButtonState(MathUtilities.Components.Button.BUTTON_STATE_DISABLED);

            this.disableUseResult(true);

            this._chooseTaskView.on('click', $.proxy(this.goButtonClick, this));
            this._chooseTaskView.on('disableUseResult', $.proxy(this.disableUseResult, this));

            //            $('.step-by-step-holder').css('display', 'none');
            el.find('.step-by-step-holder').hide();
            el.find('#hide-steps').hide();

            // UndoManager Object
            this._undoRedoManager = new MathUtilities.Components.Undo.Models.UndoManager();
            this._undoManagerView = new MathUtilities.Components.Undo.Views.UndoManager({ el: this.el });

            this._undoManagerView.on('undo:actionPerformed', function () {
                self._callUndo();
            });
            this._undoManagerView.on('redo:actionPerformed', function () {
                self._callRedo();
            });


            el.find('.custom-button-text').attr('unselectable', 'on');
            el.find('#error-holder').attr('data-display-flag', 'hide');

            this.setState(this.toolbarState);
            this._listenEvents();
            $el.on('change','#task-dropdown', $.proxy(self._onDropdownChange, self));
            this._initAccessibility();

            this._createCustomComboboxes();

            this._chooseTaskView._updateMatrixFocusRect('first');

            this.render();
            tooltipElems = {
                'undo':'bottom',
                'redo':'bottom',
                'math-tool-save-btn-icon-6':'top',
                'math-tool-open-btn-icon-6':'top',
                'math-tool-screenshot-btn-icon-6':'top',
                'math-tool-print-btn-icon-6':'top',
                'math-tool-btn-help-6':'bottom',
                'math-tool-btn-restore-6':'bottom',
                'math-tool-btn-hide-6':'bottom',
                'math-tool-btn-close-6': 'bottom'
                };
            tooltipElemsLength = tooltipElems.length;
            for(elemId in tooltipElems){
                undoOptions = {
                    'id': elemId + '-tooltip',
                    'text': self.accManagerView.getMessage(elemId + '-tooltip',0),
                    'position':tooltipElems[elemId],
                    'tool-holder': self.$el.parents('.tool-holder')
                };
                tooltipView = MathUtilities.Components.CustomTooltip.generateTooltip(undoOptions);
                if ('ontouchstart' in window) {
                    $('#' + elemId).on('touchstart', $.proxy(tooltipView.showTooltip, tooltipView)).on('touchend', $.proxy(tooltipView.hideTooltip, tooltipView));
                }
                else {
                    $('#' + elemId).on('mouseenter', $.proxy(tooltipView.showTooltip, tooltipView)).on('mouseleave', $.proxy(tooltipView.hideTooltip, tooltipView));
                }
            }
           
            if (this.options.data) {
                if (typeof (this.options.data.toolState) !== undefined) {
                    this.retrieveState(this.options.data.toolState);
                }
                else {
                    this.retrieveState(this.options.data);
                }
            }
        },

        /**
       * Instantiates Accessibility view
       * @method _initAccessibility
       */
        _initAccessibility: function _initAccessibility() {
            var self = this,
                isTouchSupported = "ontouchend" in document,
                elementsArray,
                tabIndex,
                elementCount,
                accJsonData,
                startTabIndex = this.options.startTabIndex;

            //store accessibility data.
            accJsonData = this.options.accJsonData;

            // create Model object
            this.accManagerModel = new MathUtilities.Components.Manager.Models.Manager({ isWrapOn: false, startTabindex: startTabIndex });

            //Parse Model  
            this.accManagerModel.parse(accJsonData);

            //accessibility is on or off
            if (this.options.bAllowAccessibility || isTouchSupported) {
                this.accManagerModel.isAccessible = this.options.bAllowAccessibility;
                this.isAccesibilityOn = this.options.bAllowAccessibility;
            }
            else {
                this.accManagerModel.isAccessible = false;
                this.isAccesibilityOn = false;
            }

            //TODO : add manager class
            $('#tool-holder-6').addClass('math-utilities-manager').attr('role', 'application');

            //TODO:el change
            //create Model view
            self.accManagerView = new MathUtilities.Components.Manager.Views.Manager({ el: $('#tool-holder-6'), model: this.accManagerModel });

            //load matrix screen
            self.loadScreen('Matrix-tool');

            //load button screen
            self.loadScreen('buttons');

            //load screen for common buttons
            self.loadScreen('tool-holder');

            self.loadScreen('input-value-screen');

            self.loadScreen('result-value-screen');


            //remove loc data of custom buttons
            this.setLocMessage('go-btn', null);
            this.setLocMessage('use-result-btn', null);

            //initial tab -index of editable div
            tabIndex = this.getTabIndex('first') + 15;

            //code to add first and second matrix cell
            this.$el.find('.first-rows,.second-rows ').each(function () {
                var columNo = 1,
                    $currentRow = $(this),
                    object;

                $currentRow.find('.matrix-cell').each(function () {
                    object = {
                        "elementId": $(this).attr('id'),
                        "accId": $(this).attr('id'),
                        "type": "editable",
                        "isWrapOn": true,
                        "selector": "#" + $(this).find('.element-holder').attr('id'),
                        "tabIndex": tabIndex,
                        "messages": [{
                            "id": "0",
                            "isAccTextSame": false,
                            "message": {
                            }
                        }]
                    };
                    //elementsArray.push(object);
                    tabIndex = tabIndex + 15;

                    self.createAccDiv(object);

                    self._changeCellMessage($(this).attr('id'));

                });
            });
            if (this.isAccesibilityOn) {
                this._accessibilityOn();
            }


            //
            for (var screenCounter = 0; screenCounter < accJsonData.length; screenCounter++) {
                if (accJsonData[screenCounter].id === "error-screen") {
                    var errorData = accJsonData[screenCounter];
                    this._createErrorObject(errorData);
                    break;
                }
            }

        },
        /**
        * attach different event for accessibility
        * @method _accessibilityOn
        * @private
        */
        _accessibilityOn: function _accessibilityOn() {
            var $el = this.$el,
                    self = this,
                    firstMatrixDisableId = [],
                    secondMatrixDisableId = [],
                    firstMatrixTabDisablefunc,
                    secondMatrixTabDisablefunc,
                    elementCount,
                    enableSliderHandler;

            //attach click event to  matrix container,
            //to enable tab index of internal cell and to set focus to first element
            $el.find('.matrix-container').on('click', function (event) {

                var currentId = event.target.id;
                if (currentId === 'first') {
                    self.enableMatrix('first', true);
                    //set focus to first cell of first Matrix
                    self.setFocus('first-11-cell');
                }
                else if (currentId === 'second') {
                    self.enableMatrix('second', true);
                    //set focus to first cell of second Matrix
                    self.setFocus('second-11-cell');
                }
            });

            //attach focusIn event to element to disable firstMatrix section inner element
            firstMatrixDisableId = ['first', 'go-btn', 'second-slider-box-vertical', 'scalar-holder'];
            firstMatrixTabDisablefunc = function () {
                self.enableMatrix('first', false);
            }

            for (elementCount = 0; elementCount < firstMatrixDisableId.length; elementCount++) {
                //attach focus function to disable first matrix section 
                self.accManagerView.focusIn(firstMatrixDisableId[elementCount], firstMatrixTabDisablefunc);
            }

            //attach focusIn event to element to disable firstMatrix section inner element
            secondMatrixDisableId = ['second', 'go-btn'];
            secondMatrixTabDisablefunc = function () {
                self.enableMatrix('second', false)
            }

            for (elementCount = 0; elementCount < secondMatrixDisableId.length; elementCount++) {
                //attach focus function to disable second matrix section 
                self.accManagerView.focusIn(secondMatrixDisableId[elementCount], secondMatrixTabDisablefunc);
            }


            $el.find('.matrix-cell').on('keydown', function (event) {
                var keyCode = event.keyCode,
                    matrixId;
                if (keyCode === 27) {
                    matrixId = $(this).parents('.matrix-container').attr('id');
                    self.setFocus(matrixId);
                }
            });

            //disable tab index for first and second matrices
            this.enableMatrix('first', false);
            this.enableMatrix('second', false);

            //set calculation holder acc message
            this._changeCalcultionHolderAccMessage();

            //change slider message
            this._changeSliderAccMessage('first');
            this._changeSliderAccMessage('second');

            //disable reult tabIndex
            this.enableTab('result', false);


            //disable useResult
            this.enableTab('use-result-btn', false);

            //set acc Message of Matrices
            this._changeMatrixAccMessage('first');
            this._changeMatrixAccMessage('second');


            var undoRedoDisableIds = ['go-btn', 'undo']
            for (elementCount = 0; elementCount < undoRedoDisableIds.length; elementCount++) {
                this.accManagerView.focusIn(undoRedoDisableIds[elementCount], $.proxy(this._enableUndoRedo, this));
            }

            this.updateFocusRect('math-title-text-6');
            //set title as default focus
            this.setFocus('math-title-text-6', 60);

            this.$el.find('.element-holder').attr('tabindex', '-1');
        },
        /**
        * Enable or disable matrix-cell tab index
        * @method enableMatrix
        * @param matrix {string} id of matrix
        * @param isEnable {Boolean} if true enable,else disable
        */
        //TODO:make it private
        enableMatrix: function enableMatrix(matrix, isEnable) {
            var $el = this.$el,
                self = this,
                cellId;

            $el.find('#' + matrix).find('.matrix-cell').each(function () {
                cellId = $(this).attr('id');
                self.enableTab(cellId, isEnable);
            });
        },

        /**
        * Chainable function.
        * @method render
        * @chainable
        * @return {Object}
        */
        render: function render() {
            return this;
        },
        /*
        * listen to event trigger by child view
        * @method _listenEvents
        */
        _listenEvents: function _listenEvents() {
            var matrixData, redoData, undoData;
            this.listenTo(this._chooseTaskView, 'undoRedoRegister', function (data) {
                if (data.actionName === 'sliderValueChange') {
                    data.undoRedoData.undo.matrixData = this.model.get('saveToolState');
                    matrixData = this._getMatrixData();
                    redoData = data.undoRedoData.redo;
                    redoData.matrixData = matrixData;

                    //change slider accessibility message
                    this._changeSliderAccMessage(redoData.sliderPosition, redoData.isVerticalSlider, redoData.sliderValue);

                    //change Acc Messsage of matrix
                    this._changeMatrixAccMessage(redoData.sliderPosition);

                    //read slider value
                    this._readSliderValue(redoData.sliderPosition, redoData.isVerticalSlider);
                }
                else if (data.actionName === 'dropdownValueChange') {
                    undoData = data.undoRedoData.undo;
                    undoData.matrixData = this.model.get('saveToolState');
                    undoData.matrixData.task.index = parseInt(undoData.dropdownValue);
                    matrixData = this._getMatrixData();
                    redoData = data.undoRedoData.redo;
                    redoData.matrixData = matrixData;
                    redoData.matrixData.task.index = parseInt(redoData.dropdownValue);
                }

                this.execute(data.actionName, data.undoRedoData);
            });
            this.listenTo(this._chooseTaskView, 'saveToolState', function () {
                matrixData = this._getMatrixData();
                this.model.set('saveToolState', matrixData);
            });



            //attach this listener to change cell acc text
            this.listenTo(this._chooseTaskView, 'cellDataChange', $.proxy(this._changeCellMessage, this));

            //attach this listener to updte focusRect size
            this.listenTo(this._chooseTaskView, 'updateFocusRect', $.proxy(this.updateFocusRect, this));

            //to change selector of cell when fraction is addded or remove
            this.listenTo(this._chooseTaskView, 'changeSelector', $.proxy(this.setSelector, this));

            this.listenTo(this._resultView, 'undoRedoRegister', function (data) {
                this.execute(data.actionName, data.undoRedoData);
            });
            this.listenTo(this._stepByStepView, 'undoRedoRegister', function (data) {
                this.execute(data.actionName, data.undoRedoData);
            });
        },

        /**
        * _callUndo calls undo function of UndoRedoManager
        * @method _callUndo
        * @return void
        * 
        */
        _callUndo: function callUndo() {
            var matrixTool = MathUtilities.Tools.MatrixTool.MatrixToolHolder.Views.MatrixToolHolder.MATRIX_TOOL;
            this._undoRedoManager.undo(matrixTool);
            this._enableUndoRedo();
        },

        /**
        * _callRedoc calls redo of UndoRedoManager
        * @method _callRedo
        * @return void
        */
        _callRedo: function callRedo() {
            var matrixTool = MathUtilities.Tools.MatrixTool.MatrixToolHolder.Views.MatrixToolHolder.MATRIX_TOOL;
            this._undoRedoManager.redo(matrixTool);
            this._enableUndoRedo();
        },

        /**
        * Action to be performed on submit button click.
        * @method goButtonClick
        * @private
        */
        goButtonClick: function () {
            var firstArray = new MatrixData(this.dataInMatrixForm('first-rows', 'value', false, true)),
                secondArray = new MatrixData(this.dataInMatrixForm('second-rows', 'value', false, true)),
                dropdownValue = arguments[0],
                dataArray = null,
                scalarValue = 0,
        //                tempHolder = null,
                matData = '',
                tempArray = null,
                inverseArray = null,
                tempAns = null,
                rows = 0,
                columns = 0,
                answer = null,
                resultData = null,
        //                numNumerator = 0,
        //                numDenominator = 0,
        //                determinant = 0,
            //                rows = 0,
        //                coln = 0,
        //                identityMatrix = [],
                checkMatricesData,
                getScalar,
        //                multiDimData = null,
                actualData = null,
                undoData = {},
                redoData = {},
                errorFocusRect,
                e, p, k, j, td, i;

            /*call checkMatrices to check if matrix cell is empty*/
            checkMatricesData = this.checkMatrices();
            if (checkMatricesData === false) {
                return;
            }

            /*call getScalar to get scalar value also to check if it contain number*/
            if ($('#scalar-holder').css('display') !== 'none') {
                getScalar = this.getScalar();
                if (getScalar.isProperFormat === false) {
                    errorFocusRect = this._focusRectForError(getScalar.errorCode);
                    this._displayErrorMessage(getScalar.errorMessage, errorFocusRect, false);
                    return;
                }
                scalarValue = getScalar.scalarValue;
            }

            undoData.answer = this._chooseTaskView.model.get('answer');
            undoData.answerDataArray = this.model.get('resultDataArray');
            undoData.matData = this.model.get('matData');
            undoData.matrixData = this._getMatrixData();

            try {
                switch (dropdownValue) {
                    case '0':
                        dataArray = this.model._calculateInverse(firstArray);
                        if (dataArray === undefined) {
                            e = {};
                            //e.message = 'The inverse of the matrix cannot be determined as it is a singular matrix.';
                            e.code = this._ERROR_MESSAGE.MATRIX_IS_SINGULAR.code;
                            throw e;
                        }

                        firstArray.inverse();

                        dataArray = MatrixUtils.toMatrix(dataArray);//dataArray.toMatrix();
                        answer = dataArray.___getElements();
                        rows = dataArray.rows();
                        columns = dataArray.columns();
                        break;

                    case '1':
                        dataArray = firstArray.transpose();
                        answer = dataArray.___getElements();
                        rows = dataArray.rows();
                        columns = dataArray.columns();
                        break;

                    case '2':
                        answer = firstArray.det();
                        answer = parseFloat(answer.toFixed(2));
                        break;

                    case '3':
                        dataArray = firstArray.add(secondArray);
                        answer = dataArray.___getElements();
                        rows = dataArray.rows();
                        columns = dataArray.columns();
                        break;

                    case '4':
                        dataArray = firstArray.subtract(secondArray);
                        answer = dataArray.___getElements();
                        rows = dataArray.rows();
                        columns = dataArray.columns();
                        break;

                    case '5':
                        dataArray = firstArray.multiply(secondArray);
                        answer = dataArray.___getElements();
                        rows = dataArray.rows();
                        columns = dataArray.columns();
                        break;

                    case '6':
                        dataArray = firstArray.scale(scalarValue);
                        answer = dataArray.___getElements();
                        rows = dataArray.rows();
                        columns = dataArray.columns();
                        break;

                    case '7':
                        tempArray = this.model._calculateInverse(secondArray);

                        if (tempArray === undefined) {
                            e = {};
                            //e.message = 'The inverse of the matrix cannot be determined as it is a singular matrix.';
                            e.code = this._ERROR_MESSAGE.SECOND_MATRIX_IS_SINGULAR.code;
                            throw e;
                        }

                        secondArray.inverse();

                        tempArray = MatrixUtils.toMatrix(tempArray);//tempArray.toMatrix();
                        tempAns = tempArray.___getElements();
                        rows = tempArray.rows();
                        columns = tempArray.columns();
                        inverseArray = new MatrixData(tempAns, rows, columns);
                        dataArray = firstArray.multiply(inverseArray);
                        answer = dataArray.___getElements();
                        break;

                }

                this._chooseTaskView.model.set('answer', answer);
                this.model.set('resultDataArray', dataArray);

                if (answer.length !== undefined) {
                    matData = dataArray.stringify('$', '@');
                    resultData = this._resultView.renderResult(matData, answer);
                    actualData = this._resultView.renderResult(matData, answer);

                    //multiDimData = this.model._getElementsInMultiDimensionalArray(answer, rows, columns);
                    p = 0;
                    for (k = 0; k < actualData.length; k++) {
                        td = actualData[k].td;
                        for (j = 0; j < td.length; j++) {
                            //if (multiDimData[k + 1] !== undefined) {
                            actualData[k].td[j].text = answer[p];
                            p++;
                            //}
                        }
                    }

                    this.saveResultData(resultData, this.dataInMatrixForm('first-rows', 'object', true), actualData);

                    this.disableUseResult(false);

                    for (i = 0; i < answer.length; i++) {
                        if ((-99.99 > answer[i]) || (answer[i] > 99.99)) {
                            this.disableUseResult(false);
                        }
                    }
                    this.model.set('matData', matData);

                    this._changeResultAccMessage();

                    this.enableResultAcc(true);
                    //$('.math-utilities-tools-matrix #use-result-btn-holder').css('margin-left', '80px');
                }
                else {
                    this.disableUseResult(true);
                    this._resultView.renderResult('', answer);
                    this._changeResultAccMessage();

                    this.enableResultAcc(true);
                    //$('.math-utilities-tools-matrix #use-result-btn-holder').css('margin-left', '30px');
                }
                redoData.answer = answer;
                redoData.answerDataArray = dataArray;
                redoData.matData = matData;
                redoData.matrixData = this._getMatrixData();

                if (!this._matchMatrices(undoData.matrixData.resultMatrix, redoData.matrixData.resultMatrix)) {
                    this.execute('goButtonClick', { undo: undoData, redo: redoData });
                }

                this._changeResultAccMessage();
                if (this.isAccesibilityOn) {
                    this.setFocus('result');
                }

            }
            catch (e) {
                var focusRect = this._focusRectForError(e.code);
                var errorMessage = this._getErrorMessage(e.code);
                this._displayErrorMessage(errorMessage, focusRect, false);
            }

            $('.element-holder').blur();
        },

        /**
        * Returns data in the form required for Matrix calculations.
        * @method dataInMatrixForm
        * @returns {Array}
        * @private
        */
        dataInMatrixForm: function (className, dataReqd, allData, retriveAttrData) {
            var matRows = $('.' + className),
                matRowsLen = matRows.length,
                matVisibleRows = [],
                matrixFormData = [],
                tempElemHolder = [],
                tempRowHolder = [],
                i = 0,
                j = 0,
                k = 0,
                numerator = null,
                denom = null,
                numNumerator = null,
                numDenominator = null,
                divAnswer = null,
                condition = null;

            for (; i < matRowsLen; i++) {
                if (allData) {
                    condition = true;
                }
                else {
                    condition = $(matRows[i]).css('display') !== 'none';
                }
                if (condition) {
                    matVisibleRows.push(matRows[i]);
                }
            }

            for (; j < matVisibleRows.length; j++) {

                tempElemHolder = $(matVisibleRows[j]).find('.element-holder');

                for (k = 0; k < tempElemHolder.length; k++) {
                    if (allData) {
                        condition = true;
                    }
                    else {
                        condition = $(tempElemHolder[k]).css('display') !== 'none';
                    }

                    if (condition) {

                        if (retriveAttrData) {
                            if (!$(tempElemHolder[k]).hasClass('numerator') && !$(tempElemHolder[k]).hasClass('denominator')) {
                                tempRowHolder.push(Number($(tempElemHolder[k]).attr('data-content')));
                            }
                        }
                        else {
                            numerator = $(tempElemHolder[k]).find('.numerator');
                            denom = $(tempElemHolder[k]).find('.denominator');

                            if (numerator.length !== 0 && denom.length !== 0 && !$(tempElemHolder[k]).hasClass('numerator') && !$(tempElemHolder[k]).hasClass('denominator')) {
                                numNumerator = Number(numerator.text());
                                numDenominator = Number(denom.text());
                                divAnswer = (numNumerator / numDenominator).toFixed(2);

                                if (dataReqd === 'value') {
                                    tempRowHolder.push(Number(divAnswer));
                                } else {
                                    tempRowHolder.push(tempElemHolder[k]);
                                }

                            }
                            else if (!$(tempElemHolder[k]).hasClass('numerator') && !$(tempElemHolder[k]).hasClass('denominator')) {

                                if (dataReqd === 'value') {
                                    tempRowHolder.push(Number($(tempElemHolder[k]).text()));
                                } else {
                                    tempRowHolder.push(tempElemHolder[k]);
                                }
                            }
                        }
                    }
                }

                matrixFormData.push(tempRowHolder);
                tempRowHolder = [];
            }

            return matrixFormData;
        },


        /**
        * Disable 'Use Result' button.
        * @method disableUseResult
        * @private
        */
        disableUseResult: function (disableBtn) {
            if (disableBtn) {
                this.model.get('useResultView').setButtonState(MathUtilities.Components.Button.BUTTON_STATE_DISABLED);
                $('#use-result-btn').off('click.matrix', $.proxy(this.onUseResultClick, this)).attr('state', 'buttonDisable');
            }
            else {
                this.model.get('useResultView').setButtonState(MathUtilities.Components.Button.BUTTON_STATE_ACTIVE);
                $('#use-result-btn').off('click.matrix').on('click.matrix', $.proxy(this.onUseResultClick, this)).attr('state', 'buttonEnable');
            }
            this.enableUseResult(!disableBtn);
        },


        /**
        */
        enableResultAcc: function enableResultAcc(isEnable) {
            if (this.isAccesibilityOn) {
                this.enableTab('result', isEnable);
                this.updateFocusRect('result');
            }
        },
        /**
        */
        enableUseResult: function enableUseResult(isEnable) {
            if (this.isAccesibilityOn) {
                this.enableTab('use-result-btn', isEnable);
            }
        },
		
		"isPrecisionGreaterThanTwo": function(value) {
			var indexOfE = value.indexOf('e'),
				indexOfDot = value.indexOf('.'),
				PRECISION = 2;
				
				if(indexOfE !== -1 && Math.abs(Number(value.substring(indexOfE))) > PRECISION ||
					indexOfDot !== -1 && (value.length - indexOfDot - 1) > PRECISION) {
					return true;
				}
				return false;
		},
		
		"displayWarning": function(answer) {
			var r, errorCode, errorFocusRect, errorMessage,
				len = answer.length;			
            this.$("#use-result-error-holder").hide();
            for (r = 0; r < len; r++) {
                if (this.isPrecisionGreaterThanTwo(answer[r].toString())) {
                    errorCode = this._ERROR_MESSAGE.RESULT_VALUE_PRECISION_MORE_THAN_TWO_DECIMAL_PLACES.code;
                    errorFocusRect = this._focusRectForError(errorCode);
                    errorMessage = this._getErrorMessage(errorCode);
                    this._displayErrorMessage(errorMessage, errorFocusRect, true, true);
					break;
                }
            }
		},

        /**
        * Action to be performed on 'Use Result' button click.
        * @method onUseResultClick
        * @private
        */
        onUseResultClick: function () {
            var answer = this._chooseTaskView.model.get('answer'),
                errorData,
                errorMessage, errorFocusRect, errorCode;
            errorData = this._chooseTaskView.hideErrorMessage();
            for (var r = 0; r < answer.length; r++) {
                if ((-99.99 > answer[r]) || (answer[r] > 99.99)) {
                    //alert('Sorry answer is out of range');
                    errorCode = this._ERROR_MESSAGE.RESULT_OUT_OF_RANGE.code;
                    errorFocusRect = this._focusRectForError(errorCode);
                    errorMessage = this._getErrorMessage(errorCode);
                    this._displayErrorMessage(errorMessage, errorFocusRect, false);
                    return;
                }
            }

            //for (var k = 0; k < answer.length; k++) {
            //if ((-99.99 > answer[k]) || (answer[k] > 99.99)) {
            //    //alert('Sorry answer is out of range');
            //    $('#error-holder').css('display', 'block');
            //    $('#error-text').text('Sorry answer is out of range');
            //    break;
            //}
            //else {
            var resultData = this.model.get('resultData'),
                firstMatrix = this.model.get('firstMatrixList'),
                actualData = this.model.get('actualData'),
                td,
                i,
                j,
                resultRows,
                resultColums,
                undoData = {},
                redoData = {};

            undoData.matrixData = this._getMatrixData();
            undoData.errorData = errorData;

            resultRows = resultData.length;
            resultColums = resultData[0].td.length;
            for (i = 0; i < resultData.length; i++) {
                td = resultData[i].td;
                $(firstMatrix[i]).hide();
                for (j = 0; j < td.length; j++) {
                    $(firstMatrix[i][j]).show().attr('contenteditable', true).parent().show().parent().show();
                    $(firstMatrix[i][j]).attr('data-content', actualData[i].td[j].text);
                    $(firstMatrix[i][j]).attr('prev-data', resultData[i].td[j].text);
                    $(firstMatrix[i][j]).text(resultData[i].td[j].text);
                }
            }

            this._chooseTaskView.setSlider('firstMatrix', resultRows, resultColums);

            if (!this.isAccesibilityOn) {
                $('#first-11').focus();
                this._chooseTaskView.setCursor($('#first-11')[0], $('#first-11').text().length);
            }

            redoData.matrixData = this._getMatrixData();

            if (!this._matchMatrices(undoData.matrixData.firstMatrix, redoData.matrixData.firstMatrix)) {
                this.execute('useResultClick', { undo: undoData, redo: redoData });
            }

            this.setFocus('calculation-holder');
			
			this.displayWarning(answer);
			
            this._changeCalculationSectionAccMessages();
        },

        /**
        * Saves all the data required for saving result data.
        * @method saveResultData
        * @private
        */
        saveResultData: function (resultData, firstData, actualData) {
            this.model.set('resultData', resultData);
            this.model.set('firstMatrixList', firstData);
            this.model.set('actualData', actualData);
        },

        /**
        *display error if matrix is not in proper format
        *@method checkMatrices
        *@private
        */
        checkMatrices: function checkMatrices() {
            var firstMatrix = this.checkMatrixData('first-rows', 'value'),
                secondMatrix = this.checkMatrixData('second-rows', 'value');
            if (firstMatrix.isProperFormat === false) {
                this._displayErrorMessage(firstMatrix.errorMessage, firstMatrix.errorCell, false);
                this.enableMatrix('first', true);
                return false;
            }
            else if (secondMatrix.isProperFormat === false) {
                this._displayErrorMessage(secondMatrix.errorMessage, secondMatrix.errorCell, false);
                this.enableMatrix('second', true);
                return false;
            }
            return true;
        },

        /**
        * Check if matrix contain an empty string
        * @method checkMatrixData
        * @private
        */
        checkMatrixData: function checkMatrixData(className) {

            var matRows = $('.' + className),
                matRowsLen = matRows.length,
                matVisibleRows = [],
                tempElemHolder = [],
                i = 0,
                j = 0,
                k = 0,
                numerator = null,
                denom = null,
                isProperFormat = true,
                errorMessage,
                numVal,
                denomVal,
                numText,
                denomText,
                scalar,
                errorCell;

            for (; i < matRowsLen; i++) {
                if ($(matRows[i]).css('display') !== 'none') {
                    matVisibleRows.push(matRows[i]);
                }
            }

            outterLoop:
                for (; j < matVisibleRows.length; j++) {

                    tempElemHolder = $(matVisibleRows[j]).find('.element-holder');

                    for (k = 0; k < tempElemHolder.length; k++) {
                        if ($(tempElemHolder[k]).css('display') !== 'none') {

                            numerator = $(tempElemHolder[k]).find('.numerator');
                            denom = $(tempElemHolder[k]).find('.denominator');

                            if (numerator.length !== 0 && denom.length !== 0 && !$(tempElemHolder[k]).hasClass('numerator') && !$(tempElemHolder[k]).hasClass('denominator')) {
                                numText = numerator.text();
                                numVal = Number(numText);
                                denomText = denom.text();
                                denomVal = Number(denomText);
                                scalar = numVal / denomVal;
                                if (numText === '' || denomText === "") {
                                    errorMessage = this._getErrorMessage(this._ERROR_MESSAGE.EMPTY_CELL.code);
                                    isProperFormat = false;
                                    errorCell = $(tempElemHolder[k]).parents('.matrix-cell').attr('id');
                                    break outterLoop;
                                }
                                else if (isNaN(denomVal) || isNaN(scalar) || !isFinite(scalar) || isNaN(numVal)) {
                                    errorMessage = this._getErrorMessage(this._ERROR_MESSAGE.MATRIX_NO_INVALID.code);
                                    isProperFormat = false;
                                    errorCell = $(tempElemHolder[k]).parents('.matrix-cell').attr('id');
                                    break outterLoop;

                                }
                            }
                            else if (!$(tempElemHolder[k]).hasClass('numerator') && !$(tempElemHolder[k]).hasClass('denominator')) {
                                numText = $(tempElemHolder[k]).text();
                                numVal = Number(numText);
                                if (numText === '') {
                                    errorMessage = this._getErrorMessage(this._ERROR_MESSAGE.EMPTY_CELL.code);
                                    isProperFormat = false;
                                    errorCell = $(tempElemHolder[k]).parents('.matrix-cell').attr('id');
                                    break outterLoop;
                                }
                                else if (isNaN(numVal)) {
                                    errorMessage = this._getErrorMessage(this._ERROR_MESSAGE.MATRIX_NO_INVALID.code);
                                    isProperFormat = false;
                                    errorCell = $(tempElemHolder[k]).parents('.matrix-cell').attr('id');
                                    break outterLoop;
                                }
                            }
                        }
                    }
                }
            return { isProperFormat: isProperFormat, errorMessage: errorMessage, errorCell: errorCell };
        },
        /**
        *display error if matrix is not in proper format
        *@method getScalar
        *@private
        */
        getScalar: function getScalar() {

            var numNumerator,
                numDenominator,
                scalarValue,
                numText,
                denomText,
        //                scalarText,
                isProperFormat = true,
                errorMessage,
                errorSection,
                errorCode;

            if ($('#scalar-value').find('.numerator').length !== 0) {
                numText = $('#scalar-value').find('.numerator').text();
                denomText = $('#scalar-value').find('.denominator').text();
                numNumerator = Number(numText);
                numDenominator = Number(denomText);
                scalarValue = Number((numNumerator / numDenominator).toFixed(2));
                if (numText === '' || denomText === '') {
                    errorCode = this._ERROR_MESSAGE.EMPTY_CELL.code;
                    errorMessage = this._getErrorMessage(errorCode);
                    isProperFormat = false;
                }
                else if (isNaN(numDenominator) || isNaN(numNumerator) || isNaN(scalarValue) || !isFinite(scalarValue)) {
                    errorCode = this._ERROR_MESSAGE.SCALAR_INVALID.code;
                    errorMessage = this._getErrorMessage(errorCode);
                    isProperFormat = false;
                }
            }
            else {
                numText = $('#scalar-value').text();
                scalarValue = Number(numText);
                if (numText === '') {
                    errorCode = this._ERROR_MESSAGE.EMPTY_CELL.code;
                    errorMessage = this._getErrorMessage(errorCode);
                    isProperFormat = false;
                }
                else if (isNaN(scalarValue)) {
                    errorCode = this._ERROR_MESSAGE.SCALAR_INVALID.code;
                    errorMessage = this._getErrorMessage(errorCode);
                    isProperFormat = false;
                }
            }
            return { isProperFormat: isProperFormat, scalarValue: scalarValue, errorMessage: errorMessage, errorCode: errorCode };
        },
        _getMatrixData: function _getMatrixData() {
            var firstMatrix,
                secondMatrix,
                resultMatrix,
                $currentMatrix,
                scalar,
                rows,
                column,
                $currentRow,
                $currentColumn,
                $scalar,
                matrixContent,
                isVisible = true,
                cellContent,
                $task,
                taskContent = {},
                selectedIndex;

            //task information
            $task = $("#task-dropdown");
            selectedIndex = parseInt($task[0].selectedIndex.toString());

            taskContent = {
                index: selectedIndex,
                name: $task.text().trim()
            };


            //first matrix data
            rows = 0;
            matrixContent = [];

            $('#first-matrix-holder').find('.first-rows:visible').each(function () {
                $currentRow = $(this);

                column = 0;
                matrixContent[rows] = [];

                $currentRow.find('.matrix-cell:visible').each(function () {
                    $currentColumn = $(this);

                    cellContent = {};
                    if ($currentColumn.find('.fraction').length !== 0) {
                        cellContent.isFraction = true;
                        cellContent.numerator = $currentColumn.find('.numerator').text();
                        cellContent.denominator = $currentColumn.find('.denominator').text();
                        cellContent.dataContent = $currentColumn.find('.element-holder').attr('data-content');

                    }
                    else {
                        cellContent.isFraction = false;
                        cellContent.number = $currentColumn.find('.element-holder').text();
                        cellContent.dataContent = $currentColumn.find('.element-holder').attr('data-content');
                    }
                    matrixContent[rows][column] = cellContent;
                    column++;

                });
                rows++;

            });
            firstMatrix = {
                isVisible: isVisible,
                rows: rows,
                cols: column,
                content: matrixContent
            };

            //secondMatrixData
            $currentMatrix = $('#second-matrix-holder');
            isVisible = true;
            rows = 0;
            column = 0;
            matrixContent = [];
            if ($currentMatrix.is(':visible')) {
                isVisible = true;
                $currentMatrix.find('.second-rows:visible').each(function () {
                    $currentRow = $(this);

                    column = 0;
                    matrixContent[rows] = [];

                    $currentRow.find('.matrix-cell:visible').each(function () {
                        $currentColumn = $(this);

                        cellContent = {};
                        if ($currentColumn.find('.fraction').length !== 0) {
                            cellContent.isFraction = true;
                            cellContent.numerator = $currentColumn.find('.numerator').text();
                            cellContent.denominator = $currentColumn.find('.denominator').text();
                            cellContent.dataContent = $currentColumn.find('.element-holder').attr('data-content');

                        }
                        else {
                            cellContent.isFraction = false;
                            cellContent.number = $currentColumn.find('.element-holder').text();
                            cellContent.dataContent = $currentColumn.find('.element-holder').attr('data-content');

                        }
                        matrixContent[rows][column] = cellContent;
                        column++;

                    });
                    rows++;

                });
            }
            else {
                isVisible = false;
            }
            secondMatrix = {
                isVisible: isVisible,
                rows: rows,
                cols: column,
                content: matrixContent
            };

            //resultData
            $currentMatrix = $('.result-matrix-holder');
            isVisible = true;
            rows = 0;
            column = 0;
            matrixContent = [];
            if ($currentMatrix.is(':visible')) {
                isVisible = true;
                $currentMatrix.find('.result-rows:visible').each(function () {
                    $currentRow = $(this);

                    column = 0;
                    matrixContent[rows] = [];

                    $currentRow.find('.result-element-holder:visible').each(function () {
                        $currentColumn = $(this);

                        matrixContent[rows][column] = $currentColumn.text();
                        column++;

                    });
                    rows++;

                });
            }
            else {
                isVisible = false;
            }
            resultMatrix = {
                isVisible: isVisible,
                rows: rows,
                cols: column,
                content: matrixContent,
                answer: this._chooseTaskView.model.get('answer'),
                matData: this.model.get('matData')
            };

            //scalar data
            $scalar = $('#scalar-holder');
            if ($scalar.is(':visible')) {
                isVisible = true;
                cellContent = {};
                if ($scalar.find('.fraction').length !== 0) {
                    cellContent.isFraction = true;
                    cellContent.numerator = $scalar.find('.numerator').text();
                    cellContent.denominator = $scalar.find('.denominator').text();

                }
                else {
                    cellContent.isFraction = false;
                    cellContent.number = $scalar.find('.element-holder').text();

                }
            }
            else {
                isVisible = false;
            }
            scalar = {
                isVisible: isVisible,
                content: cellContent
            };

            return {
                firstMatrix: firstMatrix,
                secondMatrix: secondMatrix,
                resultMatrix: resultMatrix,
                scalar: scalar,
                task: taskContent
            };
        },
        /**
        *Display error Messages
        *@method _displayErrorMessage
        */
        "_displayErrorMessage": function (errorMessage, focusRect, skipUndoRedoRegistration, resultErrorCode) {

            var undoData = {},
                redoData = {},
				$errorHolder = resultErrorCode ? $('#use-result-error-holder') : $('#error-holder'),
				$errorText = resultErrorCode ? $('#use-result-error-text') : $('#error-text'),
                errorAccText = "";


            undoData.actionType = 'hideError';
            undoData.errorMessage = $errorHolder.text();
            undoData.dataFlag = $('#error-holder').attr('data-display-flag');


            $errorHolder.show().attr('data-display-flag', 'show');;
            $errorText.text(errorMessage);


            redoData.actionType = 'showError';
            redoData.errorMessage = errorMessage;
            redoData.dataFlag = $errorHolder.attr('data-display-flag');

            if (skipUndoRedoRegistration !== true && undoData.errorMessage !== redoData.errorMessage) {
                this.execute('errorMessageDisplay', { undo: undoData, redo: redoData });
            }
            if(resultErrorCode){
                errorAccText = this.accManagerView.getAccMessage("resultValuePrecisionMoreThanTwoDecimalPlaces", 0);
            }
            this._changeErrorAccMessage(focusRect, $errorHolder.attr('id'), errorAccText);
        },
        _getErrorMessage: function _getErrorMessage(errorCode) {
            var errorCodes = this._ERROR_MESSAGE,
                errorMessage = '';

            $.each(errorCodes, function (key, value) {
                if (value.code === errorCode) {
                    errorMessage = value.message;
                }
            });

            return errorMessage;
        },
        _setMatrixData: function _setMatrixData(matrix, matrixData) {
            var rows = matrixData.rows,
                            cols = matrixData.cols,
                            content = matrixData.content,
                            rowCounter = 1,
                            columnCounter = 1,
                            currentCellData,
                            $currentCell,
                            fractionHtml;

            for (; rowCounter <= rows; rowCounter++) {
                for (columnCounter = 1; columnCounter <= cols; columnCounter++) {
                    $currentCell = $('#' + matrix + '-' + rowCounter + '' + columnCounter);
                    currentCellData = content[rowCounter - 1][columnCounter - 1];

                    this._setCellValue($currentCell, currentCellData);
                }
            }
        },
        /**
        * set value of current cell
        * @method _setCellValue
        * @param {object} cell jquery object
        * @param {object} cell value
        * @private
        */
        _setCellValue: function _setCellValue($currentCell, cellData) {
            var fractionHtml,
                cellId = $currentCell.attr('id');
            if (cellData.isFraction === true) {
                fractionHtml = MathUtilities.Tools.MatrixTool.templates['fraction-ui']({
                    numeratorText: cellData.numerator,
                    fractionId: cellId + '-fraction',
                    numeratorId: cellId + '-numerator',
                    denominatorId: cellId + '-denominator'
                }).trim();

                $currentCell.html(fractionHtml);
                $currentCell.attr('contenteditable', false).attr('data-content', cellData.dataContent);
                $currentCell.find('.numerator').text(cellData.numerator).attr('contenteditable', true);
                $currentCell.find('.denominator').text(cellData.denominator).attr('contenteditable', true);
            }
            else {
                $currentCell.text(cellData.number).attr('contenteditable', true).attr('data-content', cellData.dataContent);
            }
        },
        /**
        * change calculation holder acc message
        * @method _changeCalcultionHolderAccMessage
        * @private
        */
        _changeCalcultionHolderAccMessage: function _changeCalcultionHolderAccMessage() {
            var $el = this.$el,
                $row1, $row2,
                rowCount1, columnCount1, rowCount2, columnCount2;

            //first matrix data
            $row1 = this.$('.first-rows:visible');
            rowCount1 = $row1.length;
            columnCount1 = $($row1[0]).find('.matrix-cell:visible').length;

            //second Matrix data
            $row2 = this.$('.second-rows:visible');
            rowCount2 = $row2.length;
            columnCount2 = $($row2[0]).find('.matrix-cell:visible').length;

            if (this.$('#second-matrix-holder').is(':visible')) {
                this.changeAccMessage('calculation-holder', 1, [rowCount1, columnCount1, rowCount2, columnCount2]);
            }
            else if (this.$('#scalar-holder').is(':visible')) {
                this.changeAccMessage('calculation-holder', 2, [rowCount1, columnCount1]);
            }
            else {
                this.changeAccMessage('calculation-holder', 0, [rowCount1, columnCount1]);
            }
        },

        /**
        * change accessibility message of all elements presents in calculation-holder
        * @method _changeCalculationSectionAccMessages
        * @private
        */
        _changeCalculationSectionAccMessages: function _changeCalculationSectionAccMessages() {
            //change acc message of matrices
            this._changeMatrixAccMessage('first');
            this._changeMatrixAccMessage('second');

            //change accMessage of calculation holder
            this._changeCalcultionHolderAccMessage();

            //change slider accMessages
            this._changeSliderAccMessage('first');
            this._changeSliderAccMessage('second');

            //change scalar acc Messsage 
            this._changeCellMessage('scalar-holder');

            //change acc-message of each cell
            this._changeMatrixCellsMessage('first');
            this._changeMatrixCellsMessage('second');

        },


        // undo redo 
        /**
        * execute method for registering and handling undoredo functionality
        * @method execute
        * @param actionName {String}
        * @param undoRedoData {Object}
        * @return void
        * 
        */
        execute: function execute(actionName, undoRedoData, skipRegistration) {
            var undoAction,
                redoAction,
                matrixTool,
                matData,
                resultData,
                actualData,
                answer,
                dataArray,
                sliderValue,
                firstMatrixData,
                visibleRows,
                visibleColumn,
                matrixContent,
                rowCounter,
                columnCounter,
                $currentCell,
                $currentRow,
                cellText,
                htmlTemplate,
                p, k, td, j, i,
                message,
                matrixCellId,
                sliderId;


            if (skipRegistration) {
                switch (actionName) {
                    case 'goButtonClick':
                        var length = undoRedoData.matrixData.resultMatrix.content.length;
                        //if (length === 0) {
                        //    $('.math-utilities-tools-matrix #use-result-btn-holder').css('margin-left', '30px');
                        //}
                        //else {
                        //    $('.math-utilities-tools-matrix #use-result-btn-holder').css('margin-left', '80px');
                        //}
                        this._setResult(undoRedoData);


                        //for accessibility change result acc message
                        this._changeResultAccMessage();

                        //for accessibility set focus to calculation holder
                        this.setFocus('calculation-holder');
                        break;

                    case 'sliderValueChange':
                        sliderId = undoRedoData.sliderPosition;
                        if (undoRedoData.isVerticalSlider === true) {
                            sliderId += '-vertical-slider-handler';
                            sliderValue = parseInt(undoRedoData.sliderValue, 10);
                            //                            $('#' + undoRedoData.sliderPosition + '-slider-box-vertical').attr('isundoRedoAction', true);
                            this._chooseTaskView.setSlider(undoRedoData.sliderPosition + 'Matrix', 5 - sliderValue);
                            //                            $('#' + undoRedoData.sliderPosition + '-slider-box-vertical').attr('isundoRedoAction', false);
                            if (undoRedoData.sliderPosition === 'first') {
                                this._setMatrixData('first', undoRedoData.matrixData.firstMatrix);
                            }
                            else {
                                this._setMatrixData('second', undoRedoData.matrixData.secondMatrix);
                            }

                        }
                        else {
                            sliderId += '-horizontal-slider-handler';
                            sliderValue = parseInt(undoRedoData.sliderValue, 10);
                            //                            $('#' + undoRedoData.sliderPosition + '-slider-box-horizontal').attr('isundoRedoAction', true);
                            this._chooseTaskView.setSlider(undoRedoData.sliderPosition + 'Matrix', undefined, sliderValue + 1);
                            //                            $('#' + undoRedoData.sliderPosition + '-slider-box-horizontal').attr('isundoRedoAction', false);
                            if (undoRedoData.sliderPosition === 'first') {
                                this._setMatrixData('first', undoRedoData.matrixData.firstMatrix);
                            }
                            else {
                                this._setMatrixData('second', undoRedoData.matrixData.secondMatrix);
                            }
                        }
                        this._changeErrorDisplay(undoRedoData.errorData, true);

                        //for accessibility change slider acc message
                        //this._changeSliderAccMessage(undoRedoData.sliderPosition);

                        this._changeCalculationSectionAccMessages();

                        //for accessibility set focus to slider handler
                        this.setFocus(sliderId);

                        break;

                    case 'dropdownValueChange':

                        $('#task-dropdown').attr('undoRedoAction', true);
                        //$('#task-dropdown').prop('selectedIndex', parseInt(undoRedoData.dropdownValue, 10));


                        this._changeErrorDisplay(undoRedoData.errorData, true);
                        this._retrieveMatrixState(undoRedoData.matrixData);

                        //for accessibility change calculation section acc message
                        this._changeCalculationSectionAccMessages();

                        //for accessibility set focus to drop-down
                        this.setFocus('task-dropdown');

                        $('#task-dropdown').attr('undoRedoAction', false);
                        break;

                    case 'CellDataChange':

                        $currentCell = $('#' + undoRedoData.cell);

                        $currentCell.empty();
                        $currentCell.append(undoRedoData.cellHTML.trim());
                        $currentCell.attr('data-content', undoRedoData.dataContent);
                        //                        $('.element-holder').text(0).attr('contenteditable', true)
                        if ($currentCell.find('.fraction').length !== 0) {
                            $currentCell.find('.numerator').attr('contenteditable', true);
                            $currentCell.find('.denominator').attr('contenteditable', true);
                        }
                        else {
                            $currentCell.attr('contenteditable', true);
                        }

                        this._changeErrorDisplay(undoRedoData.errorData, true);

                        //for accessibility change cell acc Message
                        matrixCellId = $currentCell.parents('.matrix-cell').attr('id');

                        //this._changeCellMessage(matrixCellId);
                        this._changeCalculationSectionAccMessages();

                        //enable both matrices so that tab flow continue
                        if (matrixCellId) {
                            this.enableMatrix('first');
                            this.enableMatrix('second');
                        }

                        //set focus to cell
                        this.setFocus(matrixCellId || 'scalar-holder');

                        break;

                    case 'useResultClick':
                        firstMatrixData = undoRedoData.matrixData.firstMatrix;
                        visibleRows = firstMatrixData.rows;
                        visibleColumn = firstMatrixData.cols;
                        matrixContent = firstMatrixData.content;
                        //for (rowCounter = 1; rowCounter <= 5; rowCounter++) {
                        //    $currentRow = $('#first-' + rowCounter);
                        //    if (rowCounter <= visibleRows) {
                        //        for (columnCounter = 1; columnCounter <= 5; columnCounter++) {
                        //            $currentCell = $('#first-' + rowCounter + '' + columnCounter);
                        //            if (columnCounter <= visibleColumn) {
                        //                cellText = matrixContent[rowCounter - 1][columnCounter - 1];
                        //                if (cellText.isFraction === true) {
                        //                    htmlTemplate = MathUtilities.Tools.MatrixTool.templates['fraction-ui']({
                        //                        numeratorText: cellText.numerator
                        //                    }).trim();

                        //                    $currentCell.html(htmlTemplate);
                        //                    $currentCell.attr('contenteditable', false);
                        //                    $currentCell.attr('data-content', cellText.dataContent);
                        //                    $currentCell.find(' .numerator').text(cellText.numerator);
                        //                    $currentCell.find(' .denominator').text(cellText.denominator);
                        //                }
                        //                else {
                        //                    $currentCell.show().text(cellText.number).attr('data-content', cellText.dataContent);
                        //                }
                        //            }
                        //            else {
                        //                $currentCell.hide();
                        //            }
                        //        }
                        //    }
                        //    else {
                        //        $currentRow.hide();
                        //    }
                        //}

                        this._setMatrixData('first', firstMatrixData);
                        this._chooseTaskView.setSlider('firstMatrix', visibleRows, visibleColumn);
                        //                        this._chooseTaskView.model.set('answer', undoRedoData.matrixData.resultMatrix.answer);
                        this._changeErrorDisplay(undoRedoData.errorData, true);

                        //for accessibility change acc text of first matrix
                        //this._changeMatrixAccMessage('first');
                        this._changeCalculationSectionAccMessages();

                        //for accessibility set focus to first matrix container
                        
						this.displayWarning(new MatrixData(this.dataInMatrixForm('first-rows', 'object', false, true)).___getElements());
						//___getElements function return matrix data in array format.
                        if(!this.$("#use-result-error-holder").is(":visible")){
                            this.setFocus('first');
                        }
                        break;

                    case 'showHideStep':
                        if (undoRedoData.actionType === 'showStep') {
                            this._resultView.onShowStepsClick(true);
                        }
                        else {
                            this._stepByStepView.onHideStepsClick(true);
                        }
                        break;
                    case 'collapseExpand':
                        if (undoRedoData.actionType === 'collapse') {
                            this._chooseTaskView.onCollapseClick(true);
                        }
                        else {
                            this._chooseTaskView.onExpandClick(true);
                        }
                        break;
                    case 'errorMessageDisplay':
                        if (undoRedoData.actionType = 'hideError') {
                            if (undoRedoData.dataFlag === 'hide') {
                                this._chooseTaskView.hideErrorMessage();

                                //for accessibilty set focus to container
                                this.setFocus('calculation-holder');
                            }
                            else {
                                this._displayErrorMessage(undoRedoData.errorMessage, true);

                                //for accessibility if error is changed set focus to error message
                                this.setFocus('error-holder');
                            }
                        }
                        else {
                            this._displayErrorMessage(undoRedoData.errorMessage, true);

                            //for accessibility if error is display set focus to error message
                            this.setFocus('error-holder');
                        }
                        break;
                }
            }
            else {
                undoAction = new MathUtilities.Components.Undo.Models.Action({
                    name: actionName,
                    data: undoRedoData.undo,
                    manager: this
                });

                redoAction = new MathUtilities.Components.Undo.Models.Action({
                    name: actionName,
                    data: undoRedoData.redo,
                    manager: this
                });
                matrixTool = MathUtilities.Tools.MatrixTool.MatrixToolHolder.Views.MatrixToolHolder.MATRIX_TOOL;
                this._undoRedoManager.registerAction(matrixTool, undoAction, redoAction);
            }
        },

        /**
        * saveState saves current Matix-tool state
        * @method saveState
        * @return void
        */
        saveState: function saveState() {
            var stateData = {};
            stateData = this._getMatrixData();

            return stateData;
        },
        /**
        * retrieveState retrieves saved Matrix state
        * @method retrieveState
        * @return void
        */
        retrieveState: function retrieveState(savedState) {
			if(typeof(savedState) !== 'undefined'){
				if(typeof(savedState.toolState) !== 'undefined'){
					savedState = savedState.toolState;
				}
			}
            var matrixTool = MathUtilities.Tools.MatrixTool.MatrixToolHolder.Views.MatrixToolHolder.MATRIX_TOOL;


            this._retrieveMatrixState(savedState);

            this._undoRedoManager.clearModule(matrixTool);

        },
        /**
        * set matrix state as given in data
        * @method _retrieveMatrixState
        * @param savedState {object} contain matrix state value
        * @private
        */
        _retrieveMatrixState: function _retrieveMatrixState(savedState) {
            var firstMatrixRows, firstMatrixCols, secondMatrixRows, secondMatrixCols, firstMatrix, secondMatrix, scalar, $el = this.$el, $dropDown;
            if (savedState !== undefined) {
                $dropDown = this.$('#task-dropdown');
                $dropDown.attr('undoRedoAction', true);
                $dropDown.prop('selectedIndex', parseInt(savedState.task.index, 10));
                $dropDown.attr('undoRedoAction', false);


                firstMatrix = savedState.firstMatrix;
                firstMatrixRows = firstMatrix.rows;
                firstMatrixCols = firstMatrix.cols;

                //set first Matrix Data
                this._chooseTaskView.setSlider('firstMatrix', firstMatrixRows, firstMatrixCols);
                this._setMatrixData('first', firstMatrix);


                secondMatrix = savedState.secondMatrix;
                secondMatrixRows = secondMatrix.rows;
                secondMatrixCols = secondMatrix.cols;

                //set second Matrix Data
                if (secondMatrix.isVisible === true) {
                    this._chooseTaskView.setSlider('secondMatrix', secondMatrixRows, secondMatrixCols);
                    this._setMatrixData('second', secondMatrix);
                }

                //set scalar value
                scalar = savedState.scalar;
                if (scalar.isVisible === true) {
                    this._setCellValue($('#scalar-value'), scalar.content);
                }

                this._setResult(savedState.resultMatrix);
            }
        },
        /**
        * set value for result data
        * @method _setResult
        * @param {object} resultData
        */

        _setResult: function _setResult(resultData) {
            var matData = resultData.matData,
                answer = resultData.answer,
                rowCounter,
                columnCounter,
                td,
                resultData,
                actualData,
                answerIndex;

            if (answer && answer.length !== undefined) {
                resultData = this._resultView.renderResult(matData, answer);
                actualData = this._resultView.renderResult(matData, answer);

                answerIndex = 0;
                for (rowCounter = 0; rowCounter < actualData.length; rowCounter++) {
                    td = actualData[rowCounter].td;
                    for (columnCounter = 0; columnCounter < td.length; columnCounter++) {
                        actualData[rowCounter].td[columnCounter].text = answer[answerIndex];
                        answerIndex++;
                    }
                }

                this.saveResultData(resultData, this.dataInMatrixForm('first-rows', 'object', true), actualData);

                this.disableUseResult(false);

                for (answerIndex = 0; answerIndex < answer.length; answerIndex++) {
                    if ((-99.99 > answer[answerIndex]) || (answer[answerIndex] > 99.99)) {
                        this.disableUseResult(false);
                    }
                }
                this.model.set('matData', matData);

                //disable tab index for result
                this.enableResultAcc(true);
                this._changeResultAccMessage();
            }
            else {
                this.disableUseResult(true);
                this._resultView.renderResult('', answer);

                //disable tab index for result
                this.enableResultAcc(false);
            }

            this._chooseTaskView.model.set('answer', answer);
        },
        /**
        * decide to show-hide error message,for undo-redo
        * @method _changeErrorDisplay
        * @param {Object} errorData, error -data
        * @param {boolean} skipUndoRedoRegistration
        * @private
        * @return void
        */
        _changeErrorDisplay: function _changeErrorDisplay(errorData, skipUndoRedoRegistration) {
            if (errorData && errorData.isVisible === true) {
                this._displayErrorMessage(errorData.ErrorMessage, skipUndoRedoRegistration);
            }
            else {
                this._chooseTaskView.hideErrorMessage();
            }
        },
        /**
        * change result acc message.
        * @method _changeResultAccMessage
        * @return void
        */
        _changeResultAccMessage: function _changeResultAccMessage() {

            var $result = this.$el.find('#result'),
                accText = '',
                accResultMessage = '',
                $resultRows = $result.find('.result-rows'),
                $currentRow,
                rowCount = 0,
                columnCount = 0,
                cellValue,
                self = this;

            if ($resultRows.length === 0) {
                rowCount++;
                columnCount++;
                cellValue = $result.find('.result-element-holder').text();
                accText = self.getAccMessage('commonResultText', 2, [cellValue]);
                accResultMessage += accText;

            }
            else {
                //result is matrix
                $resultRows.each(function () {
                    $currentRow = $(this);
                    rowCount++;
                    columnCount = 0;
                    $currentRow.find('.result-element-holder').each(function () {
                        columnCount++;
                        cellValue = $(this).text();
                        if (cellValue < 0) {
                            cellValue = self.getAccMessage('commonInputText', 3) + Math.abs(cellValue);
                        }
                        accText = self.getAccMessage('commonResultText', 1, [rowCount, columnCount, cellValue]);
                        accResultMessage += accText;
                    });
                });

                if (rowCount === 1 && columnCount === 1) {
                    accText = self.getAccMessage('commonResultText', 5, [rowCount, columnCount]);
                }
                else if (rowCount > 1 && columnCount === 1) {
                    accText = self.getAccMessage('commonResultText', 4, [rowCount, columnCount]);
                }
                else if (rowCount === 1 && columnCount > 1) {
                    accText = self.getAccMessage('commonResultText', 3, [rowCount, columnCount]);
                }
                else {
                    accText = self.getAccMessage('commonResultText', 0, [rowCount, columnCount]);
                }
                accResultMessage = accText + accResultMessage;
            }
            this.setAccMessage('result', accResultMessage);
        },
        /**
        * Change acc message of error and set tab-index of error
        * @method _changeErrorAccMessage
        * @param focusRectId {string} id of element where focus should be placed after error message
        * @private
        */
        "_changeErrorAccMessage": function(focusRectId, errorId, errorAccText) {
            errorId = errorId || 'error-holder';
			
            var tabIndexOfFocusRect = this.getTabIndex(focusRectId),
                defaultErrorIndex = this.getTabIndex(errorId),
                errorTabIndex = tabIndexOfFocusRect - 2,
                focusOutfunction,
                self = this, keyCode,
                keyDownFunct,
                isShiftPress = false,
                $errorHolder = this.$('#'+errorId);

            if (this.isAccesibilityOn) {
                this.setAccMessage(errorId, errorAccText || $errorHolder.find('.error-text').text());
                this.updateFocusRect(errorId);
                this.setFocus(errorId);

                keyDownFunct = function (event) {
                    keyCode = event.keyCode;
                    if (keyCode === 16) {
                        isShiftPress = true;
                    }
                    else if (keyCode === 9 && !isShiftPress) {
                        self.setTabIndex(errorId, errorTabIndex);
                    }
                }

                focusOutfunction = function () {
                    self.setTabIndex(errorId, defaultErrorIndex);
					
					if (errorId === 'error-holder') {
						self._chooseTaskView.hideErrorMessage();
					} else {
						$('#' + errorId).css('display', 'none').attr('data-display-flag', 'hide');
					}

                    //remove attach focus-out function
                    self.focusOut(errorId, this, 0, false);
                }

                $errorHolder.on('keydown', keyDownFunct);
                this.focusOut(errorId, focusOutfunction);
            }
        },

        /**
        * Return element id where focus should be placed after error-message
        * @method _focusRectForError
        * @param errorCode {string} error code string
        * @return {string}  element id string
        */
        _focusRectForError: function _focusRectForError(errorCode) {
            var errorMessage = this._ERROR_MESSAGE;
            switch (errorCode) {
                case errorMessage.SINGULAR_MATRIX.code:
                    return 'first';
                case errorMessage.SECOND_MATRIX_IS_SINGULAR.code:
                    return 'second';

                case errorMessage.DIMENSION_MISMATCH.code:
                case errorMessage.DIMENSION_MISMATCH_ADDITION.code:
                case errorMessage.DIMENSION_MISMATCH_SUBTRACTION.code:
                case errorMessage.DIMENSION_MISMATCH_MULTIPLICATION.code:
                case errorMessage.NOT_SQUARE_DETERMINANT.code:
                case errorMessage.MUST_BE_SQUARE.code:
                    return 'first-vertical-slider-handler';

                case errorMessage.EMPTY_CELL.code:
                case errorMessage.SCALAR_INVALID.code:
                    return 'scalar-holder';

                case errorMessage.RESULT_OUT_OF_RANGE.code:
				case errorMessage.RESULT_VALUE_PRECISION_MORE_THAN_TWO_DECIMAL_PLACES.code:
                    return 'calculation-holder';

            }
        },
        /**
        * change matrix container acc Message
        * @method _changeMatrixAccMessage
        * @param {string} matrix name
        * @private
        */
        _changeMatrixAccMessage: function _changeMatrixAccMessage(matrix) {
            var $el = this.$el,
                $matrix = $el.find('#' + matrix),
                $rows = $matrix.find('.' + matrix + '-rows:visible'),
                rowCount = $rows.length,
                $column = $($rows[0]).find('.matrix-cell:visible'),
            columnCount = $column.length;

            this.changeAccMessage(matrix, 0, [rowCount, columnCount]);
        },

        /**
        * check if given two matrices are equal or not
        * @method _matchMatrices
        * @param toMarix {object} matrix data
        * @param withMatrix {object} matrix data
        * @return {boolean} true if both matrix are equal else false.
        * @privarte 
        */
        _matchMatrices: function _matchMatrices(toMatrix, withMatrix) {
            var rowCount, columnCount;
            if (toMatrix.rows !== withMatrix.rows || toMatrix.cols !== withMatrix.cols) {
                return false;
            }
            else {
                for (rowCount = 0; rowCount < toMatrix.rows; rowCount++) {
                    for (columnCount = 0; columnCount < toMatrix.cols; columnCount++) {
                        if (toMatrix.content[rowCount][columnCount].dataContent !== withMatrix.content[rowCount][columnCount].dataContent) {
                            return false;
                        }
                    }
                }
                if (toMatrix.rows === 0) {
                    //determinant case
                    if (toMatrix.answer !== withMatrix.answer) {
                        return false;
                    }
                }
            }
            return true;
        },

        /**
        * enable or disable tab index of element
        * @method enableTab
        * @param  {String} elementId, id of element whose tab index to be enable or disable.
        * @param {Boolean} isEnable,if true eneble tab index,else disable tab index
        */
        enableTab: function enableTab(elementId, isEnable) {
            if (this.isAccesibilityOn) {
                this.accManagerView.enableTab(elementId, isEnable);
            }
        },

        /**
        * set focus to element
        * @method setFocus
        * @param {String} elementId, id of element at which focus should be place.
        * @param {integer} ndelay, optional, delay time.,if not specified focus will be set immediately
        */
        setFocus: function setFocus(elementId, ndelay) {
            if (this.isAccesibilityOn) {
                this.accManagerView.setFocus(elementId, ndelay);
            }
        },
        /**
        * Loads the required screen.
        * @method loadScreen
        * @param screenId {String} Id of required screen.
        **/
        loadScreen: function loadScreen(screenId) {
            //if (this.isAccesibilityOn) {
            this.accManagerView.loadScreen(screenId);
            //}
        },
        /**
        * Unload the screen.
        * @method unloadScreen.
        * @param screenId {String} Id of required screen.
        **/
        unloadScreen: function (screenId) {
            //if (this.isAccesibilityOn) {
            this.accManagerView.unloadScreen(screenId);
            //}
        },
        /**
        * update focus rect size,for accessibility
        * @method updateFocusRect
        * @param {string} elementId, id of element which focus rect size should be change.
        */
        updateFocusRect: function updateFocusRect(elementId) {
            if (this.isAccesibilityOn) {
                this.accManagerView.updateFocusRect(elementId);
            }
        },
        /**
        * Sets the acc message for element.
        * @method setAccMessage
        * @param elementId {String} of required element.
        * @param message {String} accessible message string
        **/
        setAccMessage: function (elementId, message) {
            if (this.isAccesibilityOn) {
                this.accManagerView.setAccMessage(elementId, message);
            }
        },
        /**
        * Sets the loc message for element.
        * @method setAccMessage
        * @param elementId {String} of required element.
        * @param message {String} accessible message string
        **/
        setLocMessage: function (elementId, message) {
            //if (this.isAccesibilityOn) {
            this.accManagerView.setMessage(elementId, message);
            //}
        },
        /**
        * creates accessible div dynamically
        * @method createAccDiv
        * @param object {Object}
        **/
        createAccDiv: function createAccDiv(object) {
            if (this.isAccesibilityOn) {
                this.accManagerView.createAccDiv(object);
            }
        },
        /**
        * Call change Acc Message method, accessibility manager
        * @method changeAccMessage
        * @param accId {String}  Id of element.
        * @param messageId {String}  Id of message which is to be set
        * @param params {Array} array of replacement text for place holder(%@$%)(optional)
        */
        changeAccMessage: function changeAccMessage(accId, messageId, params) {
            if (this.isAccesibilityOn) {
                this.accManagerView.changeAccMessage(accId, messageId, params);
            }
        },
        /**
        * call getAccMessage Method of manager view if accessibility is on else return false
        * @method getAccMessage
        * @param accId {String} of required element.
        * @param messageId {String} Message Id of required message node.
        * @return {String} Returns null if element or message is not found.
        *         Returns the acc message if element and message node is found.
        **/
        getAccMessage: function getAccMessage(accId, messageId, params) {
            if (this.isAccesibilityOn) {
                return this.accManagerView.getAccMessage(accId, messageId, params);
            }
            else {
                return null;
            }
        },
        /**
        * return tab-index of element.
        * @method getTabIndex
        * @param accId Element accId of required element.
        * @return {Number} Returns null if element is not found.
        *         Returns the tabIndex if element is found.
        **/
        getTabIndex: function getTabIndex(accId) {
            if (this.isAccesibilityOn) {
                return this.accManagerView.getTabIndex(accId);
            }
        },
        /**
        * Sets the tabIndex for element.
        * @method setTabIndex
        * @param accId {Object} Element accId of required element.
        * @param newTabIndex {Number} new value of tabIndex
        **/
        setTabIndex: function setTabIndex(accId, newTabIndex) {
            if (this.isAccesibilityOn) {
                this.accManagerView.setTabIndex(accId, newTabIndex);
            }
        },
        /**
        * Sets the selector for element.
        * @method changeSelector
        * @param accId {String} Element id of required element.
        * @param selector {String} Selector onto which focus is to be set.
        **/
        setSelector: function setSelector(accId, selector) {
            if (this.isAccesibilityOn) {
                this.accManagerView.setSelector(accId, selector);
            }
        },
        /** 
        * Adds the listener for focusin event.
        * @method focusIn
        * @param accId {String} of required element.
        * @param focusInHandler {Function} Listener which is to be added for focusin event.
        * @param delay {Number} Time delay after which added listener is executed.
        * @param addOrRemove {Boolean} It tells whether given listener is to be added or removed.
        **/
        focusIn: function (accId, focusInHandler, delay, addOrRemove) {
            if (this.isAccesibilityOn) {
                this.accManagerView.focusIn(accId, focusInHandler, delay, addOrRemove);
            }
        },
        /** 
        * Adds the listener for focusout event.
        * @method focusOut
        * @param accId {String} of required element.
        * @param focusOutHandler {Function} Listener which is to be added for focusout event.
        * @param delay {Number} Time delay after which added listener is executed.
        * @param addOrRemove {Boolean} It tells whether given listener is to be added or removed.
        **/
        focusOut: function (accId, focusOutHandler, delay, addOrRemove) {
            if (this.isAccesibilityOn) {
                this.accManagerView.focusOut(accId, focusOutHandler, delay, addOrRemove);
            }
        },
        /**
        * Parses the DOM for select and option elements, converts it into Accessible Custom Combo box,
        * with setters/getters to make it pretend like actual Select element.
        *
        * @method createCustomComboboxes
        * @private
        * @return
        */
        _createCustomComboboxes: function () {
            var $el = $(this.el),
               self = this,
               basePath = MathUtilities.Tools.MatrixTool.MatrixToolHolder.Models.MatrixToolHolder.BASEPATH,
               dropDownOpenEvent;

            var comboOptions = {
                el: $("#matrixToolHolder"),
                manager: this.accManagerView,
                screenId: 'combobox',
                elementData: [{
                    elementID: 'task-dropdown',
                    selectedItem: 0,
                    imagePath: basePath + 'js/math-utilities/components/combobox/images/arrow-up-down.png'
                }]

            };
            this.customComboController = MathUtilities.Components.ComboboxController.generateCustomComboboxController(comboOptions);

            //this.customComboController = new MathUtilities.Components.CustomCombo();
            //this.customComboController.setContextElement($("#matrixToolHolder"));
            //// This call makes to controller to parse entire dom in context to passed element above, and make it as CustomCombo.
            //this.customComboController.ParseDOM();

            //it is added to clear text of locatized-span
            this.setLocMessage('task-dropdown', null);
        },
        /**
        * Action to be performed on dropdown change.
        * @method onDropdownChange
        * @private 
        */
        _onDropdownChange: function _onDropdownChange(event) {
            this._chooseTaskView.onDropdownChange(event);

            //change acc Message of calculation section
            this._changeCalculationSectionAccMessages();

        },

        /**
        * keyPress event handler for value-holder if accessibility is on
        * @method _valueKeyPressHandler
        * @param event {object}
        * @private 
        */
        _valueKeyPressHandler: function _valueKeyPressHandler(event) {
            if (this.isAccesibilityOn) {
                var keyCode = event.keyCode,
                    $currTarget = $(event.target);
                if (keyCode === 27 || keyCode === 9) {
                    this.setFocus($currTarget.parents('.matrix-cell').attr('id'));
                    //event.stopPropagation();
                }
            }
        },
        /**
        * change accessibility text of given cell.
        * @method _changeCellMessage
        * @param cellId {string} id of cell-element whose acc Message to be change
        * @return null
        */
        _changeCellMessage: function _changeCellMessage(cellId) {
            var $el = this.$el,
                $currCell = $el.find('#' + cellId),
                $numerator = $currCell.find('.numerator'),
                $denominator = $currCell.find('.denominator'),
                numValue,
                denomValue,
                cellValue,
                checkValidInput,
                accText,
                cellRow,
                cellColumn;

            cellRow = cellId.substring(cellId.indexOf('-') + 1, cellId.indexOf('-') + 2);
            cellColumn = cellId.substring(cellId.indexOf('-') + 2, cellId.indexOf('-') + 3);

            if (cellId === 'scalar-holder') {
                //check if is fraction
                if ($numerator.length === 0) {
                    cellValue = $currCell.find('.element-holder').text();
                    if (isNaN(parseFloat(cellValue))) {
                        accText = this.getAccMessage('scalar-holder', 2);
                    }
                    else {
                        if (cellValue < 0) {
                            cellValue = this.getAccMessage('commonInputText', 3) + Math.abs(cellValue);
                        }
                        else if (parseFloat(cellValue) === 0 && cellValue.toString().indexOf('-') !== -1) {
                            cellValue = this.getAccMessage('commonInputText', 3) + cellValue.toString().substring(1)
                        }
                        accText = this.getAccMessage('scalar-holder', 0, [cellValue]);
                    }
                }
                else {
                    numValue = $numerator.text();
                    denomValue = $denominator.text();
                    if (isNaN(parseFloat(numValue)) || isNaN(parseFloat(denomValue))) {
                        accText = this.getAccMessage('scalar-holder', 2);
                    }
                    else {
                        if (numValue < 0) {
                            numValue = this.getAccMessage('commonInputText', 3) + Math.abs(numValue);
                        }
                        else if (parseFloat(numValue) === 0 && numValue.toString().indexOf('-') !== -1) {
                            numValue = this.getAccMessage('commonInputText', 3) + numValue.toString().substring(1)
                        }
                        if (denomValue < 0) {
                            denomValue = this.getAccMessage('commonInputText', 3) + Math.abs(denomValue);
                        }
                        else if (parseFloat(denomValue) === 0 && denomValue.toString().indexOf('-') !== -1) {
                            denomValue = this.getAccMessage('commonInputText', 3) + denomValue.toString().substring(1)
                        }
                        accText = this.getAccMessage('scalar-holder', 1, [numValue, denomValue]);
                    }
                }
                this.setAccMessage('scalar-holder', accText);
            }
            else {
                //check if is fraction
                if ($numerator.length === 0) {
                    cellValue = $currCell.find('.element-holder').text();
                    if (isNaN(parseFloat(cellValue))) {
                        accText = this.getAccMessage('commonInputText', 2, [cellRow, cellColumn]);
                    }
                    else {
                        if (cellValue < 0) {
                            cellValue = this.getAccMessage('commonInputText', 3) + Math.abs(cellValue);
                        }
                        else if (parseFloat(cellValue) === 0 && cellValue.toString().indexOf('-') !== -1) {
                            cellValue = this.getAccMessage('commonInputText', 3) + cellValue.toString().substring(1)
                        }

                        accText = this.getAccMessage('commonInputText', 0, [cellRow, cellColumn, cellValue]);
                    }
                }
                else {
                    numValue = $numerator.text();
                    denomValue = $denominator.text();
                    if (isNaN(parseFloat(numValue)) || isNaN(parseFloat(denomValue))) {
                        accText = this.getAccMessage('commonInputText', 2, [cellRow, cellColumn]);
                    }
                    else {
                        if (numValue < 0) {
                            numValue = this.getAccMessage('commonInputText', 3) + Math.abs(numValue);
                        }
                        else if (parseFloat(numValue) === 0 && numValue.toString().indexOf('-') !== -1) {
                            numValue = this.getAccMessage('commonInputText', 3) + numValue.toString().substring(1)
                        }
                        if (denomValue < 0) {
                            denomValue = this.getAccMessage('commonInputText', 3) + Math.abs(denomValue);
                        }
                        else if (parseFloat(denomValue) === 0 && denomValue.toString().indexOf('-') !== -1) {
                            denomValue = this.getAccMessage('commonInputText', 3) + denomValue.toString().substring(1)
                        }
                        accText = this.getAccMessage('commonInputText', 1, [cellRow, cellColumn, numValue, denomValue]);
                    }
                }

                this.setAccMessage(cellId, accText);
            }

            this._changeCellSelector(cellId);
        },
        /**
        * enable or disable undo-redo buttons depending upon is data available
        * @method _enableUndoRedo
        * @return 
        */
        _enableUndoRedo: function _enableUndoRedo() {
            var undoManager = this._undoRedoManager,
                matrix_tool = MathUtilities.Tools.MatrixTool.MatrixToolHolder.Views.MatrixToolHolder.MATRIX_TOOL;

            //check if undo data available
            if (undoManager.isUndoAvailable(matrix_tool)) {
                this.enableTab('undo', true);
            }
            else {
                this.enableTab('undo', false);
            }

            //check for redo data
            if (undoManager.isRedoAvailable(matrix_tool)) {
                this.enableTab('redo', true);
            }
            else {
                this.enableTab('redo', false);
            }
        },
        /**
        * change slider accessibility message
        * @method _changeSliderAccMessage
        * @param matrix{string} either 'first' or 'second'
        */
        _changeSliderAccMessage: function _changeSliderAccMessage(matrix) {

            var $el = this.$el,
                $rows = $el.find('.' + matrix + '-rows:visible'),
                $columns = $($rows[0]).find('.matrix-cell:visible'),
                columnCount = $columns.length,
                rowCount = $rows.length,
                verticalSliderId = matrix + '-vertical-slider-handler',
                horizontalSliderId = matrix + '-horizontal-slider-handler';

            if (rowCount === 1) {
                this.changeAccMessage(verticalSliderId, 1, [rowCount]);
            }
            else {
                this.changeAccMessage(verticalSliderId, 0, [rowCount]);
            }

            if (columnCount === 1) {
                this.changeAccMessage(horizontalSliderId, 1, [columnCount]);
            }
            else {
                this.changeAccMessage(horizontalSliderId, 0, [columnCount]);
            }
        },
        /**
        * read slider acc message
        * @method _readSliderValue
        * @param matrix {string} matrix name
        * @param isVertical {boolean} is slider is vertical or horizontal
        */
        _readSliderValue: function _readSliderValue(matrix, isVertical) {
            var sliderId = '';
            if (isVertical) {
                sliderId = matrix + '-vertical-slider-handler';
            }
            else {
                sliderId = matrix + '-horizontal-slider-handler';
            }

            //this.$('#' + sliderId).blur();
            this.setFocus('temp-focus', 30);
            this.setFocus(sliderId, 30);
        },
        /**
        * create error object,add message from accessibility json object
        * @method _createErrorObject
        * @param errorData {object} error data object
        */
        _createErrorObject: function _createErrorObject(errorData) {
            var errorMessage = this._ERROR_MESSAGE,
                errorElements = errorData.elements,
                errorCode = MathUtilities.Tools.MatrixTool.MatrixToolHolder.Views.MatrixToolHolder.MATRIX_ERROR_CODE,
                errorLength = errorElements.length,
                elementCount;

            $.each(errorCode, function (key, value) {
                errorMessage[key] = {};
                errorMessage[key]['code'] = value.code;
                errorMessage[key]['message'] = '';

                for (elementCount = 0; elementCount < errorLength; elementCount++) {
                    if (errorElements[elementCount].accId === value.codeId) {
                        errorMessage[key]['message'] = errorElements[elementCount].messages[0].message.loc;
                    }
                }
            });
        },

        _changeMatrixCellsMessage: function _changeMatrixCellsMessage(matrix) {
            var $el = this.$el,
                $rows = $el.find('.' + matrix + '-rows'),
                $currentRow,
                $currentCell,
                numValue,
                denomValue,
                rowCount = 0,
                columnCount = 0,
                accText = '',
                self = this;

            $rows.each(function () {
                $currentRow = $(this);
                rowCount++;

                $currentRow.find('.matrix-cell').each(function () {
                    $currentCell = $(this).attr('id');

                    self._changeCellMessage($currentCell);
                });

            });
        },
        /**
        * change selector of cell 
        * @method _changeCellSelector
        * @param cellId {string} cell id
        */
        _changeCellSelector: function (cellId) {
            var $el = this.$el,
                $cell = $el.find('#' + cellId),
                $numerator = $cell.find('.numerator');

            if ($numerator.length !== 0) {
                this.setSelector(cellId, '#' + $numerator.attr('id'));
            }
            else {
                this.setSelector(cellId, '#' + $cell.find('.element-holder').attr('id'));
            }
        }




    }, {
        MATRIX_TOOL: 'matrixTool',

        MATRIX_ERROR_CODE: {
            "SINGULAR_MATRIX": {
                "codeId": 'singularMatrix',
                "code": 'Matrix is singular'
            },
            "INVALID_PARAMETERS": {
                "codeId": 'invalidParameter',
                "code": 'Invalid parameters'
            },
            "OUT_OF_BOUNDS": {
                "codeId": 'outOfBounds',
                "code": 'Out of bounds'
            },
            "DIMENSION_MISMATCH": {
                "codeId": 'dimensionMismatch',
                "code": 'Dimension mismatch'
            },
            "MATRIX_IS_SINGULAR": {
                "codeId": 'singularMatrix',
                "code": 'Matrix is singular'
            },
            "UNKNOWN_TYPE": {
                "codeId": 'unknownType',
                "code": 'Unknown type'
            },
            "SIZE_NOT_GIVEN": {
                "codeId": 'sizeNotGiven',
                "code": 'Size not given'
            },
            "MUST_BE_SQUARE": {
                "codeId": 'notSquareMatrix',
                "code": 'Matrix not square'
            },
            "EMPTY_CELL": {
                "codeId": 'emptyCell',
                "code": 'Cell empty'
            },
            "SCALAR_INVALID": {
                "codeId": 'invalidScalar',
                "code": 'Scalar is not rational number'
            },
            "MATRIX_NO_INVALID": {
                "codeId": 'invalidMatrixValue',
                "code": 'Matrix element is not rational number'
            },
            "RESULT_OUT_OF_RANGE": {
                "codeId": 'resultOutOfRange',
                "code": 'Result is out of range'
            },
            "DIMENSION_MISMATCH_ADDITION": {
                "codeId": 'additionDimensionsMismatch',
                "code": 'Dimension mismatch for addition'
            },
            "DIMENSION_MISMATCH_SUBTRACTION": {
                "codeId": 'subtractionDimensionsMismatch',
                "code": 'Dimension mismatch for subtraction'
            },
            "DIMENSION_MISMATCH_MULTIPLICATION": {
                "codeId": 'multiplyDimensionMismatch',
                "code": 'Dimension not appropriate for multiplication'
            },
            "NOT_SQUARE_DETERMINANT": {
                "codeId": 'notSquareForDeterminant',
                "code": 'Matrix not square for determinant'
            },
            "SECOND_MATRIX_IS_SINGULAR": {
                "codeId": 'secondMatrixSingular',
                "code": 'Second matrix is singular'
            },
			"RESULT_VALUE_PRECISION_MORE_THAN_TWO_DECIMAL_PLACES": {
                "codeId": 'resultValuePrecisionMoreThanTwoDecimalPlaces',
                "code": 'Result value having precision more than two decimal places'
            }
        }

    });

}(window.MathUtilities));