(function () {
    'use strict';
    /**
    * Carousel holds properties and methods required for a carousel.
    *
    * @class Carousel
    * @module MiniGolf
    * @type Object
    * @constructor
    * @extends MathInteractives.Common.Player.Models.BaseInteractive
    * @namespace MathInteractives.Interactivities.MiniGolf.Models
    */
    MathInteractives.Interactivities.MiniGolf.Models.Carousel = MathInteractives.Common.Player.Models.BaseInteractive.extend({
        defaults: function () {
            return {
                /**
                * Array/Collection to hold data for each slide
                * @attribute slidesData
                * @type Object
                * @default null
                */
                slidesData: null,

                /**
                * Number indicating the default slide number to be shown as the current slide.
                * @attribute defaultSlideNumber
                * @type Number
                * @default 0
                */
                defaultSlideNumber: 0
            };
        },

        /**
        * Initialises Carousel Model
        *
        * @method initialize
        **/
        initialize: function (options) {
            var currentNameSpace = MathInteractives.Interactivities.MiniGolf.Models.Carousel;
            if (!this.get('slidesData')) {
                this.set('slidesData', new currentNameSpace.Slides());
            }
            else {
                this.set('slidesData', new currentNameSpace.Slides(this.get('slidesData')));
            }
        }


    }, {

        /**
        * Contains properties of a single slide.
        * @class Slide
        * @module MiniGolf
        * @type Object
        * @constructor
        * @extends MathInteractives.Common.Player.Models.BaseInteractive
        * @namespace MathInteractives.Interactivities.MiniGolf.Models.Carousel
        * @static
        */
        Slide: MathInteractives.Common.Player.Models.BaseInteractive.extend({
            defaults: function() {
                return {
                    /**
                    * Reference to the precompiled handlebar template called as a method with some template data to prepare DOM for rendering a slide.
                    *
                    * @attribute template
                    * @type Object
                    * @default null
                    */
                    template: null,

                    /**
                    * Name of the precompiled handlebar template called as a method with some template data to prepare DOM for rendering a slide.
                    *
                    * @attribute templateName
                    * @type String
                    * @default null
                    */
                    templateName: null,

                    /**
                    * String refering to the precompiled handlebar templates' module
                    *
                    * @attribute templateModule
                    * @type String
                    * @default null
                    */
                    templateModule: null,

                    /**
                    * Object storing various data properties to be sent while using the precompiled handlebar template.
                    *
                    * @attribute data
                    * @type Object
                    * @default null
                    */
                    data: null,

                    /**
                    * Boolean indicating if the slide is the current slide.
                    *
                    * @attribute isCurrentSlide
                    * @type Boolean
                    * @default false
                    */
                    isCurrentSlide: false,

                    /**
                    * Number indicating the default slide to be displayed as current slide, useful in case of save-resume.
                    *
                    * @attribute defaultSlideNumber
                    * @type Number
                    * @default null
                    */
                    defaultSlideNumber: null
                }
            },

            /**
            * Initialized the slide model by getting it's template using method _getTemplateFromNamespace and binding the
            * same method to change event of attributes templateModule and templateName.
            *
            * @method initialize
            */
            initialize: function initialize() {
                this._getTemplateFromNamespace();
                this.on('change:templateModule', $.proxy(this._getTemplateFromNamespace, this));
                this.on('change:templateName', $.proxy(this._getTemplateFromNamespace, this));
            },

            /**
            * Sets the template of the slide using the templateModule and templateName attributes.
            *
            * @method _getTemplateFromNamespace
            * @private
            */
            _getTemplateFromNamespace: function _getTemplateFromNamespace() {
                var templateModule = this.get('templateModule'),
                    templateFromCommon = !!this.get('isCommon'),
                    templateNamespace,
                    templateName = this.get('templateName'),
                    template;
                templateNamespace = templateFromCommon ? MathInteractives.Common.Interactivities : MathInteractives.Interactivities;
                templateNamespace = templateNamespace[templateModule].templates;
                template = templateNamespace[templateName];
                this.set('template', template);
            }
        }),

        /**
        * Collection of carousel slides
        * @class Slides
        * @module MiniGolf
        * @type Object
        * @extends Backbone.Collection
        * @namespace MathInteractives.Interactivities.MiniGolf.Models.Carousel
        * @constructor
        * @static
        */
        Slides: Backbone.Collection.extend({
            /**
            * Intialize the collection of table rows.
            * @method initialize
            * @constructor
            */
            initialize: function () {
                this.model = MathInteractives.Interactivities.MiniGolf.Models.Carousel.Slide;
            }
        }),

        EVENTS: {
            /**
            * Fired when user clicks on the current slide.
            * Triggered in the function {{#crossLink "MathInteractives.Interactivities.MiniGolf.Views.Slide/_onSlideElClick:method"}}{{/crossLink}}
            * @event SLIDE_CLICK_EVENT
            */
            SLIDE_CLICK_EVENT: 'slideClicked',

            /**
            * Fired by carousel view on {{#crossLink "MathInteractives.Interactivities.MiniGolf.Models.Carousel/SLIDE_CLICK_EVENT:event"}}custom event{{/crossLink}}, triggered when user clicks on the current slide.
            * Triggered in the function {{#crossLink "MathInteractives.Interactivities.MiniGolf.Views.Carousel/_onSlideClickEvent:method"}}{{/crossLink}}
            * @event CAROUSEL_SLIDE_CLICK_EVENT
            */
            CAROUSEL_SLIDE_CLICK_EVENT: 'slideClicked',

            /**
            * Fired by carousel view at the start of slide change animation.
            * Triggered in the functions {{#crossLink "MathInteractives.Interactivities.MiniGolf.Views.Carousel/_onPrevSlideBtnClick:method"}}{{/crossLink}},
            * {{#crossLink "MathInteractives.Interactivities.MiniGolf.Views.Carousel/_onNextSlideBtnClick:method"}}{{/crossLink}}
            * @event SLIDE_CHANGE_ANIMATION_START
            */
            SLIDE_CHANGE_ANIMATION_START: 'slideChangeAnimationStart',

            /**
            * Fired by carousel view at the end of slide change animation.
            * Triggered in the functions {{#crossLink "MathInteractives.Interactivities.MiniGolf.Views.Carousel/_onPrevSlideAnimationEnd:method"}}{{/crossLink}},
            * {{#crossLink "MathInteractives.Interactivities.MiniGolf.Views.Carousel/_onNextSlideAnimationEnd:method"}}{{/crossLink}}
            * @event SLIDE_CHANGE_ANIMATION_END
            */
            SLIDE_CHANGE_ANIMATION_END: 'slideChangedAnimationEnd',

            /**
            * Triggered in the function {{#crossLink "MathInteractives.Interactivities.MiniGolf.Views.Carousel/updateASlide:method"}}{{/crossLink}}
            * on slide's model object.
            * @event UPDATE_SLIDE
            */
            UPDATE_SLIDE: 'updateSlide',

            /**
            * Triggered in the functions {{#crossLink "MathInteractives.Interactivities.MiniGolf.Views.Carousel/onPrevSlideBtnClick:method"}}{{/crossLink}},
            * {{#crossLink "MathInteractives.Interactivities.MiniGolf.Views.Carousel/onPrevSlideBtnClick:method"}}{{/crossLink}}
            * on carousel view object.
            * when the user tries to navigate to the left of leftmost slide and right of rightmost slide.
            * @event ALREADY_AT_END
            */
            ALREADY_AT_END: 'alreadyAtEndOfCarousel'
        }
    });
})();