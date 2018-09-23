(function () {
    'use strict';
    if (MathInteractives.Common.Interactivities.ShapeSlicer.Models.Pyramid) {
        return;
    }
    /*
	*
	*  Pyramid Model
	*	
	* @class Pyramid
	* @namespace MathInteractives.Interactivities.ShapeSlicer.Models
    * @extends MathInteractives.Common.Player.Models.BaseInteractive
	* @constructor
	*/

    MathInteractives.Common.Interactivities.ShapeSlicer.Models.Pyramid = MathInteractives.Common.Player.Models.BaseInteractive.extend({

        defaults: function () {
            return {

                radius: 110 * Math.pow(2, 0.5),

                height: 220,

                radiusSegments: 4,

                heightSegments: 4,

                numberOfClickableSpheres: 4,

                numberOfDummyLines: 1000,

                pointsArr: [],

                /**
                * Holds the check for points
                *
                * @property pointChecker
                * @default false
                **/
                pointChecker: false,

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
            var nameSpace = MathInteractives.Common.Interactivities.ShapeSlicer.Models.Pyramid;

            this.set('cameraQuaternion', nameSpace.CAMERA_QUATERNION);
            this.set('cameraPos', nameSpace.CAMERA_POSITION);
            this.set('cameraUp', nameSpace.CAMERA_UP);
        }
    }, {
        CAMERA_QUATERNION: {
            "w": 0.9926912650848908,
            "x": -0.03338251333833725,
            "y": -0.11308802314220948,
            "z": -0.0257052067724823
        },

        CAMERA_POSITION: {
            "x": -77.98237144441882,
            "y": 25.231836518262995,
            "z": 340.2676948665866
        },

        CAMERA_UP: {
            "x": 0.058584993395634805,
            "y": 0.9964497002541587,
            "z": -0.06046315747812758
        }        
    });
})();