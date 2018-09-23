/**
 * @author suhas sanmukh
 */
var CheckBoxModel = Backbone.Model.extend({

    defaults: {
        value: null,
        type: null,
        form: null,
        disabled: null,
        name: null,
        checked: null,
        defaultChecked: null
    },
    _GetSetValue: function _GetSetValue(value) {
        if (typeof value === "undefined") {
            return this.get("value");
        }
        return this.set("value", String(value));
    },
    _GetSetChecked: function _GetSetChecked(value) {
        if (typeof value === "undefined") {
            return this.get("checked");
        }
        return this.set("checked", Boolean(value));
    },
    _GetSetType: function _GetSetType(value) {
        if (typeof value === "undefined") {
            return this.get("type");
        }
        return this.set("type", String(value));
    },
    _GetSetDefaultChecked: function _GetSetDefaultChecked(value) {
        if (typeof value === "undefined") {
            return this.get("value");
        }
        return this.set("value", Boolean(value));
    },
    _GetSetForm: function _GetSetForm(value) {
        if (typeof value === "undefined") {
            return this.get("form");
        }
        return this.set("form", value);
    },
    _GetSetName: function _GetSetName(value) {
        if (typeof value === "undefined") {
            return this.get("name");
        }
        return this.set("name", String(value));
    },
    _GetSetDisabled: function _GetSetDisabled(value) {
        if (typeof value === "undefined") {
            return this.get("disabled");
        }
        return this.set("disabled", Boolean(value));
    },
    AddPropertiesCheckBox: function AddPropertiesCheckBox(radio) {
        var oData = this;
        Object.defineProperties(radio, {
            checked: {
                enumerable: true,
                get: $.proxy(oData._GetSetChecked, oData),
                set: $.proxy(oData._GetSetChecked, oData)
            },
            name: {
                enumerable: true,
                get: $.proxy(oData._GetSetName, oData),
                set: $.proxy(oData._GetSetName, oData)
            },
            type: {
                enumerable: true,
                get: $.proxy(oData._GetSetType, oData),
                set: $.proxy(oData._GetSetType, oData)
            },
            disabled: {
                enumerable: true,
                get: $.proxy(oData._GetSetDisabled, oData),
                set: $.proxy(oData._GetSetDisabled, oData)
            },
            defaultChecked: {
                enumerable: true,
                get: $.proxy(oData._GetSetDefaultChecked, oData),
                set: $.proxy(oData._GetSetDefaultChecked, oData)
            },
            form: {
                enumerable: true,
                get: $.proxy(oData._GetSetForm, oData),
                set: $.proxy(oData._GetSetForm, oData)
            },
            value: {
                enumerable: true,
                get: $.proxy(oData._GetSetValue, oData),
                set: $.proxy(oData._GetSetValue, oData)
            }
        });
        var tempData = this._tempData;
        for(var i in tempData)
        {
            if(tempData.hasOwnProperty(i))
            {
                this.set(i, tempData[i]);
            }
        }
        delete this._tempData;
    },
    FormDataStructure: function FormDataStructure(checkbox) {
        this._tempData = {
            value: checkbox.value,
            type: checkbox.type,
            name: checkbox.name,
            disabled: checkbox.disabled,
            checked: checkbox.checked,
            form: checkbox.form,
            defaultChecked: checkbox.defaultChecked
        }
    }
});

