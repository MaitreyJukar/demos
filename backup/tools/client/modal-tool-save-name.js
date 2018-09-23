define([
    'dist/templates/math/modal-tool-save-name',
    'js/de/helper/spinner'
], function (template, Spinner) {
    'use strict';

    return Backbone.View.extend({
        "events": {
            "click .modal-footer .btn-primary": "saveToolState",
            "error": "saveError",
            "success": "saveSuccess"
        },

        "el": ".modal.tool-save-name",

        "$alerts": null,
        "$inputs": null,
        "$inputSaveName": null,
        "saveOptions": null,

        "toggleInputs": function () {
            var disable = !this.$inputSaveName.prop('disabled');
            this.$inputs.prop('disabled', disable);
            if (disable) {
                this.$alerts.addClass('hide');
                this.spinner.start();
            } else {
                this.spinner.stop();
            }
        },

        "initialize": function (saveOptions) {
            this.saveOptions = saveOptions;

            this.listenTo(this, 'success', this.saveSuccess)
                .listenTo(this, 'error', this.saveError);
        },

        "onModalHidden": function () {
            this.$inputSaveName.val('');
        },

        "onModalShown": function () {
            this.$inputSaveName.focus();
        },

        "render": function () {
            if (!this.$el.length) {
                this.setElement($(template()).appendTo(document.body));
                this.$alerts = this.$('.alert');
                this.$inputs = this.$('input, button');
                this.$inputSaveName = this.$('input[name=tool-save-name]');

                this.spinner = new Spinner({
                    "el": this.$inputs.filter('.btn-primary'),
                    "size": "medium"
                });
            }
            return this;
        },

        "saveError": function () {
            this.toggleInputs();
            this.$alerts.addClass('hide')
                        .filter('.alert-danger')
                        .removeClass('hide');
            this.$inputSaveName.focus();
        },

        "saveSuccess": function () {
            this.toggleInputs();
            this.$el.modal('hide');
        },

        "saveToolState": function () {
            var title = $.trim(this.$inputSaveName.val());

            if (!title) {
                this.$inputSaveName.val('').focus();
                return;
            }

            this.toggleInputs();

            this.saveOptions.data.title = title;

            this.saveOptions.success = _.bind(function () {
                this.trigger('success', arguments);
            }, this);

            this.saveOptions.error = _.bind(function () {
                this.trigger('error', arguments);
            }, this);

            this.saveOptions.complete = _.bind(function () {
                this.trigger('complete', arguments);
            }, this);

            $.ajax(this.saveOptions);
        },

        "showModal": function () {
            var $modal = this.$el.modal('show');

            $modal.on('shown.bs.modal', _.bind(this.onModalShown, this))
                  .on('hidden.bs.modal', _.bind(this.onModalHidden, this));
        }
    });
});
