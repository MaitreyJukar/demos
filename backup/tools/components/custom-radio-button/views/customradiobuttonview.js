/**
 * @author suhas.sanmukh
 */
var RadioButtonView = Backbone.View.extend({
    initialize: function initialize() {
        var $el = this.$el, model = this.model;
        $el.addClass("custom-radio");
        this.$label = $("[for='" + $el[0].id + "']");
        model.on({
            "change:name": this._OnPropChanged,
            "change:value": this._OnPropChanged,
            "change:type": this._OnPropChanged,
            "change:form": this._OnPropChanged,
            "change:checked": this._OnPropChanged,
            "change:defaultChecked": this._OnPropChanged,
            "change:disabled": this._OnPropChanged
        }, this);
        model.AddPropertiesRadio($el[0]);
        this.render();
    },
    render: function render() {
        this.$el.css("background-image", "url('" + ShellModel.GetImagePath('CustomRadio') + "')");
        return this;
    },
    _OnPropChanged: function _OnPropChanged(model) {
        var $el = this.$el, $RadioLabelGroup = $el.add(this.$label), arrChangedAttributes, item, value, $RadioLabelGroup;
        arrChangedAttributes = model.changedAttributes();
        $RadioLabelGroup = this.$el.add(this.$label);

        for (item in arrChangedAttributes) {
            if (arrChangedAttributes.hasOwnProperty(item)) {
                value = arrChangedAttributes[item];
                break;
            }
        }
        switch (item) {
            case "checked":
                if (value) {
                    $("[data-name='" + model.get("name") + "']").not($el).prop("checked", false);
                    $el.addClass("cr-checked");
                    $el.attr("data-checked", 'checked');
                    $RadioLabelGroup.off("click");
                }
                else {
                    $el.removeClass("cr-checked");
                    $el.removeAttr("data-checked");
                    $RadioLabelGroup.on("click", $.proxy(this._OnRadioClicked, this));
                }
                break;
            case "disabled":
                if (value) {
                    $RadioLabelGroup.addClass("cr-disabled");
                    this._RemoveDomListeners();
                    $el.attr("data-disabled", 'disabled');
                }
                else {
                    $RadioLabelGroup.removeClass("cr-disabled");
                    this._AddDomListeners();
                    $el.removeAttr("data-disabled", 'disabled');
                }
                break;
            default:
                $el.attr("data-" + item, value);
                break;
        }

    },
    _AddDomListeners: function _AddDomListeners() {
        var $RadioLabelGroup = this.$el.add(this.$label);
        $RadioLabelGroup.on("click", $.proxy(this._OnRadioClicked, this));
        $RadioLabelGroup.on("mouseenter", $.proxy(this._OnRadioOver, this));
        $RadioLabelGroup.on("mouseleave", $.proxy(this._OnRadioOut, this));
        $RadioLabelGroup.on("mousedown", $.proxy(this._OnRadioDown, this));
        $RadioLabelGroup.on("mouseup", $.proxy(this._OnRadioUp, this));
    },
    _RemoveDomListeners: function _RemoveDomListeners() {
        var $RadioLabelGroup = this.$el.add(this.$label);
        $RadioLabelGroup.off("click");
        $RadioLabelGroup.off("mouseenter");
        $RadioLabelGroup.off("mouseleave");
        $RadioLabelGroup.off("mousedown");
        $RadioLabelGroup.off("mouseup");
    },
    _OnRadioDown: function _OnRadioDown(event) {
        this.$el.addClass("cr-active");
    },
    _OnRadioUp: function _OnRadioUp(event) {
        this.$el.removeClass("cr-active");
    },
    _OnRadioOver: function _OnRadioOver(event) {
        this.$el.addClass("cr-hover");
    },
    _OnRadioOut: function _OnRadioOut(event) {
        this.$el.removeClass("cr-hover cr-active");
    },
    _OnRadioClicked: function _OnRadioClicked(event) {
        var model = this.model;        
        model.set("checked", true);
        this.$el.trigger("change");
    }
});