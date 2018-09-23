(function () {
    'use strict';
    if (MathInteractives.Common.Interactivities.ShapeSlicer.Models.Sphere) {
        return;
    }
    /*
	*
	*  Sphere Model
	*	
	* @class Sphere
	* @namespace MathInteractives.Interactivities.ShapeSlicer.Models
    * @extends MathInteractives.Common.Player.Models.BaseInteractive
	* @constructor
	*/

    MathInteractives.Common.Interactivities.ShapeSlicer.Models.Sphere = MathInteractives.Common.Player.Models.BaseInteractive.extend({

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
                radius: 175,

                segments: 50,

                numberOfVerticalCircles: 3,

                numberOfHorizontalCircles: 5,

                numberOfClickableSpheres: 6,

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
            var nameSpace = MathInteractives.Common.Interactivities.ShapeSlicer.Models.Sphere;

            this.set('cameraQuaternion', nameSpace.CAMERA_QUATERNION);
            this.set('cameraPos', nameSpace.CAMERA_POSITION);
            this.set('cameraUp', nameSpace.CAMERA_UP);
        }
    }, {
        CAMERA_QUATERNION: {
            "w": 0.965842614143013,
            "x": 0.00007484599268762112,
            "y": -0.25912934085857875,
            "z": -0.0001598908903332809
        },

        CAMERA_POSITION: {
            "x": -175.1947224582841,
            "y": -0.02159991882916927,
            "z": 302.9963840645764
        },

        CAMERA_UP: {
            "x": 0.0002700692805593036,
            "y": 0.9999999376659625,
            "z": 0.0002274437378109711
        }
    }); 
})();