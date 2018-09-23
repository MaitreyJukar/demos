/**
 * @author suhas.sanmukh
 */
var CheckBoxView = Backbone.View.extend({
    initialize: function initialize() {
        var $el = this.$el,
            model = this.model;
        $el.addClass("custom-checkbox");
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
        model.AddPropertiesCheckBox($el[0]);
        this.render();
    },
    render: function render() {
        this.$el.css("background-image", "url('" + ShellModel.GetImagePath('CustomCheckBox') + "')");
        return this;
    },
    _OnPropChanged: function _OnPropChanged(model) {
        var $el = this.$el,
            $CheckBoxLabelGroup = $el.add(this.$label),
            arrChangedAttributes = model.changedAttributes(),
            item = null,
            value = null;             

        for (item in arrChangedAttributes) {
            if (arrChangedAttributes.hasOwnProperty(item)) {
                value = arrChangedAttributes[item];
                break;
            }
        }
        switch (item) {
            case "checked":
                if (value) {
                    $el.addClass("cb-checked");
                    $el.attr("data-checked", 'checked');
                }
                else {
                    $el.removeClass("cb-checked");
                    $el.removeAttr("data-checked");
                }
                break;
            case "disabled":
                if (value) {
                    $CheckBoxLabelGroup.addClass("cb-disabled");
                    this._RemoveDomListeners();
                    $el.attr("data-disabled", 'disabled');
                }
                else {
                    $CheckBoxLabelGroup.removeClass("cb-disabled");
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
        var $CheckBoxLabelGroup = this.$el.add(this.$label);
        $CheckBoxLabelGroup.on("click", $.proxy(this._OnCheckBoxClicked, this));
        $CheckBoxLabelGroup.on("mouseenter", $.proxy(this._OnCheckBoxOver, this));
        $CheckBoxLabelGroup.on("mouseleave", $.proxy(this._OnCheckBoxOut, this));
        $CheckBoxLabelGroup.on("mousedown", $.proxy(this._OnCheckBoxDown, this));
        $CheckBoxLabelGroup.on("mouseup", $.proxy(this._OnCheckBoxUp, this));
    },
    _RemoveDomListeners: function _RemoveDomListeners() {
        var $CheckBoxLabelGroup = this.$el.add(this.$label);
        $CheckBoxLabelGroup.off("click");
        $CheckBoxLabelGroup.off("mouseenter");
        $CheckBoxLabelGroup.off("mouseleave");
        $CheckBoxLabelGroup.off("mousedown");
        $CheckBoxLabelGroup.off("mouseup");
    },
    _OnCheckBoxDown: function _OnCheckBoxDown(event) {
        this.$el.addClass("cb-Active");
    },
    _OnCheckBoxUp: function _OnCheckBoxUp(event) {
        this.$el.removeClass("cb-Active");
    },
    _OnCheckBoxOver: function _OnCheckBoxOver(event) {
        this.$el.addClass("cb-Hover");
    },
    _OnCheckBoxOut: function _OnCheckBoxOut(event) {
        this.$el.removeClass("cb-Hover cb-Active");
    },
    _OnCheckBoxClicked: function _OnCheckBoxClicked(event) {
        var model = this.model;       
        model.set("checked", !model.get("checked"));
        this.$el.trigger("change");
    }
});