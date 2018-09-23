(function (MathUtilities) {
    'use strict';

    MathUtilities.Tools.Components = {};

    MathUtilities.Tools.Components.SaveState = {};

    MathUtilities.Tools.Components.SaveState.Models = {};

    MathUtilities.Tools.Components.SaveState.Models.MaintainState = new Backbone.Model.extend({},
    {
        /*
        Function to save the state of the user for the current tool.
        @param name: Name of the tool in string format.
        @param data: Data to be save in JSON object format.
        @return: Returns true if data was saved else false local storage is not supported in the browser.
        */
        saveState: function (name, data) {
            if (this.isDataStorageSupported) {
                localStorage[name] = JSON.stringify(data);
                return true;
            }
            else {
                return false;
            }
        },

        /*
        Function to retrieve state data stored for the current tool.
        @param name: Name of the tool in string format for which the data is to retrieved.
        @return: Json data for the tool, null if data for the tool is not present or false if local data storage is not supported for the browser.
        */
        retrieveState: function (name) {
            if (this.isDataStorageSupported) {
                var data = localStorage[name];
                if (data) {
                    return $.parseJSON(data);
                }
                else {
                    return null;
                }
            }
            else {
                return false;
            }
        },

        /*
        Function to check if local data storage is supported for the browser.
        @return: true if local data storage is supported else false
        */
        isDataStorageSupported: function () {
            return (typeof (Storage) !== 'undefined');
        }
    });
} (window.MathUtilities));