(function () {
    'use strict';
    if (MathInteractives.Common.Interactivities.ShapeSlicer.Models.TriangularPrism) {
        return;
    }
    /*
	*
	*  TriangularPrism Model
	*	
	* @class TriangularPrism
	* @namespace MathInteractives.Interactivities.ShapeSlicer.Models
    * @extends MathInteractives.Common.Player.Models.BaseInteractive
	* @constructor
	*/

    MathInteractives.Common.Interactivities.ShapeSlicer.Models.TriangularPrism = MathInteractives.Common.Player.Models.BaseInteractive.extend({

        defaults: function () {
            return {

                side: 220,

                otherSide: 220 * Math.pow(2, 0.5),

                height: 220,

                radiusSegments: 3,

                heightSegments: 3,

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
            var nameSpace = MathInteractives.Common.Interactivities.ShapeSlicer.Models.TriangularPrism;

            this.set('cameraQuaternion', nameSpace.CAMERA_QUATERNION);
            this.set('cameraPos', nameSpace.CAMERA_POSITION);
            this.set('cameraUp', nameSpace.CAMERA_UP);
        }
    }, {
       
        CAMERA_QUATERNION: {
            "w": 0.9532886817966322,
            "x": -0.3009215890693126,
            "y": -0.024878622598870963,
            "z": -0.008241944527372633
        },

        CAMERA_POSITION: {
            "x": -14.865431011183707,
            "y": 200.94913248808803,
            "z": 286.1790787481164
        },

        CAMERA_UP: {
            "x": 0.030686933431395665,
            "y": 0.8187565430793766,
            "z": -0.5733201856565052
        }
    });
})();