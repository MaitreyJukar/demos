import { Utilities } from "./../../../helper/utilities";
import { Manager } from "./base-mgr";
import * as PopupModelPckg from "./models/popup";
import * as PopupViewPckg from "./views/popup";

export interface Attributes {
    availableLangs?: string[];
    localizationData?: LocData;
    popupModels?: Array<PopupModelPckg.Popup | PopupModelPckg.Attributes>;
    popupViews?: Array<PopupViewPckg.Popup | Backbone.ViewOptions<PopupModelPckg.Popup>>;
    displayOnePopupAtOnce?: boolean;
}

export interface CustomEventMap {
    "button-clicked": { event: JQuery.Event; popupMgr: PopupManager; popupView: PopupViewPckg.Popup; btnId: string };
    "state-changed": { popupMgr: PopupManager; popupView: PopupViewPckg.Popup };
}

export interface LanguageData {
    buttonLables: string[];
    text: string;
}

export interface LocData {
    langs: { [id: string]: LanguageData[] };
}

export class PopupManager extends Manager<CustomEventMap> {
    public availableLangs: string[] = [];
    public localizationData: LocData;
    public popupModels: PopupModelPckg.Popup[];
    public popupViews: PopupViewPckg.Popup[];
    public displayOnePopupAtOnce: boolean;

    constructor(attr: Attributes = {}) {
        super(attr);
        attr = $.extend(true, this.defaults(), attr);
        $.extend(true, this, attr);

        if (this.popupModels.length !== this.popupViews.length) {
            Utilities.logger.warn("WARNING! number of popup models and views should be same. found:",
                this.popupModels.length,
                this.popupViews.length);
            return;
        }

        for (let i = 0; i < this.popupModels.length; i++) {
            if (!(this.popupModels[i] instanceof PopupModelPckg.Popup)) {
                this.popupModels[i] = new PopupModelPckg.Popup(this.popupModels[i]);
            }
        }
        for (let i = 0; i < this.popupViews.length; i++) {
            if (!(this.popupViews[i] instanceof PopupViewPckg.Popup)) {
                $.extend(true, this.popupViews[i], { model: this.popupModels[i] });
                this.popupViews[i] = new PopupViewPckg.Popup(this.popupViews[i]);
            }
        }

        this.attachViewListeners();
        this.attachModelListeners();
    }

    public defaults() {
        return {
            availableLangs: [] as string[],
            displayOnePopupAtOnce: true,
            localizationData: null as LocData,
            popupModels: [] as PopupModelPckg.Popup[],
            popupViews: [] as PopupViewPckg.Popup[]
        };
    }

    public attachViewListeners() {
        for (const view of this.popupViews) {
            view.addListener("button-clicked", this.onPopupBtnClicked, this);
        }
    }

    public attachModelListeners() {
        for (const model of this.popupModels) {
            model.on("change:state", this.onPopupStateChanged.bind(this, model));
        }
    }

    /**
     * Returns popup view from model.
     * @param model model for comparison.
     */
    public getPopupViewFromModel(model: PopupModelPckg.Popup) {
        for (const view of this.popupViews) {
            if (view.model === model) {
                return view;
            }
        }
    }

    /**
     * Retruns popup model from models but its view's id.
     * @param id View's id.
     */
    public getPopupModelById(id: string): PopupModelPckg.Popup {
        for (const view of this.popupViews) {
            if (view.id === id) {
                return view.model;
            }
        }
    }

    /**
     * Shows popup by its view id.
     * @param id View's id.
     * @return false if popup not found, otherwise new state.
     */
    public showPopupById(id: string) {
        return this.changePopupStateById(id, PopupModelPckg.Popup.eState.SHOWN);
    }

    /**
     * Hides popup by its view id.
     * @param id View's id.
     * @return false if popup not found, otherwise new state.
     */
    public hidePopupById(id: string) {
        return this.changePopupStateById(id, PopupModelPckg.Popup.eState.HIDDEN);
    }

    /**
     * Hides all popups.
     * Sets all popup model's state to 'HIDDEN'.
     */
    public hideAllPopups() {
        for (const model of this.popupModels) {
            model.state = PopupModelPckg.eState.HIDDEN;
        }
    }

    /**
     * Sets data as per given languages.
     * @param language valid string from available data.
     */
    public setLanguage(language: string) {
        for (const [index, view] of this.popupViews.entries()) {
            const newText = this.localizationData.langs[language][index].text;
            const buttonData = this.localizationData.langs[language][index].buttonLables;
            view.model.text = newText;
            for (const [j, bLabel] of buttonData.entries()) {
                view.model.buttonsData[j].label = bLabel;
            }
            view.updateButtons();
        }
    }

    /**
     * Handler for popups any button clicked event.
     * Triggers 'button-clicked' event.
     * @param data button clicked event data.
     */
    private onPopupBtnClicked(data: PopupViewPckg.CustomEventMap["button-clicked"]) {
        if (data.btnId === void 0) {
            data.btnId = "";
        }
        this.trigger("button-clicked", { event: data.event, popupView: data.popupView, popupMgr: this, btnId: data.btnId });
    }

    /**
     * Handler for popup model's state event.
     * Triggers 'state-changed' event.
     * @param popupModel The one whos state was changed.
     */
    private onPopupStateChanged(popupModel: PopupModelPckg.Popup) {
        this.trigger("state-changed", { popupView: this.getPopupViewFromModel(popupModel), popupMgr: this });
        if (popupModel.state === PopupModelPckg.Popup.eState.SHOWN) {
            for (const model of this.popupModels) {
                if (model !== popupModel) {
                    model.state = PopupModelPckg.Popup.eState.HIDDEN;
                }
            }
        }
    }

    /**
     * Finds popup model from its view's id.
     * Sets popup model's state.
     * @param id popup view's id.
     * @param state new state to be set.
     * @return false if popup not found, otherwise new state.
     */
    private changePopupStateById(id: string, state: PopupModelPckg.eState) {
        if (this.getPopupModelById(id)) {
            return this.getPopupModelById(id).state = state;
        } else {
            return false;
        }
    }
}
