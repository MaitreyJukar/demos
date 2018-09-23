/*
 * Handle keydown event on canvas area
 * @method _handleKeyDownEvent
 * @param {object} event
 * @private
 */
_handleKeyDownEvent: function _handleKeyDownEvent(event) {

        switch (event.keyCode) {
            case LEFTARROW:
            case RIGHTARROW:
            case UPARROW:
            case DOWNARROW:
                event.preventDefault();

                // Fire custom event
                // this.trigger("custom_keydown")

                // to handle JAWS issue
                this._handleArrowUpTrigger();
                break;
        }
    },


    /*
     * Handles keyup events on the canvas area
     * @method _handleKeyUpEvent
     * @param {Object} event
     * @private
     */
    _handleKeyUpEvent: function(event) {

        switch (event.keyCode) {
            case LEFTARROW:
            case RIGHTARROW:
            case UPARROW:
            case DOWNARROW:
                event.preventDefault();
                this._lastArrowKeyUpEvent = event;
                break;
        }
    },
    /*
     * JAWS handles arrow keys differently. When any arrow key is held down, keydown and keyup events are fired simultaneously.
     * To overcome this, this function checks whether another keydown has occured within a set timer before the keyup is fired.
     * If another keydown has been fired, the keyup event won't be triggered.
     *
     * @method _handleArrowUpTrigger
     * @private
     */
    _handleArrowUpTrigger: function() {
        var self = this,
            keyupTimer = 300;

        self._previousArrowKeyDownCount = self._currentArrowKeyDownCount;
        self._currentArrowKeyDownCount++;
        if (self._previousArrowKeyDownCount === 0) {
            if (self._keyUpInterval) {
                window.clearInterval(self._keyUpInterval);
            }
            self._keyUpInterval = window.setInterval(function() {
                if (self._previousArrowKeyDownCount === self._currentArrowKeyDownCount) {
                    window.clearInterval(self._keyUpInterval);
                    self._keyUpInterval = null;
                    self._previousArrowKeyDownCount = 0;
                    self._currentArrowKeyDownCount = 0;
                    self._handleArrowKeyUp();
                    self._lastArrowKeyUpEvent = null;
                } else {
                    if (self._lastArrowKeyUpEvent) {
                        self._previousArrowKeyDownCount = self._currentArrowKeyDownCount;
                    }
                }
            }, keyupTimer);
        }
    },

    /*
     * Triggers custom events when keyup of an arrow key is fired on the canvas.
     * @method _handleArrowKeyUp
     * @private
     */
    _handleArrowKeyUp: function() {
        if (this._lastArrowKeyUpEvent) {
            var event = this._lastArrowKeyUpEvent,
                keyCode = event.keyCode;

            switch (keyCode) {
                case LEFTARROW:
                    this.$el.trigger(LEFT_ARROW_KEYUP);
                    break;
                case RIGHTARROW:
                    this.$el.trigger(RIGHT_ARROW_KEYUP);
                    break;
                case UPARROW:
                    this.$el.trigger(UP_ARROW_KEYUP);
                    break;
                case DOWNARROW:
                    this.$el.trigger(DOWN_ARROW_KEYUP);
                    break;
            }
            this.$el.trigger(ARROW_KEYUP, [event, keyCode]);
        }
    },
