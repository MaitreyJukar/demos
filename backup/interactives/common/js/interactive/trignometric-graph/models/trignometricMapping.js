(function () {
    var exploreMappingModel = null;
    /**
    * Model for Unroll Circle tab
    *
    * @class ExploreTrignometricMapping
    * @extends MathInteractives.Common.Player.Models.BaseInteractive
    * @namespace MathInteractives.Common.Interactivities.TrignometricGraphing.Models.ExploreTrignometricMapping
    */
    MathInteractives.Common.Interactivities.TrignometricGraphing.Models.ExploreTrignometricMapping = MathInteractives.Common.Player.Models.BaseInteractive.extend({
        defaults: function () {

            return {
                noOfRadius: null,
                angleUnit: null,
                unwrappingCircleActivity: false,
                staticData: {
                    circle_centre_coordinates: null,
                    circle_circumference: null,

                    centrePoint: null,

                    numberline_length: null,
                    numberline_coordinates_x: null,
                    numberline_coordinates_y: null,
                    numberline_coordinates_final_x: null,
                    numberline_length_coordinates: null,
                    activityData: null
                },
            }
        },

        initialize: function () {

            if (typeof (this.get('activityData')) === 'undefined' || this.get('activityData') === null) {
                this.set('activityData', {
                    'hasDirectionText': true,
                    'hasComboBoxes': true,
                    'defaultNoOfRadius': 0,
                    //TODO : remove this parameter later
                    'unwrappingCircleActivity': false
                })
            }
            //TODO : remove this line later
            this.set('unwrappingCircleActivity', this.get('activityData').unwrappingCircleActivity);
            if (this.get('activityData').defaultNoOfRadius === 1) {
                this.setNoOfRadius(2);
            }
            else {
                this.setNoOfRadius(this.get('activityData').defaultNoOfRadius);
            }
            //this.setNoOfRadius(0);
            this.setAngleUnit('Radians');
            this.initializeStaticData();

        },
        initializeStaticData: function initializeStaticData() {
            var pi = Math.PI,
            staticData = this.getStaticData(),
            circumference = 2 * pi * exploreMappingModel.CIRCLE_RADIUS;

            staticData.circle_centre_coordinates = [exploreMappingModel.CIRCLE_CENTRE_COORDINATES_X, exploreMappingModel.CIRCLE_CENTRE_COORDINATES_Y];
            staticData.circle_circumference = circumference;

            staticData.numberline_length = circumference;
            staticData.numberline_coordinates_x = exploreMappingModel.CIRCLE_CENTRE_COORDINATES_X + (circumference / 4);
            staticData.numberline_coordinates_y = exploreMappingModel.CIRCLE_CENTRE_COORDINATES_Y + exploreMappingModel.CIRCLE_RADIUS;
            staticData.numberline_coordinates_final_x = staticData.numberline_coordinates_x + staticData.numberline_length;
            staticData.numberline_length_coordinates = [staticData.numberline_coordinates_x, staticData.numberline_coordinates_y];

            //this.setStaticData();
            return;
        },

        //------------------getters-setters-----------------------//
        getNoOfRadius: function setNoOfRadius() {
            return this.get('noOfRadius');
        },
        setNoOfRadius: function aetStaticData(noOfRadius) {
            this.set('noOfRadius', noOfRadius);
            return;
        },


        getAngleUnit: function getStaticData() {
            return this.get('angleUnit');
        },
        setAngleUnit: function setNoOfRadius(angleUnit) {
            this.set('angleUnit', angleUnit);
            return;
        },


        getStaticData: function getStaticData() {
            return this.get('staticData');
        },
        setStaticData: function aetStaticData(staticData) {
            this.set('staticData', staticData);
            return;
        }
        //------------------getters-setters-end-------------------//

    },

{
        CIRCLE_CENTRE_COORDINATES_X: 140,
        CIRCLE_CENTRE_COORDINATES_Y: 195,
        CIRCLE_RADIUS: 87,
        CIRCLE_COLOR: '#8cb61d',
        REMAINING_CIRCLE_COLOR: '#7b7272',
        REMAINING_CIRCLE_WIDTH: 1,

        NUMBERLINE_COLOR: '#FFFFFF',
        NUMBERLINE_THICKNESS: 2,

        DRAG_HANDLE_GRADIENT: ['#329fc3', '#02375c'],

        DRAG_HANDLE_GRADIENT_HOVER: ['#02375c', '#329fc3'],

        DRAG_HANDLE_RADIUS: 10,

        LABEL_OFFSET: 30,
        LABEL_OFFSET_FOR_UNWRAPPING: 30,
        NUMBERLINE_TO_LABEL_PADDING: 18,

        TICK_LENGTH: 29,
        FOCUS_RECT_STROKE_WIDTH: 2,
        FOCUS_RECT_COLOR: '#aaa',


    RADIUS_CHANGE: 'radius-change',

    UNWRAPPING_CIRCLE_ACTIVITY: {
        //TODO : remove this PARAMETER later
        'unwrappingCircleActivity': true,
        'hasDirectionText': true,
        'hasComboBoxes': false,
        'defaultNoOfRadius': 1
    }


});

    exploreMappingModel = MathInteractives.Common.Interactivities.TrignometricGraphing.Models.ExploreTrignometricMapping;
})();