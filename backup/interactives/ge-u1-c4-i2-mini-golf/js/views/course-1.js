(function () {
    'use strict';
    /**
    * Course holds method and properties to render a course 1
    * @class Course1
    * @namespace MathInteractives.Interactivities.MiniGolf.Views
    * @extends MathInteractives.Interactivities.MiniGolf.Views.Course
    * @constructor
    */
    MathInteractives.Interactivities.MiniGolf.Views.Course1 = MathInteractives.Interactivities.MiniGolf.Views.Course.extend({

        /**
        * Initialises Course1
        *
        * @method initialize
        **/
        initialize: function () {
            var canvasObj, canvasViewElId;
            this._setUpCourseProperties();
            
            this._superwrapper('initialize', arguments);
            canvasViewElId = '#' + this.idPrefix + 'work-area-' + this.model.get('levelId');
            if (this.isAccessible() === true) {
                canvasObj = new MathInteractives.Interactivities.MiniGolf.Views.BaseCanvasAcc({
                    canvasId: this.canvasId,
                    model: this.model,
                    el: canvasViewElId
                });
            }
            else {
                canvasObj = new MathInteractives.Interactivities.MiniGolf.Views.BaseCanvas({
                    canvasId: this.canvasId,
                    model: this.model,
                    el: canvasViewElId
                });
            }
            this.baseSetUp(canvasObj);
            //this._bindAccEvents();


        },

        //_bindAccEvents: function _bindAccEvents() {
        //    var self = this;
        //    this.$('.level-0-acc-container').on('keyup', function (event) {
        //        self._onCanvasAccKeyup(event);
        //    });
        //},
        render: function render() {
         
            this._superwrapper('render', arguments);
            this.loadScreen('course-0-screen');
        },
       
        /**
        * Initializes course specific properties
        *
        * @method _setUpCourseProperties
        * @private
        **/
        _setUpCourseProperties: function () {
            var className = MathInteractives.Interactivities.MiniGolf.Models.MiniGolfData,
                model = this.model;

            model.set('courseBoundaries', className.BOUNDRIES.COUESE_0);
            model.set('matBoundaries', className.MAT_BOUNDRIES.COUESE_0);
            model.set('holePosition', className.HOLES.COURSE_0.POSITION);
            model.set('holeRadius', className.HOLES.COURSE_0.RADIUS);

        }

    });

    var currentModelName = MathInteractives.Interactivities.MiniGolf.Models.Course;
})();