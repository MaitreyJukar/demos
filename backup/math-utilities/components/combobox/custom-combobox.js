(function () {
    'use strict';

    var MathUtilities = window.MathUtilities || {};
    MathUtilities.Components = MathUtilities.Components || {};
    MathUtilities.Components.CustomCombo = function () {
        /**
        * CustomComboBox.oItems -- > Stores data of all comboboxes with key being the Container ID of the combobox
        * CustomComboBox.oItems[id].data stores data
        * CustomComboBox.oItems[id].change stores change event handler
        * CustomComboBox.oOpenComboBoxes[id] --> Object of the div of the
        dropDown with key being the container ID of the combobox
        * Private ----
        * CustomComboBox.oSelectedIndex[id] --> Maintain the selected index of each 
        *                                              combobox with key being the container ID of the combobox
        * CustomComboBox.iHighlightedIndex --> The highlighted item of the open combobox which is not selected yet.
        * CustomComboBox.oItems[id].dropDown
        */
        var CustomComboBox = {};

        //Constants
        CustomComboBox.MAX_DROP_DOWN_HEIGHT = 250;
        CustomComboBox.DEFAULT_LINE_HEIGHT = 25;
        CustomComboBox.LEFT_OFFSET_FOR_OPTGROUP_ITEM = "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;";

        CustomComboBox.oItems = {};
        CustomComboBox.oGroups = {};

        CustomComboBox.oOpenComboBoxes = {};
        CustomComboBox.oSelectedIndex = {};
        CustomComboBox.iHighlightedIndex = -1;
        CustomComboBox.bIgnoreBlur = false;
        CustomComboBox.bTouchOnCombo = false;
        CustomComboBox.HintDelay = 600;
        CustomComboBox.bDisabledItemsSelectionEnabled = false;
        CustomComboBox.hintElement = $("<span class='combo-hint'></span>");
        $(document.body).append(CustomComboBox.hintElement);

        /* 
        * Element into which all the Select/Option tags are to be made as custom.
        * @property contextElement
        * @type Object
        * @defaults null
        */
        CustomComboBox.contextElement = null;

        /* 
        * A patch to stop doing something based on outside events. Like while opening tooltip, we dont open dropdown.
        * @property bDefaultEventPrevented
        * @type BOOL
        * @defaults false
        */
        CustomComboBox.bDefaultEventPrevented = false;
        window.addEventListener("mousedown", function () { CustomComboBox.bDefaultEventPrevented = false; });
        window.addEventListener("touchstart", function () { CustomComboBox.bDefaultEventPrevented = false; });

        CustomComboBox.oTempDiv = document.createElement("div");
        CustomComboBox.oTempDiv.id = "CustomComboTempFocusDiv";
        document.body.appendChild(CustomComboBox.oTempDiv);
        /**
        *Public functions
        *  */
        CustomComboBox.RemoveItem = function (strID, iIndex, iParentOptGroupIndex, bIsOptGroup) {
            var iAbsIndex,
            bSelectedValueDeleted = true,
            i;
            if (!bIsOptGroup) {
                if (iParentOptGroupIndex === null && CustomComboBox.oItems[strID].data[iIndex].data !== null) {
                    alert('This is a optGroup but bIsOptGroup is false');
                }
                if (iParentOptGroupIndex !== null) {
                    CustomComboBox.oItems[strID].data[iParentOptGroupIndex].data.splice(iIndex, 1);
                }
                else {
                    CustomComboBox.oItems[strID].data.splice(iIndex, 1);
                }
                iAbsIndex = CustomComboBox.GetAbsoluteIndex(strID, iIndex, iParentOptGroupIndex);
                CustomComboBox.oItems[strID].linear.splice(iAbsIndex, 1);
            }
            else {
                if (iParentOptGroupIndex !== null) {
                    alert('You are not allowed to set iParentOptGroupIndex while removing a optgroup');
                }
                iAbsIndex = CustomComboBox.GetAbsoluteIndex(strID, 0, iIndex);
                CustomComboBox.oItems[strID].linear.splice(iAbsIndex, CustomComboBox.oItems[strID].data[iIndex].length);
                CustomComboBox.oItems[strID].data.splice(iIndex, 1);
            }

            for (i = 0; i < CustomComboBox.oItems[strID].linear.length; i++) {
                if (CustomComboBox.oItems[strID].linear[i].value === $("#" + strID).val()) {

                    bSelectedValueDeleted = false;
                }
            }
            if (bSelectedValueDeleted) {
                $("#" + strID).prop("selectedIndex", 0);
            }
            CustomComboBox.AdjustWidth(strID);
        };

        /** 
        * Remove all the options for the combobox, with the id that is passed to it
        * @method RemoveAllOptionsForComboWithId
        * @param String Id of the combox box.
        * @return true if it succesfully removes the options, false if it fails.
        */
        CustomComboBox.RemoveAllOptionsForComboWithId = function (strID) {
            var comboBox = CustomComboBox.oItems[strID];
            //Check if combo exist with the id passed.
            if (comboBox) {
                comboBox.data.splice(0);
                comboBox.linear.splice(0);
            }
        }

        /**
        * Appends list of options to a combox box with specified ID.
        * @method AddOptionsToComboWithId
        * @public
        * @param strID ID of the combox.
        * @options List/Array of options to be added into Combo
        * -- [{ value :'', text :'', acc:'', enabled:'' }]
        * @return
        */
        CustomComboBox.AddOptionsToComboWithId = function (strID, arrOptions) {
            var comboBox = CustomComboBox.oItems[strID];

            //check if combo exist with the id passed.
            if (comboBox && arrOptions) {
                comboBox.data = arrOptions.data;
                comboBox.linear = arrOptions.linear;
            }
        }

        /** 
        * Parses the DOM and removes all Select elements and converts it into Custom combo boxes.
        * @method ParseDOM
        */
        CustomComboBox.ParseDOM = function () {
            CustomComboBox.ReplaceAllComboBoxes();
        }

        /** 
        * Parses the DOM and removes all Select elements and converts it into Custom combo boxes.
        * @method ParseDOM
        * @param {Object} contextElement
        * @return 
        */
        CustomComboBox.setContextElement = function (contextElement) {
            CustomComboBox.contextElement = contextElement;
        }

        /** 
        * Returns the Context element for custom combo boxes.
        * @method getContextElement
        * @return {Object} Context Element
        */
        CustomComboBox.getContextElement = function () {
            CustomComboBox.contextElement = contextElement;
        }


        //add item dynamically.iParentOptGroupIndex should be null if not required. 
        //Pass a object of option tag in the option parameter
        CustomComboBox.AddItem = function (strID, iIndex, iParentOptGroupIndex, option) {
            var oData,
            obj = {},
            objOption = $(option),
            iAbsIndex,
            j,
            arrChildren,
            iLen;

            if (objOption.is("option")) {
                oData = {};
                oData.value = objOption.attr('value');
                oData.text = objOption.html();
                oData.acc = objOption.attr("acc");
                oData.enabled = objOption.attr('disabled') !== 'disabled';
                oData.bIsOptGroupChild = false;
                if (iParentOptGroupIndex !== null) {
                    CustomComboBox.oItems[strID].data[iParentOptGroupIndex].data.splice(iIndex, 0, oData);
                }
                else {
                    CustomComboBox.oItems[strID].data.splice(iIndex, 0, oData);
                }
                iAbsIndex = CustomComboBox.GetAbsoluteIndex(strID, iIndex, iParentOptGroupIndex);
                CustomComboBox.oItems[strID].linear.splice(iAbsIndex, 0, oData);
                if (iAbsIndex <= CustomComboBox.oSelectedIndex[strID] || CustomComboBox.oSelectedIndex[strID] === -1) {
                    CustomComboBox.oSelectedIndex[strID] += 1;
                }
                if (objOption.attr('selected') === 'selected') {
                    CustomComboBox.oSelectedIndex[strID] = iAbsIndex;
                }
            }
            else if (objOption.is('optgroup')) {
                if (iParentOptGroupIndex !== null) {
                    alert('You are not allowed to set iParentOptGroupIndex while adding a optgroup');
                }

                obj.label = objOption.attr("label");
                obj.data = [];
                iAbsIndex = CustomComboBox.GetAbsoluteIndex(strID, iIndex, iParentOptGroupIndex);
                arrChildren = objOption.children();
                iLen = arrChildren.length;
                for (j = 0; j < iLen; j++) {
                    //if($(objOption.children()[j]).is("option"))
                    //{
                    var objChild = $(arrChildren[j]);
                    oData = {};
                    oData.value = objChild.attr('value');
                    oData.text = objChild.html();
                    oData.acc = objChild.attr("acc");
                    oData.enabled = objChild.attr('disabled') !== 'disabled';
                    oData.bIsOptGroupChild = true;
                    CustomComboBox.oItems[strID].linear.splice(iAbsIndex + j, 0, oData);
                    //needs to be reviewed where element had come from..currently it has been blindly
                    // replaced with objOption

                    /*if ($($(element).children()[j]).attr('selected') === 'selected')
                    {
                    CustomComboBox.oSelectedIndex[this.id] = iAbsIndex + j;
                    }*/
                    if (objChild.attr('selected') === 'selected') {
                        CustomComboBox.oSelectedIndex[this.id] = iAbsIndex + j;
                    }
                    obj.data.push(oData);
                }
                CustomComboBox.oItems[strID].data.splice(iIndex, 0, obj);
            }

            // Manager.ChangeMessage(strID);
        };
        //returns absolute index ignoring the optgroup
        CustomComboBox.GetAbsoluteIndex = function (strID, iItemIndex, iGroupIndex) {
            var i,
            nCount = 0,
            j;
            if (iGroupIndex === null) {
                return iItemIndex;
            }

            for (i = 0; i < CustomComboBox.oItems[strID].data.length; i++) {
                if (CustomComboBox.oItems[strID].data[i].label !== null) {
                    for (j = 0; j < CustomComboBox.oItems[strID].data[i].data.length; j++) {
                        if (iGroupIndex === i && iItemIndex === j) {
                            return nCount;
                        }
                        nCount++;
                    }
                }
                else {
                    if (i === iItemIndex) {
                        return nCount;
                    }
                    nCount++;
                }
            }
        };
        //private
        CustomComboBox.UpdateGroup = function (strID) {
            if (CustomComboBox.oGroups[strID] && CustomComboBox.oGroups[strID][0]) {
                //for (var i = 0; i < CustomComboBox.oGroups[strID].length; CustomComboBox.oGroups[strID]++)
                //{
                CustomComboBox.AdjustWidth(CustomComboBox.oGroups[strID][0]);
                //}
            }
        };
        CustomComboBox.EnableDisableComboBox = function (strID, bDisabled) {
            if (bDisabled) {
                $("#" + strID).addClass('CustomComboDisabled');
                $("#" + strID + "_comboHolder").addClass('CustomComboHolderDisabled');
                $("#" + strID + "_comboHolder > .CustomComboButton").addClass('CustomComboButtonImage_Disabled');
                // Manager.EnableTab(strID, false);
            }
            else {
                $("#" + strID).removeClass('CustomComboDisabled');
                $("#" + strID + "_comboHolder").removeClass('CustomComboHolderDisabled');
                $("#" + strID + "_comboHolder > .CustomComboButton").removeClass('CustomComboButtonImage_Disabled');
            }
            // Manager.EnableTab(strID, !bDisabled);
        };
        //Custom function to disabled a comboitem
        CustomComboBox.EnableDisableComboItem = function (strID, bEnable, iIndex, value) {
            var k,
            nCount = 0,
            i,
            j;
            if (iIndex === null) {
                for (k = 0; k < CustomComboBox.oItems[strID].linear.length; k++) {
                    if (CustomComboBox.oItems[strID].linear[k].value === value) {
                        iIndex = k;
                    }
                }
            }
            if (CustomComboBox.oSelectedIndex[strID] === iIndex) {
                $("#" + strID + "_selectedItem").addClass("CustomComboItemDisabled");
            }
            else {
                $("#" + strID + "_selectedItem").removeClass("CustomComboItemDisabled");
            }
            /*
            * Removed since in some cases we an already selected item might get disabled.
            *
            *if (!CustomComboBox.bDisabledItemsSelectionEnabled && CustomComboBox.oSelectedIndex[strID] === iIndex)
            {
            if (iIndex < (CustomComboBox.oItems[strID].linear.length - 1))
            {
            $("#" + strID).prop("selectedIndex", iIndex + 1);
            }
            }*/

            for (i = 0; i < CustomComboBox.oItems[strID].data.length; i++) {
                if (CustomComboBox.oItems[strID].data[i].label !== null) {
                    for (j = 0; j < CustomComboBox.oItems[strID].data[i].data.length; j++) {
                        if (nCount === iIndex) {
                            CustomComboBox.oItems[strID].linear[nCount].enabled = bEnable;
                            nCount = -1;
                            break;
                        }
                        nCount++;
                    }
                    if (nCount === -1) {
                        break;
                    }
                }
                else {
                    if (nCount === iIndex) {
                        CustomComboBox.oItems[strID].linear[nCount].enabled = bEnable;
                        break;
                    }
                    nCount++;
                }
            }
        };
        CustomComboBox.EnableDisableAllComboItems = function (strID, bEnable) {
            var nCount = 0,
            i,
            j,
            iLen = CustomComboBox.oItems[strID].data.length;
            for (i = 0; i < iLen; i++) {
                if (CustomComboBox.oItems[strID].data[i].label !== null) {
                    var iLen2 = CustomComboBox.oItems[strID].data[i].data.length;
                    for (j = 0; j < iLen2; j++) {
                        CustomComboBox.oItems[strID].linear[nCount].enabled = bEnable;
                        nCount++;
                    }
                }
                else {
                    CustomComboBox.oItems[strID].linear[nCount].enabled = bEnable;
                    nCount++;
                }
            }
        };

        CustomComboBox.GetTabIndex = function (strAccId) {
            return $('#' + strAccId + "_hack").attr("tabindex");
        };

        CustomComboBox.SetTabIndex = function (oElement, nTabIndex) {
            if (nTabIndex === null) {
                return;
            }
            $('#' + oElement.id + "_hack").attr("tabindex", nTabIndex);
        };
        //Replaces particular select tag in the document
        CustomComboBox.ReplaceComboBox = function (id) {
            // Mouse hover and leave functions.
            var timeId = null,
                docScrollTop,
                docScrollLeft,
                enterFn = function (event) {
                    docScrollTop = window.scrollY || 0;
                    docScrollLeft = window.scrollX || 0;
                    leaveFn();
                    if ($(this).hasClass("CustomComboDisabled")) {
                        return;
                    }
                    var strHtml, id = $(this).attr("id");
                    strHtml = $("#" + id + "_selectedItem").html();
                    strHtml = strHtml.replace(/&nbsp;/g, '');


                    timeId = setTimeout(
                        function () {
                            CustomComboBox.ShowHint(strHtml);
                        },
                        CustomComboBox.HintDelay);
                    //CustomComboBox.ShowHint(strHtml);
                    CustomComboBox.SetPos(event.clientX + docScrollLeft + 15, event.clientY + docScrollTop + 15);
                },

                leaveFn = function () {
                    CustomComboBox.HideHint();
                    clearTimeout(timeId);
                },

                bIsTouchDevice = CustomComboBox.IsTouchDevice();

            $("#" + id).each(function () {
                var objThis = $(this);
                var div = document.createElement('div');
                var objDiv = $(div);
                objDiv.attr('name', objThis.attr('name'));
                objDiv.attr('class', objThis.attr('class'));
                objDiv.attr('style', objThis.attr('style'));
                objDiv.addClass('CustomCombo');

                if (!bIsTouchDevice) {
                    $(objDiv).bind('mousemove', enterFn);
                    $(objDiv).bind('mouseleave', leaveFn);
                    $(objDiv).bind('click', leaveFn);
                }


                var strPosition = objThis.css("position");
                objDiv.css("position", strPosition);
                if (strPosition !== "absolute" && strPosition !== "relative") {
                    objDiv.css("position", "relative");
                }

                /*  var parentNode = this.parentNode;

                parentNode.appendChild(div);*/
                objDiv.insertAfter("#" + this.id);
                objDiv.attr('id', this.id);
                var oItemData,
                data = [],
                linear = [],
                arrChildren = objThis.children(),
                iLen = arrChildren.length,
                i,
                j;

                if (iLen === 0) {
                    CustomComboBox.oSelectedIndex[this.id] = iLen === 0 ? -1 : 0;
                }
                for (i = 0; i < iLen; i++) {
                    var element = arrChildren[i];
                    var objElement = $(element);
                    if (objElement.is("option")) {
                        oItemData = {};
                        oItemData.value = objElement.attr('value');
                        oItemData.text = objElement.html();
                        oItemData.acc = objElement.html();
                        oItemData.enabled = objElement.attr('disabled') !== 'disabled';
                        oItemData.bIsOptGroupChild = false;
                        data.push(oItemData);
                        linear.push(oItemData);
                        if (objElement.attr('selected') === 'selected') {
                            CustomComboBox.oSelectedIndex[this.id] = linear.length - 1;
                        }
                    }
                    else if (objElement.is('optgroup')) {
                        var obj = {};
                        obj.label = objElement.attr("label");
                        obj.data = [];
                        var arrChildren2 = objElement.children();
                        var iLen2 = arrChildren2.length;
                        for (j = 0; j < iLen2; j++) {
                            var objChild = $(arrChildren2[j]);
                            if (objChild.is("option")) {
                                oItemData = {};
                                oItemData.value = objChild.attr('value');
                                oItemData.text = objChild.html();
                                oItemData.acc = objChild.html();
                                oItemData.enabled = objChild.attr('disabled') !== 'disabled';
                                oItemData.bIsOptGroupChild = true;
                                linear.push(oItemData);
                                if (objChild.attr('selected') === 'selected') {
                                    CustomComboBox.oSelectedIndex[this.id] = linear.length - 1;
                                }
                                obj.data.push(oItemData);
                            }
                        }
                        data.push(obj);
                    }
                }
                $(this).remove();

                CustomComboBox.AddComboBox(this.id, data, linear);
                CustomComboBox.AdjustWidth(this.id);

            });
        };


        /*
        * Given a context, it replaces all the select tag into custom combo.
        * @method ReplaceAllComboBoxes
        * @return 
        */
        CustomComboBox.ReplaceAllComboBoxes = function () {
            if (this.contextElement) {
                $(this.contextElement.find(" select")).each(function () {
                    CustomComboBox.ReplaceComboBox(this.id);
                });
            }
            else {
                throw new Error("ReplaceAllComboBoxes : Please set a context element before replacing Select tags.");
            }

        };

        CustomComboBox.GetOptionTextAt = function (strContainerID, iIndex) {
            return CustomComboBox.oItems[strContainerID].linear[iIndex].text;
        };
        //Called from Manager.SetFocus
        CustomComboBox.SetFocus = function (strID) {
            document.getElementById(strID + "_hack").focus();
        };
        /*
        Private functions
        * */
        /**
        *
        * @param strContainerID --> id of the container in which the comboBox was created
        * @param iIndex --> selectedIndex
        */
        //called when the prop("selectedIndex") is changed
        CustomComboBox.SetSelectedIndex = function (strContainerID, iIndex) {
            //Manager.ChangeAccMessage(strContainerID + "_comboHolder", iIndex);
            //Manager.ChangeMessage(strContainerID + "_selectedItem", iIndex);
            if (CustomComboBox.oOpenComboBoxes[strContainerID]) {
                if (CustomComboBox.iHighlightedIndex !== -1) {
                    $('#' + strContainerID + "_comboItemX" + CustomComboBox.iHighlightedIndex)
                    .removeClass('CustomComboItemSelected');
                }
                $('#' + strContainerID + "_comboItemX" + iIndex).addClass('CustomComboItemSelected');
                CustomComboBox.iHighlightedIndex = iIndex;
            }
            var iPrevIndex = CustomComboBox.oSelectedIndex[strContainerID];
            CustomComboBox.oSelectedIndex[strContainerID] = iIndex;
            $('#' + strContainerID).val(CustomComboBox.oItems[strContainerID]
                .linear[CustomComboBox.oSelectedIndex[strContainerID]].value);
            if (iPrevIndex !== CustomComboBox.oSelectedIndex[strContainerID]) {
                $('#' + strContainerID).trigger('change');
            }

            var selectedItem = document.getElementById(strContainerID + "_selectedItem");
            //we insert inner html over here incase the combo is not localized which
            // will result in returning from the Manager.ChangeMessage method
            selectedItem.innerHTML = CustomComboBox.oItems[strContainerID]
                    .linear[CustomComboBox.oSelectedIndex[strContainerID]].text;
            // Manager.ChangeMessage(strContainerID);
        };

        //called from manager.mLoadCOmbo
        CustomComboBox.mLoadCombo = function (oElement) {
            var nCount = 0,
            nGroupCount = 0,
            i;
            //for combo boxes created and removed at runtime as in popups
            if ($("#" + oElement.id).is("select")) {
                CustomComboBox.oOpenComboBoxes[oElement.id] = undefined;
                CustomComboBox.oItems[oElement.id] = undefined;
                CustomComboBox.oSelectedIndex[oElement.id] = undefined;
                oElement.oHackDiv = undefined;
                oElement.oHackDivScreen = undefined;
            }

            //Replace any comboboxes created later
            if (CustomComboBox.oItems[oElement.id] === undefined) {
                CustomComboBox.ReplaceAllComboBoxes();
                if (CustomComboBox.oItems[oElement.id] === undefined) {
                    return;
                }
            }
            if (CustomComboBox.oItems[oElement.id].linear.length === 0) {
                return;
            }

            // if (oElement.oHackDiv === null)
            // {
            // //remove hackdiv later
            // var oHackDivScreen = Manager.mRenderTransparentDivForHidingHack(oElement.accid,
            // oElement.blnBlockHackScreen);
            // var oHackDiv = Manager.mRenderTransparentDivForReading(oElement.accid);
            // oElement.oHackDiv = oHackDiv;
            // oElement.oHackDivScreen = oHackDivScreen;
            // $(oElement.oHackDiv).bind("focus", CustomComboBox.OnComboBoxFocus);
            // }

            //$(actingCombo).bind("blur", CustomComboBox.OnComboBoxBlur);

            for (i = 0; i < CustomComboBox.oItems[oElement.id].data.length; i++) {
                if (CustomComboBox.oItems[oElement.id].data[i].label !== null) {
                    CustomComboBox.oItems[oElement.id].data[i].label = oElement.arrMessageGroups[nGroupCount].loc;
                    nGroupCount++;
                }
            }

            var strValue;
            for (i = 0; i < oElement.arrMessages.length; i++) {
                if (!CustomComboBox.oItems[oElement.id].linear[i]) {
                    continue;
                }
                strValue = oElement.arrMessages[i].value;

                if (strValue !== undefined && strValue !== null) {
                    CustomComboBox.oItems[oElement.id].linear[i].value = strValue;
                }
                CustomComboBox.oItems[oElement.id].linear[i].text = oElement.arrMessages[i].loc;
                CustomComboBox.oItems[oElement.id].linear[i].acc = oElement.arrMessages[i].acc === null ?
                                            oElement.arrMessages[i].loc : oElement.arrMessages[i].acc;
            }
            /*
            if (CustomComboBox.oSelectedIndex[oElement.id] !== null && 
            oElement.arrMessages[CustomComboBox.oSelectedIndex[oElement.id]] !== undefined && 
            oElement.arrMessages[CustomComboBox.oSelectedIndex[oElement.id]] !== null)
            {
            if (oElement.arrMessages[CustomComboBox.oSelectedIndex[oElement.id]].acc !== null)
            {
            var strText = oElement.arrMessages[CustomComboBox.oSelectedIndex[oElement.id]].acc;
            }
            else
            {
            strText = oElement.arrMessages[CustomComboBox.oSelectedIndex[oElement.id]].loc;
            }
            }
            */

            // Manager.mApplyAccText(oElement, CustomComboBox.oItems[oElement.id]
            // .linear[CustomComboBox.oSelectedIndex[oElement.id]].acc);
            // $("#" + oElement.id + "_selectedItem").html(CustomComboBox.oItems[oElement.id]
            // .linear[CustomComboBox.oSelectedIndex[oElement.id]].text)
            // var strVal = CustomComboBox.oItems[oElement.id].linear[CustomComboBox.oSelectedIndex[oElement.id]].value;
            // $('#' + oElement.id).val(strVal);
            // CustomComboBox.AdjustWidth(oElement.id);
            // Manager.UpdateFocusRect(oElement.accid);
            // CustomComboBox.SetTabIndex(oElement);
        };

        //increase width of combobox based on the longest string in the combo 
        // options incase width is not explicitly specified
        CustomComboBox.AdjustWidth = function (strID) {
            //check if width was specified by user or auto adjusted according to content
            if (!document.getElementById(strID).style.width || CustomComboBox.oItems[strID].bWidthAdjusted === true) {
                var nMaxWidth = 0,
                div = document.createElement('div'),
                iLength = CustomComboBox.oItems[strID].linear.length,
                strText,
                oComboBox,
                nDivWidth,
                i,
                objDiv = $(div).addClass('CustomComboSelectedItem');


                $("#ActivityContainer").append(div);
                for (i = 0; i < iLength; i++) {
                    oComboBox = CustomComboBox.oItems[strID].linear[i];
                    strText = oComboBox.bIsOptGroupChild ? CustomComboBox.LEFT_OFFSET_FOR_OPTGROUP_ITEM : "";
                    strText += oComboBox.text;
                    div.innerHTML = strText;
                    nDivWidth = objDiv.width();
                    if (nDivWidth > nMaxWidth) {
                        nMaxWidth = nDivWidth;
                    }
                }
                objDiv.addClass('CustomComboGroup');
                for (i = 0; i < CustomComboBox.oItems[strID].data.length; i++) {
                    if (CustomComboBox.oItems[strID].data[i].label !== null) {
                        strText = CustomComboBox.oItems[strID].data[i].label;
                        div.innerHTML = strText;
                        nDivWidth = objDiv.width();
                        if (nDivWidth > nMaxWidth) {
                            nMaxWidth = nDivWidth;
                        }
                    }
                }
                objDiv.remove();
                if (nMaxWidth !== 0) {
                    //width of button
                    nMaxWidth += 34;

                    var objThis = $("#" + strID);
                    var strGroupName = objThis.prop("group");
                    if (CustomComboBox.oGroups[strGroupName]) {
                        for (j = 0; j < CustomComboBox.oGroups[strGroupName].length; j++) {
                            var objOtherCombo = $("#" + CustomComboBox.oGroups[strGroupName][j]);
                            var nWidth = parseInt(objOtherCombo.css('width'), 10);
                            if (nWidth > nMaxWidth) {
                                nMaxWidth = nWidth;
                            }
                            else {
                                objOtherCombo.css('width', nMaxWidth);

                                // Manager.UpdateFocusRect(CustomComboBox.oGroups[strGroupName][j]);
                                CustomComboBox.oItems[CustomComboBox.oGroups[strGroupName][j]].bWidthAdjusted = true;
                            }

                        }
                    }
                    objThis.css('width', nMaxWidth);
                }
                CustomComboBox.oItems[strID].bWidthAdjusted = true;
            }
            else {
                CustomComboBox.oItems[strID].bWidthAdjusted = false;
                Utils.RefreshDom();
            }
            $('.customComboButton').css({ width: '15%' });
            $('.CustomComboSelectedItem').css({ width: '85%' });
        };

        CustomComboBox.GetSetterGetterFunctions = function () {
            var objSetterGetters = {};
            objSetterGetters.SetSelectedIndex = function (value) {
                value = parseInt(value, 10);
                var objThis = $(this),
                nSelectedIndex = objThis.data('customSelectedIndex'),
                iLen = CustomComboBox.oItems[this.id].linear.length,
                i;

                if (iLen === 0) {
                    objThis.data('customSelectedIndex', -1);
                    return objThis.data('customSelectedIndex', -1);
                }
                if (value.toString() === 'NaN') {
                    value = 0;
                }
                if (parseInt(value, 10) < 0) {
                    value = 0;
                }
                else if (parseInt(value, 10) > iLen - 1) {
                    value = iLen - 1;
                }

                if (!CustomComboBox.bDisabledItemsSelectionEnabled &&
                CustomComboBox.oItems[this.id].linear[value].enabled === false) {
                    iLen = 0;
                    if (value > nSelectedIndex) {
                        for (i = value + 1; i < iLen; i++) {
                            if (CustomComboBox.oItems[this.id].linear[i].enabled === true) {
                                this.selectedIndex = i;
                                break;
                            }
                        }
                    }
                    else if (value < nSelectedIndex) {
                        for (i = value - 1; i >= 0; i--) {
                            if (CustomComboBox.oItems[this.id].linear[i].enabled === true) {
                                this.selectedIndex = i;
                                break;
                            }
                        }
                    }
                    return;
                }
                if (CustomComboBox.oItems[this.id].linear[value].enabled === false) {
                    $("#" + this.id + "_selectedItem").addClass("CustomComboItemDisabled");
                }
                else {
                    $("#" + this.id + "_selectedItem").removeClass("CustomComboItemDisabled");
                }
                objThis.data('customSelectedIndex', value);
                CustomComboBox.SetSelectedIndex(this.id, value);
                return value;
            };
            objSetterGetters.GetSelectedIndex = function () {
                return $(this).data('customSelectedIndex');
            };
            objSetterGetters.SetSelectedValue = function (value) {
                var iLen = CustomComboBox.oItems[this.id].linear.length,
                i;
                for (i = 0; i < iLen; i++) {
                    if (CustomComboBox.oItems[this.id].linear[i].value === value) {
                        this.selectedIndex = i;
                    }
                }
                return $(this).val();
            };
            objSetterGetters.GetSelectedValue = function () {
                return $(this).val();
            };
            objSetterGetters.GetarrOptions = function () {
                var arr = [],
                obj,
                iLen = CustomComboBox.oItems[this.id].linear.length,
                i;

                for (i = 0; i < iLen; i++) {
                    obj = {};
                    obj.enabled = CustomComboBox.oItems[this.id].linear[i].enabled;
                    arr.push(obj);
                }
                return arr;
            };
            objSetterGetters.SetarrOptions = function (value) {
                alert("Setting this property is not allowed");
            };
            objSetterGetters.GetDisabled = function () {
                return $(this).data('customDisabled');
            };
            objSetterGetters.SetDisabled = function (value) {
                $(this).data('customDisabled', value).trigger('EnableDisableCombo');
            };
            objSetterGetters.GetGroupName = function () {
                return $(this).data('customGroup');
            };
            objSetterGetters.SetGroupName = function (value) {
                if (value) {
                    if (!CustomComboBox.oGroups[value]) {
                        CustomComboBox.oGroups[value] = [];
                    }
                    if (CustomComboBox.oGroups[value].indexOf(this.id) === -1) {
                        CustomComboBox.oGroups[value].push(this.id);
                    }
                }
                var strPreviousGroup = $(this).data('customGroup');
                if (strPreviousGroup !== value) {
                    if (strPreviousGroup) {
                        CustomComboBox.oGroups[strPreviousGroup]
                            .splice(CustomComboBox.oGroups[strPreviousGroup].indexOf(this.id), 1);
                    }
                    $(this).data('customGroup', value).trigger('ComboGroupChange');
                }
            };
            return objSetterGetters;
        };
        /**
        *
        * @param strContainerID  --> id of the container in which the comboBox was created
        * @param arr --> DataProvider for the combobox of type array
        */
        CustomComboBox.AddComboBox = function (strContainerID, arr, linearData) {
            CustomComboBox.oItems[strContainerID] = {};
            CustomComboBox.oItems[strContainerID].data = arr;
            CustomComboBox.oItems[strContainerID].linear = linearData;

            var combo = document.getElementById(strContainerID),
            oContainer = document.createElement('div');

            $(combo).data('customDisabled', false);
            var objSetterGetters = CustomComboBox.GetSetterGetterFunctions();
            try {
                Object.defineProperty(combo, "selectedIndex",
            {
                get: objSetterGetters.GetSelectedIndex,
                set: objSetterGetters.SetSelectedIndex
            });
                Object.defineProperty(combo, "selectedValue",
            {
                get: objSetterGetters.GetSelectedValue,
                set: objSetterGetters.SetSelectedValue
            });
                Object.defineProperty(combo, "arrOptions",
            {
                get: objSetterGetters.GetarrOptions,
                set: objSetterGetters.SetarrOptions
            });
                Object.defineProperty(combo, "disabled",
            {
                get: objSetterGetters.GetDisabled,
                set: objSetterGetters.SetDisabled
            });
                Object.defineProperty(combo, "group",
            {
                get: objSetterGetters.GetGroupName,
                set: objSetterGetters.SetGroupName
            });
            }
            catch (e) {
                //Since object.defineProperty is not supported on dom objects in iOS 4.3.5
                combo.__defineGetter__('selectedIndex', objSetterGetters.GetSelectedIndex);
                combo.__defineSetter__('selectedIndex', objSetterGetters.SetSelectedIndex);
                combo.__defineGetter__('selectedValue', objSetterGetters.GetSelectedValue);
                combo.__defineSetter__('selectedValue', objSetterGetters.SetSelectedValue);
                combo.__defineGetter__('arrOptions', objSetterGetters.GetarrOptions);
                combo.__defineSetter__('arrOptions', objSetterGetters.SetarrOptions);
                combo.__defineGetter__('disabled', objSetterGetters.GetDisabled);
                combo.__defineSetter__('disabled', objSetterGetters.SetDisabled);
                combo.__defineGetter__('group', objSetterGetters.GetGroupName);
                combo.__defineSetter__('group', objSetterGetters.SetGroupName);
            }



            $(combo).bind('EnableDisableCombo', function () {
                var bDisable = $(this).data('customDisabled');
                CustomComboBox.EnableDisableComboBox(this.id, bDisable);
                // call enable or disable
            });
            $(combo).bind('ComboGroupChange', function () {
                CustomComboBox.AdjustWidth(this.id);
            });

            oContainer.id = strContainerID + "_comboHolder";

            //adding tabindex of parent to this container..needs to be changed later
            $(oContainer).addClass('CustomComboHolder');

            var selectedItem = document.createElement('div');

            selectedItem.id = strContainerID + "_selectedItem";
            $(selectedItem).addClass('CustomComboSelectedItem');

            var option = document.createElement('div');
            $(option).addClass('CustomComboButton').addClass('CustomComboButtonImage');
            combo.appendChild(oContainer);

            oContainer.appendChild(selectedItem);
            oContainer.appendChild(option);

            $(combo).bind("click", CustomComboBox.OpenDropDown)
                .bind("keydown", CustomComboBox.OnKeyDown).bind("mousedown", function () {
                    $("#" + this.id + "_comboHolder > .CustomComboButton")
                .removeClass("CustomComboButtonImage")
                .removeClass("CustomComboButtonImage_Hover").addClass("CustomComboButtonImage_Active");
                }).bind("mouseover", function () {
                    $("#" + this.id + "_comboHolder > .CustomComboButton")
                .removeClass("CustomComboButtonImage")
                .removeClass("CustomComboButtonImage_Active").addClass("CustomComboButtonImage_Hover");
                }).bind("mouseup", function () {
                    $("#" + this.id + "_comboHolder > .CustomComboButton")
                .removeClass("CustomComboButtonImage")
                .removeClass("CustomComboButtonImage_Active").addClass("CustomComboButtonImage_Hover");
                }).bind("mouseout", function () {
                    $("#" + this.id + "_comboHolder > .CustomComboButton")
                .removeClass("CustomComboButtonImage_Hover")
                .removeClass("CustomComboButtonImage_Active").addClass("CustomComboButtonImage");
                }).bind("touchend", function () {
                    var strThisId = this.id,
                setter = setTimeout(function () {
                    $("#" + strThisId + "_comboHolder > .CustomComboButton")
                    .removeClass("CustomComboButtonImage_Hover")
                    .removeClass("CustomComboButtonImage_Active").addClass("CustomComboButtonImage");
                    clearTimeout(setter);
                }, 50);
                }).prop('selectedIndex', CustomComboBox.oSelectedIndex[strContainerID]).attr("tabIndex", 0);

            /*
            if( arr )
            {
            combo.selectedIndex = 0;
            }
            */
        };

        //  Event Handlers
        //Add "comboBox press arrow keys to change selection" message on first focus
        CustomComboBox.OnComboBoxFocus = function (event) {
            var combo = $(event.currentTarget),
            strHTML = combo.html();
            combo.unbind('focus').bind("blur", CustomComboBox.OnComboBoxBlur);

            // if (strHTML.indexOf('To change the selection use the arrow keys') === -1)
            // {
            // var strMessage = Manager.GetAccMessage("ComboMessage", 0, [strHTML]);
            // combo.html(strMessage);
            // if (Manager.BrowserUsesTitle())
            // {
            // combo.attr("title", strMessage);
            // }
            // }

        };

        CustomComboBox.OnComboBoxBlur = function (event) {
            if (CustomComboBox.bIgnoreBlur) {
                CustomComboBox.bIgnoreBlur = false;
                return;
            }
            CustomComboBox.bIgnoreBlur = false;
            $(event.currentTarget).unbind('blur').bind("focus", CustomComboBox.OnComboBoxFocus);
        };

        CustomComboBox.OnKeyDown = function (event) {
            var nHeight,
            nLineHeight,
            strID = event.currentTarget.id,
            //strID = strID.substring(0, strID.lastIndexOf("_"));
            iLen = CustomComboBox.oItems[strID].linear.length,
            iIndex,
            key = event ? event.which : event.keyCode,
            combo = $('#' + strID),
            oldSelectedIndex = combo.prop('selectedIndex'),
            oSelectedItem,
            strHighlightedItemId,
            iNextHighlight,
            oNextItem;

            //dont set focus on Tab key
            if (combo.hasClass('CustomComboDisabled')) {
                return;
            }
            switch (key) {
                case 9:
                    //Tab
                case 27:
                    //ESC
                    CustomComboBox.CloseOpenComboBoxes();
                    break;
                case 33:
                    //page up
                    event.preventDefault();
                    if (CustomComboBox.oOpenComboBoxes[strID]) {
                        nHeight = parseInt($(CustomComboBox.oOpenComboBoxes[strID]).css('height'), 10);
                        nLineHeight = parseInt($(CustomComboBox.oOpenComboBoxes[strID]).css('lineHeight'), 10);
                        CustomComboBox.oOpenComboBoxes[strID].scrollTop -= parseInt($(CustomComboBox.oOpenComboBoxes[strID])
                                                                        .css('height'), 10);
                    }
                    else {
                        nLineHeight = CustomComboBox.DEFAULT_LINE_HEIGHT;
                        nHeight = iLen * nLineHeight > CustomComboBox.MAX_DROP_DOWN_HEIGHT ?
                                        CustomComboBox.MAX_DROP_DOWN_HEIGHT : iLen * nLineHeight;
                    }
                    iIndex = parseInt((nHeight / nLineHeight), 10);
                    combo.prop('selectedIndex', oldSelectedIndex - iIndex);
                    break;
                case 34:
                    //page down
                    event.preventDefault();
                    if (CustomComboBox.oOpenComboBoxes[strID]) {
                        nHeight = parseInt($(CustomComboBox.oOpenComboBoxes[strID]).css('height'), 10);
                        nLineHeight = parseInt($(CustomComboBox.oOpenComboBoxes[strID]).css('lineHeight'), 10);
                        CustomComboBox.oOpenComboBoxes[strID].scrollTop += parseInt(
                                            $(CustomComboBox.oOpenComboBoxes[strID]).css('height'), 10);
                    }
                    else {
                        nLineHeight = CustomComboBox.DEFAULT_LINE_HEIGHT;
                        nHeight = iLen * nLineHeight > CustomComboBox.MAX_DROP_DOWN_HEIGHT ?
                                    CustomComboBox.MAX_DROP_DOWN_HEIGHT : iLen * nLineHeight;
                    }

                    iIndex = parseInt((nHeight / nLineHeight), 10);

                    combo.prop('selectedIndex', oldSelectedIndex + iIndex);
                    break;
                case 35:
                    //end
                    event.preventDefault();
                    if (CustomComboBox.oOpenComboBoxes[strID]) {
                        CustomComboBox.oOpenComboBoxes[strID].scrollTop = CustomComboBox.oOpenComboBoxes[strID]
                                                                    .scrollHeight;
                    }
                    combo.prop('selectedIndex', iLen - 1);
                    break;
                case 36:
                    //home
                    event.preventDefault();
                    if (CustomComboBox.oOpenComboBoxes[strID]) {
                        CustomComboBox.oOpenComboBoxes[strID].scrollTop = 0;
                    }
                    combo.prop('selectedIndex', 0);
                    break;
                case 13:
                case 32:
                    //Enter key
                    //Space
                    event.preventDefault();
                    if ($(".CustomComboDropDown").length === 0) {
                        CustomComboBox.OpenDropDown(event);
                    } else {
                        if (CustomComboBox.iHighlightedIndex !== oldSelectedIndex) {
                            combo.prop('selectedIndex', CustomComboBox.iHighlightedIndex);
                        }
                        CustomComboBox.CloseOpenComboBoxes();
                    }
                    break;
                case 37:
                case 189:
                    //left
                    break;
                case 38:
                case 219:
                    //up
                    event.preventDefault();
                    if ($(".CustomComboDropDown").length === 0) {
                        iIndex = CustomComboBox.iHighlightedIndex === -1 ?
                                    oldSelectedIndex : CustomComboBox.iHighlightedIndex;
                        iIndex = iIndex - 1;
                        $('#' + strID).prop('selectedIndex', iIndex);
                        if (iIndex >= 0 && CustomComboBox.oOpenComboBoxes[strID] &&
                            (CustomComboBox.oOpenComboBoxes[strID].scrollTop - CustomComboBox.DEFAULT_LINE_HEIGHT) <
                                document.getElementById(strID + "_comboItemX" + iIndex).offsetTop) {
                            document.getElementById(strID + "_comboItemX" + iIndex).scrollIntoView();
                        }
                    } else {
                        oSelectedItem = $(".CustomComboItemSelected");
                        strHighlightedItemId = oSelectedItem.attr("id");
                        iNextHighlight = parseInt(strHighlightedItemId.split("X")[1], 10);
                        iNextHighlight--;
                        if (iNextHighlight <= -1) {
                            return false;
                        }
                        CustomComboBox.iHighlightedIndex = iNextHighlight;
                        oSelectedItem.removeClass("CustomComboItemSelected");
                        $("#" + strID + "_comboItemX" + iNextHighlight).addClass("CustomComboItemSelected")[0]
                                                                .scrollIntoView();
                    }
                    break;
                case 39:
                case 187:
                    //right
                    break;
                case 40:
                case 222:
                    //down
                    event.preventDefault();
                    if ($(".CustomComboDropDown").length === 0) {
                        iIndex = CustomComboBox.iHighlightedIndex === -1 ?
                                            oldSelectedIndex : CustomComboBox.iHighlightedIndex;
                        combo.prop('selectedIndex', iIndex + 1);
                        if (CustomComboBox.oOpenComboBoxes[strID] &&
                            document.getElementById(strID + "_comboItemX" + CustomComboBox.iHighlightedIndex).offsetTop
                                    > CustomComboBox.oOpenComboBoxes[strID].scrollTop
                                        + parseInt($(CustomComboBox.oOpenComboBoxes[strID]).css('height'), 10)) {
                            document.getElementById(strID + "_comboItemX"
                                + CustomComboBox.iHighlightedIndex).scrollIntoView();
                        }
                    } else {
                        oSelectedItem = $(".CustomComboItemSelected");
                        strHighlightedItemId = oSelectedItem.attr("id");
                        iNextHighlight = parseInt(strHighlightedItemId.split("X")[1], 10);
                        iNextHighlight++;
                        oNextItem = $("#" + strID + "_comboItemX" + iNextHighlight);
                        if (iNextHighlight >= $(".CustomComboItem").length) {
                            return false;
                        }

                        oSelectedItem.removeClass("CustomComboItemSelected");
                        CustomComboBox.iHighlightedIndex = iNextHighlight;
                        oNextItem.addClass("CustomComboItemSelected");
                        if (oNextItem[0].offsetTop + 15 >
                         CustomComboBox.oOpenComboBoxes[strID].scrollTop
                         + parseInt($(CustomComboBox.oOpenComboBoxes[strID]).css('height'), 10)) {
                            oNextItem[0].scrollIntoView();
                        }
                    }
                    break;
            }
            if (oldSelectedIndex !== $('#' + strID).prop('selectedIndex')) {
                CustomComboBox.bIgnoreBlur = true;
                var oHackDiv = document.getElementById(event.currentTarget.id + "_hack");
                // Manager.SetFocus("CustomComboTempFocusDiv");
                $(oHackDiv).focus();
            }
        };
        CustomComboBox.CloseComboBox = function (event) {
            if (event.currentTarget !== document) {
                event.stopPropagation();
                event.stopImmediatePropagation();
                event.preventDefault();
                //If the comboBox on which it is mousedown is different from the one which is open
                // , we go ahead and close the
                //open combo box
                if (CustomComboBox.oOpenComboBoxes[event.currentTarget.id] ||
                 $(event.currentTarget).hasClass('CustomComboDropDown')) {
                    return;
                }
            }
            CustomComboBox.CloseOpenComboBoxes();
        };

        CustomComboBox.OnTouchStart = function (event) {
            if (CustomComboBox.bTouchOnCombo) {
                CustomComboBox.bTouchOnCombo = false;
                return;
            }
            if (event.currentTarget === document) {
                CustomComboBox.CloseOpenComboBoxes();
            }
            else {
                CustomComboBox.bTouchOnCombo = true;
            }
        };
        CustomComboBox.CloseOpenComboBoxes = function () {
            var iterable_element;
            CustomComboBox.bTouchOnCombo = false;
            CustomComboBox.iHighlightedIndex = -1;
            for (iterable_element in CustomComboBox.oOpenComboBoxes) {
                $(CustomComboBox.oOpenComboBoxes[iterable_element]).remove();
                delete CustomComboBox.oOpenComboBoxes[iterable_element];
                $("#" + iterable_element).unbind('mousedown', CustomComboBox.CloseComboBox)
                                    .unbind('touchstart', CustomComboBox.OnTouchStart);
            }
            $(document).unbind('mousedown', CustomComboBox.CloseComboBox)
                   .unbind('mousewheel DOMMouseScroll', CustomComboBox.CloseComboBox)
                   .unbind('touchstart', CustomComboBox.OnTouchStart);

        };


        CustomComboBox.ShowHint = function (strHintText) {
            CustomComboBox.hintElement.html(strHintText);
            CustomComboBox.hintElement.show();
        };

        CustomComboBox.PreventDefault = function (bPrevent) {
            CustomComboBox.bDefaultEventPrevented = bPrevent;
        }

        CustomComboBox.HideHint = function () {
            CustomComboBox.hintElement.hide();
        };

        CustomComboBox.SetPos = function (iX, iY) {
            CustomComboBox.hintElement.css("left", iX + "px");
            CustomComboBox.hintElement.css("top", iY + "px");
        };


        CustomComboBox.OpenDropDown = function (event) {
            // Check to see if long tap occured, then let this event go...
            if (CustomComboBox.bDefaultEventPrevented) {
                return;
            }

            var objCurrentTarget = $(event.currentTarget);
            if (objCurrentTarget.hasClass('CustomComboDisabled')) {
                return;
            }
            var oDropDownObject = null;
            if (CustomComboBox.oOpenComboBoxes[event.currentTarget.id]) {
                oDropDownObject = CustomComboBox.oOpenComboBoxes[event.currentTarget.id];
            }
            else if ($(event.currentTarget).hasClass('CustomComboDropDown')) {
                oDropDownObject = event.currentTarget;
            }

            if (oDropDownObject !== null) {
                $(oDropDownObject).remove();
                CustomComboBox.CloseOpenComboBoxes();
                return;
            }
            var dropDown;
            if (CustomComboBox.oItems[event.currentTarget.id].dropDown) {
                dropDown = CustomComboBox.oItems[event.currentTarget.id].dropDown;
            }
            else {
                dropDown = document.createElement('div');
                CustomComboBox.oItems[event.currentTarget.id].dropDown = dropDown;
            }
            var objDropDown = $(dropDown);
            objDropDown.html("");

            objCurrentTarget.unbind('mousedown', CustomComboBox.CloseComboBox)
                        .bind('mousedown', CustomComboBox.CloseComboBox);
            objCurrentTarget.unbind('touchstart', CustomComboBox.OnTouchStart)
                        .bind('touchstart', CustomComboBox.OnTouchStart);
            $(document).unbind('mousedown', CustomComboBox.CloseComboBox)
                   .bind('mousedown', CustomComboBox.CloseComboBox)
                   .unbind('mousewheel DOMMouseScroll', CustomComboBox.CloseComboBox)
                   .bind('mousewheel DOMMouseScroll', CustomComboBox.CloseComboBox)
                   .unbind('touchstart', CustomComboBox.OnTouchStart)
                   .bind('touchstart', CustomComboBox.OnTouchStart);
            var offset = objCurrentTarget.offset();
            objDropDown.css(
        {
            "top": offset.top + objCurrentTarget.height() - 4,
            "left": offset.left,
            "min-width": objCurrentTarget.width(),
            "color": objCurrentTarget.css("color"),
            "font-size": objCurrentTarget.css("font-size")

        });
            objDropDown.unbind('mousedown', CustomComboBox.CloseComboBox).bind('mousedown', CustomComboBox.CloseComboBox)
                   .unbind('mousewheel DOMMouseScroll').bind('mousewheel DOMMouseScroll', function (event) {
                       event.stopPropagation();
                       event.stopImmediatePropagation();
                   })
                   .unbind('touchstart', CustomComboBox.OnTouchStart).bind('touchstart', CustomComboBox.OnTouchStart)
                   .unbind('click', CustomComboBox.OpenDropDown).bind('click', CustomComboBox.OpenDropDown);
            objDropDown.removeClass().addClass('CustomComboDropDown');
            var timeId = null;
            // Mouse hover and leave functions.
            var enterFn = function (event) {
                var strHtml, id = $(this).attr(id);
                strHtml = $("#" + id + "_selectedItem").html();
                strHtml = strHtml.replace(/&nbsp;/g, '');
                timeId = setTimeout(
            function () {
                CustomComboBox.ShowHint(strHtml);
            }, CustomComboBox.HintDelay);

                CustomComboBox.SetPos(event.clientX + 15, event.clientY + 25);
            }

            var leaveFn = function () {
                CustomComboBox.HideHint();
                clearTimeout(timeId);
            }

            CustomComboBox.oOpenComboBoxes[event.currentTarget.id] = dropDown;
            var oItem,
            objoItem,
            nCount = 0,
            i,
            j,
            curComboItem;

            curComboItem = CustomComboBox.oItems[event.currentTarget.id];
            for (i = 0; i < curComboItem.data.length; i++) {

                if (curComboItem.data[i].label != null) {
                    oItem = document.createElement('div');
                    objoItem = $(oItem);
                    oItem.innerHTML = CustomComboBox.oItems[event.currentTarget.id].data[i].label + "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp&nbsp;&nbsp;&nbsp;";
                    objoItem.addClass('CustomComboItem').addClass('CustomComboGroup');
                    dropDown.appendChild(oItem);
                    for (j = 0; j < CustomComboBox.oItems[event.currentTarget.id].data[i].data.length; j++) {
                        oItem = document.createElement('div');
                        objoItem = $(oItem);
                        oItem.id = event.currentTarget.id + "_comboItemX" + nCount;
                        if (CustomComboBox.oItems[event.currentTarget.id].data[i].data[j].enabled === false) {
                            objoItem.addClass('CustomComboItemDisabled');
                        }
                        else {
                            CustomComboBox.BindListenersOnItem(objoItem);
                        }
                        if (nCount === CustomComboBox.oSelectedIndex[event.currentTarget.id]) {
                            objoItem.addClass('CustomComboItemSelected');
                            CustomComboBox.iHighlightedIndex = nCount;
                        }
                        oItem.innerHTML = CustomComboBox.LEFT_OFFSET_FOR_OPTGROUP_ITEM + CustomComboBox.oItems[event.currentTarget.id].data[i].data[j].text + "  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;";  //CustomComboBox.LEFT_OFFSET_FOR_OPTGROUP_ITEM +
                        //oItem.innerHTML = Manager.GetMessage(event.currentTarget.id + "_selectedItem", nCount);
                        objoItem.addClass('CustomComboItem');
                        dropDown.appendChild(oItem);
                        nCount++;
                    }
                }
                else {
                    oItem = document.createElement('div');
                    objoItem = $(oItem);
                    oItem.id = event.currentTarget.id + "_comboItemX" + nCount;
                    oItem.innerHTML = curComboItem.data[i].text;
                    if (curComboItem.data[i].renderTpl) {
                        oItem.innerHTML = oItem.innerHTML + curComboItem.data[i].renderTpl;
                    }
                    objoItem.addClass('CustomComboItem');
                    if (curComboItem.data[i].enabled === false) {
                        objoItem.addClass('CustomComboItemDisabled');
                    }
                    else {
                        CustomComboBox.BindListenersOnItem(objoItem);
                    }


                    //objoItem.bind('mouseenter', enterFn);
                    //objoItem.bind('mouseleave', leaveFn);

                    if (nCount === CustomComboBox.oSelectedIndex[event.currentTarget.id]) {
                        objoItem.addClass('CustomComboItemSelected');
                        CustomComboBox.iHighlightedIndex = nCount;
                    }


                    dropDown.appendChild(oItem);
                    nCount++;
                }

            }
            var arrChildren = objDropDown.children();
            var nHeight = (CustomComboBox.DEFAULT_LINE_HEIGHT * arrChildren.length)
                     > CustomComboBox.MAX_DROP_DOWN_HEIGHT ?
                       CustomComboBox.MAX_DROP_DOWN_HEIGHT : (CustomComboBox.DEFAULT_LINE_HEIGHT * arrChildren.length);
            if (nHeight + parseInt(objDropDown.css("top"), 10) > (window.innerHeight - 5)) {
                objDropDown.css("top", offset.top - nHeight - 8);
            }
            objDropDown.css('height', nHeight);
            document.body.appendChild(dropDown);
            if ($.support.touch === false) {
                var objHackDiv = document.getElementById(event.currentTarget.id + "_hack");
                if (objHackDiv) {
                    objHackDiv.focus();
                }

            }
            var strID = event.currentTarget.id, comboBoxHighlightedItem = document.getElementById(strID + "_comboItemX" + CustomComboBox.iHighlightedIndex);
            if (CustomComboBox.oOpenComboBoxes[strID]
            && comboBoxHighlightedItem && comboBoxHighlightedItem.offsetTop
            >= CustomComboBox.oOpenComboBoxes[strID].scrollTop
            + parseInt($(CustomComboBox.oOpenComboBoxes[strID]).css('height'), 10)) {
                document.getElementById(strID + "_comboItemX" + CustomComboBox.iHighlightedIndex).scrollIntoView();
            }
        };
        CustomComboBox.BindListenersOnItem = function (oItem) {
            oItem.unbind('mouseover touchstart', CustomComboBox.OnComboItemOver)
             .bind('mouseover touchstart', CustomComboBox.OnComboItemOver);
            oItem.unbind('click', CustomComboBox.OnComboItemClick).bind('click', CustomComboBox.OnComboItemClick);
            oItem.unbind('touchend', CustomComboBox.OnComboItemTouchEnd)
             .bind('touchend', CustomComboBox.OnComboItemTouchEnd);
        };
        CustomComboBox.OnComboItemClick = function (event) {
            var strID = event.currentTarget.id;
            var strContainerID = strID.substring(0, strID.lastIndexOf("_"));
            strID = strID.substring(strID.lastIndexOf("X") + 1, strID.length);
            $('#' + strContainerID).prop("selectedIndex", parseInt(strID, 10));
        };
        CustomComboBox.OnComboItemTouchEnd = function (event) {
            var strID = event.currentTarget.id;
            var strContainerID = strID.substring(0, strID.lastIndexOf("_"));
            $("#" + strContainerID + "_comboItemX" + CustomComboBox.iHighlightedIndex)
                                        .removeClass('CustomComboItemSelected');
        };
        CustomComboBox.OnComboItemOver = function (event) {
            var strID = event.currentTarget.id;
            var strContainerID = strID.substring(0, strID.lastIndexOf("_"));

            $("#" + strContainerID + "_comboItemX" + CustomComboBox.iHighlightedIndex)
                                .removeClass('CustomComboItemSelected');
            $(event.currentTarget).addClass('CustomComboItemSelected');
            strID = strID.substring(strID.lastIndexOf("X") + 1, strID.length);
            CustomComboBox.iHighlightedIndex = parseInt(strID, 10);
        };

        CustomComboBox.IsTouchDevice = function () {
            return 'ontouchstart' in window || navigator.msMaxTouchPoints;
        }
        //CustomComboBox.ReplaceAllComboBoxes();
        return CustomComboBox;
    }
})();