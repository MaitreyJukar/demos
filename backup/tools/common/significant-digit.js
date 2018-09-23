(function () {
    'use strict';

    MathUtilities.Components.SignificantDigit = {};

    var SignificantDigit = MathUtilities.Components.SignificantDigit
    SignificantDigit.getAsLatex = function (arrNumber) {
        var strHtml;
        if (arrNumber.length == 2) {
            if (arrNumber[1].toString().indexOf('+') !== -1) {
                arrNumber[1] = arrNumber[1].replace(/\+/g, '');
            }
            strHtml = String(arrNumber[0] + " \\cdot " + String(10) + "^{" + arrNumber[1] + '}');
        }
        else {
            strHtml = String(arrNumber[0]);
        }
        return strHtml;
    },
    SignificantDigit.GetAsHtml = function (arrNumber) {
        var strHtml;
        if (arrNumber.length == 2 && arrNumber[1] != 0) {
            strHtml = String(arrNumber[0] + " x " + String(10) + "<sup>" + arrNumber[1] + "</sup>");
        }
        else {
            strHtml = String(arrNumber[0]);
        }
        return strHtml;
    }
    SignificantDigit.Mode = new Object();
    SignificantDigit.Mode.MIXED = "Mixed";
    SignificantDigit.Mode.DECIMAL = "false";
    SignificantDigit.Mode.SCIENTIFIC = "true";

    function HandleMixedCase(nNumber, nSignificantDigit) {
        var nReqSigDig = Number(nSignificantDigit);

        var arrReturn = [];

        var arrDecimal = SignificantDigit.Calculate(nNumber, nSignificantDigit, false);
        var nSigDigDecimal = CalculateSignificantDigit(arrDecimal[0]);
        if (nSigDigDecimal == nReqSigDig) {
            arrReturn = [arrDecimal[0]]
        }
        else {
            arrReturn = SignificantDigit.Calculate(nNumber, nReqSigDig, true);
        }

        return arrReturn;
    }

    //	GetNumber = function (arrSignificant)
    //	{
    //		 var nNos = Number(arrSignificant[0])
    //		 if (arrSignificant.length == 2)
    //		 {
    //			  nNos = nNos * Math.pow(10, Number(arrSignificant[1]))
    //		 }

    //		 return nNos;
    //	}

    SignificantDigit.bIsNegative = false;

    SignificantDigit.ShiftNumber = function (nNumber, nPower, nDesiredPower) {
        var strNumber = String(nNumber);
        var strPower = String(nPower);
        var strDesiredPower = String(nDesiredPower);

        var strFinalisedNumber = "";

        var nShiftPower = Number(nPower) - Number(nDesiredPower);
        /*
        in effect what we need is Number * 10 raise to nShiftPower
        */

        if (strNumber.indexOf(".") == -1) {
            strNumber += ".";
        }

        var arrNumberParts = strNumber.split(".");
        var arrBeforeDecimal = arrNumberParts[0].split("");
        var arrAfterDecimal = arrNumberParts[1].split("");
        var nAbsShiftInPower = Math.abs(nShiftPower);
        //need to shift left
        if (nShiftPower < 0) {
            //if decimal point is to be shifted through more digits then available
            if (arrBeforeDecimal.length < nAbsShiftInPower) {
                //prepend array with zeroes
                var nDeficit = nAbsShiftInPower - arrBeforeDecimal.length;
                for (var i = 0; i < nDeficit; i++) {
                    arrBeforeDecimal.unshift("0");
                }
            }


            for (i = 0; i < nAbsShiftInPower; i++) {
                arrAfterDecimal.unshift(arrBeforeDecimal.pop());
            }

        }
        else {
            //if decimal point is to be shifted through more digits then available
            if (arrAfterDecimal.length < nAbsShiftInPower) {
                //add zeroes at end of array 
                var nDeficit = nAbsShiftInPower - arrBeforeDecimal.length;
                for (var i = 0; i < nDeficit; i++) {
                    arrAfterDecimal.push("0");
                }
            }

            for (i = 0; i < nAbsShiftInPower; i++) {
                arrBeforeDecimal.push(arrAfterDecimal.shift());
            }
        }

        strFinalisedNumber = GetNumberFromArray(arrBeforeDecimal, arrAfterDecimal);


        return strFinalisedNumber;
    }

    function GetNumberFromArray(arrBefore, arrAfter) {
        var strFinal = "";
        var strAfter = arrAfter.toString().replace(/,/g, "");
        var strBefore = arrBefore.toString().replace(/,/g, "");

        if (arrBefore.length == 0) {
            strFinal = GetZeroes(1, true) + strAfter;
        }
        else if (arrAfter.length == 0) {
            strFinal = strBefore;
        }
        else {
            strFinal = strBefore + "." + strAfter;
        }

        return strFinal;

    }

    function GetZeroes(nNumberOfZeroes, bDecimal) {
        nNumberOfZeroes = Math.abs(nNumberOfZeroes);
        var strRet = "";

        if (bDecimal == true) {
            nNumberOfZeroes--;
            strRet = String(Math.pow(10, nNumberOfZeroes)).replace("1", "0.")
        }
        else {
            strRet = String(Math.pow(10, nNumberOfZeroes)).replace("1", "")
        }


        return strRet;
    }

    SignificantDigit.Calculate = function (nNumber, nSignificantDigit, bScientificNotation, bInternalCall) {
        //console.log(nNumber + " " + nSignificantDigit);
        //debugger
        if (String(nNumber).indexOf("-") == 0) {

            SignificantDigit.bIsNegative = true;
            nNumber = String(Number(nNumber) * -1);
        }

        var arrReturn = new Array();
        var arrScientificValue = [];
        var arrDecimalValue = [];
        var bSpecialCase = false;

        if (bScientificNotation == null || bScientificNotation == undefined || bScientificNotation == SignificantDigit.Mode.MIXED) {
            //bScientificNotation = SignificantDigit.Mode.MIXED;
            arrReturn = HandleMixedCase(nNumber, nSignificantDigit);
            return arrReturn;
        }



        if (bScientificNotation == true || bScientificNotation == "true") {
            bScientificNotation = SignificantDigit.Mode.SCIENTIFIC;
        }
        else if (bScientificNotation == false || bScientificNotation == "false") {
            bScientificNotation = SignificantDigit.Mode.DECIMAL;
        }


        //    if (bScientificNotation == SignificantDigit.Mode.DECIMAL && (bInternalCall == undefined || bInternalCall == null))
        //    {
        //        var arrDecimal = SignificantDigit.Calculate(nNumber, nSignificantDigit, false, true);
        //        var arrScientific = SignificantDigit.Calculate(nNumber, nSignificantDigit, true, true);

        //        var nDecimal = GetNumber(arrDecimal);
        //        var nScientific = GetNumber(arrScientific);

        //        if (nDecimal != nScientific)
        //        {
        //            var strDecimal = arrDecimal[0];
        //            var arrDecimal = strDecimal.split(".");
        //            var strBeforeDecimal = arrDecimal[0];
        //            var strAfterDecimal = arrDecimal[1];

        //            strBeforeDecimal = strBeforeDecimal + strAfterDecimal.substr(0, Number(arrScientific[1]));
        //            strAfterDecimal = strAfterDecimal.substr(Number(arrScientific[1]));
        //            if (strAfterDecimal.length == 0)
        //            {
        //                strFinalNumber = strBeforeDecimal;
        //            }
        //            else
        //            {
        //                strFinalNumber = strBeforeDecimal + "." + strAfterDecimal;
        //            }

        //            var arrRet = [strFinalNumber];

        //            return arrRet;
        //        }
        //    }

        var strNumber = "";
        strNumber = nNumber.toString();  // input number

        /*if (bScientificNotation == SignificantDigit.Mode.DECIMAL)
        {
        arrDecimalValue = SignificantDigit.Calculate(strNumber, nSignificantDigit, SignificantDigit.Mode.DECIMAL);
        arrScientificValue = SignificantDigit.Calculate(strNumber, nSignificantDigit, SignificantDigit.Mode.SCIENTIFIC);

        if (arrDecimalValue[0] == arrScientificValue[0])
        {
        arrReturn = strNumber.split(".");
        arrReturn[0] = arrReturn[0] + arrReturn[1].substr(0, arrScientificValue[1]);
        if (arrReturn[1].length > arrScientificValue[1])
        {
        arrReturn += ".";
        arrReturn[0] += arrReturn[1].substr(arrScientificValue[1]);
        }
        return arrReturn[0];
        }
        }*/

        var iConversion = nSignificantDigit;
        var iSigNum = 0;
        var iCount;
        var iDecimalPosition;
        var bIsNonZero = false;
        var bIsDecimal = false; // boolean for decimal point
        var iNumberLength = strNumber.length;
        // to check if decimal point is present
        for (iCount = 0; iCount < strNumber.length; iCount++) {
            if (strNumber.charAt(iCount) == ".") {
                bIsDecimal = true;
                iDecimalPosition = iCount;
                break;
            }
        }

        if (strNumber == 0) {
            //          document.getElementById("SigniDigits").value = 1;
            arrReturn = convert(bIsDecimal, iSigNum, strNumber, iConversion, iDecimalPosition, iNumberLength, bScientificNotation);
            if (Number(arrReturn[0]) == 0) {
                arrReturn = ["0"]
            }
            return arrReturn;
        }

        iSigNum = strNumber.length;

        // calculate significant digits for number without Decimal point
        if (bIsDecimal == true) {


            for (iCount = 0; iCount < strNumber.length; iCount++) {

                if (strNumber[iCount] == 0 || strNumber[iCount] == ".") {
                    if (strNumber[iCount] == 0) {
                        iSigNum = iSigNum - 1;
                    }
                }
                else {
                    break;

                }

            }
            iSigNum--;
            arrReturn = convert(bIsDecimal, iSigNum, strNumber, iConversion, iDecimalPosition, iNumberLength, bScientificNotation);

            return arrReturn;
        }

        // calculate significant nos without Decimal point

        else {
            // if zeroes are present at the start
            for (iCount = 0; iCount < strNumber.length; iCount++) {
                //        

                if (strNumber[iCount] == 0 || strNumber[iCount] == ".") {
                    if (strNumber[iCount] == 0) {
                        iSigNum = iSigNum - 1;
                        //                    strNumber = fncRemoveZero(strNumber);
                        //                    alert(strNumber);
                    }
                }
                else {
                    break;

                }

            }

            // if zeroes are present at the end
            for (iCount = strNumber.length - 1; iCount >= 0; iCount--) {
                if (strNumber[iCount] == 0 || strNumber[iCount] == ".") {
                    if (strNumber[iCount] == 0) {
                        iSigNum = iSigNum - 1;
                    }
                }
                else {
                    break;

                }
            }
            arrReturn = convert(bIsDecimal, iSigNum, strNumber, iConversion, iDecimalPosition, iNumberLength, bScientificNotation);
            return arrReturn;
        }
    }

    function HandleNegative(arrReturn) {
        if (SignificantDigit.bIsNegative == true) {
            arrReturn[0] = "-" + String(arrReturn[0]);
        }

        SignificantDigit.bIsNegative = false;

        return arrReturn;
    }

    function convert(bIsDecimal, iSigNum, strNumber, iConversion, iDecimalPosition, iNumberLength, bScientificNotation) {
        var arrReturn = new Array();
        var arrNumberScientific = new Array();
        var iNewSigDigit;
        var iCount;
        var bLessThanOne = false;
        var iPower;
        var iExponentialPosition;
        //console.log(strNumber + " " + iSigNum);
        if (strNumber < 1) {
            bLessThanOne = true;
        }
        if (strNumber == 0) {
            strNumber = "0.";
            for (iCount = 0; iCount < iConversion - 1; iCount++) {
                strNumber += "0";
            }
            if (bScientificNotation == SignificantDigit.Mode.DECIMAL || bScientificNotation == SignificantDigit.Mode.DECIMAL) {
                arrReturn = [strNumber];
            }
            else {
                arrReturn = [strNumber, 0];
            }
            return arrReturn;
        }
        var strOriginalNumber = strNumber;
        strNumber = Number(strNumber);
        strNumber = strNumber.toExponential(iConversion - 1);
        strNumber = strNumber.toString();

        for (iCount = 0; iCount < strNumber.length; iCount++) {
            if (strNumber.charAt(iCount) == "e") {
                break;
            }
        }
        iExponentialPosition = iCount;
        iPower = parseInt(strNumber.substring(iExponentialPosition + 1, strNumber.length));
        if (bScientificNotation == SignificantDigit.Mode.SCIENTIFIC) {
            arrReturn[0] = arrReturn[0] = strNumber.substring(0, iExponentialPosition);
            arrReturn[1] = iPower;
            arrReturn = HandleNegative(arrReturn);
            return arrReturn;
        }
        var isNegative = false;
        if (iPower < 0) {
            isNegative = true;
        }
        arrReturn[0] = strNumber.substring(0, iExponentialPosition);
        var arrTemp = String(arrReturn[0]).split(".");
        if (isNegative) {

            var strAppendZeros = Number(0).toFixed(Math.abs(iPower));
            strAppendZeros = strAppendZeros.substring(0, strAppendZeros.length - 1);

            strNumber = strAppendZeros + arrTemp[0] + arrTemp[1];
            arrReturn[0] = strNumber;
            arrReturn = HandleNegative(arrReturn);
            return arrReturn;
        }
        else {
            arrTemp[0] += String(arrTemp[1]).substring(0, Math.abs(iPower));
            if (arrTemp[1].length > Math.abs(iPower)) {
                arrTemp[0] += ".";
                arrTemp[0] += String(arrTemp[1]).substr(Math.abs(iPower));
            }
            if (arrTemp[1].length < Math.abs(iPower)) {
                var strAppendZeros = Math.abs(iPower) - arrTemp[1].length;
                strAppendZeros = String(Math.pow(10, strAppendZeros));
                arrTemp[0] += strAppendZeros.substr(1);
            }
            arrReturn[0] = String(arrTemp[0]);
            arrReturn = HandleNegative(arrReturn);
            return arrReturn;

        }

    }


    //     arrNumberScientific[0] = strNumber.substring(0, iExponentialPosition);
    //     arrNumberScientific[1] = iPower;
    //     if (bIsDecimal == true)
    //     {
    ////          if (bScientificNotation == SignificantDigit.Mode.MIXED)
    ////          {
    ////               iNewSigDigit = CalculateSignificantDigit(strNumber);
    ////               if (iNewSigDigit != iConversion)
    ////               {
    ////                    return arrNumberScientific;
    ////               }
    ////               else
    ////               {
    ////                   strNumber = strNumber.substring(0, iExponentialPosition);
    ////                    arrReturn = [strNumber];
    ////               }
    ////          }
    //          if (bScientificNotation == SignificantDigit.Mode.DECIMAL)
    //          {
    //               var iShift = parseInt(strNumber.charAt(strNumber.length - 1));
    //               strNumber = strNumber.substring(0, iExponentialPosition);

    //               if (bLessThanOne)
    //               {
    //                    var strTempNumber = "0.";
    //                    for (iCount = 0; iCount < iShift - 1; iCount++)
    //                    {
    //                         strTempNumber += "0";
    //                    }
    //                    strNumber = strNumber.replace(".", "");
    //                    strTempNumber += strNumber;
    //                    strNumber = strTempNumber;
    //               }
    //               else
    //               {
    //                    if (iDecimalPosition != strNumber.indexOf("."))
    //                    {
    //                         if (iDecimalPosition == iConversion)
    //                         {
    //                              strTempNumber = strOriginalNumber.substring(0, iDecimalPosition);
    //                         }
    //                         else if (iDecimalPosition > iConversion)
    //                         {
    //                              strNumber = strNumber.replace(".", "");

    //                              for (iCount = strNumber.length; iCount < iDecimalPosition; iCount++)
    //                              {
    //                                   strNumber += "0";
    //                              }
    //                              if (bScientificNotation == SignificantDigit.Mode.DECIMAL)
    //                              {
    //                                   arrReturn = [strNumber];
    //                              }
    //                              else
    //                              {
    //                                   arrReturn = [strNumber, iPower];
    //                              }
    //                              return arrReturn;
    //                         }
    //                         else
    //                         {

    //                              strTempNumber = strOriginalNumber.substring(0, iDecimalPosition + 1);
    //                         }

    //                         strTempNumber += strNumber.substring(iDecimalPosition + 1, strNumber.length);
    //                         strNumber = strTempNumber;
    //                    }
    //               }

    //               if (bScientificNotation == SignificantDigit.Mode.DECIMAL)
    //               {
    //                    arrReturn = [strNumber];
    //               }
    //               else
    //               {
    //                    arrReturn = [strNumber, iPower];
    //               }
    //               return arrReturn;
    //          }
    //          else
    //          {

    //               strNumber = strNumber.substring(0, iExponentialPosition);

    //               arrReturn = [strNumber, iPower];
    //               return arrReturn;

    //          }
    //     }
    //     else
    //     {
    //          if (bScientificNotation == SignificantDigit.Mode.SCIENTIFIC)
    //          {
    //               strNumber = strNumber.substring(0, iExponentialPosition);
    //               arrReturn = [strNumber, iPower];
    //               return arrReturn;
    //          }
    ////          if (bScientificNotation == SignificantDigit.Mode.MIXED)
    ////          {
    ////               iNewSigDigit = CalculateSignificantDigit(strNumber);
    ////               if (iNewSigDigit != iConversion)
    ////               {
    ////                    return arrNumberScientific;
    ////               }
    ////               else
    ////               {
    ////                   strNumber = strNumber.substring(0, iExponentialPosition);
    ////                    arrReturn = [strNumber];
    ////               }
    ////          }
    //          else
    //          {
    //               var iShift = parseInt(strNumber.charAt(strNumber.length - 1));

    //               strNumber = strNumber.substring(0, iExponentialPosition);
    //               strNumber = strNumber.replace(".", "");

    //               iShift = iShift - (strNumber.length - 1);

    //               for (iCount = 0; iCount < iShift; iCount++)
    //               {
    //                    strNumber += "0";
    //               }
    //               if (iConversion > iNumberLength)
    //               {
    //                    strTempNumber = strNumber.substring(0, iSigNum);
    //                    strTempNumber += ".";
    //                    strTempNumber += strNumber.substring(iSigNum, strNumber.length);
    //                    strNumber = strTempNumber;
    //                }
    //               
    //               if (bScientificNotation == SignificantDigit.Mode.DECIMAL)
    //               {
    //                    arrReturn = [strNumber];
    //               }
    //               else
    //               {
    //                    arrReturn = [strNumber, iPower];
    //               }
    //               return arrReturn;
    //          }
    //     }
    //}

    function CalculateSignificantDigit(strNumber) {
        var iSigNum = 0;
        var iCount;
        var iDecimalPosition;
        var bIsNonZero = false;
        var bIsDecimal = false; // boolean for decimal point
        var iNumberLength = strNumber.length;
        // to check if decimal point is present
        for (iCount = 0; iCount < strNumber.length; iCount++) {
            if (strNumber.charAt(iCount) == ".") {
                bIsDecimal = true;
                iDecimalPosition = iCount;
                break;
            }
        }
        iSigNum = strNumber.length;

        // calculate significant digits for number without Decimal point
        if (bIsDecimal == true) {
            for (iCount = 0; iCount < strNumber.length; iCount++) {

                if (strNumber[iCount] == 0 || strNumber[iCount] == ".") {
                    if (strNumber[iCount] == 0) {
                        iSigNum = iSigNum - 1;
                    }
                }
                else {
                    break;

                }

            }
            iSigNum--;
            return iSigNum;
        }

        // calculate significant nos without Decimal point

        else {
            // if zeroes are present at the start
            for (iCount = 0; iCount < strNumber.length; iCount++) {
                //        

                if (strNumber[iCount] == 0 || strNumber[iCount] == ".") {
                    if (strNumber[iCount] == 0) {
                        iSigNum = iSigNum - 1;

                    }
                }
                else {
                    break;

                }

            }

            // if zeroes are present at the end
            for (iCount = strNumber.length - 1; iCount >= 0; iCount--) {
                if (strNumber[iCount] == 0 || strNumber[iCount] == ".") {
                    if (strNumber[iCount] == 0) {
                        iSigNum = iSigNum - 1;
                    }
                }
                else {
                    break;

                }
            }
            return iSigNum;
        }
    }
})();