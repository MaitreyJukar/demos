(function () {

    MathInteractives.Common.Components.Models.AudioManager = Backbone.Model.extend({


        defaults: function () {
            return {
                /**
                * Audio preloader Image Id
                * @property preloaderImg
                * @type String
                */
                preloaderImgId: "sound-preloder",
                /**
                * Stores boolean to check whether preloader should be displayed or not
                * @property displayPreloader
                * @type Boolean
                */
                displayPreloader: true,

                /**
                * Buffer value of audio 
                * @property bufferValue
                * @type Number
                */
                bufferValue: null,

                /**
                * Current time of audio 
                * @property currentTime
                * @type Number
                */
                currentTime: null,

                /**
                * Duration of audio file
                * @property duration
                * @type Number
                */
                duration: null,

                /**
                * Sound id of current playing id
                * @property currentPlayingAudio
                * @type String
                */
                currentPlayingAudio: null,

                /**
                * Stores a boolean whether the interactive is completely audio dependent
                * @property isMandatory
                * @type Boolean
                * @default false
                */
                isMandatory: false,

                /**
                * Stores a boolean whether sound should be played or not
                * @property workWithSound
                * @type Boolean
                * @default true
                */
                workWithSound: true,

                /**
                * Stores time in milliseconds within which the sound must be loaded before sending a new request
                * @property initialLoadTime
                * @type Number
                * @default 5000
                */
                initialLoadTime: 7000,

                /**
                * IdPrefix of current instance
                * @property idPrefix
                * @type String
                */
                idPrefix: null,

                /**
                * Manager object
                * @property manager
                * @type Object
                */
                manager: null,

                /**
                * Player object
                * @property player
                * @type Object
                */
                player: null,

                /**
                * FilePath object
                * @property filePath
                * @type Object
                */
                filePath: null,

                /**
                * Complete audio file path 
                * @property audioFilePath
                * @type String
                */
                audioFilePath: null,

                /**
                * Sound Id map JSON
                * @property audioData
                * @type Object
                */
                audioData: {},

                /**
                * Stores Audio Information of current interactivity in an object
                * @property audioInfo
                * @type Object
                */
                audioInfo: {},

                /**
                * Stores Audio ids of audio sprites
                * @property audioSpriteId
                * @type Array
                */
                audioSpriteId: []
            }
        },



        /**
        * Audio Manager Model constructor
        *
        * @method initialize
        */
        initialize: function () {
            this.setGlobalAudioData();
        },


        /******** Getter functions ********/

        /**
        * Gets IDPrefix of interactivity for current Instance
        * @method getIdPrefix
        * return {String} idPrefix
        * @public
        */
        getIdPrefix: function () {
            return this.get('idPrefix');
        },

        /**
        * Gets audio data json
        * @method getAudioData
        * return {object} JSON data for audio 
        * @public
        */
        getAudioData: function () {
            return this.get('audioData');
        },

        /**
        * Gets complete audio file path
        * @method getAudioFilePath
        * return {String} audioFilePath
        * @public
        */
        getAudioFilePath: function () {
            return this.get('audioFilePath');
        },

        /**
        * Gets filepath json
        * @method getFilePath
        * return {object} JSON data for filePath 
        * @public
        */
        getFilePath: function () {
            return this.get('filePath');
        },

        getManager: function () {
            return this.get('manager');
        },

        /**
        * Gets Audio information 
        * @method getGlobalAudioData
        * @param {String} audioSpriteId 
        * return {object} Audio info for corresponding intereactivity
        * @public
        */
        getGlobalAudioData: function (audioSpriteId) {
            return this.get('audioInfo')[audioSpriteId];
        },

        /**
        * Gets current playing sound id
        * @method getCurrentPlayingAudio
        * return {String} currentPlayingAudio 
        * @public
        */
        getCurrentPlayingAudio: function () {
            return this.get('currentPlayingAudio');
        },

        /**
        * Gets duration of audio file
        * @method getDuration
        * return {Number} duration 
        * @public
        */
        getDuration: function () {
            return this.get('duration');
        },

        /**
        * Gets current time of audio.
        * @method getCurrentTime
        * return {Number} currentTime 
        * @public
        */
        getCurrentTime: function () {
            return this.get('currentTime');
        },

        /**
        * Gets buffer value of audio.
        * @method getBufferValue
        * return {Number} bufferValue 
        * @public
        */
        getBufferValue: function () {
            return this.get('bufferValue');
        },

        /**
        * Gets audio preloader Image Id.
        * @method getPreloaderImgId
        * return {String} Image Id
        * @public
        */
        getPreloaderImgId: function () {
            return this.get('preloaderImgId');
        },

        /**
        * Gets audio preloader Image path.
        * @method getPreloaderImgPath
        * return {String} Image path
        * @public
        */
        getPreloaderImgPath: function () {
            var filePath = this.getFilePath(),
                imagePath = this.getPreloaderImgId();
            return (filePath.getImagePath(imagePath));
        },

        /******** Setter functions ********/

        /**
        * Sets duration of audio.
        * @method setDuration
        * @param {Number} duration 
        * @public
        */
        setDuration: function (duration) {
            this.set('duration', duration)
        },

        /**
        * Sets buffer value of audio.
        * @method setBufferValue
        * @param {Number} bufferValue 
        * @public
        */
        setBufferValue: function (bufferValue) {
            this.set('bufferValue', bufferValue);
        },

        /**
        * Sets Audio Info of current interactivity by calling static function : ParseData.
        * @method setGlobalAudioData
        * @param {Number} bufferValue 
        * @public
        */
        setGlobalAudioData: function () {
            this.parseData(this.getAudioData(), this.getAudioFilePath());
        },

        /**
        * Sets current playing sound Id.
        * @method setCurrentPlayingAudio
        * @param {Number} soundId 
        * @public
        */
        setCurrentPlayingAudio: function (soundId) {
            this.set('currentPlayingAudio', soundId);
        },

        /**
        * Sets Audio Info of current interactivity.
        * @method parseData
        * @param {Object} audioData  Entire JSON data containing all audio related data
        * @param {String} audioFilePath  Path to the audio resource
        * @public
        */
        parseData: function (audioData, audioFilePath) {

            var audioInfo = this.get('audioInfo');
            if (this.get('audioSpriteId').length > 0) {
                var audioId = this.get('audioSpriteId');
                for (var i = 0, count = audioId.length; i < count; i++) {
                    audioInfo[audioId[i]] = {};
                    audioInfo[audioId[i]].audioData = audioData;
                    audioInfo[audioId[i]].pathToSrc = audioFilePath;
                }
            }
            else {
                var idPrefix = this.get('idPrefix');
                audioInfo[idPrefix] = {};
                audioInfo[idPrefix].audioData = audioData;
                audioInfo[idPrefix].pathToSrc = audioFilePath;
            }
            this.set('audioInfo', audioInfo);
        }

    }, {

    });

})();
