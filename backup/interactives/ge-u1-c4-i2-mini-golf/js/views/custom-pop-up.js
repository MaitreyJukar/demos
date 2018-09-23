(function () {

    MathInteractives.Interactivities.MiniGolf.Views.CustomPopup = MathInteractives.Common.Player.Views.Base.extend({

        gotItButton: null,

        initialize: function () {
            this.initializeDefaultProperties();
            this._appendTemplate();
            this.render();
        },
        render: function render() {
            this._createButtons();

        },


        initializeDefaultProperties: function initializeDefaultProperties() {
            var options = this.options;

            this.player = options.player;
            this.manager = options.manager;
            this.filePath = options.filePath;
            this.idPrefix = options.idPrefix;
        },

        _appendTemplate: function _appendTemplate() {
            var model = this.model,
                baseClass = model.get('baseClass') || null,
                templateData = {
                    idPrefix: this.idPrefix,
                    courseNumber: model.get('levelId'),
                    imageCount: thi.model.get('imageObject')
                },
                currentTemplate = MathInteractives.Interactivities.MiniGolf.templates.courseTutorial(templateData).trim();

            this.$el.append(currentTemplate);

            if (baseClass !== null) {
                this.$('.course-tutorial-container').addClass(baseClass);
            }
        },
        _createButtons: function _createButtons() {

            var idPrefix = this.idPrefix,
                buttonData = {
                    'player': this.player,
                    'manager': this.manager,
                    'idPrefix': idPrefix,
                    'path': this.filePath,
                    'data': {
                        'id': idPrefix + 'course-' + this.model.get('levelId') + '-got-it-button-contanier',
                        'type': MathInteractives.global.Theme2.Button.TYPE.TEXT,
                        'height': 38,
                        'width': 45,
                        'tooltipText': this.getMessage('got-it-btn', 0)
                    }
                }
            this.gotItButton = MathInteractives.global.Theme2.Button.generateButton(buttonData);
        }
    });
})()