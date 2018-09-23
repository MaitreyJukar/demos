(function () {
    'use strict';
    if (MathInteractives.Common.Interactivities.ShapeSlicer.Models.Prism) {
        return;
    }
    /*
	*
	*  Prism Model
	*	
	* @class Prism
	* @namespace MathInteractives.Interactivities.ShapeSlicer.Models
    * @extends MathInteractives.Common.Player.Models.BaseInteractive
	* @constructor
	*/
    MathInteractives.Common.Interactivities.ShapeSlicer.Models.Prism = MathInteractives.Common.Player.Models.BaseInteractive.extend({

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

                radiusSegments: 6,

                heightSegments: 4,

                numberOfClickableSpheres: 6,

                numberOfDummyLines: 5000,

                numberOfPolygonSides: 6,

                offsetForCrossSectionY: 4,

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
            var nameSpace = MathInteractives.Common.Interactivities.ShapeSlicer.Models.Prism;

            this.set('cameraQuaternion', nameSpace.CAMERA_QUATERNION);
            this.set('cameraPos', nameSpace.CAMERA_POSITION);
            this.set('cameraUp', nameSpace.CAMERA_UP);
        }
    },
    {
        CAMERA_QUATERNION:  {
            "w": -0.250162329032432,
            "x": 0.001070076560693548,
            "y": 0.9682031672439314,
            "z": 0.0005455695670457578
        },

        CAMERA_POSITION: {
            "x": -169.5451644921678,
            "y": 0.5571405228582591,
            "z": -306.1929567964649
        },

        CAMERA_UP: {
            "x": 0.002345064960379164,
            "y": 0.9999971145799406,
            "z": 0.0005210586569029675
        }        
    });
})();