/* globals $, _, MathUtilities */

(function(MathUtilityComponents) {
    "use strict";
    var TextEditor = MathUtilityComponents.TinyMCEEditor;
    TextEditor.DataCleaner = Backbone.Model.extend({
        // Instance properties/methods
    }, {
        //static properties/methods
        "getText": function(inputText, preventTextTrim, configType, dimensions) {
            var $tempInputHolder = $('<div>'),
                $equationHolder = null,
                latex = null,
                $this = null,
                DataCleaner = TextEditor.DataCleaner;

            $tempInputHolder.html(inputText);

            if (DataCleaner.isEmptyEditor($tempInputHolder)) {
                if (preventTextTrim) {
                    return $tempInputHolder.html();
                }
                return "";
            }

            $tempInputHolder.find('.delete-btn, .rte-media-cell-span').remove(); //remove media close button and media note

            $equationHolder = $tempInputHolder.find('.rte-equation-holder'); //remove rendered mathquill
            $equationHolder.removeClass("active-mathml");
            $equationHolder.each(function() {
                $this = $(this);
                latex = $this.attr('data-mathquill-latex') || "";
                latex = latex.replace(/</g, '&lt;').replace(/>/g, '&gt;'); /*Regex to replace less than and greater than sign*/
                $this.html(latex);
            });

            DataCleaner.textSourceMathMlCleanup($tempInputHolder); //remove rendered mathml
            $(":first", $tempInputHolder).attr('tinymce', 'true');

            $tempInputHolder.find('.rte-two-column-layout-container .rte-content-cell, .rte-two-column-layout-container .rte-media-cell').removeAttr('contenteditable');

            if (configType === TextEditor.Config.SINGLE_LINE || configType === TextEditor.Config.INLINE_EDITOR) {
                $tempInputHolder.find('br').remove();
            }

            if (dimensions) {
                $(':first', $tempInputHolder).attr({
                    "use-dimensions": true,
                    "height": dimensions.height,
                    "width": dimensions.width,
                    "backgroundcolor": dimensions.backgroundColor
                });
            } else {
                $(':first', $tempInputHolder).removeAttr('height width')
                    .attr("use-dimensions", false);
            }

            return $tempInputHolder.html();
        },

        "isEmptyEditor": function($tinyMCEBodyHtml) {
            var textContent = '',
                $twoColumnTextElm = null;
            $tinyMCEBodyHtml.find("#MathJax_Font_Test").remove();

            if ($tinyMCEBodyHtml.find('.media-holder').length === 0) {
                $twoColumnTextElm = $tinyMCEBodyHtml.find('.rte-two-column-layout-container .rte-content-cell');
                if ($twoColumnTextElm.length === 1) {
                    textContent = $twoColumnTextElm.text();
                } else {
                    textContent = $tinyMCEBodyHtml.text();
                }
            } else {
                textContent = $tinyMCEBodyHtml.html();
            }
            textContent = textContent.trim();

            // For answer field.
            if ($tinyMCEBodyHtml.find('.tei-answerfield-holder').length > 0) {
                return false;
            }

            return textContent === "";

        },

        "returnOnlyText": function(inputText) {
            var $tempDiv = $('<div />').html(inputText),
                textToReturn = null;

            if ($tempDiv.find('.rte-two-column-layout-container').length > 0) {
                textToReturn = $tempDiv.find('.rte-content-cell').html();
            } else {
                textToReturn = inputText;
            }

            textToReturn = TextEditor.DataCleaner.getText(textToReturn);
            return textToReturn;
        },

        "textSourceMathMlCleanup": function($elm) {
            var mathMlText = null,
                $mathJaxContainer = null,
                content,
                $cleanUpDiv,
                $child;

            $elm = $elm || null;
            if ($elm) {

                $elm.find('#MathJax_Font_Test, #MathJax_Message').remove();
                $elm.find('#MathJax_Hidden').parent().remove();

                $elm.find('> div[style]').each(function() {
                    $cleanUpDiv = $(this);
                    content = $cleanUpDiv.text();
                    if (!content && $cleanUpDiv.children('.media-holder').length === 0) {
                        $cleanUpDiv.remove();
                    }
                });
                $elm.children().each(function(index, child) {
                    $child = $(this);
                    if ($child.css('visibility') === 'hidden') {
                        $child.remove();
                    }
                });

                $elm.find('.math-equation').each(function() {
                    $mathJaxContainer = $(this);
                    mathMlText = $mathJaxContainer.find('script').html();
                    $mathJaxContainer.html(mathMlText);
                });
            }
        }

    });
})(MathUtilities.Components);
