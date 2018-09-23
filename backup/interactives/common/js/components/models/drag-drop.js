(function (namespace) {
    'use strict';
    var DragDrop = null,
        ClassName = null,
        CurrentObject = null;
    /**
    * Class for making objects draggable and droppable
    *
    * @class DragDrop
    * @constructor
    * @extends MathInteractives.Common.Player.Models.BaseInteractive
    * @namespace MathInteractives.Common.Components.Models.DragDrop
    **/
    namespace.Common.Components.Models.DragDrop = MathInteractives.Common.Player.Models.BaseInteractive.extend({
        defaults: {
            type: null,
            elements: null,
            options: null,
            dropSlots: null,
            preventDefaultFunctionality: null,
            idPrefix: null,
            manager: null,
            player: null,
            contextMenuScreenId: null,

            _elementModels: null,
            _scope: null,
            _contextMenuView: null,
            currentSelectedDraggableIndex: -1,

            /**
            * Holds boolean for IE browser
            *
            * @property isIE
            * @type Boolean
            * @default  null
            * @private
            */
            isIE: null
        },

        initialize: function () {

            this.setUpAllProperties();
            switch (this.getType()) {

                case 'drag':
                    this.setUpDraggable();
                    break;

                case 'drop':
                    this.setUpDroppable();
                    break;

                default: ClassName.log(ClassName.LOG_MESSAGES.INVALID);
                    break;
            }

        },

        setUpAllProperties: function setUpAllProperties() {

            this.setIdPrefix(this.getIdPrefix());
            this.set('isIE', MathInteractives.Common.Utilities.Models.BrowserCheck.isIE);

            if (ClassName.checkIsNull(this.getIdPrefix()) || ClassName.checkIsUndefined(this.getIdPrefix())) {
                ClassName.log(ClassName.LOG_MESSAGES.INVALID_IDPREFIX);
                return false;
            }
            else {
                this.setScope(this.getIdPrefix());
            }

            this.setElements(this.getElements());
            this.setDropSlots(this.getDropSlots() ? this.getDropSlots() : []);
            this.setOptions(this.getOptions() ? this.getOptions() : {});
            this.set_elementModels([]);
            this.setPreventDefaultFunctionality(this.getPreventDefaultFunctionality());
            this.setManager(this.getManager());
            this.setPlayer(this.getPlayer());
            this.setContextMenuScreenId(this.getContextMenuScreenId());



            return;

        },

        setUpDraggable: function setUpDraggable() {
            this.makeElementsDraggable(this.getOptions(), this.getPreventDefaultFunctionality(), this.getIdPrefix());
            this.populateDropSlotsAndAttachEvents();

            if (!(this.getContextMenuScreenId() === null)) {
                this.generateContextMenuForDraggable();
                this._generateContextMenu();
            }
            return;
        },

        setUpDroppable: function setUpDroppable() {
            this.makeElementsDroppable(this.getOptions(), this.getPreventDefaultFunctionality(), this.getIdPrefix());
            this.attachDropEvents();
            return;
        },


        makeElementsDraggable: function makeElementsDraggable(options, preventDefaultFunctionality, scope) {

            var self = this,
                elements = self.getElements(),
                length = elements.length,
                index = null,
                id = null;

            for (index = 0; index < length; index++) {
                id = ClassName.getIdSelectorString(elements[index]);
                if (!ClassName.checkIsDraggableAlready(scope, id)) {
                    self.makeElementDraggable(id, options, preventDefaultFunctionality, scope);
                }
            }
            return;
        },

        makeElementDraggable: function makeElementDraggable(id, options, preventDefaultFunctionality, scope) {
            var self = this,
                draggableElementModel = new ClassName.Draggable({
                    id: id,
                    options: options,
                    preventDefaultFunctionality: preventDefaultFunctionality,
                    idPrefix: scope
                });
            ClassName.addDraggableElement(scope, draggableElementModel);
            this.get_elementModels().push(draggableElementModel);
            $(draggableElementModel.getId()).off('click').on('click', $.proxy(self.keyPressHandler, self));
            return;
        },

        keyPressHandler: function (event) {
            // Stop event propagation useful in case the draggable is placed inside a droppable
            //      else droppable's keypress will be triggered.
            event.stopPropagation();
            if (event.which === 1) {
                return;
            }
            var self = this,
                scope = self.getIdPrefix(),
                idPrefixLength = scope.length,
                interactivityView = ClassName.getAccessibilityView(scope),
                eventTarget = event.target.id.slice(idPrefixLength),
                initialTabIndex = interactivityView.getTabIndex(eventTarget),
                dropSlotsArray = this.getDropSlots(),
                nextTabIndex = initialTabIndex + 1,
                dropSlotId = null, counter = 0,
                enabledDropSlotsArray = [],
                enabledDropSlotsArrayLength = null,
                dropSlotsArrayLength = dropSlotsArray.length;

            // selected droppable stored (usefull for swapping)
            MathInteractives.Common.Components.Models.DragDrop.DRAGGABLE_SELECTED = event.target.parentElement;
            var droppableParent = $(event.target).parent().attr('id');
            // loop to get enabled drop slots from all drop slots
            for (counter = 0; counter < dropSlotsArrayLength; counter++) {
                dropSlotId = dropSlotsArray[counter];
                if (ClassName.getModelFromDroppables(scope, dropSlotId).get('isDroppable') && dropSlotId !== droppableParent) {
                    enabledDropSlotsArray.push(dropSlotId);
                }
            }
            enabledDropSlotsArrayLength = enabledDropSlotsArray.length;
            for (counter = 0; counter < enabledDropSlotsArrayLength; counter++, nextTabIndex++) {
                dropSlotId = enabledDropSlotsArray[counter];
                $('#' + dropSlotId).off('click').on('click', $.proxy(self.keyPressDropEventHandler, self, event));
                dropSlotId = enabledDropSlotsArray[counter].slice(idPrefixLength);
                interactivityView.setTabIndex(dropSlotId, nextTabIndex);

                $('#' + scope + dropSlotId).off('keydown.selection').on('keydown.selection', function (event) {
                    if (event.keyCode === 13 || event.keyCode === 32) {
                        $.proxy(self.removeDropSlotTabIndex, self);
                    }
                })

                //focus on 1st dropslot and attach event to remove tab index if shift + tab on 1st dropt slot
                if (counter === 0) {
                    interactivityView.setFocus(dropSlotId);
                    $('#' + scope + dropSlotId).off('keydown.remove-tab-index-first-element').on('keydown.remove-tab-index-first-element',

                    function (event) {
                        if (event.keyCode === 9 && event.shiftKey) {
                            $('body').off('keyup.remove-tab-index-first-element').on('keyup.remove-tab-index-first-element',
                            function (event) {
                                if (event.keyCode === 9) {
                                    $('body').off('keyup.remove-tab-index-first-element');
                                    $.proxy(self.removeDropSlotTabIndex, self)();
                                    if (self.get('isIE')) {
                                        interactivityView.setFocus(self.get('elements')[0].replace(self.get('idPrefix'), ''), 5);
                                    }
                                }
                            }

                            );
                        }
                    });
                }

                //attach event to remove tab index if tab on last dropt slot. It also work for element with single dropslot
                if (counter === enabledDropSlotsArrayLength - 1) {
                    $('#' + scope + dropSlotId).off('keydown.remove-tab-index-last-element').on('keydown.remove-tab-index-last-element',

                    function (event) {
                        if (event.keyCode === 9 && !event.shiftKey) {
                            $('body').off('keyup.remove-tab-index-last-element').on('keyup.remove-tab-index-last-element',
                            function (event) {
                                $('body').off('keyup.remove-tab-index-last-element');
                                $.proxy(self.removeDropSlotTabIndex, self)();
                            });
                        }
                    });
                }
            }
        },

        // sets tab index of drop slot depending on draggable selected
        setTabIndexForDraggable: function setTabIndexForDraggable(dropSlotsArray, initialTabIndex, interactivityView, event) {
            //event.stopPropagation();
            // event.preventDefault();
            //event.stopImmediatePropagation();
            if (event && $(event.target.parentElement).hasClass('ui-draggable')) {
                return;
            }
            var nextTabIndex = initialTabIndex + 1,
                counter, idPrefixLength = this.getIdPrefix().length,
                dropSlotId = null, dropSlotsArrayLength = dropSlotsArray.length;
            for (counter = 0; counter < dropSlotsArrayLength; counter++, nextTabIndex++) {
                if (ClassName.getModelFromDroppables(this.getIdPrefix(), dropSlotsArray[counter]).get('isDroppable')) {
                    dropSlotId = dropSlotsArray[counter].slice(idPrefixLength);
                    interactivityView.setTabIndex(dropSlotId, nextTabIndex);
                }
            }
        },

        keyPressDropEventHandler: function keyPressDropEventHandler(originalEvent, currentEvent) {
            var ui = {
                draggable: [originalEvent.target]
            }
            var dropIdString = currentEvent.currentTarget.id,
                dropSlotsArray = this.getDropSlots(),
                dropId = dropSlotsArray.indexOf(dropIdString),
                idPrefix = this.getIdPrefix();

            ClassName.getModelFromDroppables(idPrefix, dropSlotsArray[dropId]).dropHandler(originalEvent, ui);
            this.removeDropSlotTabIndex();
        },

        removeDropSlotTabIndex: function removeDropSlotTabIndex(event) {
            var self = this,
                scope = self.getIdPrefix(),
                interactivityView = ClassName.getAccessibilityView(scope),
                dropSlotsArray = this.getDropSlots(),
                dropSlotId = null, counter = 0,
                dropSlotsArrayLength = dropSlotsArray.length;
            for (counter = 0; counter < dropSlotsArrayLength; counter++) {
                dropSlotId = dropSlotsArray[counter].replace(scope, '');
                interactivityView.enableTab(dropSlotId, false);
            }
        },


        populateDropSlotsAndAttachEvents: function populateDropSlotsAndAttachEvents() {
            var self = this,
                elements = self.get_elementModels(),
                elementsLength = elements.length,
                dropSlots = self.getDropSlots(),
                length = dropSlots.length,
                index = null,
                elementsCounter = null,
                droppableContainerId = null;

            for (index = 0; index < length; index++) {

                droppableContainerId = ClassName.getIdSelectorString(dropSlots[index]);

                for (elementsCounter = 0; elementsCounter < elementsLength; elementsCounter++) {
                    elements[elementsCounter].addDropSlot(droppableContainerId);
                    self.attachEvents(elements[elementsCounter]);
                }

            }
            return;
        },

        makeElementsDroppable: function makeElementsDroppable(options, preventDefaultFunctionality, scope) {
            var self = this,
                elements = self.getElements(),
                length = elements.length,
                index = null,
                id = null;
            for (index = 0; index < length; index++) {
                id = ClassName.getIdSelectorString(elements[index]);
                if (!ClassName.checkIsDroppableAlready(scope, id)) {
                    self.makeElementDroppable(id, options, preventDefaultFunctionality, scope);
                }
            }

            return;
        },

        makeElementDroppable: function makeElementDroppable(id, options, preventDefaultFunctionality, idPrefix) {
            var scope = this.getIdPrefix(),
                droppableElementModel = new ClassName.Droppable({
                    id: id,
                    options: options,
                    preventDefaultFunctionality: preventDefaultFunctionality,
                    idPrefix: idPrefix
                });

            ClassName.addDroppableElement(scope, droppableElementModel);
            this.get_elementModels().push(droppableElementModel);
            return;
        },

        attachDropEvents: function attachDropEvents() {
            var self = this,
                elements = self.get_elementModels(),
                elementsLength = elements.length,
                elementsCounter = null;
            for (elementsCounter = 0; elementsCounter < elementsLength; elementsCounter++) {
                self.attachEvents(elements[elementsCounter]);
            }

            return;
        },

        attachEvents: function attachEvents(modelObject) {
            var self = this;
            if (this.getType() === 'drag') {
                self.stopListening(modelObject, ClassName.INDIVIDUAL_EVENTS.DRAG.START, self.dispatchDragStartEvent);
                self.stopListening(modelObject, ClassName.INDIVIDUAL_EVENTS.DRAG.DRAG, self.dispatchDragEvent);
                self.stopListening(modelObject, ClassName.INDIVIDUAL_EVENTS.DRAG.STOP, self.dispatchDragStopEvent);


                self.listenTo(modelObject, ClassName.INDIVIDUAL_EVENTS.DRAG.START, self.dispatchDragStartEvent);
                self.listenTo(modelObject, ClassName.INDIVIDUAL_EVENTS.DRAG.DRAG, self.dispatchDragEvent);
                self.listenTo(modelObject, ClassName.INDIVIDUAL_EVENTS.DRAG.STOP, self.dispatchDragStopEvent);
            }
            else if (this.getType() === 'drop') {
                self.stopListening(modelObject, ClassName.INDIVIDUAL_EVENTS.DROP.DROP, self.dispatchDropEvent);
                self.listenTo(modelObject, ClassName.INDIVIDUAL_EVENTS.DROP.DROP, self.dispatchDropEvent);
            }
            return;
        },
        _functionCaller: function _functionCaller(functionType, parameter) {
            var self = this,
                scope = this.getIdPrefix(),
                type = this.getType(),
                elements = self.get_elementModels(),
                elementsLength = elements.length,
                elementsCounter = null;

            for (elementsCounter = 0; elementsCounter < elementsLength; elementsCounter++) {
                ClassName[functionType](scope, type, elements[elementsCounter].getId(), parameter);
            }

            return;
        },
        _disableIndividialElement: function _disableIndividialElement(functionType, id) {
            var scope = this.getIdPrefix(),
                type = this.getType();
            ClassName[functionType](scope, type, id);
            return;
        },
        _enableIndividialElement: function _enableIndividialElement(functionType, id) {
            var scope = this.getIdPrefix(),
                type = this.getType();
            ClassName[functionType](scope, type, id);
            return;
        },
        _generateContextMenu: function _generateContextMenu() {
            var self = this,
                scope = this.getIdPrefix(),
                accessibilityView = ClassName.getAccessibilityView(scope),
                dropSlots = this.getDropSlots(),
                contextMenuView = null,
                player = this.getPlayer(),
                elements = self.get_elementModels(),
                index = 0,
                jQueryElementArray = [],
                elementsLength = elements.length,
                manager = self.getManager(),
                contextMenuScreenId = this.getContextMenuScreenId(),
                dropSlotsLength = dropSlots.length;
            for (index = 0; index < elementsLength; index++) {
                jQueryElementArray.push($(elements[index].getId()));
                jQueryElementArray[index].off(MathInteractives.global.ContextMenu.CONTEXTMENU_SELECT).on(MathInteractives.global.ContextMenu.CONTEXTMENU_SELECT, $.proxy(this.onContextMenuSelect, this));
                jQueryElementArray[index].off(MathInteractives.global.ContextMenu.CONTEXTMENU_HIDE).on(MathInteractives.global.ContextMenu.CONTEXTMENU_HIDE, $.proxy(this.onContextMenuHide, this));
            }

            var options = {
                el: player.$el,
                prefix: scope,
                elements: jQueryElementArray,
                contextMenuCount: dropSlotsLength,
                manager: manager,
                thisView: self,
                nestedMenuData: {},
                screenId: contextMenuScreenId
            }
            contextMenuView = MathInteractives.global.ContextMenu.initContextMenu(options);
            this.setContextMenuView(contextMenuView);

            return;
        },

        editContextMenu: function (elementIds, ignore) {
            var contextMenuView = this.getContextMenuView();
            contextMenuView.editContextMenu(elementIds, ignore);
        },

        onContextMenuHide: function onContextMenuHide(originalEvent, contextMenuEvent) {
            var interactivityView = ClassName.getAccessibilityView(this.getIdPrefix()),
                idPrefixLength = this.getIdPrefix().length,
                originalEventId = originalEvent.target.id,
                originalEventAccId = originalEventId.slice(idPrefixLength);
            interactivityView.setFocus(originalEventAccId);

        },
        onContextMenuSelect: function onContextMenuSelect(originalEvent, contextMenuEvent) {
            var ui = {
                draggable: [originalEvent.currentTarget]
            }
            var dropIdString = contextMenuEvent.currentTarget.id,
                dropId = dropIdString.split('-'),
                cMenuIndex, dropType;
            // dropId++;
            // dropType = dropIdString[dropId];
            dropType = dropId[dropId.length - 1];
            cMenuIndex = parseInt(dropType);
            var idPrefix = this.getIdPrefix();
            this.removeDropSlotTabIndex();
            // Store droppable selected (useful for swapping)
            ClassName.DRAGGABLE_SELECTED = originalEvent.target.parentElement;
            ClassName.getModelFromDroppables(idPrefix, this.getDropSlots()[cMenuIndex]).dropHandler(originalEvent, ui);
        },
        /*-----------events------------------*/
        dispatchDragStartEvent: function dragStartHandler(customEventObject) {
            this.trigger(ClassName.EVENTS.DRAG.START, customEventObject);
        },
        dispatchDragEvent: function dragHandler(customEventObject) {
            this.trigger(ClassName.EVENTS.DRAG.DRAG, customEventObject);
        },
        dispatchDragStopEvent: function dragStopHandler(customEventObject) {
            this.trigger(ClassName.EVENTS.DRAG.STOP, customEventObject);
        },

        dispatchDropEvent: function dispatchDropEvent(customEventObject) {
            this.trigger(ClassName.EVENTS.DROP.DROP, customEventObject);
        },
        /*-----------events-end---------------*/



        /*------------PUBLIC-FUNCTIONS----------------------*/

        destroy: function destroy() {
            this._functionCaller('DESTROY');
            return;
        },

        addDropSlot: function addDropSlot(dropSlotId) {//only for drag type
            this._functionCaller('ADD_DROP_SLOT', dropSlotId);
            return;
        },

        disable: function disable() {
            this._functionCaller('DISABLE');
            return;
        },
        enable: function enable() {
            this._functionCaller('ENABLE');
            return;
        },

        addOptions: function addOptions(options) {
            if (options) {
                this._functionCaller('ADD_OPTIONS', options);
                return;
            }
            return;
        },

        generateContextMenuForDraggable: function generateContextMenuForDraggable() {
            if (this.getType() === 'drag') {
                this._generateContextMenu();
            }
            return;
        },

        disableIndividialElement: function disableIndividialElement(id) {// Either drag or drop type
            this._disableIndividialElement('DISABLE', id);
        },
        enableIndividialElement: function enableIndividialElement(id) {// Either drag or drop type
            this._disableIndividialElement('ENABLE', id);
        },
        /*------------PUBLIC-FUNCTIONS-END----------------------*/



        /*------------getters/setters----------------------*/
        getIdPrefix: function getIdPrefix() {
            return this.get('idPrefix');
        },

        setIdPrefix: function setIdPrefix(arg) {
            this.set('idPrefix', arg);
            return;
        },

        getScope: function getScope() {
            return this.get('_scope');
        },

        setScope: function setScope(arg) {
            this.set('_scope', arg);
            return;
        },

        getType: function getType() {
            return this.get('type');
        },

        getElements: function getElements() {
            return this.get('elements');
        },

        setElements: function setElements(arg) {
            this.set('elements', arg);
            return;
        },

        getDropSlots: function getDropSlots() {
            return this.get('dropSlots');
        },

        setDropSlots: function setDropSlots(arg) {
            var isDropSlotsNull = ClassName.checkIsNull(arg);
            if (isDropSlotsNull) {
                arg = [];
            }
            this.set('dropSlots', arg);
            return;
        },

        getOptions: function getOptions() {
            return this.get('options');
        },

        setOptions: function setOptions(arg) {
            var isOptionsNull = ClassName.checkIsNull(arg);
            if (isOptionsNull) {
                arg = {};
            }
            this.set('options', arg);
            return;
        },

        getPreventDefaultFunctionality: function getPreventDefaultFunctionality() {
            return this.get('preventDefaultFunctionality');
        },
        setPreventDefaultFunctionality: function setPreventDefaultFunctionality(arg) {
            this.set('preventDefaultFunctionality', arg);
            return;
        },

        get_elementModels: function get_elementModels() {
            return this.get('_elementModels');
        },

        set_elementModels: function set_elementModels(arg) {
            this.set('_elementModels', arg);
            return;
        },

        getManager: function getManager() {
            return this.get('manager');
        },

        setManager: function setManager(arg) {
            this.set('manager', arg);
            return;
        },

        getPlayer: function getPlayer() {
            return this.get('player');
        },

        setPlayer: function setPlayer(arg) {
            this.set('player', arg);
            return;
        },

        getContextMenuView: function getContextMenuView() {
            return this.get('_contextMenuView');
        },

        setContextMenuView: function setContextMenuView(arg) {
            this.set('_contextMenuView', arg);
            return;
        },

        getContextMenuScreenId: function getContextMenuScreenId() {
            return this.get('contextMenuScreenId');

        },

        setContextMenuScreenId: function setContextMenuScreenId(arg) {
            this.set('contextMenuScreenId', arg);
            return;
        }

        /*------------getters/setters end------------------*/
    },
    {

        SCOPES: {},

        currentScope: null,

        addDraggableElement: function addDraggableElement(scope, draggableElementModel) {
            ClassName.SCOPES[scope].Draggables[draggableElementModel.getId()] = draggableElementModel;
            return;
        },

        addDroppableElement: function addDroppableElement(scope, droppableElementModel) {
            ClassName.SCOPES[scope].Droppables[droppableElementModel.getId()] = droppableElementModel;
            return;
        },

        getModelFromDraggables: function getModelFromDraggables(scope, id) {
            id = id.indexOf('#') < 0 ? ClassName.getIdSelectorString(id) : id;

            CurrentObject = ClassName.SCOPES[scope].Draggables[id];

            if (CurrentObject === undefined || CurrentObject === null) {
                ClassName.log(ClassName.LOG_MESSAGES.INVALID);
                return null;
            } else {
                return CurrentObject;
            }
            return;
        },

        getModelFromDroppables: function getModelFromDroppables(scope, id) {
            id = id.indexOf('#') < 0 ? ClassName.getIdSelectorString(id) : id;
            CurrentObject = ClassName.SCOPES[scope].Droppables[id];

            if (CurrentObject === undefined || CurrentObject === null) {
                ClassName.log(ClassName.LOG_MESSAGES.INVALID);
                return null;
            } else {
                return CurrentObject;
            }
        },

        getAccessibilityView: function getAccessibilityView(scope) {
            CurrentObject = ClassName.SCOPES[scope].AccessibilityView;

            if (CurrentObject === undefined || CurrentObject === null) {
                ClassName.log(ClassName.LOG_MESSAGES.INVALID);
                return null;
            } else {
                return CurrentObject;
            }

        },

        removeItemFromDraggables: function removeItemFromDraggables(scope, id) {
            id = id.indexOf('#') < 0 ? ClassName.getIdSelectorString(id) : id;

            ClassName.SCOPES[scope].Draggables[id] = null;
            return;
        },

        removeItemFromDroppables: function removeItemFromDroppables(scope, id) {
            id = id.indexOf('#') < 0 ? ClassName.getIdSelectorString(id) : id;
            // Remove stored reference of droppable
            ClassName.SCOPES[scope].Droppables[id] = null;
            return;
        },

        checkIsDraggableAlready: function checkIsDraggable(scope, id) {
            id = id.indexOf('#') < 0 ? ClassName.getIdSelectorString(id) : id;

            var property = ClassName.SCOPES[scope].Draggables[id],
                isNull = ClassName.checkIsNull(property),
                isUndefined = ClassName.checkIsUndefined(property);

            if (isNull === false && isUndefined === false) {
                return true;
            }
            return false;
        },

        checkIsDroppableAlready: function checkIsDroppable(scope, id) {
            id = id.indexOf('#') < 0 ? ClassName.getIdSelectorString(id) : id;

            var property = ClassName.SCOPES[scope].Droppables[id],
                isNull = ClassName.checkIsNull(property),
                isUndefined = ClassName.checkIsUndefined(property);

            if (isNull === false && isUndefined === false) {
                return true;
            }
            return false;
        },


        /*---------------Draggable Models----------------------------*/
        Draggable: Backbone.Model.extend({
            defaults: {
                id: null,
                options: null,
                isDraggable: null,
                dropSlots: null,
                preventDefaultFunctionality: null,
                idPrefix: null,

                _isClone: null
            },

            initialize: function () {
                this.setIsDraggable(false);
                this.setDropSlots([]);
                this.set_isClone(false);
                this.initializeDraggable();
                this.setPreventDefaultFunctionality(this.getPreventDefaultFunctionality());
                this.setIdprefix(this.getIdprefix());
                this.bindPropertyChangeListeners();
            },

            initializeDraggable: function initializeDraggable() {
                var id = this.getId(),
                    UTILCLASS = MathInteractives.Common.Utilities.Models.Utils;
                if (this.isIdNull()) {
                    return;
                }

                var self = this,
                    $element = $(id),
                    draggableOptions = self.getOptions();

                if (draggableOptions.helper === 'clone') {
                    self.set_isClone(true);
                }

                draggableOptions = self.overrideOptions(draggableOptions);


                //$.fn.EnableTouch(id);
                UTILCLASS.EnableTouch (id, {specificEvents: UTILCLASS.SpecificEvents.DRAGGABLE});
                $element.draggable(draggableOptions);
                this.setIsDraggable(true);
                return;
            },

            overrideOptions: function overrideOptions(draggableOptions) {
                var self = this;

                draggableOptions.revert = ClassName.checkIsUndefined(draggableOptions.revert) ? 'invalid' : draggableOptions.revert;
                draggableOptions.zIndex = ClassName.checkIsUndefined(draggableOptions.zIndex) ? 999 : draggableOptions.zIndex;

                if (draggableOptions.helper === null || typeof draggableOptions.helper === 'undefined') {
                    draggableOptions.helper = 'clone';
                }
                draggableOptions.start = $.proxy(self.dragStartHandler, self);
                draggableOptions.drag = $.proxy(self.dragHandler, self);
                draggableOptions.stop = $.proxy(self.dragStopHandler, self);
                return draggableOptions;
            },

            isIdNull: function isIdNull() {
                if (ClassName.checkIsNull(this.getId())) {
                    ClassName.log(ClassName.LOG_MESSAGES.NO_ID);
                    return true;
                }
                return false
            },

            addDropSlot: function addDropSlot(dropSlotId) {
                if (!this.isDropSlotAdded(dropSlotId)) {
                    this.getDropSlots().push(dropSlotId);
                }
                return;
            },

            isDropSlotAdded: function isDropSlotAdded(dropSlotId) {
                return this.getDropSlots().indexOf(dropSlotId) < 0 ? false : true;
            },

            dragStartHandler: function dragStartHandler(event, ui) {
                if (this.getIsDraggable() === false) {
                    return
                }
                var draggableElement = $(this.getId()),
                    customEventObject = ClassName._createCustomEventObject(event, ui, draggableElement);

                ClassName.getAccessibilityView(this.getIdprefix()).hideTabDrawer();

                if (!this.getPreventDefaultFunctionality() && !this.get_isClone()) {
                    draggableElement.css({ 'visibility': 'hidden' });
                }
                this.trigger(ClassName.INDIVIDUAL_EVENTS.DRAG.START, customEventObject);
                return;
            },

            dragHandler: function dragHandler(event, ui) {
                if (this.getIsDraggable() === false) {
                    return
                }
                var draggableElement = $(this.getId()),
                    customEventObject = ClassName._createCustomEventObject(event, ui, draggableElement);

                this.trigger(ClassName.INDIVIDUAL_EVENTS.DRAG.DRAG, customEventObject);
                return;
            },

            dragStopHandler: function dragStopHandler(event, ui) {
                if (this.getIsDraggable() === false) {
                    return
                }
                var draggableElement = $(this.getId()),
                    customEventObject = ClassName._createCustomEventObject(event, ui, draggableElement);

                if (!this.getPreventDefaultFunctionality() && !this.get_isClone()) {
                    draggableElement.css({ 'visibility': 'visible' });
                }

                this.trigger(ClassName.INDIVIDUAL_EVENTS.DRAG.STOP, customEventObject);
                return;
            },

            revertDraggableOnce: function (customEventObject) {
                // Executed as the callback for ---> MathInteractives.Common.Components.Models.DragDrop.REVERT_DRAGGABLE(customEvent)
                return;
            },

            bindPropertyChangeListeners: function bindPropertyChangeListeners() {
                this.on('change:options', $.proxy(this.onSetOptions, this));
                this.on('change:isDraggable', $.proxy(this.onSetIsDraggable, this));
            },

            /*------------listeners---------------*/

            onSetOptions: function onSetOptions() {
                $(this.getId()).draggable(this.getOptions());
                return;
            },

            onSetIsDraggable: function onSetIsDraggable() {
                switch (this.getIsDraggable()) {

                    case true: $(this.getId()).draggable('enable');
                        return;

                    case false: $(this.getId()).draggable('disable');
                        return;

                    default: ClassName.log(ClassName.LOG_MESSAGES.INVALID);
                        return;
                }

            },
            /*------------listeners-end-----------*/

            /*------------getters/setters---------------*/
            getId: function getId() {
                return this.get('id');
            },

            getIsDraggable: function getIsDraggable() {
                return this.get('isDraggable');
            },

            setIsDraggable: function setIsDrabbable(option) {
                var isUndefined = ClassName.checkIsUndefined(option);
                if (!isUndefined) {
                    this.set('isDraggable', option);
                    return;
                }
                return;
            },

            getDropSlots: function getDropSlots() {
                return this.get('dropSlots');
            },

            setDropSlots: function setDropSlots(arg) {
                this.set('dropSlots', arg);
                return;
            },

            getOptions: function getOptions() {
                return this.get('options');
            },

            setOptions: function getOptions(arg) {
                this.set('options', arg);
                return;
            },

            get_isClone: function get_isClone() {
                return this.get('_isClone');
            },

            set_isClone: function set_isClone(arg) {
                this.set('_isClone', arg);
                return;
            },

            getPreventDefaultFunctionality: function getPreventDefaultFunctionality() {
                return this.get('preventDefaultFunctionality');
            },
            setPreventDefaultFunctionality: function setPreventDefaultFunctionality(arg) {
                this.set('preventDefaultFunctionality', arg);
                return;
            },

            getIdprefix: function getIdprefix() {
                return this.get('idPrefix');
            },

            setIdprefix: function setIdprefix(arg) {
                this.set('idPrefix', arg);
                return;
            }

        }, {}),
        /*---------------Draggable Models End-----------------*/



        /*---------------Droppable Models---------------------*/
        Droppable: Backbone.Model.extend({
            defaults: {
                id: null,
                options: null,
                isDroppable: null,
                preventDefaultFunctionality: null,
                idPrefix: null
            },

            initialize: function () {
                this.setIsDroppable(false);
                this.initializeDroppable();
                this.setPreventDefaultFunctionality(this.getPreventDefaultFunctionality());
                this.setIdprefix(this.getIdprefix());
                this.bindPropertyChangeListeners();
                return;
            },

            initializeDroppable: function initializeDroppable() {
                var self = this,
                    id = this.getId(),
                    UTILCLASS = MathInteractives.Common.Utilities.Models.Utils;
                if (this.isIdNull()) {
                    return;
                }
                var $element = $(id),
                    droppableOptions = this.getOptions();

                droppableOptions.drop = $.proxy(self.dropHandler, self)

                //$.fn.EnableTouch(id);
                UTILCLASS.EnableTouch (id, {specificEvents: UTILCLASS.SpecificEvents.DRAGGABLE});

                $element.droppable(droppableOptions);
                this.setIsDroppable(true);
                return;
            },

            dropHandler: function dropHandler(event, ui) {
                if (this.getIsDroppable() === false) {
                    return
                }
                var scope = this.getIdprefix(),
                    droppableElement = $(this.getId()),
                    customEventObject = ClassName._createCustomEventObject(event, ui, droppableElement),
                    draggableSelectorString = ClassName.getIdSelectorString(ui.draggable[0].id),
                    draggableModel = ClassName.getModelFromDraggables(scope, draggableSelectorString),
                    draggableElement = null,
                    possibleDropSlots = null,
                    isDraggableValid = false;


                if (draggableModel) {
                    isDraggableValid = true;
                    draggableElement = $(draggableModel.getId());
                    possibleDropSlots = draggableModel.getDropSlots();
                }
                if (isDraggableValid) {
                    if (possibleDropSlots.indexOf(this.getId()) < 0) {
                        if (!this.getPreventDefaultFunctionality()) {
                            ui.draggable.draggable("option", "revert", true);
                            draggableElement.show();
                        }
                    }
                    else {
                        customEventObject.isValidDrop = true;
                        if (!this.getPreventDefaultFunctionality()) {
                            ui.draggable.draggable("option", "revert", 'invalid');
                            droppableElement.append(draggableElement);
                        }
                    }

                }

                this.trigger(ClassName.INDIVIDUAL_EVENTS.DROP.DROP, customEventObject);
                return;
            },

            isIdNull: function isIdNull() {
                if (ClassName.checkIsNull(this.getId())) {
                    ClassName.log(ClassName.LOG_MESSAGES.NO_ID);
                    return true;
                }
                return false
            },

            bindPropertyChangeListeners: function bindPropertyChangeListeners() {
                this.on('change:options', $.proxy(this.onSetOptions, this));
                this.on('change:isDroppable', $.proxy(this.onSetIsDroppable, this));
            },

            /*------------listeners---------------*/

            onSetOptions: function onSetOptions() {
                $(this.getId()).droppable(this.getOptions());
                return;
            },

            onSetIsDroppable: function onSetIsDroppable() {
                switch (this.getIsDroppable()) {

                    case true: $(this.getId()).droppable('enable');
                        return;

                    case false: $(this.getId()).droppable('disable');
                        return;

                        //default: ClassName.log(ClassName.LOG_MESSAGES.INVALID);
                        return;
                }
            },
            /*------------listeners-end-----------*/


            /*------------getters/setters---------------*/
            getId: function getId() {
                return this.get('id');
            },

            getIsDroppable: function getIsDraggable() {
                return this.get('isDroppable');
            },

            setIsDroppable: function setIsDroppable(option) {
                var isUndefined = ClassName.checkIsUndefined(option);
                if (!isUndefined) {
                    this.set('isDroppable', option);
                    return;
                }
            },

            getOptions: function getOptions() {
                return this.get('options');
            },

            setOptions: function getOptions(arg) {
                this.set('options', arg);
                return;
            },

            getPreventDefaultFunctionality: function getPreventDefaultFunctionality() {
                return this.get('preventDefaultFunctionality');
            },
            setPreventDefaultFunctionality: function setPreventDefaultFunctionality(arg) {
                this.set('preventDefaultFunctionality', arg);
                return;
            },

            getIdprefix: function getIdprefix() {
                return this.get('idPrefix');
            },

            setIdprefix: function setIdprefix(arg) {
                this.set('idPrefix', arg);
                return;
            }
        }, {}),

        /*---------------Droppable Models End---------------------*/

        DRAGGABLE_SELECTED: null,

        /*---------------Common logs------------------------------*/
        log: function log(message) {
            // console.log(message);
            return;
        },
        LOG_MESSAGES: {
            NO_ID: 'Please Specify ID',
            NO_MODEL: 'Model is Undefined',
            INVALID: 'Invalid call/type',
            INVALID_IDPREFIX: 'Please specify idPrefix'
        },

        /*---------------Common logs end--------------------------*/


        /*-------------Event name Strings-------------------------*/
        EVENTS: {
            DRAG: {
                START: 'drag-start',
                DRAG: 'drag',
                STOP: 'stop'
            },
            DROP: {
                DROP: 'drop'
            }

        },

        INDIVIDUAL_EVENTS: {
            DRAG: {
                START: 'individual-drag-start',
                DRAG: 'individual-drag',
                STOP: 'individual-stop',
                KEYPRESS: 'individual-keypress'
            },
            DROP: {
                DROP: 'individual-drop'
            }
        },
        /*-------------Event name Strings End---------------------*/

        /*------------PUBLIC-FUNCTIONS----------------------*/

        DESTROY: function DESTROY_DRAGGABLE(scope, type, id) {
            if (type === 'drag') {
                var draggableModel = ClassName.getModelFromDraggables(scope, id);
                $(draggableModel.getId()).draggable('destroy');
                ClassName.removeItemFromDraggables(scope, id);
            }
            else if (type === 'drop') {
                var droppableModel = ClassName.getModelFromDroppables(scope, id);
                $(droppableModel.getId()).droppable('destroy');
                ClassName.removeItemFromDroppables(scope, id);
            }


        },

        ADD_OPTIONS: function ADD_OPTIONS(scope, type, id, options) {
            if (options) {
                var elementModel = null,
                    previousOptions = null,
                    finalOptions = null;
                if (type === 'drag') {
                    elementModel = ClassName.getModelFromDraggables(scope, id);

                } else if (type === 'drop') {
                    elementModel = ClassName.getModelFromDroppables(scope, id);
                }
                if (elementModel) {
                    previousOptions = elementModel.getOptions();
                    finalOptions = ClassName._combineObjects(previousOptions, options);
                    elementModel.setOptions(finalOptions);
                    return;
                }
                return;
            }
            return;
        },

        ADD_DROP_SLOT: function ADD_DROP_SLOT(scope, type, draggableElementId, dropSlotId) {
            if (type === 'drag') {
                dropSlotId = dropSlotId.indexOf('#') < 0 ? ClassName.getIdSelectorString(dropSlotId) : dropSlotId;

                ClassName.getModelFromDraggables(scope, draggableElementId).addDropSlot(dropSlotId);
            }
        },

        ENABLE: function ENABLE(scope, type, id) {
            var elementModel = null;
            if (type === 'drag') {
                elementModel = ClassName.getModelFromDraggables(scope, id);
                elementModel.setIsDraggable(true);
            } else if (type === 'drop') {
                elementModel = ClassName.getModelFromDroppables(scope, id);
                elementModel.setIsDroppable(true);
            }
            return;
        },
        DISABLE: function DISABLE(scope, type, id) {
            var elementModel = null;

            if (type === 'drag') {
                elementModel = ClassName.getModelFromDraggables(scope, id);
                elementModel.setIsDraggable(false);
            } else if (type === 'drop') {
                elementModel = ClassName.getModelFromDroppables(scope, id);
                elementModel.setIsDroppable(false);
                // unbind focus in and focus out on disabling drop slot.
                $(id).off('focusout');
                $(id).off('focusin');
            }
            return;

        },

        REVERT_DRAGGABLE: function REVERT_DRAGGABLE(scope, customEventObject) {
            var uiDraggable = customEventObject.ui.draggable,
                elementModel, uiDraggableId;
            uiDraggable = $(uiDraggable); //If an element is dropped via context menu or accessibility, makes it a jQuery object
            uiDraggableId = uiDraggable.attr('id');

            uiDraggable.draggable("option", "revert", true);
            if (typeof uiDraggableId !== 'undefined') {
                elementModel = ClassName.getModelFromDraggables(scope, uiDraggableId);
                elementModel.listenToOnce(elementModel, ClassName.INDIVIDUAL_EVENTS.DRAG.STOP, elementModel.revertDraggableOnce);
            }
            return;
        },

        SETUP_SCOPE: function SETUP_SCOPE(scope, manager, player) {
            ClassName.SCOPES[scope] = null;
            ClassName.SCOPES[scope] = {
                Draggables: {},
                Droppables: {},
                AccessibilityView: (function () {
                    if (ClassName.SCOPES[scope] && ClassName.SCOPES[scope].AccessibilityView) {
                        return ClassName.SCOPES[scope].AccessibilityView
                    } else {
                        var view = MathInteractives.Common.Player.Views.Base.extend({
                            idPrefix: scope,
                            manager: manager,
                            player: player
                        });
                        return new view();
                    }
                })()

            };
            // ClassName.ACTIVATE_SCOPE(scope);
        },

        //ACTIVATE_SCOPE: function ACTIVATE_SCOPE(scope) {
        //    ClassName.currentScope = scope;
        //},


        /*------------PUBLIC-FUNCTIONS-END------------------*/

        /*------------PRIVATE-FUNCTIONS----------------------*/

        _createCustomEventObject: function _createCustomEventObject(originalEvent, ui, $element, extraOptions) {
            return {
                originalEvent: originalEvent ? originalEvent : null,
                ui: ui ? ui : null,
                $element: $element ? $element : null,
                extraOptions: extraOptions ? extraOptions : null,
                //Drop related
                isValidDrop: false
            }
        },

        _combineObjects: function _combineObjects(previousObject, newObject) {

            if ($.each) {
                var finalObject = {};
                $.each(previousObject, function (key, value) {
                    finalObject[key] = value;
                });

                $.each(newObject, function (key, value) {
                    finalObject[key] = value;
                });
                return finalObject;

            }
            return;
        },

        //_getCurrentScope: function _getCurrentScope() {
        //    return ClassName.currentScope;
        //},

        /*------------PRIVATE-FUNCTIONS-END------------------*/



        /*--------------------Helper functions-------------------*/
        checkIsUndefined: function checkIsUndefined(variable) {
            return variable === undefined ? true : false;
        },

        checkIsNull: function checkIsUndefined(variable) {
            return variable === null ? true : false;
        },

        getIdSelectorString: function getIdSelectorString(str) {
            return '#' + str;
        },



        /*------------Instance-Creation--------------*/
        createDragDropModel: function createDragDropModel(properties) {
            if (properties) {
                var dragDropModel = new ClassName(properties);
                return dragDropModel;
            }
            return;
        }
    });

    ClassName = namespace.Common.Components.Models.DragDrop;
})(MathInteractives);
