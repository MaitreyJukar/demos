(function () {
    'use strict';
    /**
    * Contains common functions of Model
    * @class Base
    * @extends Backbone.Model
    * @namespace MathInteractives.Common.Player.Models
    **/
    MathInteractives.Common.Player.Models.Base = Backbone.Model.extend({
        /*
        * handles logging
        * @method log
        * @public
        * @param {string} logString
        */
        log: function (logString) {
            MathInteractives.Debugger.log(logString);
        },


        /*
        * Returns json data for specified ID
        * @method getJson
        * @public
        * @param {string} jsonId
        * @return {object} json object
        */
        getJson: function getJson(jsonId) {
            var jsonData = this.get('jsonData'), currentJson = jsonData[jsonId];
            if (jsonData !== null && typeof jsonData !== 'undefined') {
                if (currentJson) {
                    return currentJson.data;
                }
                return null;
            }
        },

        /*
      * Returns Accessibility State
      * @method isAccessible
      * @public
      * @return {bool} isAccessible 
      */
        isAccessible: function isAccessible() {
            var manager = this.get('manager');
            if (manager) {
                return this.get('manager').model.get('isAccessible');
            }
            return false;
        },

        /*
        * Override Backbone set method to add check for read only attributes
        * @method set
        * @public
        * @param {string} attribute
        * @param {Object} option
        * @param {Bool} silent used to avoid error 
        * @return {object} 
        */
        set: function set(attribute, option, silent) {
            if (!silent) {
                switch (attribute) {
                    case 'jsonData': {
                        throw 'jsonData overwrite not allowed';
                        break;
                    }
                }
            }

            return Backbone.Model.prototype.set.call(this, attribute, option);
        },
        toJSON: function () {
            // check if requires serialization
            var player = this.get('player');
            if (player !== null && player !== undefined && player.serializationRequired === true) {
                MathInteractives.Common.Player.Models.Base.serializeModel(this);
            }
            return this.attributes;
        },
        /**
        * Parses the json. Should be called from interactive
        * @method initializeSavedState
        * @returns parsed model
        */
        initializeSavedState: function initializeSavedState() {
            var newModel = new Backbone.Model(),
                self = this;

            this.parseModel(this.attributes, newModel);
            $.each(newModel.attributes, function (key, value) {
                self.set(key, value);
            });
        },
        /**
        * Compares the current state of the interactive model with the save state
        * @method compareSavedState
        * @param tabIndexToCompare {Number} Stores the index of tab for comparison
        * @returns true if save state is same as compared to the current state of the interactive model
        */
        compareSavedState: function compareSavedState(tabIndexToCompare) {
            var playerModel = this.get('player').model,
                activeTab = (typeof tabIndexToCompare === 'undefined') ? playerModel.getCurrentActiveTab() : tabIndexToCompare,
                attrForSaveStateComparison = playerModel.getAttrsForSaveStateComparison()[activeTab],
                previousSaveState = JSON.parse(playerModel.get('previousSaveState')),
                attrsToIgnore = this.get('attributesToIgnore') || [],
                attrsToIgnoreConfigTabsData = playerModel.get('config').tabsData[activeTab].view.attributesToIgnore || [],   // attrs in attributesToIgnore in tabsData
                tabAttrsToIgnore = [],
                previousState = null,
                previousStateObj = null,
                currentState = null;

            if (previousSaveState) {
                if (attrForSaveStateComparison) {
                    previousStateObj = previousSaveState[attrForSaveStateComparison];

                    // ignore attrs in attributesToIgnore inside attrForSaveStateComparison
                    if (this.attributes[attrForSaveStateComparison] instanceof Backbone.Model) {
                        tabAttrsToIgnore = this.attributes[attrForSaveStateComparison].attributes.attributesToIgnore
                    } else {
                        tabAttrsToIgnore = this.attributes[attrForSaveStateComparison].attributesToIgnore
                    }
                    if (Array.isArray(tabAttrsToIgnore)) {
                        attrsToIgnore = attrsToIgnore.concat(tabAttrsToIgnore);
                    }

                    attrsToIgnore = attrsToIgnore.concat(attrsToIgnoreConfigTabsData);
                    previousState = playerModel.ignoreAttrsForSaveState(previousStateObj, attrsToIgnore);
                    currentState = playerModel.ignoreAttrsForSaveState(this.attributes[attrForSaveStateComparison], attrsToIgnore);
                    return previousState === currentState;
                } else {
                    previousState = playerModel.ignoreAttrsForSaveState(JSON.parse(playerModel.get('previousSaveState')), attrsToIgnore),
                    currentState = playerModel.ignoreAttrsForSaveState(this.attributes, attrsToIgnore);
                    return previousState === currentState;
                }
            }
            return false;
        },

        /*
        * Updates the previous save state to the current state of the interactive
        * This is used to decide whether to show a clear data pop-up or not after comparison
        * @method updatePreviousSaveState
        * @param tabIndexToCompare {Number} Stores the index of tab for comparison
        * @public
        */
        updatePreviousSaveState: function (tabIndexToCompare) {
            this.get('player')._updatePreviousSaveState(tabIndexToCompare);
        },

        /**
        * Parses a collection (Use for nested collections)
        * @method parseCollection
        * @param obj{Object} The object which has to be parsed
        * @param collection{Backbone.Collection} The collection in which the parsed object will be placed
        * @return collection{Backbone.Collection} The collection in which the parsed object will be placed
        */
        parseCollection: function parseCollection(obj, collection) {
            var self = this;
            if (obj.length > 0) {
                obj.pop();
            }
            $.each(obj, function (key, value) {
                var modelType = value.modelName,
                    newModel;

                if (modelType !== null && modelType !== undefined) {
                    newModel = self.executeFunctionByName(modelType, window);
                } else {
                    newModel = new MathInteractives.Common.Player.Models.Base();
                }
                //var newModel = new MathInteractives.Common.Player.Models.Base();
                collection.add(newModel);
                self.parseModel(value, newModel);
            });
            return collection;
        },
        /**
        * Parses a model (Use for nested models)
        * @method parseModel
        * @param obj{Object} The object which has to be parsed
        * @param model{Backbone.Model} The model in which the parsed object will be placed
        */
        parseModel: function parseModel(obj, model) {
            for (var i in obj) {
                if (obj.hasOwnProperty(i)) {
                    if (typeof obj[i] === 'object' && obj[i] !== null && obj[i] !== undefined) {
                        if (obj[i].length !== null && obj[i].length !== undefined) {
                            // it is a collection or an array
                            if (obj[i].length > 0) {
                                var lastEle = (obj[i])[obj[i].length - 1];
                                if (lastEle.instanceType === 'Collection') {
                                    // it is a collection
                                    // but what type of collection is it??
                                    var collectionType = lastEle.collectionName, // string
                                        childCollection;

                                    if (collectionType !== null && collectionType !== undefined) {
                                        childCollection = this.executeFunctionByName(collectionType, window);
                                    } else {
                                        childCollection = new MathInteractives.Common.Player.Collections.Base();
                                    }
                                    //var childCollection = new MathInteractives.Common.Player.Collections.Base();

                                    // required for 2nd saved state so that all the parsed collections have serialization attribute
                                    //childCollection.serializationRequired = true; // Not required now
                                    this.parseCollection(obj[i], childCollection);
                                    model.set(i, childCollection);
                                }
                                else {
                                    // it is an array
                                    model.set(i, obj[i]);
                                }
                            } else {
                                // it is obv an array
                                model.set(i, obj[i]);
                            }
                        }
                        else if (obj[i].instanceType === 'Model') {
                            // it is a model

                            // but what type of model is it??
                            var modelType = obj[i].modelName, // string
                                childModel;

                            if (modelType !== null && modelType !== undefined) {
                                childModel = this.executeFunctionByName(modelType, window);
                            } else {
                                childModel = new MathInteractives.Common.Player.Models.Base();
                            }
                            //var childModel = new MathInteractives.Common.Player.Models.Base(); // Not required now
                            this.parseModel(obj[i], childModel);
                            model.set(i, childModel);
                        }
                        else if (obj[i].instanceType === 'Object') {
                            // It is an object
                            model.set(i, obj[i]);
                        } else {
                            // Error Alien Type
                            //console.log('ERROR: ALIEN TYPE DETECTED WHILE PARSING');
                        }
                    } else {
                        model.set(i, obj[i]);
                    }
                }
            }
        },
        executeFunctionByName: function executeFunctionByName(functionName, context /*, args */) {
            var args = Array.prototype.slice.call(arguments, 2);
            var namespaces = functionName.split(".");
            var func = namespaces.pop();
            for (var i = 0; i < namespaces.length; i++) {
                context = context[namespaces[i]];
            }
            //console.log(context[func]);
            return new context[func]();

        }
    }, {
        /**
        * Serializes the model (Mainly adds a instanceType property to Array, Object , Model and Collection and Normal attribute
        * @method serializeModel
        * @param model{Backbone.Model} The model that has to be serialized
        * @returns serialized model
        */
        serializeModel: function serializeModel(model) {
            var self = this;
            $.each(model.attributes, function (key, value) {
                if (value instanceof Backbone.Model) {
                    model.get(key).set('instanceType', 'Model');
                    model.get(key).set('modelName', model.modelName);
                    self.serializeModel(value);
                } else if (value instanceof Backbone.Collection) {
                    //model.get(key).instanceType = 'Collection';
                    self.serializeCollection(value);
                } else if (value instanceof Array) {
                    //model.get(key).instanceType = 'Array';
                } else if (value instanceof Object) {
                    model.get(key).instanceType = 'Object';
                }
            });

            return model;
        },
        /**
        * Serializes the passed collection
        * @method serializeCollection
        * @param model{Backbone.Collection} The collection that has to be serialized
        */
        serializeCollection: function serializeCollection(collection) {
            var i = 0;
            for (; i < collection.models.length; i++) {
                collection.models[i].set('instanceType', 'Model');
                collection.models[i].set('modelName', collection.models[i].modelName);
                this.serializeModel(collection.models[i]);
            }
            //collection.add({ 'instanceType': 'Collection' });
        }

    })
})();