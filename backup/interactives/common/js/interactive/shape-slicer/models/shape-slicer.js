(function () {
    'use strict';
    if (MathInteractives.Common.Interactivities.ShapeSlicer.Models.ShapeSlicer) {
        return;
    }
    var modelClassName = null;
    /*
     *
     *  Main model of shape slicer interactive
     *
     * @class ShapeSlicer
     * @namespace MathInteractives.Interactivities.ShapeSlicer.Models
     * @extends MathInteractives.Common.Player.Models.BaseInteractive
     * @constructor
     */
    MathInteractives.Common.Interactivities.ShapeSlicer.Models.ShapeSlicer = MathInteractives.Common.Player.Models.BaseInteractive.extend({

        defaults: function () {
            return {

                /**
                 * [[Description]]
                 * @attribute interacivityType
                 * @type Object
                 * @default null
                 */
                interacivityType: null,

                /**
                 * [[Description]]
                 * @attribute numberOfShapes
                 * @type Object
                 * @default null
                 */
                numberOfShapes: null,

                /**
                 * [[Description]]
                 * @attribute shapeNumber
                 * @type Object
                 * @default null
                 */
                shapeNumber: null,

                /**
                 * [[Description]]
                 * @attribute clickableSphereRadius
                 * @type Number
                 * @default 9.5
                 */
                clickableSphereRadius: 9.5,

                /**
                 * [[Description]]
                 * @attribute clickableSphereScaleFactor
                 * @type Number
                 * @default 1.31 //12.5/9.5
                 */
                clickableSphereScaleFactor: 1.31, //12.5/9.5

                /**
                 * [[Description]]
                 * @attribute maxPoints
                 * @type Number
                 * @default 3
                 */
                maxPoints: 3,

                /**
                 * [[Description]]
                 * @attribute pathCoordinates
                 * @type Object
                 * @default null
                 */
                pathCoordinates: null,

                /**
                 * Holds the all help screen elements
                 * @attribute helpElements
                 * @type Object
                 * @default [] // Please keep all the references null in defaults.
                 */
                helpElements: [], // Please keep all the references null in defaults.

                /**
                 * [[Description]]
                 * @attribute shape2DModel
                 * @type Object
                 * @default null
                 */
                shape2DModel: null,

                /**
                 * [[Description]]
                 * @attribute galleryObject
                 * @type Object
                 * @default null
                 */
                galleryObject: null,

                /**
                 * [[Description]]
                 * @attribute currentGalleryIndex
                 * @type Number
                 * @default 0
                 */
                currentGalleryIndex: 0,

                /**
                 * [[Description]]
                 * @attribute galleryImageCount
                 * @type Number
                 * @default 0
                 */
                galleryImageCount: 0,

                /**
                 * [[Description]]
                 * @attribute galleryFirstVisibleColumn
                 * @type Number
                 * @default 0
                 */
                galleryFirstVisibleColumn: 0,

                /**
                 * [[Description]]
                 * @attribute noOfSlicedShapes
                 * @type Number
                 * @default 0
                 */
                noOfSlicedShapes: 0,

                /**
                 * [[Description]]
                 * @attribute isSliceShapeButtonEnabled
                 * @type Boolean
                 * @default false
                 */
                isSliceShapeButtonEnabled: false,

                /**
                 * [[Description]]
                 * @attribute shapeCollection
                 * @type Object
                 * @default null
                 */
                shapeCollection: null,
                /**
                 * [[Description]]
                 * @attribute saveStateLoad
                 * @type Boolean
                 * @default false
                 */
                saveStateLoad: false,

                /**
                 * [[Description]]
                 * @attribute activityLoaded
                 * @type Boolean
                 * @default true
                 */
                activityLoaded: true,

                /**
                 * [[Description]]
                 * @attribute eventManager
                 * @type Object
                 * @default null
                 */
                eventManager: null,

                showClearPopup: false,

                requestAnimation: false,

                isSaveImageButtonEnabled: false,

                isTryAnotherButtonEnabled: false,

                attributesToIgnore: ['saveStateLoad', 'eventManager', 'currentTab', 'pathCoordinates', 'isTryAnotherButtonEnabled', 'shapeColorsToUse']
            };
        },

        /**
         * Initialises ShapeSlicerMainModel
         *
         * @method initialize
         */
        initialize: function () {
            modelClassName = MathInteractives.Common.Interactivities.ShapeSlicer.Models.ShapeSlicer;
            var eventManager = new modelClassName.EVENT_MANAGER_MODEL();
            this.set('eventManager', eventManager);

            this._selectInteractivityType();
            this._setNumberOfShapes();
            if (this.get('galleryObject') === null) {
                this.set('galleryObject', []);
            }
            this.on('change:galleryObject', this.galleryObjectChange, this);
            eventManager.on(modelClassName.EVENT_MANAGER_MODEL.SAVE_IMAGE, this._updateGalleryObjectsCount, this);
            eventManager.on(modelClassName.EVENT_MANAGER_MODEL.DELETE_IMAGE, this._updateGalleryObjectsCount, this);
            eventManager.on(modelClassName.EVENT_MANAGER_MODEL.CLEAR_ALL_IMAGES, this._updateGalleryObjectsCount, this);

            this._generateCollection();
        },

        /**
         * generates collection
         * @method _generateCollection
         * @private
        */
        _generateCollection: function _generateCollection() {
            var shapeCollection = this.get('shapeCollection');

            if (shapeCollection) {
                shapeCollection = new Backbone.Collection(shapeCollection);
            }
            else {
                shapeCollection = new Backbone.Collection();
            }

            this.set('shapeCollection', shapeCollection);
        },

        /**
         * gallery object change
         * @method galleryObjectChange
         * @public
        */
        galleryObjectChange: function () {
            // console.log('gallery obj changed');
        },

        /**
         * update gallery objects count
         * @method _updateGalleryObjectsCount
         * @private
        */
        _updateGalleryObjectsCount: function _updateGalleryObjectsCount() {
            var galleryImageCount = this.get('galleryObject').length;
            this.set('galleryImageCount', galleryImageCount);
        },

        /**
         * select interactivity type
         * @method _selectInteractivityType
         * @private
        */
        _selectInteractivityType: function _selectInteractivityType() {

            var interacivityType = this.get('interacivityType');
            if (interacivityType === null) {
                this.set('interacivityType', this.get('type'));
            }
        },

        /**
         * Sets number of shapes
         * @method _setNumberOfShapes
         * @private
        */
        _setNumberOfShapes: function _setNumberOfShapes() {

            var numberOfShapes = modelClassName.NUMBER_OF_SHAPES,
                interactivityType = this.get('interacivityType'),
                defaultShape = modelClassName.DEFAULT_SHAPE[interactivityType],
                shapeNumber = this.get('shapeNumber');
            switch (interactivityType) {
                case 1:
                    this.set('numberOfShapes', numberOfShapes[1]);
                    shapeNumber = shapeNumber || defaultShape;
                    this.set('shapeNumber', parseInt(shapeNumber));
                    break;
                case 2:
                    this.set('numberOfShapes', numberOfShapes[2]);
                    shapeNumber = shapeNumber || defaultShape;
                    this.set('shapeNumber', parseInt(shapeNumber));
                    break;
                default:
                    break;
            }
        },
        /**
         * Gets current gallery index
         * @method getCurrentGalleryIndex
         * @public
         * @param {[[Type]]} value [[Description]]
         * @returns {[[Type]]} [[Description]]
        */
        getCurrentGalleryIndex: function (value) {
            return this.get('currentGalleryIndex');
        },

        /**
         * Sets current gallery index
         * @method setCurrentGalleryIndex
         * @public
         * @param {[[Type]]} value [[Description]]
        */
        setCurrentGalleryIndex: function (value) {
            this.set('currentGalleryIndex', value);
        },

        /**
         * Gets current state data
         * @method getCurrentStateData
         * @public
         * @returns {[[Type]]} [[Description]]
        */
        getCurrentStateData: function getCurrentStateData() {
            var eventManager = this.get('eventManager'),
                result;

            eventManager.trigger(modelClassName.EVENT_MANAGER_MODEL.SAVE_STATE_START);
            result = JSON.stringify(this, this.getJSONAttributes);
            eventManager.trigger(modelClassName.EVENT_MANAGER_MODEL.SAVE_STATE_END);
            return result;
        },

        /**
         * Gets j s o n attributes
         * @method getJSONAttributes
         * @public
         * @param {[[Type]]} key [[Description]]
         * @param {[[Type]]} value [[Description]]
         * @returns {[[Type]]} [[Description]]
        */
        getJSONAttributes: function getJSONAttributes(key, value) {
            var result = value;
            switch (key) {
                case 'path':
                case 'manager':
                case 'player':
                case 'jsonData':
                case 'helpElements':
                case 'pathCoordinates':
                case 'eventManager':
                    result = undefined;
                    break;
                case 'saveStateLoad':
                    result = true;
                    break;
            }
            return result;
        }
    }, {

        EVENT_MANAGER_MODEL: Backbone.Model.extend({}, {
            SAVE_STATE_START: 'save-state-start',
            SAVE_STATE_END: 'save-state-end',
            SHAPE_SLICED: 'shape-sliced',
            DRAW_SLICED_SHAPE: 'draw-sliced-shape',
            SAVE_IMAGE: 'save-image',
            EDIT_IMAGE: 'edit-image',
            DELETE_IMAGE: 'delete-image',
            CLEAR_ALL_IMAGES: 'clear-all-images',
            POINTS_ON_SAME_EDGE: 'points-on-same-edge',
            POINTS_ON_SAME_FACE: 'points-on-same-face',
            CLICK_ON_3D_CANVAS: 'click-on-3d-canvas',
            CREATE_CROSSSECTION: 'create-crosssection',
            DISABLE_HOVER: 'disable-hover',
            ENABLE_HOVER: 'enable-hover',
            TAB_CHANGED: 'tab-changed',
            UNLOAD_INTERACTIVE: 'unload-interactive',
            ENABLE_TRY_ANOTHER: 'enable-try-another',
            DISABLE_TRY_ANOTHER: 'disable-try-another',
            SET_RESET_BUTTON_STATE: 'set-reset-button-state',
            DISABLE_BUTTON_ON_COLOR_PICKER: 'disable-button-on-color-picker',
            ENABLE_BUTTON_ON_COLOR_PICKER: 'enable-button-on-color-picker',
            DESELECT_SHAPE: 'deselect-shape',
            SET_FOCUS: 'set-focus'
        }),


        NUMBER_OF_SHAPES: {
            1: 6,
            2: 3
        },

        SHAPES: {
            1: ['Cube', 'Tetrahedron', 'Prism', 'Cone', 'Sphere', 'Cylinder'],
            2: ['Cube', 'TriangularPrism', 'Pyramid']

        },

        MAX_SLICE_SHAPES: 11,

        RESET_ROTATE_BUTTON_WIDTH: 43,
        RESET_ROTATE_BUTTON_HEIGHT: 38,

        LEFT_CANVAS: {
            HEIGHT: 353,
            WIDTH: 432
        },
        DEFAULT_SHAPE: {
            '1': 0,
            '2': 0
        },
        MAX_GALLERY_LENGTH: 24
    });
})();
