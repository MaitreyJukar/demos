(function () {
    'use strict';
    var className = null;
    /**
    * Class for Overview Tab ,  contains properties and methods of Overview tab
    * @class Overview
    * @module VirusZapper1
    * @namespace MathInteractives.Interactivities.VirusZapper1.Views
    * @extends MathInteractives.Common.Player.Views.Base
    * @type Object
    * @constructor
    */
    MathInteractives.Common.Interactivities.VirusZapper.Views.VirusDataWrapper = MathInteractives.Common.Player.Views.Base.extend({

        /**
        * Stores filepaths for resources , value set on initialize
        *   
        * @property filePath 
        * @type Object
        * @default null
        **/
        filePath: null,

        /**
        * Stores manager instance for using common level functions , value set on initialize
        *
        * @property manager 
        * @type Object
        * @default null
        **/
        manager: null,

        /**
        * Stores reference to player , value set on initialize
        * 
        * @property player 
        * @type Object
        * @default null
        **/
        player: null,

        /**
        * id-prefix of the interactive , value set on initialize
        * 
        * @property idPrefix 
        * @type String
        * @default null
        **/
        idPrefix: null,

        /**
        * virus data tab model class reference from main model
        * 
        * @property virusDataTabModel 
        * @type Object
        * @default null
        **/
        virusDataTabModel: null,

        /**
        * container for interactive
        * 
        * @property container
        * @type String
        * @default null
        **/
        container: null,

        /**
        * Stores data for viruses
        * 
        * @property virusDataRightPanelDiv
        * @type Object
        * @default null
        **/
        template: {},
        /**
        * Holds the sort button is focused first time or not
        * @property firstTimeFocus
        * @type Boolean
        * @default true
        */
        firstTimeFocus: true,
        /**
        * Initializes the overview tab
        *
        * @method initialize
        * @public 
        **/
        initialize: function () {
            this.player = this.model.get('player');
            this.filePath = this.player.getPath();
            this.manager = this.player.getManager();
            this.idPrefix = this.player.getIDPrefix();
            this.virusDataTabModel = this.model;
            var teamplateData = { idPrefix: this.idPrefix };
            this.$el.append(MathInteractives.Common.Interactivities.VirusZapper.templates.dataTab(teamplateData).trim());
            if (this.isAccessible()) {
                this.loadScreen('data-tab-acc-div');
            }
            this.render();
            this.loadScreen('virusData-tab');
            this.changeMessage('virus-data-zapped-count', '0', [this.model.get('zappedCount')]);
            this.loadScreen('table-alt-text');

        },

        /**
        * Renders the view of overview tab
        *
        * @method render
        * @public 
        **/
        render: function () {

            var img = this.filePath.getImagePath('virus-zapper-sprite-1');
            this.$el.css({
                'background-image': 'url(' + img + ')'
            });
            this._generateButtons();
            this.createTable();
            this.player.bindTabChange(this.tabChange, this, 2);
            if (this.model.get('interactivityType') === 1) {
                //                this.model.on('bonusClicked', $.proxy(this.callbackOnbonusClicked, this));
                //                this.model.on('TryanotherClick', $.proxy(this.callbackOnTryAnotherClicked, this));
                this.model.on(MathInteractives.Interactivities.VirusZapper1.Models.VirusZapper1Data.Events.BONUS_CLICKED, $.proxy(this.callbackOnbonusClicked, this));
                this.model.on(MathInteractives.Interactivities.VirusZapper1.Models.VirusZapper1Data.Events.TRY_ANOTHER_CLICKED, $.proxy(this.callbackOnTryAnotherClicked, this));

            }
            else {
                this.model.on(MathInteractives.Interactivities.VirusZapper2.Models.VirusZapper2Data.Events.BONUS_CLICKED, $.proxy(this.callbackOnbonusClicked, this));
                this.model.on(MathInteractives.Interactivities.VirusZapper2.Models.VirusZapper2Data.Events.TRY_ANOTHER_CLICKED, $.proxy(this.callbackOnTryAnotherClicked, this));

            }
            this.placeViruses();
        },

        /**
        * Refreshes table after the tab switch
        *
        * @method tabChange
        * @public 
        **/
        tabChange: function tabChange() {
            this.tableModel.refreshTable();
            this.setFocus('data-tab');
            this._setSortNotationIndex();
        },

        /**
        * Places virus SVG images on the right side of the data tab
        *
        * @method callbackOnbonusClicked placeViruses
        * @public 
        **/

        placeViruses: function () {
            var $virus;
            this.template.Type1 = true;
            var templateData = {
                idPrefix: this.idPrefix,
                templateType: this.template,
                virusNo: 1
            };
            this.template.Type1 = false;
            this.template.Type4 = true;
            templateData.virusNo = 4;
            $virus = MathInteractives.Common.Interactivities.VirusZapper.templates.customVirus(templateData).trim();
            this.$('.bean-virus').append($virus);

            this.template.Type4 = false;
            this.template.Type1 = true;
            templateData.virusNo = 1;
            $virus = MathInteractives.Common.Interactivities.VirusZapper.templates.customVirus(templateData).trim();
            this.$('.grape-virus').append($virus);
            this.template.Type1 = false;
            this.template.Type2 = true;
            templateData.virusNo = 2;
            $virus = MathInteractives.Common.Interactivities.VirusZapper.templates.customVirus(templateData).trim();
            this.$('.sponge-virus').append($virus);

            this.template.Type2 = false;
            this.template.Type3 = true;
            templateData.virusNo = 3;
            $virus = MathInteractives.Common.Interactivities.VirusZapper.templates.customVirus(templateData).trim();
            this.$('.red-virus').append($virus);

            this.template.Type3 = false;
            templateData.gradient1Id = 'data-tab-bonus-virus-gradient1';
            templateData.gradient2Id = 'data-tab-bonus-virus-gradient2';
            $virus = MathInteractives.Common.Interactivities.VirusZapper.templates.bonusVirus(templateData).trim();
            this.$('.bonus-virus').append($virus);



        },

        /**
        * Callback for bonusClicked trigger, it calls addValues for updating table
        *
        * @method callbackOnbonusClicked
        * @public 
        **/
        callbackOnbonusClicked: function () {
            this.addValues();
        },

        /**
        * Callback for tryAnotherClicked trigger, it calls clearTable for clearing table
        *
        * @method callbackOnTryAnotherClicked
        * @public 
        **/
        callbackOnTryAnotherClicked: function () {
            this.clearTable();
        },


        /**
        * Creates table of theme2
        *
        * @method createTable
        * @public 
        **/

        createTable: function () {
            var tableData = [{
                isHeaderRow: true,
                rowData: [{
                    text: this.getMessage('header-text', 0)
                },
                {
                    text: this.getMessage('header-text', 1)
                }]
            }];
            var tableProperties = {
                idPrefix: this.idPrefix,
                manager: this.manager,
                player: this.player,
                filePath: this.filePath,
                defaultRowCount: 11,
                defaultColumnCount: 2,
                tabIndex: 540,
                //                prevElementAccId: 'virus-zapped-info',
                //                nextElementAccId: 'back-to-game-btn',
                tableData: tableData,
                enableTableSorting: true,
                showCurrentRowColor: false,
                hasInputBoxInTable: true,
                classForCustomSort: 'row1-ans',
                dataRowCustomClass: 'table-data',
                tableBorderClass: 'data-table-border',
                headerRowCustomClass: 'table-header'
                //sortingOrder:0,

            };
            tableProperties.columnsForCustomSort = [0];
            tableProperties.dataRowCustomClass = 'table-data';
            this.tableModel = new MathInteractives.global.Theme2DataTable.Model(tableProperties);
            this.tableView = new MathInteractives.global.Theme2DataTable.View({ model: this.tableModel, el: '#' + this.idPrefix + 'virus-data-table' });
            this.tableModel.setNextAccElement('tbl-sort-notation-0');
            this.tableModel.setPreviousAccElement('virus-zapped-info');
            this._setSortNotationIndex();
        },

        /**
        * Apply Tab indices to the sort notations
        * @method _setSortNotationIndex
        * @private
        */
        _setSortNotationIndex: function _setSortNotationIndex() {
            var accDivObject,
                counter,
                self = this,
                index = 2;
            if (this.tableModel.get('tableData').length > 2) {
                for (counter = 0; counter < 2; counter++) {
                    accDivObject = {
                        'elementId': 'tbl-sort-notation-' + counter,
                        'tabIndex': 540 + index,
                        'offsetTop': 2,
                        'offsetLeft': 2,
                        'acc': this.getMessage('sort-notaion-acc-text', 0, [this.getAccMessage('header-text', counter), this.getMessage('sort-notaion-acc-text', 1)])
                    };
                    this.createAccDiv(accDivObject);

                }
                this.focusIn('tbl-sort-notation-0', function () {
                    self.focusInSort('tbl-sort-notation-0');
                });
                this.focusIn('tbl-sort-notation-1', function () {
                    self.focusInSort('tbl-sort-notation-1');
                });
            }
        },
        /*
        * It change the acc text according to sort button class
        * It call when the sort button is focused
        * @method focusInSort
        */
        focusInSort: function (id) {
            var sortNo = parseInt(id.substr(id.length - 1, 1)),
                colAccText = null,
                sortAccText = null,
                accText = null, $tempDiv, object;
            if (this.firstTimeFocus) {
                $tempDiv = $('<div>', {
                    'id': this.idPrefix + '-temp-div'
                });
                object = {
                    'elementId': this.idPrefix + '-temp-div',
                    'uniqueId': this.idPrefix,
                    'acc': ''
                };

                this.manager.createAccDiv(object);
                switch (sortNo) {
                    case 0:
                        colAccText = this.getAccMessage('header-text', 0);
                        break;
                    case 1:
                        colAccText = this.getAccMessage('header-text', 1);
                        break;
                }
                var $header = this.$('#' + this.idPrefix + id).parent().parent();
                if ($header.hasClass('sorting-enabled') && $header.hasClass('tbl-sort-asc')) {
                    sortAccText = this.getMessage('sort-notaion-acc-text', 2);
                    accText = this.getMessage('sort-notaion-acc-text', 0, [colAccText, sortAccText]);
                    this.setAccMessage(id, accText);
                }
                else {
                    sortAccText = this.getMessage('sort-notaion-acc-text', 1);
                    accText = this.getMessage('sort-notaion-acc-text', 0, [colAccText, sortAccText]);
                    this.setAccMessage(id, accText);
                }
                this.setFocus('temp-div');
                this.setFocus(id);
                this.firstTimeFocus = false;
            }
            else {
                this.firstTimeFocus = true;
            }
        },

        /**
        * Adds new new row to the model arrays and update
        *
        * @method addValues
        * @public 
        **/

        addValues: function addValues() {
            var length = this.model.get('tableDataCol1').length;
            var status = this.model.get('tableDataCol3')[length - 1];
            if (status === true) {
                status = className.STATUS_TYPE.TYPE_1;
                this.model.increaseZappedCount();
                this.changeMessage('virus-data-zapped-count', '0', [this.model.get('zappedCount')]);
                this.changeAccMessage('virus-zapped-info', 1, [this.model.get('zappedCount'), this.getMessage('virus-data-text2-holder', 0)]);
                if (this.model.get('zappedCount') > 1) {
                    this.setMessage('virus-data-text2-holder', this.getMessage('virus-data-text2-holder', 1));
                    this.changeAccMessage('virus-zapped-info', 1, [this.model.get('zappedCount'), this.getMessage('virus-data-text2-holder', 1)]);
                }
            }
            else if (status === false) {
                status = className.STATUS_TYPE.TYPE_2;
                this.model.increaseMissedCount();
            }

            if (length == 2) {
                this.tableModel.enableDisableTableHeaderClicks(true);
            }

            var templateData =
            {
                qsn: this.model.get('tableDataCol1')[length - 1],
                ans: this.model.get('tableDataCol2')[length - 1]
            };

            if (this.model.get('qsnType')[length - 1] === 2) {
                templateData.squareCubeType = '';
                templateData.rootAltText = this.getMessage('symbol','square');
                templateData.approxAltText = this.getMessage('symbol', 'approx');
                var tempData = {
                    rowData: [
                        {
                            //                            text: '<div class="table-row-data-div"><span class="square-cube-type1"></span><span class="sqrt-symbol">√</span><span class="qsn">' + this.model.get('tableDataCol1')[length - 1] + '</span><span class="sqrt-symbol"> ≈ </span><span>' + this.model.get('tableDataCol2')[length - 1] + '</span><span class="row1-ans">' + this.model.get('tableDataCol2')[length - 1] + '</span></div>'
                            text: MathInteractives.Common.Interactivities.VirusZapper.templates.tableQsnDisplay(templateData).trim()
                        },
                        {
                            text: this.getMessage('status-text', status)
                        }
                    ]
                };
            }

            else {
                templateData.squareCubeType = this.model.get('qsnType')[length - 1];
                templateData.rootAltText = this.getMessage('symbol', 'cube');
                templateData.approxAltText = this.getMessage('symbol', 'approx');
                var tempData = {
                    rowData: [
                        {
                            //                            text: '<div class="table-row-data-div"><span class="square-cube-type1">' + this.model.get('qsnType')[length - 1] + '</span><span class="sqrt-symbol">√</span><span class="qsn">' + this.model.get('tableDataCol1')[length - 1] + '</span><span class="sqrt-symbol"> ≈ </span><span>' + this.model.get('tableDataCol2')[length - 1] + '</span><span class="row1-ans">' + this.model.get('tableDataCol2')[length - 1] + '</span></div>'
                            text: MathInteractives.Common.Interactivities.VirusZapper.templates.tableQsnDisplay(templateData).trim()
                        },
                        {
                            text: this.getMessage('status-text', status)
                        }
                    ]
                };
            }
            this.tableModel.addRow(tempData);

            if (this.tableModel.get('tableData').length > 2) {
                this.tableModel.enableDisableTableHeaderClicks(true);
                this.tableModel.enableDisableSortingOnColumn(true);
            }
        },

        /**
        * Clears the table and the model arrays on try another click
        *
        * @method clearTable
        * @public 
        **/

        clearTable: function clearTable() {
            this.model.clearTableData();
            this.tableModel.clearDataFromTable();
            this.changeMessage('virus-data-zapped-count', '0', [this.model.get('zappedCount')]);
            this.setMessage('virus-data-text2-holder', this.getMessage('virus-data-text2-holder', 0));
            this.changeAccMessage('virus-zapped-info', 0);
        },
        /**
        * switches tab to explore tab
        * @method tabSwitchDataTab
        * @public
        */
        tabSwitchDataTab: function () {
            this.stopReading();
            //console.log('tab switch');
            this.player.switchToTab(1);
            this.setFocus('header-subtitle');
        },

        /**
        * Renders all buttons in data tab.
        * @method _generateButtons
        * @private
        */
        _generateButtons: function _generateButtons() {
            var self = this;
            this.backToGameBtnView = MathInteractives.global.Theme2.Button.generateButton({

                path: this.filePath,
                player: this.player,
                idPrefix: this.idPrefix,
                manager: this.manager,
                data: {
                    id: this.idPrefix + 'back-to-game-btn',
                    text: this.getMessage('back-to-game-btn-text', 0),
                    type: MathInteractives.global.Theme2.Button.TYPE.TEXT,
                    width: 152,
                    height: 38
                }
            });
            this.backToGameBtnView.$el.on('click', $.proxy(self.tabSwitchDataTab, self));

            this.loadScreen('back-btn');
        }
    },
    {
        /**
        * Creating instance of the dataWrapperView
        *
        * @method generateVirusDataWrapperView
        * @public 
        **/


        generateVirusDataWrapperView: function (obj) {
            if (obj.model) {
                //                var virusZapperMainModel = new MathInteractives.Common.Interactivities.VirusZapper.Models.VirusZapper();
                //                obj.model.set('virusZapperModel', virusZapperMainModel);

                var virusDataWrapperView = new MathInteractives.Common.Interactivities.VirusZapper.Views.VirusDataWrapper({ model: obj.model, el: obj.el });
                return virusDataWrapperView;
            }
        },
        STATUS_TYPE: {
            TYPE_1: 'zapped',
            TYPE_2: 'missed'
        }

    })

    className = MathInteractives.Common.Interactivities.VirusZapper.Views.VirusDataWrapper;
})()