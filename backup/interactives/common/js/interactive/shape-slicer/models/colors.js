(function() {
    'use strict';
    if (MathInteractives.Common.Interactivities.ShapeSlicer.Models.Colors) {
        return;
    }
    /*
     *
     * Colors Model
     *
     * @class Colors
     * @namespace MathInteractives.Interactivities.ShapeSlicer.Models
     * @extends MathInteractives.Common.Player.Models.BaseInteractive
     * @constructor
     */

    MathInteractives.Common.Interactivities.ShapeSlicer.Models.Colors = MathInteractives.Common.Player.Models.BaseInteractive.extend({

        /**
         * [[Description]]
         * @attribute _valueRanges
         * @type Object
         * @default {
         */
        _valueRanges : {
            rgb : {
                r : [0, 255],
                g : [0, 255],
                b : [0, 255]
            },
            hsv : {
                h : [0, 360],
                s : [0, 100],
                v : [0, 100]
            },
            hsl : {
                h : [0, 360],
                s : [0, 100],
                l : [0, 100]
            },
            cmy : {
                c : [0, 100],
                m : [0, 100],
                y : [0, 100]
            },
            cmyk : {
                c : [0, 100],
                m : [0, 100],
                y : [0, 100],
                k : [0, 100]
            },
            Lab : {
                L : [0, 100],
                a : [-128, 127],
                b : [-128, 127]
            },
            XYZ : {
                X : [0, 100],
                Y : [0, 100],
                Z : [0, 100]
            },
            alpha : {
                alpha : [0, 1]
            },
            HEX : {
                HEX : [0, 16777215]
            } // maybe we don't need this
        },

        /**
         * [[Description]]
         * @attribute _instance
         * @type Object
         * @default {}
         */
        _instance : {},
        /**
         * [[Description]]
         * @attribute _colors
         * @type Object
         * @default {}
         */
        _colors : {},

        colors : null,

        /**
         * [[Description]]
         * @attribute XYZMatrix
         * @type Object
         * @default { // Observer = 2° (CIE 1931) Illuminant = D65
         */
        XYZMatrix : {// Observer = 2° (CIE 1931), Illuminant = D65
            X : [0.4124564, 0.3575761, 0.1804375],
            Y : [0.2126729, 0.7151522, 0.0721750],
            Z : [0.0193339, 0.1191920, 0.9503041],
            R : [3.2404542, -1.5371385, -0.4985314],
            G : [-0.9692660, 1.8760108, 0.0415560],
            B : [0.0556434, -0.2040259, 1.0572252]
        },
        /**
         * [[Description]]
         * @attribute grey
         * @type Object
         * @default { r: 0.298954 g: 0.586434, b: 0.114612 }, // CIE-XYZ 1931
         */
        grey : {
            r : 0.298954,
            g : 0.586434,
            b : 0.114612
        }, // CIE-XYZ 1931

        /**
         * [[Description]]
         * @attribute luminance
         * @type Object
         * @default { r: 0.2126 g: 0.7152, b: 0.0722 },
         */
        luminance : {
            r : 0.2126,
            g : 0.7152,
            b : 0.0722
        },

        /**
         * Initializes
         * @method initialize
         * @public
         */
        initialize : function() {
            this.colors = {
                RND : {}
            };
            this.options = {
                color : 'rgba(204, 82, 37, 0.8)', // init value(s)...
                XYZMatrix : this.XYZMatrix,
                grey : this.grey,
                luminance : this.luminance,
                valueRanges : this._valueRanges
            };
            this.initInstance({});
        },

        /**
         * Initializes instance
         * @method initInstance
         * @public
         * @param {[[Type]]} options [[Description]]
         */
        initInstance : function(options) {
            var matrix,
                importColor,
                _options = this.options,
                customBG;

            this.focusInstance();
            for (var option in options) {
                if (options[option] !== undefined)
                    _options[option] = options[option];
            }
            matrix = _options.XYZMatrix;
            if (!options.XYZReference)
                _options.XYZReference = {
                    X : matrix.X[0] + matrix.X[1] + matrix.X[2],
                    Y : matrix.Y[0] + matrix.Y[1] + matrix.Y[2],
                    Z : matrix.Z[0] + matrix.Z[1] + matrix.Z[2]
                };
            customBG = _options.customBG;
            _options.customBG = ( typeof customBG === 'string') ? this.txt2color(customBG).rgb : customBG;
            this._colors = this._setColor(this.colors, _options.color, undefined, true);
        },

        /**
         * focus instance
         * @method focusInstance
         * @public
         */
        focusInstance : function() {
            if (this._instance !== this) {
                this._instance = this;
                this._colors = this.colors;
            }
        },

        /**
         * Sets color
         * @method setColor
         * @public
         * @param {[[Type]]} newCol [[Description]]
         * @param {[[Type]]} type [[Description]]
         * @param {[[Type]]} alpha [[Description]]
         * @returns {[[Type]]} [[Description]]
         */
        setColor : function(newCol, type, alpha) {
            this.focusInstance();
            if (newCol) {
                return this._setColor(this.colors, newCol, type, undefined, alpha);
            } else {
                if (alpha !== undefined) {
                    this.colors.alpha = alpha;
                }
                return this._convertColors(type);
            }
        },

        /**
         * Sets color
         * @method _setColor
         * @private
         * @param {[[Type]]} colors [[Description]]
         * @param {[[Type]]} color [[Description]]
         * @param {[[Type]]} type [[Description]]
         * @param {[[Type]]} save [[Description]]
         * @param {[[Type]]} alpha [[Description]]
         * @returns {[[Type]]} [[Description]]
         */
        _setColor : function _setColor(colors, color, type, save, alpha) {// color only full range
            if ( typeof color === 'string') {
                var color = this.txt2color(color);
                type = color.type;
                this._colors[type] = color[type];
                alpha = alpha !== undefined ? alpha : color.alpha;
            } else if (color) {
                for (var n in color) {
                    colors[type][n] = this.limitValue(color[n] / this._valueRanges[type][n][1], 0, 1);
                }
            }
            if (alpha !== undefined) {
                colors.alpha = +alpha;
            }
            return this._convertColors(type, save ? colors : undefined);
        },

        /**
         * save as background
         * @method _saveAsBackground
         * @private
         * @param {[[Type]]} RGB [[Description]]
         * @param {[[Type]]} rgb [[Description]]
         * @param {[[Type]]} alpha [[Description]]
         * @returns {[[Type]]} [[Description]]
         */
        _saveAsBackground : function _saveAsBackground(RGB, rgb, alpha) {
            var grey = this._instance.options.grey,
                color = {};

            color.RGB = {
                r : RGB.r,
                g : RGB.g,
                b : RGB.b
            };
            color.rgb = {
                r : rgb.r,
                g : rgb.g,
                b : rgb.b
            };
            color.alpha = alpha;
            color.equivalentGrey = Math.round(grey.r * RGB.r + grey.g * RGB.g + grey.b * RGB.b);

            color.rgbaMixBlack = this.mixColors(rgb, {
                r : 0,
                g : 0,
                b : 0
            }, alpha, 1);
            color.rgbaMixWhite = this.mixColors(rgb, {
                r : 1,
                g : 1,
                b : 1
            }, alpha, 1);
            color.rgbaMixBlack.luminance = this.getLuminance(color.rgbaMixBlack, true);
            color.rgbaMixWhite.luminance = this.getLuminance(color.rgbaMixWhite, true);

            if (this._instance.options.customBG) {
                color.rgbaMixCustom = this.mixColors(rgb, this._instance.options.customBG, alpha, 1);
                color.rgbaMixCustom.luminance = this.getLuminance(color.rgbaMixCustom, true);
                this._instance.options.customBG.luminance = this.getLuminance(this._instance.options.customBG, true);
            }

            return color;
        },

        /**
         * Converts colors
         * @method _convertColors
         * @private
         * @param {[[Type]]} type [[Description]]
         * @param {[[Type]]} colorObj [[Description]]
         * @returns {[[Type]]} [[Description]]
         */
        _convertColors : function _convertColors(type, colorObj) {
            var colors = colorObj || this._colors,
                options = this._instance.options,
                ranges = this._valueRanges,
                RND = colors.RND,
                modes,
                mode = '',
                from = '',
                exceptions = {
                hsl : 'hsv',
                cmyk : 'cmy',
                rgb : type
            },
                RGB = RND.rgb,
                SAVE,
                SMART;

            if (type !== 'alpha') {
                for (var typ in ranges) {
                    if (!ranges[typ][typ]) {// no alpha|HEX
                        if (type !== typ && typ !== 'XYZ') {
                            from = exceptions[typ] || 'rgb';
                            colors[typ] = this[from + '2' + typ](colors[from]);
                        }

                        if (!RND[typ])
                            RND[typ] = {};
                        modes = colors[typ];
                        for (mode in modes) {
                            RND[typ][mode] = Math.round(modes[mode] * (typ === 'Lab' ? 1 : ranges[typ][mode][1]));
                        }
                    }
                }
                if (type !== 'Lab') {
                    delete colors._rgb;
                }

                RGB = RND.rgb;
                colors.HEX = this.rgb2hex(RGB);
                colors.equivalentGrey = options.grey.r * colors.rgb.r + options.grey.g * colors.rgb.g + this.mixColors
                options.grey.b * colors.rgb.b;
                colors.webSave = SAVE = this.getClosestWebColor(RGB, 51);
                colors.webSmart = SMART = this.getClosestWebColor(RGB, 17);
                colors.saveColor = RGB.r === SAVE.r && RGB.g === SAVE.g && RGB.b === SAVE.b ? 'web save' : RGB.r === SMART.r && RGB.g === SMART.g && RGB.b === SMART.b ? 'web smart' : '';
                colors.hueRGB = this.hue2RGB(colors.hsv.h);

                if (colorObj) {
                    colors.background = this._saveAsBackground(RGB, colors.rgb, colors.alpha);
                }
            }

            var rgb = colors.rgb, // for better minification...
                alpha = colors.alpha,
                luminance = 'luminance',
                background = colors.background,
                rgbaMixBlack,
                rgbaMixWhite,
                rgbaMixCustom,
                rgbaMixBG,
                rgbaMixBGMixBlack,
                rgbaMixBGMixWhite,
                rgbaMixBGMixCustom;

            rgbaMixBlack = this.mixColors(rgb, {
                r : 0,
                g : 0,
                b : 0
            }, alpha, 1);
            rgbaMixBlack[luminance] = this.getLuminance(rgbaMixBlack, true);
            colors.rgbaMixBlack = rgbaMixBlack;

            rgbaMixWhite = this.mixColors(rgb, {
                r : 1,
                g : 1,
                b : 1
            }, alpha, 1);
            rgbaMixWhite[luminance] = this.getLuminance(rgbaMixWhite, true);
            colors.rgbaMixWhite = rgbaMixWhite;

            if (options.allMixDetails) {
                rgbaMixBlack.WCAG2Ratio = this.getWCAG2Ratio(rgbaMixBlack[luminance], 0);
                rgbaMixWhite.WCAG2Ratio = this.getWCAG2Ratio(rgbaMixWhite[luminance], 1);

                if (options.customBG) {
                    rgbaMixCustom = this.mixColors(rgb, options.customBG, alpha, 1);
                    rgbaMixCustom[luminance] = this.getLuminance(rgbaMixCustom, true);
                    rgbaMixCustom.WCAG2Ratio = this.getWCAG2Ratio(rgbaMixCustom[luminance], options.customBG[luminance]);
                    colors.rgbaMixCustom = rgbaMixCustom;
                }

                rgbaMixBG = this.mixColors(rgb, background.rgb, alpha, background.alpha);
                rgbaMixBG[luminance] = this.getLuminance(rgbaMixBG, true);
                colors.rgbaMixBG = rgbaMixBG;

                rgbaMixBGMixBlack = this.mixColors(rgb, background.rgbaMixBlack, alpha, 1);
                rgbaMixBGMixBlack[luminance] = this.getLuminance(rgbaMixBGMixBlack, true);
                rgbaMixBGMixBlack.WCAG2Ratio = this.getWCAG2Ratio(rgbaMixBGMixBlack[luminance], background.rgbaMixBlack[luminance]);
                rgbaMixBGMixBlack.luminanceDelta = Math.abs(rgbaMixBGMixBlack[luminance] - background.rgbaMixBlack[luminance]);
                rgbaMixBGMixBlack.hueDelta = this.getHueDelta(background.rgbaMixBlack, rgbaMixBGMixBlack, true);
                colors.rgbaMixBGMixBlack = rgbaMixBGMixBlack;

                rgbaMixBGMixWhite = this.mixColors(rgb, background.rgbaMixWhite, alpha, 1);
                rgbaMixBGMixWhite[luminance] = this.getLuminance(rgbaMixBGMixWhite, true);
                rgbaMixBGMixWhite.WCAG2Ratio = this.getWCAG2Ratio(rgbaMixBGMixWhite[luminance], background.rgbaMixWhite[luminance]);
                rgbaMixBGMixWhite.luminanceDelta = Math.abs(rgbaMixBGMixWhite[luminance] - background.rgbaMixWhite[luminance]);
                rgbaMixBGMixWhite.hueDelta = this.getHueDelta(background.rgbaMixWhite, rgbaMixBGMixWhite, true);
                colors.rgbaMixBGMixWhite = rgbaMixBGMixWhite;
            }

            if (options.customBG) {
                rgbaMixBGMixCustom = this.mixColors(rgb, background.rgbaMixCustom, alpha, 1);
                rgbaMixBGMixCustom[luminance] = this.getLuminance(rgbaMixBGMixCustom, true);
                rgbaMixBGMixCustom.WCAG2Ratio = this.getWCAG2Ratio(rgbaMixBGMixCustom[luminance], background.rgbaMixCustom[luminance]);
                colors.rgbaMixBGMixCustom = rgbaMixBGMixCustom;
                rgbaMixBGMixCustom.luminanceDelta = Math.abs(rgbaMixBGMixCustom[luminance] - background.rgbaMixCustom[luminance]);
                rgbaMixBGMixCustom.hueDelta = this.getHueDelta(background.rgbaMixCustom, rgbaMixBGMixCustom, true);
            }

            colors.RGBLuminance = this.getLuminance(RGB);
            colors.HUELuminance = this.getLuminance(colors.hueRGB);

            if (options.convertCallback) {
                options.convertCallback(colors, type);
            }
            return colors;
        },

        /**
         * Gets closest web color
         * @method getClosestWebColor
         * @public
         * @param {[[Type]]} RGB [[Description]]
         * @param {[[Type]]} val [[Description]]
         * @returns {[[Type]]} [[Description]]
         */
        getClosestWebColor : function getClosestWebColor(RGB, val) {
            var out = {},
                tmp = 0,
                half = val / 2;

            for (var n in RGB) {
                tmp = RGB[n] % val;
                out[n] = RGB[n] + (tmp > half ? val - tmp : -tmp);
            }
            return out;
        },

        /**
         * Gets hue delta
         * @method getHueDelta
         * @public
         * @param {[[Type]]} rgb1 [[Description]]
         * @param {[[Type]]} rgb2 [[Description]]
         * @param {[[Type]]} nominal [[Description]]
         * @returns {[[Type]]} [[Description]]
         */
        getHueDelta : function getHueDelta(rgb1, rgb2, nominal) {
            return (Math.max(rgb1.r - rgb2.r, rgb2.r - rgb1.r) + Math.max(rgb1.g - rgb2.g, rgb2.g - rgb1.g) + Math.max(rgb1.b - rgb2.b, rgb2.b - rgb1.b)) * ( nominal ? 255 : 1) / 765;
        },

        /**
         * Gets luminance
         * @method getLuminance
         * @public
         * @param {[[Type]]} rgb [[Description]]
         * @param {[[Type]]} normalized [[Description]]
         * @returns {[[Type]]} [[Description]]
         */
        getLuminance : function getLuminance(rgb, normalized) {
            var div = normalized ? 1 : 255,
                RGB = [rgb.r / div, rgb.g / div, rgb.b / div],
                luminance = this._instance.options.luminance;

            for (var i = RGB.length; i--; ) {
                RGB[i] = RGB[i] <= 0.03928 ? RGB[i] / 12.92 : Math.pow(((RGB[i] + 0.055) / 1.055), 2.4);
            }
            return ((luminance.r * RGB[0]) + (luminance.g * RGB[1]) + (luminance.b * RGB[2]));
        },

        /**
         * mix colors
         * @method mixColors
         * @public
         * @param {[[Type]]} topColor [[Description]]
         * @param {[[Type]]} bottomColor [[Description]]
         * @param {[[Type]]} topAlpha [[Description]]
         * @param {[[Type]]} bottomAlpha [[Description]]
         * @returns {[[Type]]} [[Description]]
         */
        mixColors : function mixColors(topColor, bottomColor, topAlpha, bottomAlpha) {
            var newColor = {},
                alphaTop = (topAlpha !== undefined ? topAlpha : 1),
                alphaBottom = (bottomAlpha !== undefined ? bottomAlpha : 1),
                alpha = alphaTop + alphaBottom * (1 - alphaTop);
            // 1 - (1 - alphaTop) * (1 - alphaBottom);

            for (var n in topColor) {
                newColor[n] = (topColor[n] * alphaTop + bottomColor[n] * alphaBottom * (1 - alphaTop)) / alpha;
            }
            newColor.a = alpha;
            return newColor;
        },

        /**
         * Gets w c a g2 ratio
         * @method getWCAG2Ratio
         * @public
         * @param {[[Type]]} lum1 [[Description]]
         * @param {[[Type]]} lum2 [[Description]]
         * @returns {[[Type]]} [[Description]]
         */
        getWCAG2Ratio : function getWCAG2Ratio(lum1, lum2) {
            var ratio = 1;

            if (lum1 >= lum2) {
                ratio = (lum1 + 0.05) / (lum2 + 0.05);
            } else {
                ratio = (lum2 + 0.05) / (lum1 + 0.05);
            }
            return Math.round(ratio * 100) / 100;
        },

        /**
         * limit value
         * @method limitValue
         * @public
         * @param {[[Type]]} value [[Description]]
         * @param {[[Type]]} min [[Description]]
         * @param {[[Type]]} max [[Description]]
         * @returns {[[Type]]} [[Description]]
         */
        limitValue : function limitValue(value, min, max) {
            return (value > max ? max : value < min ? min : value);
        },

        /**
         * txt2color
         * @method txt2color
         * @public
         * @param {[[Type]]} txt [[Description]]
         * @returns {[[Type]]} [[Description]]
         */
        txt2color : function(txt) {
            var color = {},
                parts = txt.replace(/(?:#|\)|%)/g, '').split('('),
                values = (parts[1] || '').split(/,\s*/),
                type = parts[1] ? parts[0].substr(0, 3) : 'rgb',
                m = '';

            color.type = type;
            color[type] = {};
            if (parts[1]) {
                for (var n = 3; n--; ) {
                    m = type[n] || type.charAt(n);
                    // IE7
                    color[type][m] = +values[n] / this._valueRanges[type][m][1];
                }
            } else {
                color.rgb = this.hex2rgb(parts[0]);
            }
            // color.color = color[type];
            color.alpha = values[3] ? +values[3] : 1;

            return color;
        },

        /**
         *  r g b to h e x
         * @method rgb2hex
         * @public
         * @param {[[Type]]} RGB [[Description]]
         * @returns {[[Type]]} [[Description]]
         */
        rgb2hex : function(RGB) {
            return ((RGB.r < 16 ? '0' : '') + RGB.r.toString(16) + (RGB.g < 16 ? '0' : '') + RGB.g.toString(16) + (RGB.b < 16 ? '0' : '') + RGB.b.toString(16)
            ).toUpperCase();
        },

        /**
         *  h e x2rgb
         * @method hex2rgb
         * @public
         * @param {[[Type]]} HEX [[Description]]
         * @returns {[[Type]]} [[Description]]
         */
        hex2rgb : function(HEX) {
            HEX = HEX.split('');
            // IE7
            return {
                r : parseInt(HEX[0] + HEX[HEX[3] ? 1 : 0], 16) / 255,
                g : parseInt(HEX[HEX[3] ? 2 : 1] + (HEX[3] || HEX[1]), 16) / 255,
                b : parseInt((HEX[4] || HEX[2]) + (HEX[5] || HEX[2]), 16) / 255
            };
        },

        /**
         * hue2 r g b
         * @method hue2RGB
         * @public
         * @param {[[Type]]} hue [[Description]]
         * @returns {[[Type]]} [[Description]]
         */
        hue2RGB : function(hue) {
            var h = hue * 6,
                mod = ~~h % 6, // Math.floor(h) -> faster in most browsers
                i = h === 6 ? 0 : (h - mod);

            return {
                r : Math.round([1, 1 - i, 0, 0, i, 1][mod] * 255),
                g : Math.round([i, 1, 1, 1 - i, 0, 0][mod] * 255),
                b : Math.round([0, 0, i, 1, 1, 1 - i][mod] * 255)
            };
        },

        // ------------------------ HSV ------------------------ //

        /**
         * rgb2hsv
         * @method rgb2hsv
         * @public
         * @param {[[Type]]} rgb [[Description]]
         * @returns {[[Type]]} [[Description]]
         */
        rgb2hsv : function(rgb) {// faster
            var r = rgb.r,
                g = rgb.g,
                b = rgb.b,
                k = 0,
                chroma,
                min,
                s;

            if (g < b) {
                g = b + ( b = g, 0);
                k = -1;
            }
            min = b;
            if (r < g) {
                r = g + ( g = r, 0);
                k = -2 / 6 - k;
                min = Math.min(g, b);
                // g < b ? g : b; ???
            }
            chroma = r - min;
            s = r ? (chroma / r) : 0;
            return {
                h : s < 1e-15 ? ((this._colors && this._colors.hsl && this._colors.hsl.h) || 0) : chroma ? Math.abs(k + (g - b) / (6 * chroma)) : 0,
                s : r ? (chroma / r) : ((this._colors && this._colors.hsv && this._colors.hsv.s) || 0), // ??_colors.hsv.s || 0
                v : r
            };
        },

        /**
         * hsv2rgb
         * @method hsv2rgb
         * @public
         * @param {[[Type]]} hsv [[Description]]
         * @returns {[[Type]]} [[Description]]
         */
        hsv2rgb : function(hsv) {
            var h = hsv.h * 6,
                s = hsv.s,
                v = hsv.v,
                i = ~~h, // Math.floor(h) -> faster in most browsers
                f = h - i,
                p = v * (1 - s),
                q = v * (1 - f * s),
                t = v * (1 - (1 - f) * s),
                mod = i % 6;

            return {
                r : [v, q, p, p, t, v][mod],
                g : [t, v, v, q, p, p][mod],
                b : [p, p, t, v, v, q][mod]
            };
        },

        // ------------------------ HSL ------------------------ //

        /**
         * hsv2hsl
         * @method hsv2hsl
         * @public
         * @param {[[Type]]} hsv [[Description]]
         * @returns {[[Type]]} [[Description]]
         */
        hsv2hsl : function(hsv) {
            var l = (2 - hsv.s) * hsv.v,
                s = hsv.s * hsv.v;

            s = !hsv.s ? 0 : l < 1 ? ( l ? s / l : 0) : s / (2 - l);

            return {
                h : hsv.h,
                s : !hsv.v && !s ? ((this._colors && this._colors.hsl && this._colors.hsl.s) || 0) : s, // ???
                l : l / 2
            };
        },

        /**
         * rgb2hsl
         * @method rgb2hsl
         * @public
         * @param {[[Type]]} rgb [[Description]]
         * @param {[[Type]]} dependent [[Description]]
         * @returns {[[Type]]} [[Description]]
         */
        rgb2hsl : function(rgb, dependent) {// not used in Color
            var hsv = this.rgb2hsv(rgb);

            return this.hsv2hsl( dependent ? hsv : (_colors.hsv = hsv));
        },

        /**
         * hsl2rgb
         * @method hsl2rgb
         * @public
         * @param {[[Type]]} hsl [[Description]]
         * @returns {[[Type]]} [[Description]]
         */
        hsl2rgb : function(hsl) {
            var h = hsl.h * 6,
                s = hsl.s,
                l = hsl.l,
                v = l < 0.5 ? l * (1 + s) : (l + s) - (s * l),
                m = l + l - v,
                sv = v ? ((v - m) / v) : 0,
                sextant = ~~h, // Math.floor(h) -> faster in most browsers
                fract = h - sextant,
                vsf = v * sv * fract,
                t = m + vsf,
                q = v - vsf,
                mod = sextant % 6;

            return {
                r : [v, q, m, m, t, v][mod],
                g : [t, v, v, q, m, m][mod],
                b : [m, m, t, v, v, q][mod]
            };
        },

        // ------------------------ CMYK ------------------------ //
        // Quote from Wikipedia:
        // "Since RGB and CMYK spaces are both device-dependent spaces, there is no
        // simple or general conversion formula that converts between them.
        // Conversions are generally done through color management systems, using
        // color profiles that describe the spaces being converted. Nevertheless, the
        // conversions cannot be exact, since these spaces have very different gamuts."
        // Translation: the following are just simple RGB to CMY(K) and visa versa conversion functions.

        /**
         * rgb2cmy
         * @method rgb2cmy
         * @public
         * @param {[[Type]]} rgb [[Description]]
         * @returns {[[Type]]} [[Description]]
         */
        rgb2cmy : function(rgb) {
            return {
                c : 1 - rgb.r,
                m : 1 - rgb.g,
                y : 1 - rgb.b
            };
        },

        /**
         * cmy2cmyk
         * @method cmy2cmyk
         * @public
         * @param {[[Type]]} cmy [[Description]]
         * @returns {[[Type]]} [[Description]]
         */
        cmy2cmyk : function(cmy) {
            var k = Math.min(Math.min(cmy.c, cmy.m), cmy.y),
                t = 1 - k || 1e-20;

            return {// regular
                c : (cmy.c - k) / t,
                m : (cmy.m - k) / t,
                y : (cmy.y - k) / t,
                k : k
            };
        },

        /**
         * cmyk2cmy
         * @method cmyk2cmy
         * @public
         * @param {[[Type]]} cmyk [[Description]]
         * @returns {[[Type]]} [[Description]]
         */
        cmyk2cmy : function(cmyk) {
            var k = cmyk.k;

            return {// regular
                c : cmyk.c * (1 - k) + k,
                m : cmyk.m * (1 - k) + k,
                y : cmyk.y * (1 - k) + k
            };
        },

        /**
         * cmy2rgb
         * @method cmy2rgb
         * @public
         * @param {[[Type]]} cmy [[Description]]
         * @returns {[[Type]]} [[Description]]
         */
        cmy2rgb : function(cmy) {
            return {
                r : 1 - cmy.c,
                g : 1 - cmy.m,
                b : 1 - cmy.y
            };
        },

        /**
         * rgb2cmyk
         * @method rgb2cmyk
         * @public
         * @param {[[Type]]} rgb [[Description]]
         * @param {[[Type]]} dependent [[Description]]
         * @returns {[[Type]]} [[Description]]
         */
        rgb2cmyk : function(rgb, dependent) {
            var cmy = this.rgb2cmy(rgb);
            // doppelt??

            return this.cmy2cmyk( dependent ? cmy : (_colors.cmy = cmy));
        },

        /**
         * cmyk2rgb
         * @method cmyk2rgb
         * @public
         * @param {[[Type]]} cmyk [[Description]]
         * @param {[[Type]]} dependent [[Description]]
         * @returns {[[Type]]} [[Description]]
         */
        cmyk2rgb : function(cmyk, dependent) {
            var cmy = this.cmyk2cmy(cmyk);
            // doppelt??

            return this.cmy2rgb( dependent ? cmy : (_colors.cmy = cmy));
        },

        // ------------------------ LAB ------------------------ //

        /**
         *  x y z2rgb
         * @method XYZ2rgb
         * @public
         * @param {[[Type]]} XYZ [[Description]]
         * @param {[[Type]]} skip [[Description]]
         * @returns {[[Type]]} [[Description]]
         */
        XYZ2rgb : function(XYZ, skip) {
            var M = this._instance.options.XYZMatrix,
                X = XYZ.X,
                Y = XYZ.Y,
                Z = XYZ.Z,
                r = X * M.R[0] + Y * M.R[1] + Z * M.R[2],
                g = X * M.G[0] + Y * M.G[1] + Z * M.G[2],
                b = X * M.B[0] + Y * M.B[1] + Z * M.B[2],
                N = 1 / 2.4;

            M = 0.0031308;

            r = (r > M ? 1.055 * Math.pow(r, N) - 0.055 : 12.92 * r);
            g = (g > M ? 1.055 * Math.pow(g, N) - 0.055 : 12.92 * g);
            b = (b > M ? 1.055 * Math.pow(b, N) - 0.055 : 12.92 * b);

            if (!skip) {// out of gammut
                _colors._rgb = {
                    r : r,
                    g : g,
                    b : b
                };
            }

            return {
                r : limitValue(r, 0, 1),
                g : limitValue(g, 0, 1),
                b : limitValue(b, 0, 1)
            };
        },

        /**
         * rgb2 x y z
         * @method rgb2XYZ
         * @public
         * @param {[[Type]]} rgb [[Description]]
         * @returns {[[Type]]} [[Description]]
         */
        rgb2XYZ : function(rgb) {
            var M = this._instance.options.XYZMatrix,
                r = rgb.r,
                g = rgb.g,
                b = rgb.b,
                N = 0.04045;

            r = (r > N ? Math.pow((r + 0.055) / 1.055, 2.4) : r / 12.92);
            g = (g > N ? Math.pow((g + 0.055) / 1.055, 2.4) : g / 12.92);
            b = (b > N ? Math.pow((b + 0.055) / 1.055, 2.4) : b / 12.92);

            return {
                X : r * M.X[0] + g * M.X[1] + b * M.X[2],
                Y : r * M.Y[0] + g * M.Y[1] + b * M.Y[2],
                Z : r * M.Z[0] + g * M.Z[1] + b * M.Z[2]
            };
        },

        /**
         *  x y z2 lab
         * @method XYZ2Lab
         * @public
         * @param {[[Type]]} XYZ [[Description]]
         * @returns {[[Type]]} [[Description]]
         */
        XYZ2Lab : function(XYZ) {
            var R = this._instance.options.XYZReference,
                X = XYZ.X / R.X,
                Y = XYZ.Y / R.Y,
                Z = XYZ.Z / R.Z,
                N = 16 / 116,
                M = 1 / 3,
                K = 0.008856,
                L = 7.787037;

            X = X > K ? Math.pow(X, M) : (L * X) + N;
            Y = Y > K ? Math.pow(Y, M) : (L * Y) + N;
            Z = Z > K ? Math.pow(Z, M) : (L * Z) + N;

            return {
                L : (116 * Y) - 16,
                a : 500 * (X - Y),
                b : 200 * (Y - Z)
            };
        },

        /**
         *  lab2 x y z
         * @method lab2XYZ
         * @public
         * @param {[[Type]]} Lab [[Description]]
         * @returns {[[Type]]} [[Description]]
         */
        lab2XYZ : function(Lab) {
            var R = this._instance.options.XYZReference,
                Y = (Lab.L + 16) / 116,
                X = Lab.a / 500 + Y,
                Z = Y - Lab.b / 200,
                X3 = Math.pow(X, 3),
                Y3 = Math.pow(Y, 3),
                Z3 = Math.pow(Z, 3),
                N = 16 / 116,
                K = 0.008856,
                L = 7.787037;

            return {
                X : (X3 > K ? X3 : (X - N) / L) * R.X,
                Y : (Y3 > K ? Y3 : (Y - N) / L) * R.Y,
                Z : (Z3 > K ? Z3 : (Z - N) / L) * R.Z
            };
        },

        /**
         * rgb2 lab
         * @method rgb2Lab
         * @public
         * @param {[[Type]]} rgb [[Description]]
         * @param {[[Type]]} dependent [[Description]]
         * @returns {[[Type]]} [[Description]]
         */
        rgb2Lab : function(rgb, dependent) {
            var XYZ = this.rgb2XYZ(rgb);

            return this.XYZ2Lab( dependent ? XYZ : (this._colors.XYZ = XYZ));
        },

        /**
         *  lab2rgb
         * @method lab2rgb
         * @public
         * @param {[[Type]]} Lab [[Description]]
         * @param {[[Type]]} dependent [[Description]]
         * @returns {[[Type]]} [[Description]]
         */
        lab2rgb : function(Lab, dependent) {
            var XYZ = this.lab2XYZ(Lab);

            return this.XYZ2rgb( dependent ? XYZ : (this._colors.XYZ = XYZ), dependent);
        }
    }, {

    });
})();
