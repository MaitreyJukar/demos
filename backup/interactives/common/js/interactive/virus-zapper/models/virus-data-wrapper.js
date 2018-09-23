(function () {

    /**
    * Properties required for populating compound fishtank's fish related data.
    *
    * @class fishtankData
    * @construtor
    * @extends Backbone.Model
    * @namespace MathInteractives.Interactivities.LandscapeArchitect.Models
    */
    MathInteractives.Common.Interactivities.VirusZapper.Models.VirusDataWrapper = MathInteractives.Common.Player.Models.Base.extend({
        defaults: {
            virusDataRightPanelModelObj: null,
            virusDataTableModelObj: null
        },

        //Data variable for dataTable

        /**
        * Stores the type of question
        * @property qsnType
        * @type Array
        * @default []
        */
        qsnType: [],

        /**
        * Stores the data in the first column of the table
        * @property tableDataCol1
        * @type Array
        * @default []
        */
        tableDataCol1: [],

        /**
        * Stores the data in the second column of the table
        * @property tableDataCol2
        * @type Array
        * @default []
        */
        tableDataCol2: [],

        /**
        * Stores the data in the third column of the table
        * @property tableDataCol3
        * @type Array
        * @default []
        */
        tableDataCol3: [],

        /**
        * Stores the count of zapped viruses
        * @property zappedCount
        * @type Number
        * @default 0
        */
        zappedCount: 0,

        /**
        * Stores the count of missed viruses
        * @property missedCount
        * @type Number
        * @default 0
        */
        missedCount: 0,

        initialize: function () {
            //            var modelDefaultsFromParentModel = {
            //                filePath: this.get('filePath'),
            //                manager: this.get('manager'),
            //                player: this.get('player'),
            //                idPrefix: this.get('idPrefix')
            //            };
            //            this.set('virusDataRightPanelModelObj', new MathInteractives.Common.Interactivities.VirusZapper.Models.VirusDataWrapper.VirusDataRightPanel(modelDefaultsFromParentModel));
            //            this.set('virusDataTableModelObj', new MathInteractives.Common.Interactivities.VirusZapper.Models.VirusDataWrapper.VirusDataTable(modelDefaultsFromParentModel));
            //            console.log("Wrapper");

        },

        /**
        * Updates table values
        * @method updateTableData
        * @param type {} Type of question
        * @param qsn {Number} Current question number
        * @param ans {Number} Answer entered by the user
        * @param status {String}
        * @public
        */
        updateTableData: function (type, qsn, ans, status) {
            this.qsnType.push(type);
            this.tableDataCol1.push(qsn);
            this.tableDataCol2.push(ans);
            this.tableDataCol3.push(status);
        },

        /**
        * Clears table values
        * @method clearTableData
        * @public
        */
        clearTableData: function () {
            this.qsnType = [];
            this.tableDataCol1 = [];
            this.tableDataCol2 = [];
            this.tableDataCol3 = [];
            this.zappedCount = 0;
        },

        /**
        * Increases count of zapped viruses by 1
        * @method increaseZappedCount
        * @public
        */
        increaseZappedCount: function () {
            this.zappedCount++;
        },

        /**
        * Increases count of missed viruses by 1
        * @method increaseMissedCount
        * @public
        */
        increaseMissedCount: function () {
            this.missedCount;
        }
        //        generateVirusDataWrapperView: function (model, $_el) {
        //            if (model) {
        //                var virusDataWrapperView = new MathInteractives.Common.Interactivities.VirusZapper.Views.VirusDataWrapper({ model: model, el: $_el });
        //                return virusDataWrapperView;
        //            }
        //        }

    }
    )
})();