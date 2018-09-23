(function () {
    'use strict';
    if (MathInteractives.Common.Interactivities.ShapeSlicer.Models.Cone) {
        return;
    }
    /*
	*
	*  Cone Model
	*	
	* @class Cone
	* @namespace MathInteractives.Interactivities.ShapeSlicer.Models
    * @extends MathInteractives.Common.Player.Models.BaseInteractive
	* @constructor
	*/
    MathInteractives.Common.Interactivities.ShapeSlicer.Models.Cone = MathInteractives.Common.Player.Models.BaseInteractive.extend({

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

                radius: 130,

                height: 220,

                segments: 50,

                numberOfClickableSpheres: 6,

                numberOfDummyLines: 50000,

                cameraQuaternion: null,

                cameraPos: null,

                cameraUp: null,

                lastHoveredPoint: null,

                isResetButtonEnable:false
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
            var nameSpace = MathInteractives.Common.Interactivities.ShapeSlicer.Models.Cone;

            this.set('cameraQuaternion', nameSpace.CAMERA_QUATERNION);
            this.set('cameraPos', nameSpace.CAMERA_POSITION);
            this.set('cameraUp', nameSpace.CAMERA_UP);
        }
    }, {
        CAMERA_QUATERNION: {
            "w": 1,
            "x": 0,
            "y": 0,
            "z": 0
        },

        CAMERA_POSITION: {
            "x": 0,
            "y": 0,
            "z": 350
        },

        CAMERA_UP: {
            "x": 0,
            "y": 1,
            "z": 0
        }
    });
})();