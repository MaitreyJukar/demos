

        /**
        * Lazily updates the views only when it is possible to render
        * Asynchronously triggers the drag handler to provide better performance on iPad.
        * 
        * @method lazySliderUpdate
        * @param {Object} event Event
        */
        lazySliderUpdate: function (event) {
            var self = this;
            this.currentSlideEvent = event;
            if (!self.updateRequested) {
                window.setTimeout(function () {
                    self.updateRequested = false;
                    self.updateView(self.currentSlideEvent);
                    self.currentSlideEvent = null;
                }, 1);
                self.updateRequested = true;
            }
        },