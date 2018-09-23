(function () {
    'use strict';
    if (MathInteractives.Common.Interactivities.ShapeSlicer.Models.Cylinder) {
        return;
    }
    /*
	*
	*  Cylinder Model
	*	
	* @class Cylinder
	* @namespace MathInteractives.Interactivities.ShapeSlicer.Models
    * @extends MathInteractives.Common.Player.Models.BaseInteractive
	* @constructor
	*/
    MathInteractives.Common.Interactivities.ShapeSlicer.Models.Cylinder = MathInteractives.Common.Player.Models.BaseInteractive.extend({

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

                radius: 150,

                height: 220,

                segments: 50,

                numberOfClickableSpheres: 6,

                numberOfDummyLines: 50000,

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
            var nameSpace = MathInteractives.Common.Interactivities.ShapeSlicer.Models.Cylinder;

            this.set('cameraQuaternion', nameSpace.CAMERA_QUATERNION);
            this.set('cameraPos', nameSpace.CAMERA_POSITION);
            this.set('cameraUp', nameSpace.CAMERA_UP);
        }
    },
    {
        CAMERA_QUATERNION:  {
            "w": -0.4929501807218744,
            "x": 0.0013824715120474766,
            "y": 0.8700525621589653,
            "z": 0.0025995492240981693
        },

        CAMERA_POSITION:{
            "x": -300.2222749652828,
            "y": 2.0602637651487825,
            "z": -179.89536105160855
        },

        CAMERA_UP: {
            "x": 0.004968542127117028,
            "y": 0.999982662233651,
            "z": 0.003160509647327568
        }       
    });
})();