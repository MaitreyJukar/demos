(function (MathInteractives) {
    'use strict';

    var viewNameSpace = MathInteractives.Common.Components.Theme2.Views,
        modelClassNameSpace = MathInteractives.Common.Components.Theme2.Models;

    /**
    * TutorialPlayer controls tutorial animation, event dispatching.
    *
    * @class TutorialPlayer
    * @constructor
    * @type Object
    * @extends MathInteractives.Common.Player.Views.Base
    * @namespace MathInteractives.Common.Components.Theme2.Views
    */
    viewNameSpace.TutorialPlayer = MathInteractives.Common.Player.Views.Base.extend({

        /**
        * An array storing the jquery elements on which tutorial has bound some events.
        * Used for unbinding events.
        *
        * @property _elementsWithTutorialEvents
        * @type Array
        * @default []
        */
        _elementsWithTutorialEvents: [],

        initialize: function () {
            this.player = this.options.player;
            this.idPrefix = this.options.idPrefix;
            // todo: remove global variable; added for self testing
            window['tp'] = this;
        },

        /**
        * Update the tutorial with new steps
        *
        * @method updateSteps
        * @param {Object} steps Steps which has to be set
        * @public
        */
        updateSteps: function (steps) {
            if (steps) {
                this.model.set('steps', steps);
            }
        },

        /**
        * Called usually during animation/simulation; the method prevents any mouse event to be fired through the
        * tutorial view's el.
        *
        * @method stopActualMouseEvents
        */
        stopActualMouseEvents: function stopActualMouseEvents(disallow) {
            var mouseEvents = 'click dblclick mousedown mouseup mousemove mouseover mouseout mouseenter ' +
                'mouseleave select';
            mouseEvents = mouseEvents.trim().concat(' ').replace(/ /g, '.' + this.idPrefix + ' ');
            this.$el.off(mouseEvents);  // allow events by unbinding killEvent method
            if (disallow !== false) { // stop events by killing them
                this.$el.on(mouseEvents, $.proxy(this.killEvent, this));
            }
            else {
                this.$el.off(mouseEvents);
            }
        },

        /**
        * The method kills the event passed to it by calling stopping it's propagation and preventing default action.
        *
        * @method killEvent
        * @param event {Object} The event to be killed.
        */
        killEvent: function killEvent(event) {
            event.stopPropagation();
            event.preventDefault();
        },

        /**
        * Creates the cursor view
        *
        * @method render
        */
        render: function () {
            this.addCursor();
        },

        /**
        * Creates the cursor view
        *
        * @method addCursor
        */
        addCursor: function addCursor() {
            var cursorModel = new modelClassNameSpace.TutorialPlayer.Cursor(),
                elId = this.el.id + '-cursor',
                $cursorEl = $('<div></div>', {
                    'id': elId,
                    'class': elId.slice(this.idPrefix.length)
                }).appendTo(this.$el);
            this.cursor = new viewNameSpace.TutorialPlayer.Cursor({ el: $cursorEl, model: cursorModel });
        },

        /**
        * Used to update cursor's model.
        *
        * @method updateCursor
        * @param options {Object} An object containing model attributes with values that need to be set.
        */
        updateCursor: function updateCursor(options) {
            options = options || {};
            if (options.interactionPointOffset) {
                this.cursor.model.set('interactionPointOffset', options.interactionPointOffset);
            }
            if (options.cursorImage) {
                this.cursor.$el.css('background-image', options.cursorImage);
            }
            if (options.size) {
                this.cursor.$el.css(options.size);
            }
        },

        /**
        * Displays the tutorial player view's el and calls method _playNextStep
        *
        * @method addCursor
        */
        play: function play(stepNumber) {
            if (stepNumber === null || typeof stepNumber === 'undefined') {
                stepNumber = 0;
            }
            var tutorialEvents = modelClassNameSpace.TutorialPlayer.EVENTS;
            this.model.set('stepsPlayedCounter', stepNumber);
            this.on(tutorialEvents.ALL_STEPS_COMPLETED, $.proxy(this.onAllStepsCompletion, this));
            this.playStep();
        },

        /**
        * Hides the el, resets the cursor and unbinds events
        *
        * @method onAllStepsCompletion
        */
        onAllStepsCompletion: function onAllStepsCompletion() {
            this.$el.hide();
            this.resetCursor();
        },

        /**
        * Reads the current step json and triggers custom event PARSED_STEP_REQUIRED
        *
        * @method playStep
        */
        playStep: function playStep() {
            var currentStepCount = this.model.get('stepsPlayedCounter'),
                steps = this.model.get('steps'),
                currentStep = steps[currentStepCount],
                tutorialEvents = modelClassNameSpace.TutorialPlayer.EVENTS;
            if (currentStep) {
                this.off(tutorialEvents.STEP_PARSED).on(tutorialEvents.STEP_PARSED, $.proxy(this.onStepParsed, this));
                this.trigger(tutorialEvents.PARSED_STEP_REQUIRED, currentStep);
            }
            else {
                this.off('completedStepLevel0');
                this.trigger(tutorialEvents.ALL_STEPS_COMPLETED);
            }
        },

        /**
        * Increments the steps played count and calss playStep method.
        *
        * @method proceedToNextStep
        */
        proceedToNextStep: function proceedToNextStep(counter) {
            this.model.setCounter(counter);
            this.playStep();
        },

        /**
        * Handler for the event STEP_PARSED, it stores the parsed step and calls playParsedStep method.
        *
        * @method onStepParsed
        * @param step {Object} The parse step as sent by the interactive.
        */
        onStepParsed: function onStepParsed(step) {
            this.off(modelClassNameSpace.TutorialPlayer.EVENTS.STEP_PARSED);
            this.parsedStep = step;
            // Instead of directly call, after some time interval play parsed step and so show animation
            this.playParsedStep();
        },

        /**
        * Depending on the parsed step stored, plays the step; can be used to replay.
        *
        * @method playParsedStep
        * @public
        */
        playParsedStep: function playParsedStep() {
            var step = this.parsedStep,
                unparsedStepsArray = this.model.get('steps'),
                self = this,
                index, subStep,
                methodInverseEnum = modelClassNameSpace.TutorialPlayer.METHOD_ENUM_INVERSE,
                tutorialEvents = modelClassNameSpace.TutorialPlayer.EVENTS,
                subStepLevel = 1,
                subStepsCount = 0;
            this.$el.show();
            this.clearEventsBoundByTutorial();
            if (this.model.get('stepsPlayedCounter') < unparsedStepsArray.length) {
                this.trigger(tutorialEvents.ANIMATION_START);
                var _onStepPartComplete = function () {
                    subStepsCount++;
                    if (subStepsCount >= step.length) {
                        self.off('completedStepLevel' + subStepLevel);
                        this.$el.hide();
                        //self.model.incrementCounter(); // would be incremented when interactive calls proceed to next step
                        self.trigger(tutorialEvents.STEP_ANIMATION_END, step);
                    }
                }
                this.off('completedStepLevel' + subStepLevel).on('completedStepLevel' + subStepLevel, _onStepPartComplete);

                // used a loop 'cause these sub steps are not supposed to be waiting for the one before them to start.
                for (index = 0; index < step.length; index++) {
                    subStep = step[index];
                    subStep.stepLevel = subStepLevel;
                    switch (subStep.simulateActionEnum) {
                        case methodInverseEnum._promptUserToClick:
                        case methodInverseEnum._promptUserToDoubleClick:
                        case methodInverseEnum._promptUserToDrag:
                            this.$el.removeClass('cursor-none');
                            this.cursor.$el.hide();
                            this._animateElements(subStep);
                            break;
                        default:
                            this.$el.addClass('cursor-none');
                            this.cursor.$el.show();
                            this[modelClassNameSpace.TutorialPlayer.METHOD_ENUM[subStep.simulateActionEnum]](subStep);
                            break;
                    }

                }
            }
            else {
                self.off('completedStepLevel0');
                //ALL_STEPS_COMPLETED
            }
        },

        /**
        * Calls off the events bound by tutorial.
        *
        * @method clearEventsBoundByTutorial
        */
        clearEventsBoundByTutorial: function clearEventsBoundByTutorial() {
            var elementsWithTutorialEvents = this._elementsWithTutorialEvents,
                $element = null,
                index = null;
            for (index = elementsWithTutorialEvents.length - 1; index >= 0; index--) {
                $element = elementsWithTutorialEvents[index];
                $element.off('.tutorial');
            }
            this._elementsWithTutorialEvents = [];
        },

        /**
        * Resets the cursor.
        *
        * @method resetCursor
        */
        resetCursor: function resetCursor() {
            this.cursor.model.set('position', { x: 0, y: 0 });
        },

        /**
        * Simulates the mouse drag event
        *
        * @method _simulateDrag
        * @param options {Object} An object holding info like the target, offset, stepLevel, nextTarget, nextOffset.
        * @private
        */
        _simulateDrag: function _simulateDrag(options) {
            var subSteps, subStepsCount, nextSubstep, self = this,
                subStepLevel;
            subStepLevel = options.stepLevel + 1;
            subSteps = [
                {
                    methodName: '_simulateMouseDown',
                    params: {
                        target: options.target,
                        stepLevel: subStepLevel
                    }
                },
                {
                    methodName: '_simulateMove',
                    params: {
                        target: options.nextTarget,
                        stepLevel: subStepLevel,
                        speedFactor: 2
                    }
                },
                {
                    methodName: '_simulateMouseUp',
                    params: {
                        target: options.nextTarget,
                        stepLevel: subStepLevel
                    }
                }
            ];
            subStepsCount = 0;
            nextSubstep = function () {
                if (subStepsCount < subSteps.length) {
                    var currentSubStep = subSteps[subStepsCount];
                    subStepsCount++;
                    window.setTimeout($.proxy(self[currentSubStep.methodName], self, currentSubStep.params), 500);
                    //self[currentSubStep.methodName].call(self, currentSubStep.params);
                }
                else {
                    self.off('completedStepLevel' + subStepLevel);
                    //console.log('completedStepLevel' + options.stepLevel + ' drag');
                    self.trigger('completedStepLevel' + options.stepLevel);
                }
            };
            self.off('completedStepLevel' + subStepLevel).on('completedStepLevel' + subStepLevel, nextSubstep);
            self._setCursorAtTarget(options.target);
            nextSubstep();
        },

        /**
        * Simulates the mouse move event
        *
        * @method _simulateMove
        * @param options {Object} An object holding info like the target, offset, stepLevel.
        * @private
        */
        _simulateMove: function _simulateMove(options) {
            this.trigger(modelClassNameSpace.TutorialPlayer.EVENTS.CURSOR_CHANGE_REQUIRED);
            var target = options.target,
                targetElement = target.element,
                offset = target.offset,
                targetClientRect = targetElement.getBoundingClientRect(),
                destination = {
                    x: targetClientRect.left + offset.x,
                    y: targetClientRect.top + offset.y
                },
                currentCursorPosition = this.cursor.getCursorPosition(),
                distanceToMoveX = Math.round(destination.x - currentCursorPosition.x),
                distanceToMoveY = Math.round(destination.y - currentCursorPosition.y),
                speedFactor = options.speedFactor || 1,
                speedOfMoving = options.speed || 3,
                //numberOfSubsteps = Math.max(Math.floor(Math.abs(distanceToMoveX) / speedOfMoving),
                //                            Math.floor(Math.abs(distanceToMoveY) / speedOfMoving)),
                numberOfSubsteps = 10,
                dx = distanceToMoveX / numberOfSubsteps,
                dy = distanceToMoveY / numberOfSubsteps,
                prevStepPosition = currentCursorPosition,
                currentStepPosition = null,
                subStepsCount, nextSubstep, self = this;
            speedOfMoving *= speedFactor;

            subStepsCount = 0;
            nextSubstep = function () {
                if (subStepsCount < numberOfSubsteps) {
                    currentStepPosition = null;
                    currentStepPosition = {
                        x: prevStepPosition.x + dx,
                        y: prevStepPosition.y + dy
                    };
                    subStepsCount++;
                    window.setTimeout($.proxy(self._cursorMove, self, currentStepPosition, { target: targetElement }), 100);

                    prevStepPosition = currentStepPosition;
                }
                else {
                    self.cursor.off('moveComplete');
                    //console.log('completedStepLevel' + options.stepLevel + ' move');
                    self.trigger('completedStepLevel' + options.stepLevel);
                }
            };
            self.cursor.off('moveComplete').on('moveComplete', $.proxy(nextSubstep, self));
            nextSubstep();
        },

        /**
        * Called in a loop; it calls the cursor's move method with the same parameters.
        *
        * @method _cursorMove
        * @param currentStepPosition {Object} The cursor's new position in the format { x: <value>, y: <value> }
        * @param options {Object} Contains the target element for the mouse event
        * @private
        */
        _cursorMove: function _cursorMove(currentStepPosition, options) {
            this.cursor.move(currentStepPosition, options);
        },

        /**
        * Simulates the mouse down event
        *
        * @method _simulateMouseDown
        * @param options {Object} An object holding info like the target, offset, stepLevel.
        * @private
        */
        _simulateMouseDown: function _simulateMouseDown(options) {
            this.trigger(modelClassNameSpace.TutorialPlayer.EVENTS.CURSOR_CHANGE_REQUIRED);
            var target = options.target,
                targetElement = target.element,
                offset = target.offset,
                targetClientRect = targetElement.getBoundingClientRect();
            this.cursor.sendMouseDownEvent({
                target: targetElement,
                eventPoint: {
                    x: targetClientRect.left + offset.x,
                    y: targetClientRect.top + offset.y
                }
            });
            //console.log('completedStepLevel' + options.stepLevel + ' mouse down');
            this.trigger('completedStepLevel' + options.stepLevel);
        },

        /**
        * Simulates the mouse up event
        *
        * @method _simulateMouseUp
        * @param options {Object} An object holding info like the target, offset, stepLevel.
        * @private
        */
        _simulateMouseUp: function _simulateMouseUp(options) {
            this.trigger(modelClassNameSpace.TutorialPlayer.EVENTS.CURSOR_CHANGE_REQUIRED);
            var target = options.target,
                targetElement = target.element,
                offset = target.offset,
                targetClientRect = targetElement.getBoundingClientRect();
            this.cursor.sendMouseUpEvent({
                target: targetElement,
                eventPoint: {
                    x: targetClientRect.left + offset.x,
                    y: targetClientRect.top + offset.y
                }
            });
            //console.log('completedStepLevel' + options.stepLevel + ' mouse up');
            this.trigger('completedStepLevel' + options.stepLevel);
        },

        /**
        * Simulates the click event
        *
        * @method _simulateClick
        * @param options {Object} An object holding info like the target, offset, stepLevel.
        * @private
        */
        _simulateClick: function _simulateClick(options) {
            var subSteps, subStepsCount, nextSubstep, self = this,
                target = options.target,
                offset = target.offset,
                targetElement = target.element,
                subStepLevel;
            subStepLevel = options.stepLevel + 1;
            subSteps = [
                {
                    methodName: '_simulateMouseDown',
                    params: {
                        target: target,
                        stepLevel: subStepLevel
                    }
                },
                {
                    methodName: '_simulateMouseUp',
                    params: {
                        target: target,
                        stepLevel: subStepLevel
                    }
                }
            ];
            subStepsCount = 0;
            nextSubstep = function () {
                if (subStepsCount < subSteps.length) {
                    var currentSubStep = subSteps[subStepsCount];
                    subStepsCount++;
                    self[currentSubStep.methodName].call(self, currentSubStep.params);
                }
                else {
                    self.off('completedStepLevel' + subStepLevel);
                    //self.cursor.sendClickEvent(options);
                    //console.log('completedStepLevel' + options.stepLevel + ' click');
                    self.trigger('completedStepLevel' + options.stepLevel);
                }
            };
            self.off('completedStepLevel' + subStepLevel).on('completedStepLevel' + subStepLevel, nextSubstep);
            self._setCursorAtTarget(options.target);
            nextSubstep();
        },

        /**
        * Simulates the double click event
        *
        * @method _simulateDoubleClick
        * @param options {Object} An object holding info like the target, offset, stepLevel.
        * @private
        */
        _simulateDoubleClick: function _simulateDoubleClick(options) {
            var subSteps, subStepsCount, nextSubstep, self = this,
                subStepLevel;
            subStepLevel = options.stepLevel + 1;
            subSteps = [
                {
                    methodName: '_simulateClick',
                    params: {
                        target: options.target,
                        stepLevel: subStepLevel
                    }
                },
                {
                    methodName: '_simulateClick',
                    params: {
                        target: options.target,
                        stepLevel: subStepLevel
                    }
                }
            ];
            subStepsCount = 0;
            nextSubstep = function () {
                if (subStepsCount < subSteps.length) {
                    var currentSubStep = subSteps[subStepsCount];
                    subStepsCount++;
                    self[currentSubStep.methodName].call(self, currentSubStep.params);
                }
                else {
                    self.off('completedStepLevel' + subStepLevel);
                    //self.cursor.sendDoubleClickEvent(options);
                    //console.log('completedStepLevel' + options.stepLevel + ' double click');
                    self.trigger('completedStepLevel' + options.stepLevel);
                }
            };
            self.off('completedStepLevel' + subStepLevel).on('completedStepLevel' + subStepLevel, nextSubstep);
            self._setCursorAtTarget(options.target);
            nextSubstep();
        },

        /**
        * CSS animates the target and nextTarget elements of the step depending on the animation class passed.
        *
        * @method _animateElements
        * @param stepData {Object} An object holding information about the step like the target, nextTarget and stepLevel.
        * Where 'target' and 'nextTarget' are objects containing element, animation class and offset.
        */
        _animateElements: function _animateElements(stepData) {
            var subStepLevel = stepData.stepLevel + 1,
                self = this,
                browserCheck = MathInteractives.Common.Utilities.Models.BrowserCheck,
                index,
                target = stepData.target,
                nextTarget = stepData.nextTarget,
                $targetElement, $nextTargetElement,
                animationsCount = 0, // keep a count of animations ended
                animationsRequired = 0, // trigger completedStepLevel1 when all animations have ended
                isTargetToBeAnimated = false,
                isNextTargetToBeAnimated = false,
                tutorialEvents = modelClassNameSpace.TutorialPlayer.EVENTS,
                animationEndClasses = 'webkitAnimationEnd oanimationend msAnimationEnd animationend MSAnimationEnd',
                classesAdded = '',
                _removeAnimationClass, _incrementAnimationsPlayedCount, _animationComplete,
                isIE9 = (browserCheck.isIE && browserCheck.browserVersion < 10);

            // calculate exact number of animations required
            if (target && target.animation) {
                isTargetToBeAnimated = true;
                animationsRequired++;
            }
            if (nextTarget && nextTarget.animation) {
                isNextTargetToBeAnimated = true;
                animationsRequired++;
            }


            // Called at the end of animation, it remove the animation class
            _removeAnimationClass = function () {
                $(this).removeClass(classesAdded).removeClass('animated');
            };
            // Increments the animations played count & when it reaches required count, triggers completedStepLevel1
            _incrementAnimationsPlayedCount = function () {
                animationsCount++;
                if (animationsCount >= animationsRequired) {
                    self.trigger('completedStepLevel' + stepData.stepLevel);
                }
            };
            // Called at the end of animation, removes animation class and increments animation played count.
            _animationComplete = function () {
                $(this).removeClass(classesAdded).removeClass('animated');
                _incrementAnimationsPlayedCount();
            };

            if (isTargetToBeAnimated) {
                classesAdded += target.animation.className + ' ';
                $targetElement = $(target.element);
                if (isIE9) {
                    if (target.animation.isNotStandard) {
                        self.trigger(tutorialEvents.HANDLE_CSS_ANIMATION_FOR_IE9, $targetElement, target.animation.className, _incrementAnimationsPlayedCount);
                    }
                    else {
                        this._simulateAnimateCss($targetElement, target.animation, _incrementAnimationsPlayedCount);
                    }
                }
                else {
                    $targetElement.addClass(target.animation.className).addClass('animated')
                        .one(animationEndClasses, _animationComplete);
                }
            }

            if (isNextTargetToBeAnimated) {
                classesAdded += nextTarget.animation.className + ' ';
                $nextTargetElement = $(nextTarget.element);

                // if prompting user to drag, then droppable will get animation css class on target's drag start
                //         in such case we directly call '_incrementAnimationsPlayedCount'
                if (stepData.simulateActionEnum === modelClassNameSpace.TutorialPlayer.METHOD_ENUM_INVERSE._promptUserToDrag) {
                    self._elementsWithTutorialEvents.push($targetElement);
                    $targetElement.off('dragstart.tutorial').on('dragstart.tutorial', function () {
                        if (isIE9) {
                            if (nextTarget.animation.isNotStandard) {
                                self.trigger(tutorialEvents.HANDLE_CSS_ANIMATION_FOR_IE9, $nextTargetElement, nextTarget.animation.className);
                            }
                            else {
                                this._simulateAnimateCss($nextTargetElement, nextTarget.animation);
                            }
                        }
                        else {
                            $nextTargetElement.addClass(nextTarget.animation.className).addClass('animated')
                                .one(animationEndClasses, _removeAnimationClass);
                        }
                    });
                    _incrementAnimationsPlayedCount();
                }
                else {
                    $nextTargetElement.addClass(nextTarget.animation).addClass('animated')
                        .one(animationEndClasses, _animationComplete);
                }

            }
        },

        /**
        * Creates a fake marquee and at the end of animation, simulates mouse drag to create a marquee.
        *
        * @method _promptUserToMarquee
        * @param stepData {Object} The step data for creating a marquee.
        * @private
        */
        _promptUserToMarquee: function _promptUserToMarquee(stepData) {
            this._addRemoveFakeMarqueeDiv(true);
            var options, subStepLevel = stepData.stepLevel + 1;
            options = {
                target: stepData.target,
                nextTarget: stepData.nextTarget,
                stepLevel: subStepLevel
            };
            this.off('completedStepLevel' + subStepLevel)
                .on('completedStepLevel' + subStepLevel, $.proxy(function () {

                    this._simulateMouseDown({ target: options.target, stepLevel: options.stepLevel + 1 });
                    this.cursor.simulateEvent(options.nextTarget.element, 'mousemove', {}, { offset: options.nextTarget.offset } );
                    this._simulateMouseUp({ target: options.nextTarget, stepLevel: options.stepLevel + 1 });

                    this.stopActualMouseEvents(false);
                    this._addRemoveFakeMarqueeDiv(false);
                    this.trigger('completedStepLevel' + stepData.stepLevel);
                }, this));


            /****----____ Set cursor at target ____----****/
            this._setCursorAtTarget(options.target);

            // for mouse down
            this.trigger(modelClassNameSpace.TutorialPlayer.EVENTS.CURSOR_CHANGE_REQUIRED);

            this.stopActualMouseEvents();

            var // Marquee start location
                target = options.target,
                targetElement = target.element,
                offset = target.offset,
                targetClientRect = targetElement.getBoundingClientRect(),
                destination = {
                    x: targetClientRect.left + offset.x,
                    y: targetClientRect.top + offset.y
                },

                // Marquee end location
                nextTarget = options.nextTarget,
                nextTargetElement = nextTarget.element,
                nextTargetOffset = nextTarget.offset,
                nextTargetClientRect = nextTargetElement.getBoundingClientRect(),
                nextDestination = {
                    x: nextTargetClientRect.left + nextTargetOffset.x,
                    y: nextTargetClientRect.top + nextTargetOffset.y
                },

                // fake marquee initial position
                elClientRect = this.el.getBoundingClientRect(),
                fakeMarqueeDivInitialTop = destination.y - elClientRect.top,
                fakeMarqueeDivInitialLeft = destination.x - elClientRect.left,

                // cursor step info calulation
                currentCursorPosition = this.cursor.getCursorPosition(),
                distanceToMoveX = Math.round(nextDestination.x - currentCursorPosition.x),
                distanceToMoveY = Math.round(nextDestination.y - currentCursorPosition.y),
                speedFactor = options.speedFactor || 1,
                speedOfMoving = (options.speed || 10) * speedFactor,
                //numberOfSubsteps = Math.max(Math.floor(Math.abs(distanceToMoveX) / speedOfMoving),
                //                            Math.floor(Math.abs(distanceToMoveY) / speedOfMoving)),
                numberOfSubsteps = 10,
                dx = distanceToMoveX / numberOfSubsteps,
                dy = distanceToMoveY / numberOfSubsteps,

                prevStepPosition = currentCursorPosition,
                currentStepPosition = null,
                subStepsCount, nextSubstep, self = this;

            this._$fakeMarqueeDiv.css({ 'top': fakeMarqueeDivInitialTop, 'left': fakeMarqueeDivInitialLeft });
            this._fakeMarqueeDivClientRect = this._$fakeMarqueeDiv[0].getBoundingClientRect();

            subStepsCount = 0;
            nextSubstep = function () {
                if (subStepsCount <= numberOfSubsteps) {
                    currentStepPosition = null;
                    currentStepPosition = {
                        x: prevStepPosition.x + dx,
                        y: prevStepPosition.y + dy
                    };
                    subStepsCount++;
                    window.setTimeout(function () {
                        self._expandMarquee(currentStepPosition, { target: targetElement });
                    }, 100);

                    prevStepPosition = currentStepPosition;
                }
                else {
                    self._$fakeMarqueeDiv.css({
                        'width': distanceToMoveX,
                        'height': distanceToMoveY
                    });
                    self.cursor.off('moveComplete');
                    // For mouse up
                    self.trigger(modelClassNameSpace.TutorialPlayer.EVENTS.CURSOR_CHANGE_REQUIRED);
                    self.trigger('completedStepLevel' + options.stepLevel);
                }
            };
            self.cursor.off('moveComplete').on('moveComplete', $.proxy(nextSubstep, self));
            // For mouse drag
            this.trigger(modelClassNameSpace.TutorialPlayer.EVENTS.CURSOR_CHANGE_REQUIRED);
            nextSubstep();

        },

        /**
        * Stores the fake marquee client rect to store initial top and left position of fake marquee div.
        *
        * @property _fakeMarqueeDivClientRect
        * @type Object
        * @default null
        */
        _fakeMarqueeDivClientRect: null,

        /**
        * Calls the _cursorMove method and resizes the _$fakeMarqueeDiv to the position passed.
        *
        * @method _expandMarquee
        * @param currentStepPosition {Object} The x, y location where the cursor is to be placed and to which the fake
        * marquee DIV is to be re-sized.
        * @param options {Object} An object containing the target DOM object.
        */
        _expandMarquee: function _expandMarquee(currentStepPosition, options) {
            this._cursorMove(currentStepPosition, options);
            if (this._$fakeMarqueeDiv) {
                var fakeMarqueeDivClientRect = this._fakeMarqueeDivClientRect,
                    fakeMarqueeDivInitialTop = fakeMarqueeDivClientRect.top,
                    fakeMarqueeDivInitialLeft = fakeMarqueeDivClientRect.left;
                this._$fakeMarqueeDiv.css({
                    'width': currentStepPosition.x - fakeMarqueeDivInitialLeft,
                    'height': currentStepPosition.y - fakeMarqueeDivInitialTop
                });
            }
        },

        /**
        * Cached fake marquee DIV's jquery reference.
        *
        * @property _$fakeMarqueeDiv
        * @type Object
        * @default null
        */
        _$fakeMarqueeDiv: null,

        /**
        * Adds/removes the fake marquee DIV depending on the parameter passed.
        *
        * @method _addRemoveFakeMarqueeDiv
        * @param add {Boolean} True would add the DIV, storing its jQuery reference in _$fakeMarqueeDiv. False deletes it.
        */
        _addRemoveFakeMarqueeDiv: function _addRemoveFakeMarqueeDiv(add) {
            if (add) {
                var fakeCursorDivId = this.el.id + '-fake-marquee-div';
                this._$fakeMarqueeDiv = $('<div></div>', {
                    id: fakeCursorDivId,
                    'class': fakeCursorDivId.slice(this.idPrefix.length)
                }).appendTo(this.$el);
            }
            else {
                this._$fakeMarqueeDiv.remove();
                this._$fakeMarqueeDiv = null;
            }
        },

        /**
        * Animates the cursor as if dragging the toggle button handle and fires click event at the end to perform
        * actual toggle.
        *
        * @method _simulateToggleButtonToggle
        * @param stepData {Object} The step data for toggling a toggle-button.
        * @private
        */
        _simulateToggleButtonToggle: function _simulateToggleButtonToggle(stepData) {
            var options, subStepLevel = stepData.stepLevel + 1;
            options = {
                target: stepData.target,
                nextTarget: stepData.nextTarget,
                stepLevel: subStepLevel
            };
            this.off('completedStepLevel' + subStepLevel)
                .on('completedStepLevel' + subStepLevel, $.proxy(function () {
                    this.stopActualMouseEvents(false);

                    this._setCursorAtTarget(options.target);

                    this.cursor.sendClickEvent({
                        target: options.target.element,
                        eventPoint: {
                            x: options.target.element.getBoundingClientRect().left + options.target.offset.x,
                            y: options.target.element.getBoundingClientRect().top + options.target.offset.y
                        }
                    });

                    //this._simulateClick({ target: options.nextTarget, stepLevel: options.stepLevel + 1 });

                    this.trigger('completedStepLevel' + stepData.stepLevel);
                }, this));


            /****----____ Set cursor at target ____----****/
            this._setCursorAtTarget(options.target);

            // for mouse down
            this.trigger(modelClassNameSpace.TutorialPlayer.EVENTS.CURSOR_CHANGE_REQUIRED);

            this.stopActualMouseEvents();

            var target = options.target,
                targetElement = target.element,

                // Drag end location
                nextTarget = options.nextTarget,
                nextTargetElement = nextTarget.element,
                nextTargetOffset = nextTarget.offset,
                nextTargetClientRect = nextTargetElement.getBoundingClientRect(),
                nextDestination = {
                    x: nextTargetClientRect.left + nextTargetOffset.x,
                    y: nextTargetClientRect.top + nextTargetOffset.y
                },

                // cursor step info calulation
                currentCursorPosition = this.cursor.getCursorPosition(),
                distanceToMoveX = Math.round(nextDestination.x - currentCursorPosition.x),
                distanceToMoveY = Math.round(nextDestination.y - currentCursorPosition.y),
                speedFactor = options.speedFactor || 1,
                speedOfMoving = (options.speed || 10) * speedFactor,
                //numberOfSubsteps = Math.max(Math.floor(Math.abs(distanceToMoveX) / speedOfMoving),
                //                            Math.floor(Math.abs(distanceToMoveY) / speedOfMoving)),
                numberOfSubsteps = 10,
                dx = distanceToMoveX / numberOfSubsteps,
                dy = distanceToMoveY / numberOfSubsteps,

                prevStepPosition = currentCursorPosition,
                currentStepPosition = null,
                subStepsCount, nextSubstep, self = this;

            subStepsCount = 0;
            nextSubstep = function () {
                if (subStepsCount < numberOfSubsteps) {
                    currentStepPosition = null;
                    currentStepPosition = {
                        x: prevStepPosition.x + dx,
                        y: prevStepPosition.y + dy
                    };
                    subStepsCount++;
                    window.setTimeout(function () {
                        self._dragToggleButtonHandle(currentStepPosition, {
                            target: targetElement,
                            targetParent: nextTargetElement
                        });
                    }, 20);

                    prevStepPosition = currentStepPosition;
                }
                else {
                    self.cursor.off('moveComplete');
                    // For mouse up
                    self.trigger(modelClassNameSpace.TutorialPlayer.EVENTS.CURSOR_CHANGE_REQUIRED);
                    self.trigger('completedStepLevel' + options.stepLevel);
                }
            };
            self.cursor.off('moveComplete').on('moveComplete', $.proxy(nextSubstep, self));
            // For mouse drag
            this.trigger(modelClassNameSpace.TutorialPlayer.EVENTS.CURSOR_CHANGE_REQUIRED);
            nextSubstep();

        },



        _simulateTileClick: function _simulateTileClick(stepData) {
            var options, subStepLevel = stepData.stepLevel + 1, self = this;
            options = {
                target: stepData.target,
                nextTarget: stepData.nextTarget,
                stepLevel: subStepLevel
            };
            this.off('completedStepLevel' + subStepLevel)
                .on('completedStepLevel' + subStepLevel, $.proxy(function () {
                    this.stopActualMouseEvents(false);

                    this._setCursorAtTarget(options.target);

                    this.cursor.sendClickEvent({
                        target: options.target.element,
                        eventPoint: {
                            x: options.target.element.getBoundingClientRect().left + options.target.offset.x,
                            y: options.target.element.getBoundingClientRect().top + options.target.offset.y
                        }
                    });

                    //this._simulateClick({ target: options.nextTarget, stepLevel: options.stepLevel + 1 });
                    this.trigger('completedStepLevel' + stepData.stepLevel);
                }, this));


            /****----____ Set cursor at target ____----****/
            this._setCursorAtTarget(options.target);
            // for mouse down
            this.trigger(modelClassNameSpace.TutorialPlayer.EVENTS.CURSOR_CHANGE_REQUIRED);

            var $tile = $(options.target.element);
            window.setTimeout(function () {
                $tile.addClass('tile-pressed-state');
                window.setTimeout(function () {
                    $tile.removeClass('tile-pressed-state');
                    window.setTimeout(function () {
                        self.trigger(modelClassNameSpace.TutorialPlayer.EVENTS.CURSOR_CHANGE_REQUIRED);
                        self.trigger('completedStepLevel' + options.stepLevel);
                    }, 500);
                }, 1000);
            }, 500);



            // For mouse up
            //this.trigger(modelClassNameSpace.TutorialPlayer.EVENTS.CURSOR_CHANGE_REQUIRED);
            //self.trigger('completedStepLevel' + options.stepLevel);
        },





        /**
        * Calls the _cursorMove method and positions the target (drag handle) to the position passed.
        *
        * @method _dragToggleButtonHandle
        * @param currentStepPosition {Object} The x, y location where the cursor is to be placed and to which the
        * drag handle is to be moved.
        * @param options {Object} An object containing the target (handle) DOM object and the targetParent DOM object.
        */
        _dragToggleButtonHandle: function _dragToggleButtonHandle(currentStepPosition, options) {
            this._cursorMove(currentStepPosition, options);
            var targetElement = options.target,
                targetParent = options.targetParent,
                $targetElement,
                targetClientRect,
                targetParentClientRect;
            if (targetElement) {
                $targetElement = $(targetElement);
                targetClientRect = targetElement.getBoundingClientRect();
                targetParentClientRect = targetParent.getBoundingClientRect();
                $targetElement.css({
                    'left': currentStepPosition.x - targetParentClientRect.left - targetClientRect.width / 2 //,
                    //'top': currentStepPosition.y - targetParentClientRect.top - targetClientRect.height / 2
                    // todo: handle vertical toggle button (use relative position instead of clientX, clientY)
                });
            }
        },

        /**
        * Set cursor div at the passed target's location.
        *
        * @method _setCursorAtTarget
        * @param target {Object} Target object containing the target's element, offset.
        */
        _setCursorAtTarget: function _setCursorAtTarget(target) {
            var targetElement = target.element,
                offset = target.offset,
                targetClientRect = targetElement.getBoundingClientRect(),
                destination = {
                    x: targetClientRect.left + offset.x,
                    y: targetClientRect.top + offset.y
                };
            this.cursor.setCursorPosition(destination);
        },

        /**
        * Adds css animation class for dynamic generated elements.
        *
        * @method _animateDynamicGeneratedElements
        * @param targetList {Array} A list of objects to be animated containing the element and animation object.
        */
        animateDynamicGeneratedElements: function animateDynamicGeneratedElements(targetList) {
            var browserCheck = MathInteractives.Common.Utilities.Models.BrowserCheck,
                animationEndClasses = 'webkitAnimationEnd oanimationend msAnimationEnd animationend MSAnimationEnd',
                animationsCount = 0, // keep a count of animations ended
                animationsRequired = 0, // trigger completedStepLevel1 when all animations have ended
                self = this,
                index,
                currentTarget, element, $element, animationClass,
                targetsCount = targetList.length,
                tutorialEvents = modelClassNameSpace.TutorialPlayer.EVENTS,
                classesAdded = '',
                _removeAnimationClass, _incrementAnimationsPlayedCount, _animationComplete,
                isIE9 = (browserCheck.isIE && browserCheck.browserVersion < 10);

            // Called at the end of animation, it remove the animation class
            _removeAnimationClass = function () {
                $(this).removeClass(classesAdded).removeClass('animated');
            };
            // Increments the animations played count & when it reaches required count, triggers completedStepLevel1
            _incrementAnimationsPlayedCount = function () {
                animationsCount++;
                if (animationsCount >= animationsRequired) {
                    self.trigger('dynamicGenElemsAnimationComplete');
                }
            };
            // Called at the end of animation, removes animation class and increments animation played count.
            _animationComplete = function () {
                $(this).removeClass(classesAdded).removeClass('animated');
                _incrementAnimationsPlayedCount();
            };

            for (index = 0; index < targetsCount; index++) {
                currentTarget = targetList[index];
                element = currentTarget.element;
                $element = $(element);
                classesAdded += currentTarget.animation.className + ' ';
                if (isIE9) {
                    if (currentTarget.animation.isNotStandard) {
                        self.trigger(tutorialEvents.HANDLE_CSS_ANIMATION_FOR_IE9, $element, currentTarget.animation.className);
                    }
                    else {
                        this._simulateAnimateCss($element, currentTarget.animation, _incrementAnimationsPlayedCount);
                    }
                }
                else {
                    $element.addClass(currentTarget.animation.className).addClass('animated')
                        .one(animationEndClasses, _animationComplete);
                }
            }

        },

        /**
        * Simulates animate css standard animations like bounce, pulse for IE 9.
        *
        * @method _simulateAnimateCss
        * @param $element {Object} The jquery reference of the element to be animated.
        * @param animationData {Object} The parsed animation data.
        * @param callBack {Object} The call back function to be called at the end of the animation.
        * @private
        */
        _simulateAnimateCss: function _simulateAnimateCss($element, animationData, callBack) {
            switch (animationData.className) {
                case 'bounce':
                    this._bounceElementInIe9($element, animationData, callBack);
                    break;
                case 'pulse':
                    if (animationData.isButton) {
                        this._pulseButtonInIe9($element, animationData, callBack);
                    }
                    else {
                        this._pulseElementInIe9($element, animationData, callBack);
                    }
                    break;
            }
        },

        /**
        * Simulates animate css bounce animation for IE 9.
        *
        * @method _bounceElementInIe9
        * @param $element {Object} The jquery reference of the element to be animated.
        * @param animationData {Object} The parsed animation data.
        * @param callBack {Object} The call back function to be called at the end of the animation.
        * @private
        */
        _bounceElementInIe9: function _bounceElementInIe9($element, animationData, callBack) {
            $element = $element instanceof $ ? $element : $($element);
            var totalDuration = animationData.duration || 1000,
                maxBounceDistance = animationData.value || 30,
                times = animationData.times || 1,
                stepsCount = 1 * times,
                _bounceOnce;
            _bounceOnce = function _bounceOnce() {
                if (stepsCount === 0) {
                    callBack && callBack();
                    return;
                }
                $element.effect('bounce', { distance: maxBounceDistance }, totalDuration, function () {
                    stepsCount--;
                    _bounceOnce();
                });
            }();
        },

        /**
        * Simulates animate css pulse animation for IE 9.
        *
        * @method _bounceElementInIe9
        * @param $element {Object} The jquery reference of the element to be animated.
        * @param animationData {Object} The parsed animation data.
        * @param callBack {Object} The call back function to be called at the end of the animation.
        * @private
        */
        _pulseElementInIe9: function _pulseElementInIe9($element, animationData, callBack) {
            $element = $element instanceof $ ? $element : $($element);
            var totalDuration = animationData.duration || 300,
                times = animationData.times || 1,
                stepsCount = 2 * times,
                initialWidth = $element.width(),
                initialHeight = $element.height(),
                finalWidth = initialWidth * 1.05,
                finalHeight = initialHeight * 1.05,
                initialTop = Number($element.css('top').split('px')[0]),
                initialLeft = Number($element.css('left').split('px')[0]),
                finalTop = initialTop + (initialHeight - finalHeight) / 2,
                finalLeft = initialLeft + (initialWidth - finalWidth) / 2,
                _pulseOnce,
                properties = { top: finalTop, left: finalLeft, width: finalWidth, height: finalHeight },
                initProperties = { top: initialTop, left: initialLeft, width: initialWidth, height: initialHeight };
            _pulseOnce = function _pulseOnce() {
                if (stepsCount === 0) {
                    callBack && callBack();
                    return;
                }

                $element.animate(properties,
                    totalDuration / stepsCount, function () {
                        stepsCount--;
                        $element.animate(initProperties,
                            totalDuration / stepsCount, function () {
                                stepsCount--;
                                _pulseOnce();
                            }
                        );
                    }
                );
            }();
        },

        /**
        * Simulates animate css pulse animation of Button for IE 9.
        *
        * @method _bounceElementInIe9
        * @param $element {Object} The jquery reference of the element to be animated.
        * @param animationData {Object} The parsed animation data.
        * @param callBack {Object} The call back function to be called at the end of the animation.
        * @private
        */
        _pulseButtonInIe9: function ($element, animationData, callBack) {
            $element = $element instanceof $ ? $element : $($element);
            var totalDuration = animationData.duration || 300,
                times = animationData.times || 1,
                stepsCount = 2 * times,
                maxSteps = stepsCount,
                initialWidth = $element.width(),
                initialHeight = $element.height(),
                finalWidth = initialWidth * 1.05,
                finalHeight = initialHeight * 1.05,
                initialTop = Number($element.css('top').split('px')[0]),
                initialLeft = Number($element.css('left').split('px')[0]),
                finalTop = initialTop + (initialHeight - finalHeight) / 2,
                finalLeft = initialLeft + (initialWidth - finalWidth) / 2,
                _pulseOnce, _setButton, _resetButton,
                properties = { top: finalTop, left: finalLeft, width: finalWidth, height: finalHeight },
                initProperties = { top: initialTop, left: initialLeft, width: initialWidth, height: initialHeight },
                textNode = $element.find('.custom-btn-text'),
                shadowNode = $element.find('.custom-btn-shadowHolder'),
                initTextProperty = {};
            if (textNode) {
                initTextProperty = {
                    textNode: textNode,
                    lineHeight: textNode.css('line-height'),
                    disp: textNode.css('display'),
                    paddingLeft: textNode.css('padding-left'),
                    initialHeight: initialHeight
                };
            }
            _setButton = function _setButton() {
                var textNode = initTextProperty.textNode;
                textNode.css({
                    'line-height': '',
                    'display': 'table-cell',
                    'vertical-align': 'middle',
                    'width': 'inherit',
                    'height': 'inherit',
                    'text-align': 'center',
                    'padding': 0
                });
                shadowNode.css('width', '100%');
            };

            _resetButton = function _resetButton() {
                var textNode = initTextProperty.textNode;
                textNode.css('line-height', initTextProperty.lineHeight);
                textNode.css('display', initTextProperty.disp);
                textNode.css('vertical-align', '');
                textNode.css('width', '');
                textNode.css('text-align', '');
                textNode.css('padding', '');
                textNode.css('height', initTextProperty.initialHeight + 'px');
                textNode.css('padding-left', initTextProperty.paddingLeft);
                shadowNode.css('width', 'inherit');
            };

            _pulseOnce = function _pulseOnce() {
                _setButton();
                if (stepsCount === 0) {
                    _resetButton();
                    callBack && callBack();
                    return;
                }

                $element.animate(properties,
                    totalDuration / maxSteps, function () {
                        stepsCount--;
                        $element.animate(initProperties,
                            totalDuration / maxSteps, function () {
                                stepsCount--;
                                _pulseOnce();
                            }
                        );
                    }
                );
            }();
        }
    }, {

        /**
        * Cursor simulates actual cursor pointer, firing events as the actual cursor would do.
        *
        * @class Cursor
        * @constructor
        * @type Object
        * @extends MathInteractives.Common.Player.Views.Base
        * @namespace MathInteractives.Common.Components.Theme2.Views.TutorialPlayer
        */
        Cursor: MathInteractives.Common.Player.Views.Base.extend({

            /**
            * Sets the cursor position
            *
            * @method setCursorPosition
            * @param position {Object} The position of the cursor in the format { x: <value>, y: <value> }.
            */
            setCursorPosition: function setCursorPosition(destination) {
                this.model.set('position', destination);
                var parentClientRect = this.el.parentElement.getBoundingClientRect();
                this.$el.css({
                    left: destination.x - parentClientRect.left,
                    top: destination.y - parentClientRect.top
                });
            },

            /**
            * Returns the cursor position
            *
            * @method getCursorPosition
            * @return {Object} The position of the cursor in the format { x: <value>, y: <value> }.
            */
            getCursorPosition: function getCursorPosition() {
                var clientRect = this.el.getBoundingClientRect();
                this.parentClientRect = this.el.parentElement.getBoundingClientRect();
                return {
                    x: clientRect.left,
                    y: clientRect.top
                };
            },

            /**
            * Returns the cursor's parent element's clientX, clientY in the format { x: <value>, y: <value> }.
            *
            * @method getCursorPosition
            * @return {Object} The position of the cursor in the format { x: <value>, y: <value> }.
            */
            getParentPosition: function getParentPosition() {
                var parentClientRect = this.el.parentElement.getBoundingClientRect();
                return {
                    x: parentClientRect.left,
                    y: parentClientRect.top
                };
            },

            /**
            * Moves the cursor to the position passed and calls simulateEvent method to dispatch move event.
            *
            * @method move
            * @param destination {Object} The position where the cursor is to be positioned.
            * @param options {Object} Object containing info like the target element.
            */
            move: function move(destination, options) {
                this.model.set('position', destination);
                var parentClientRect = this.parentClientRect;
                this.$el.css({
                    left: destination.x - parentClientRect.left,
                    top: destination.y - parentClientRect.top
                });
                this.numberOfStepsToPerform--;
                this.simulateEvent(options.target, 'mousemove', { clientX: destination.x, clientY: destination.y });
                this.trigger('moveComplete');
            },

            /**
            * Calls simulateEvent method to dispatch click event.
            *
            * @method sendClickEvent
            * @param options {Object} Object containing info like the target element.
            */
            sendClickEvent: function sendClickEvent(options) {
                this.simulateEvent(options.target, 'click', {
                    clientX: options.eventPoint.x,
                    clientY: options.eventPoint.y
                });
            },

            /**
            * Calls simulateEvent method to dispatch double click event.
            *
            * @method sendDoubleClickEvent
            * @param options {Object} Object containing info like the target element.
            */
            sendDoubleClickEvent: function sendDoubleClickEvent(options) {
                this.simulateEvent(options.target, 'dblclick', {
                    clientX: options.eventPoint.x,
                    clientY: options.eventPoint.y
                });
            },

            /**
            * Calls simulateEvent method to dispatch mouse down event.
            *
            * @method sendMouseDownEvent
            * @param options {Object} Object containing info like the target element.
            */
            sendMouseDownEvent: function sendMouseDownEvent(options) {
                this.simulateEvent(options.target, 'mousedown', {
                    clientX: options.eventPoint.x,
                    clientY: options.eventPoint.y
                });
            },

            /**
            * Calls simulateEvent method to dispatch mouse up event.
            *
            * @method sendMouseUpEvent
            * @param options {Object} Object containing info like the target element.
            */
            sendMouseUpEvent: function sendMouseUpEvent(options) {
                this.simulateEvent(options.target, 'mouseup', {
                    clientX: options.eventPoint.x,
                    clientY: options.eventPoint.y
                });
            },

            /**
            * Changes the cursor's appearance by changing it's background image and pointer offset in it's model.
            *
            * @method changeCursor
            * @param options {Object} Object containing info like the cur image base64 url data and size, offset.
            */
            changeCursor: function changeCursor() {

            },

            /**
            * Simulates the event by creating an event object and then calling dispatchEvent method.
            *
            * @method simulateEvent
            * @param elem {Object} The event's targetElement.
            * @param type {String} Event type
            * @param options {Object} Object containing additional event properties.
            */
            simulateEvent: function simulateEvent(elem, type, options, optionalData) {
                if (optionalData && optionalData.offset) {
                    var elemClientPos = elem.getBoundingClientRect();
                    options.clientX = elemClientPos.left + optionalData.offset.x;
                    options.clientY = elemClientPos.top + optionalData.offset.y;
                }
                var event = this.createEvent(type, options);
                this.dispatchEvent(elem, type, event, options);
            },

            /**
            * Creates the event object.
            *
            * @method createEvent
            * @param type {String} Event type
            * @param options {Object} Object containing additional event properties.
            * @return {Object} The event object.
            */
            createEvent: function createEvent(type, options) {
                var event, eventDoc, doc, body;
                options = $.extend({
                    bubbles: true,
                    cancelable: (type !== "mousemove"),
                    view: window,
                    detail: 0,
                    screenX: 0,
                    screenY: 0,
                    clientX: 1,
                    clientY: 1,
                    ctrlKey: false,
                    altKey: false,
                    shiftKey: false,
                    metaKey: false,
                    button: 0,
                    relatedTarget: undefined
                }, options);

                if (document.createEvent) {
                    event = document.createEvent("MouseEvents");
                    event.initMouseEvent(type, options.bubbles, options.cancelable,
                        options.view, options.detail,
                        options.screenX, options.screenY, options.clientX, options.clientY,
                        options.ctrlKey, options.altKey, options.shiftKey, options.metaKey,
                        options.button, options.relatedTarget || document.body.parentNode);

                    // IE 9+ creates events with pageX and pageY set to 0.
                    // Trying to modify the properties throws an error,
                    // so we define getters to return the correct values.
                    if (event.pageX === 0 && event.pageY === 0 && Object.defineProperty) {
                        eventDoc = event.relatedTarget.ownerDocument || document;
                        doc = eventDoc.documentElement;
                        body = eventDoc.body;

                        Object.defineProperty(event, "pageX", {
                            get: function () {
                                return options.clientX +
                                    (doc && doc.scrollLeft || body && body.scrollLeft || 0) -
                                    (doc && doc.clientLeft || body && body.clientLeft || 0);
                            }
                        });
                        Object.defineProperty(event, "pageY", {
                            get: function () {
                                return options.clientY +
                                    (doc && doc.scrollTop || body && body.scrollTop || 0) -
                                    (doc && doc.clientTop || body && body.clientTop || 0);
                            }
                        });
                    }
                } else if (document.createEventObject) {
                    event = document.createEventObject();
                    $.extend(event, options);
                    // standards event.button uses constants defined here: http://msdn.microsoft.com/en-us/library/ie/ff974877(v=vs.85).aspx
                    // old IE event.button uses constants defined here: http://msdn.microsoft.com/en-us/library/ie/ms533544(v=vs.85).aspx
                    // so we actually need to map the standard back to oldIE
                    event.button = {
                        0: 1,
                        1: 4,
                        2: 2
                    }[event.button] || (event.button === -1 ? 0 : event.button);
                }
                event.isSimulated = true;
                return event;
            },

            /**
            * Dispatches the event on the target.
            *
            * @method dispatchEvent
            * @param elem {Object} The event's targetElement.
            * @param type {String} Event type
            * @param event {Object} The event object.
            */
            dispatchEvent: function dispatchEvent(elem, type, event) {
                if (elem[type]) {
                    elem[type]();
                } else if (elem.dispatchEvent) {
                    elem.dispatchEvent(event);
                } else if (elem.fireEvent) {
                    elem.fireEvent("on" + type, event);
                }
            }
        })
    });
})(window.MathInteractives);
