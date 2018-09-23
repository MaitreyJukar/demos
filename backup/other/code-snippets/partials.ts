/* Include in import statements */
import * as Handlebars from "handlebars";

/* Save this outside view class declaration */
declare type HandlebarsTpl = (attr?: { [x: string]: any }) => string;
const partialTemplates: { [x: string]: HandlebarsTpl } = {
    "text": require("./../../tpl/partials/text.hbs") as HandlebarsTpl,
    "custom": require("./../../tpl/partials/custom.hbs") as HandlebarsTpl,
    "image-text": require("./../../tpl/partials/image-text.hbs") as HandlebarsTpl,
    "bullet": require("./../../tpl/partials/bullet.hbs") as HandlebarsTpl,
    "scratchpad": require("./../../tpl/partials/scratchpad.hbs") as HandlebarsTpl,
    "image": require("./../../tpl/partials/image.hbs") as HandlebarsTpl,
    "assessment": require("./../../tpl/partials/assessment.hbs") as HandlebarsTpl,
    "training": require("./../../tpl/partials/training.hbs") as HandlebarsTpl,
    "kepler-video": require("./../../tpl/partials/kepler-video.hbs") as HandlebarsTpl,
    "intro-image": require("./../../tpl/partials/intro-image.hbs") as HandlebarsTpl,
    "kepler-video-scratchpad": require("./../../tpl/partials/kepler-video-scratchpad.hbs") as HandlebarsTpl,
    "kepler-video-training": require("./../../tpl/partials/kepler-video-training.hbs") as HandlebarsTpl,
    "kepler-video-assessment": require("./../../tpl/partials/kepler-video-assessment.hbs") as HandlebarsTpl
};

/* Call this method in view initialize */
private registerTemplateHelper() {
    Handlebars.registerHelper('partialTmpls', function (data: DataNode) {
        if (!data || !data.nodeType) {
            console.error("No data found");
            return "";
        }
        if (partialTemplates[data.nodeType]) {
            return partialTemplates[data.nodeType](data);
        } else {
            console.warn("Unknown partial Template found with name:", data.nodeType);
            return "";
        }
    });
}