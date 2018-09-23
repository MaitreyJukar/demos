(function () {
    'use strict';
    if (MathInteractives.Common.Interactivities.ShapeSlicer.Models.Tetrahedron) {
        return;
    }
    /*
	*
	*  Tetrahedron Model
	*	
	* @class Tetrahedron
	* @namespace MathInteractives.Interactivities.ShapeSlicer.Models
    * @extends MathInteractives.Common.Player.Models.BaseInteractive
	* @constructor
	*/

    MathInteractives.Common.Interactivities.ShapeSlicer.Models.Tetrahedron = MathInteractives.Common.Player.Models.BaseInteractive.extend({

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

                sideLength: 195,

                numberOfClickableSpheres: 4,

                numberOfDummyLines: 1000,

                cameraQuaternion: null,

                cameraPos: null,

                cameraUp: null,

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
            var nameSpace = MathInteractives.Common.Interactivities.ShapeSlicer.Models.Tetrahedron;

            this.set('cameraQuaternion', nameSpace.CAMERA_QUATERNION);
            this.set('cameraPos', nameSpace.CAMERA_POSITION);
            this.set('cameraUp', nameSpace.CAMERA_UP);
        }
    }, {
        CAMERA_QUATERNION: {
            "w": 0.3594646890399105,
            "x": 0.11848498188999244,
            "y": 0.2788230208698257,
            "z": 0.8826121296983569
        },

        CAMERA_POSITION: {
            "x": 143.36231920298093,
            "y": 142.45099585194498,
            "z": 285.75331881455594
        },

        CAMERA_UP: {
            "x": -0.5684630990034325,
            "y": -0.586085714277047,
            "z": 0.5773675091237671
        }
    });
})();