(function () {
    'use strict';
    /**
    * Course holds method and properties to render a course 3
    * @class Course3
    * @namespace MathInteractives.Interactivities.MiniGolf.Views
    * @extends MathInteractives.Interactivities.MiniGolf.Views.Course
    * @constructor
    */
    MathInteractives.Interactivities.MiniGolf.Views.Course3 = MathInteractives.Interactivities.MiniGolf.Views.Course.extend({

        /**
        * Initializer function of view.
        * @method initialize
        * @constructor
        */
        initialize: function () {
            var canvasObj, canvasViewElId;
            this._setUpCourseProperties();         
            this._superwrapper('initialize', arguments);
            this._addPalmLeaf();
            canvasViewElId = '#' + this.idPrefix + 'work-area-' + this.model.get('levelId');

            if (this.isAccessible() === true) {

                canvasObj = new MathInteractives.Interactivities.MiniGolf.Views.CanvasWithObstaclesAcc({
                    canvasId: this.canvasId,
                    model: this.model,
                    el: canvasViewElId
                });
            }
            else {
                canvasObj = new MathInteractives.Interactivities.MiniGolf.Views.CanvasWithObstacles({
                    canvasId: this.canvasId,
                    model: this.model,
                    el: canvasViewElId
                });
            }



            //canvasObj = new MathInteractives.Interactivities.MiniGolf.Views.CanvasWithObstacles({
            //    canvasId: this.canvasId,
            //    model: this.model,
            //    el: canvasViewElId
            //});

            this.baseSetUp(canvasObj);
            this.loadScreen('course-2-screen');
            //this._bindAccEvents();
        },


        //_bindAccEvents: function _bindAccEvents() {
        //    var self = this;

        //    this.$('.level-2-acc-container').on('keyup', function (event) {
        //        self._onCanvasAccKeyup(event);

        //    });

        //},

       

        /**
        * Initializes course specific properties
        *
        * @method _setUpCourseProperties
        * @private
        **/
        _setUpCourseProperties: function () {
            var className = MathInteractives.Interactivities.MiniGolf.Models.MiniGolfData;
            this.model.set('courseBoundaries', className.BOUNDRIES.COUESE_2);
            this.model.set('matBoundaries', className.MAT_BOUNDRIES.COUESE_2);
            this.model.set('holePosition', className.HOLES.COURSE_2.POSITION);
            this.model.set('holeRadius', className.HOLES.COURSE_2.RADIUS);
        },

        /**
        * Add a DIV in DOM to place palm leaves image overlapping the course title holder.
        *
        * @method _addPalmLeaf
        * @private
        */
        _addPalmLeaf: function _addPalmLeaf() {
            var $palmLeavesHolder,
                palmLeavesHolderCssClass,
                $insertBefore,
                baseUrl,
                model, levelId;
            model = this.model;
            levelId = this.model.get('levelId');
            baseUrl = this.getJson('baseURL');
            palmLeavesHolderCssClass = 'course-' + levelId + '-palm-leaves';
            $insertBefore = this.$('.course-score-card-btn-holder');
            $palmLeavesHolder = $('<div></div>', {
                'id': this.idPrefix + palmLeavesHolderCssClass,
                'class': palmLeavesHolderCssClass
            }).insertBefore($insertBefore)
            .css({ 'background-image': ' url("' + baseUrl['palmLeaves'] + '")' });
        }
    });

    var currentModelName = MathInteractives.Interactivities.MiniGolf.Models.Course;
})();