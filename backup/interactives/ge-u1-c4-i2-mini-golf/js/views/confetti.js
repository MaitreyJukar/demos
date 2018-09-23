(function () {
    'use strict';
    /**
    * Score Container holds the necessary structure for the score-card.
    * @class ScoreCardContainer
    * @module MiniGolf
    * @namespace MathInteractives.Interactivities.MiniGolf.Views
    * @extends MathInteractives.Common.Player.Views.Base
    * @type Object
    * @constructor
    */
    MathInteractives.Interactivities.MiniGolf.Views.Confetti = MathInteractives.Common.Player.Views.Base.extend({
        /**
        * Unique interactivity id prefix
        * @property idprefix
        * @default null
        * @private
        */
        idPrefix: null,

        /**
        * Model of path for preloading files
        * @property filePath
        * @type Object
        * @default null
        */
        filePath: null,

        /**
        * Manager object 
        * @property manager
        * @type Object
        * @default null
        */
        manager: null,

        /**
        * Reference to player object
        * @property player
        * @type Object
        * @default null
        */
        player: null,

        /**
        * Reference to the confetti Canvas
        * @property $canvasEl
        * @type Object
        * @default null
        */
        canvasEl: null,

        /**
        * Context of the given canvas
        * @property ctx
        * @type Object
        * @default null
        */
        ctx: null,

        /**
        * Width of the Canvas
        * @property canvasWidth
        * @type Number
        * @default null
        */
        canvasWidth: null,

        /**
        * Height of the Canvas
        * @property canvasHeight
        * @type Number
        * @default null
        */
        canvasHeight: null,

        /**
        * Maximum number of particles.ribbons
        * @property maxNumberOfParticles
        * @type Number
        * @default 150
        */
        maxNumberOfParticles: 300,

        /**
        * Array of all the particles
        * @property particles
        * @type Array
        * @default null
        */
        particles: [],

        /**
        * Setting the interval
        * @property confettiHandler
        * @type Object
        * @default null
        */
        confettiHandler: null,
        
        /**
        * Setting the maximum time
        * @property timeCounter
        * @type Number
        * @default 0
        */
        timeCounter: 0,

        /**
        * Boolean to let the confetti fall off continuously and not stop after time counter reaches 2000.
        *
        * @property playNonStop
        * @type Boolean
        * @default false
        */
        playNonStop: false,
        
        TiltChangeCountdown: 5,
        angle: 0,
        tiltAngle: 0,

        /**
        * Initializes function of confetti view.
        * @method initialize
        * @constructor
        */
        initialize: function (options) {
            this.initializeDefaultProperties();
            if (options.neverStop) {
                this.playNonStop = true;
            }
        },

        /**
        * Generates the DOM for the Confetti.
        *
        * @method render
        * @private
        */
        render: function () {
            var canvasId = this.idPrefix + 'confetti-canvas';
            this.canvasEl = $('<canvas width = 928 height = 599></canvas>', { id: canvasId, class: 'confetti-canvas' });
            this.$el.append(this.canvasEl);
        },

        /**
        * Shows/displays the confetti canvas container DIV.
        *
        * @method _showConfetti
        */
        _showConfetti: function _showConfetti() {
            this.$el.show();
        },

        /**
        * Hides the confetti canvas container DIV.
        *
        * @method hideConfetti
        */
        hideConfetti: function hideConfetti() {
            this.$el.hide();
        },

        _randomFromTo: function randomFromTo(from, to) {
            return Math.floor(Math.random() * (to - from + 1) + from);
        },

        setUpConfetti: function setUpConfetti() {
            this.render();
            this._showConfetti();
            this.ctx = this.canvasEl.get(0).getContext("2d");
            this.canvasWidth = 928 > this.canvasEl.parent().width() ? 928 : this.canvasEl.parent().width();
            this.canvasHeight = 599 || this.canvasEl.parent().height() ? 599 : this.canvasEl.parent().height();

            for (var i = 0; i < this.maxNumberOfParticles; i++) {
                this.particles.push({
                    x: Math.random() * this.canvasWidth, //x-coordinate
                    y: Math.random() * this.canvasHeight, //y-coordinate
                    r: this._randomFromTo(15, 40), //radius
                    d: (Math.random() * this.maxNumberOfParticles) + 10, //density
                    color: "rgba(" + Math.floor((Math.random() * 255)) + ", " + Math.floor((Math.random() * 255)) + ", " + Math.floor((Math.random() * 255)) + ", 1.0)",
                    tilt: Math.floor(Math.random() * 10) - 10,
                    tiltAngleIncremental: (Math.random() * 0.07) + .05,
                    tiltAngle: 0
                });
            }
            this._startConfetti();
        },

        _startConfetti: function _startConfetti() {
            this.confettiHandler = setInterval($.proxy(this._startAnimation, this), 51);
        },

        _startAnimation: function _startAnimation() {
            this.timeCounter += 51;
            if (this.timeCounter > 2000 && !this.playNonStop) {
                clearTimeout(this.confettiHandler);
                this.timeCounter = 0;
            }
            var p;
            this.ctx.clearRect(0, 0, this.canvasWidth, this.canvasHeight);
            for (var i = 0; i < this.maxNumberOfParticles; i++) {
                p = this.particles[i];
                this.ctx.beginPath();
                this.ctx.lineWidth = p.r / 2;
                this.ctx.strokeStyle = p.color;  // Green path
                this.ctx.moveTo(p.x + p.tilt + (p.r / 4), p.y);
                this.ctx.lineTo(p.x + p.tilt, p.y + p.tilt + (p.r / 4));
                this.ctx.stroke();  // Draw it
            }

            this._update();
        },

        _update: function _update() {
            this.angle += 0.01;
            this.tiltAngle += 0.1;
            this.TiltChangeCountdown--;
            for (var i = 0; i < this.maxNumberOfParticles; i++) {

                var p = this.particles[i];
                p.tiltAngle += p.tiltAngleIncremental;
                //Updating X and Y coordinates
                //We will add 1 to the cos function to prevent negative values which will lead flakes to move upwards
                //Every particle has its own density which can be used to make the downward movement different for each flake
                //Lets make it more random by adding in the radius
                p.y += (Math.cos(this.angle + p.d) + 1 + p.r / 2) / 2;
                p.x += Math.sin(this.angle);
                //p.tilt = (Math.cos(p.tiltAngle - (i / 3))) * 15;
                p.tilt = (Math.sin(p.tiltAngle - (i / 3))) * 15;

                //Sending flakes back from the top when it exits
                //Lets make it a bit more organic and let flakes enter from the left and right also.
                if (p.x > this.canvasWidth + 5 || p.x < -5 || p.y > this.canvasHeight) {
                    if (i % 5 > 0 || i % 2 == 0) //66.67% of the flakes
                    {
                        this.particles[i] = {
                            x: Math.random() * this.canvasWidth,
                            y: -10,
                            r: p.r,
                            d: p.d,
                            color: p.color,
                            tilt: Math.floor(Math.random() * 10) - 10,
                            tiltAngle: p.tiltAngle,
                            tiltAngleIncremental: p.tiltAngleIncremental
                        };
                    }
                    else {
                        //If the flake is exitting from the right
                        if (Math.sin(this.angle) > 0) {
                            //Enter from the left
                            this.particles[i] = {
                                x: -5,
                                y: Math.random() * this.canvasHeight,
                                r: p.r,
                                d: p.d,
                                color: p.color,
                                tilt: Math.floor(Math.random() * 10) - 10,
                                tiltAngleIncremental: p.tiltAngleIncremental
                            };
                        }
                        else {
                            //Enter from the right
                            this.particles[i] = {
                                x: this.canvasWidth + 5,
                                y: Math.random() * this.canvasHeight,
                                r: p.r,
                                d: p.d,
                                color: p.color,
                                tilt: Math.floor(Math.random() * 10) - 10,
                                tiltAngleIncremental: p.tiltAngleIncremental
                            };
                        }
                    }
                }
            }

        },
        stopConfetti: function stopConfetti() {
            clearTimeout(this.confettiHandler);
            this.timeCounter = 0;
            if (this.ctx == undefined) return;
            this.ctx.clearRect(0, 0, this.canvasWidth, this.canvasHeight);
            this.canvasEl.remove();
            this.$el.hide();
        }

    }, {});
})();