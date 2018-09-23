(function () {
    'use strict';
    if (MathInteractives.Common.Interactivities.ShapeSlicer.Models.Cube) {
        return;
    }
    /*
	*
	*  Cube Model
	*	
	* @class Cube
	* @namespace MathInteractives.Interactivities.ShapeSlicer.Models
    * @extends MathInteractives.Common.Player.Models.BaseInteractive
	* @constructor
	*/

    MathInteractives.Common.Interactivities.ShapeSlicer.Models.Cube = MathInteractives.Common.Player.Models.BaseInteractive.extend({

        defaults: function () {
            return {
                pointsArr: [],

                /**
                * Holds the check for points
                *
                * @property pointChecker
                * @default false
                **/
                pointChecker: false,

                sideLength: 220,

                numberOfClickableSpheres: 4,

                numberOfDummyLines: 1000,

                numberOfPolygonSides: 4,

                cameraQuaternion: null,

                cameraPos:null,

                cameraUp:null,

                lastHoveredPoint: null,

                isResetButtonEnable: false
            };
        },


        /**
       * Initializes Shape3DModel
       *
       * @method initialize
       */
        initialize: function () {
            if (this.get('cameraQuaternion') === null) {
                this.setCameraInitialValues();
            }
        },
        setCameraInitialValues: function setCameraInitialValues() {
            var nameSpace = MathInteractives.Common.Interactivities.ShapeSlicer.Models.Cube;

            this.set('cameraQuaternion', nameSpace.CAMERA_QUATERNION);
            this.set('cameraPos', nameSpace.CAMERA_POSITION);
            this.set('cameraUp', nameSpace.CAMERA_UP);
        }
    }, {
        CAMERA_QUATERNION: {
            "w": 0.9355015435116878,
            "x": -0.23995752649986002,
            "y": 0.2587632626477187,
            "z": 0.017286720175595963
        },

        CAMERA_POSITION: {
            "x": 166.54774513082504,
            "y": 160.26766476116768,
            "z": 262.823370771778
        },

        CAMERA_UP: {
            "x": -0.15652789358836638,
            "y": 0.8842431059222783,
            "z": -0.4400149408346408
        }
    });
})();