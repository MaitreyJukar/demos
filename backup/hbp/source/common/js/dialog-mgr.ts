import * as DialogModelPckg from "./models/dialog";
import * as DialogViewPckg from "./views/dialog";
import { Manager } from "./base-mgr";

export interface Attributes {
    DialogModels?: Array<DialogModelPckg.Dialog | DialogModelPckg.Attributes>;
    DialogViews?: Array<DialogViewPckg.Dialog | Backbone.ViewOptions<DialogModelPckg.Dialog>>;
    displayOneDialogAtOnce?: boolean;
}

export interface CustomEventMap {
    "button-clicked": { event: JQuery.Event; dialogMgr: DialogManager; dialogView: DialogViewPckg.Dialog; btnId: string; };
    "state-changed": { dialogMgr: DialogManager; dialogView: DialogViewPckg.Dialog; };
}

export class DialogManager extends Manager<CustomEventMap> {
    public dialogModels: DialogModelPckg.Dialog[];
    public dialogViews: DialogViewPckg.Dialog[];
    public displayOneDialogAtOnce: boolean;

    constructor(attr: Attributes = {}) {
        super(attr);
        attr = $.extend(true, this.defaults(), attr);
        $.extend(true, this, attr);

        if (this.dialogModels.length !== this.dialogViews.length) {
            console.warn("[Invalid Construction] number of Dialog models and views should be same. found:", this.dialogModels.length, this.dialogViews.length);
            return;
        }

        for (let i = 0; i < this.dialogModels.length; i++) {
            if (!(this.dialogModels[i] instanceof DialogModelPckg.Dialog)) {
                this.dialogModels[i] = new DialogModelPckg.Dialog(this.dialogModels[i]);
            }
        }
        for (let i = 0; i < this.dialogViews.length; i++) {
            if (!(this.dialogViews[i] instanceof DialogViewPckg.Dialog)) {
                $.extend(true, this.dialogViews[i], { model: this.dialogModels[i] });
                this.dialogViews[i] = new DialogViewPckg.Dialog(this.dialogViews[i]);
            }
        }

        this.attachViewListeners();
        this.attachModelListeners();
    }

    defaults() {
        return {
            dialogModels: [] as DialogModelPckg.Dialog[],
            DialogViews: [] as DialogViewPckg.Dialog[],
            displayOneDialogAtOnce: true
        };
    }

    attachViewListeners() {
        for (const view of this.dialogViews) {
            view.addListener("button-clicked", this.onDialogBtnClicked, this);
        }
    }

    attachModelListeners() {
        for (const model of this.dialogModels) {
            model.on("change:state", this.onDialogStateChanged.bind(this, model));
        }
    }

    /**
     * Returns Dialog view from model.
     * @param model model for comparison.
     */
    public getDialogViewFromModel(model: DialogModelPckg.Dialog) {
        for (const view of this.dialogViews) {
            if (view.model === model) {
                return view;
            }
        }
    }

    /**
     * Handler for Dialogs any button clicked event.
     * Triggers 'button-clicked' event.
     * @param data button clicked event data.
     */
    private onDialogBtnClicked(data: DialogViewPckg.CustomEventMap["button-clicked"]) {
        if (data.btnId === void 0) {
            data.btnId = "";
        }
        this.trigger("button-clicked", { event: data.event, dialogView: data.dialogView, dialogMgr: this, btnId: data.btnId });
    }

    /**
     * Handler for Dialog model's state event.
     * Triggers 'state-changed' event.
     * @param dialogModel The one whos state was changed.
     */
    private onDialogStateChanged(dialogModel: DialogModelPckg.Dialog) {
        this.trigger("state-changed", { dialogView: this.getDialogViewFromModel(dialogModel), dialogMgr: this });
        if (dialogModel.state === DialogModelPckg.eState.SHOWN && this.displayOneDialogAtOnce) {
            for (const model of this.dialogModels) {
                if (model !== dialogModel) {
                    model.state = DialogModelPckg.eState.HIDDEN;
                }
            }
        }
    }

    /**
     * Retruns Dialog model from models but its view's id.
     * @param id View's id.
     */
    public getDialogModelById(id: string): DialogModelPckg.Dialog {
        for (const view of this.dialogViews) {
            if (view.id === id) {
                return view.model;
            }
        }
    }

    /**
     * Shows Dialog by its view id.
     * @param id View's id.
     * @return false if Dialog not found, otherwise new state.
     */
    public showDialogById(id: string) {
        return this.changeDialogStateById(id, DialogModelPckg.eState.SHOWN);
    }

    /**
     * Hides Dialog by its view id.
     * @param id View's id.
     * @return false if Dialog not found, otherwise new state.
     */
    public hideDialogById(id: string) {
        return this.changeDialogStateById(id, DialogModelPckg.eState.HIDDEN);
    }

    /**
     * Hides all Dialogs.
     * Sets all Dialog model's state to 'HIDDEN'.
     */
    public hideAllDialogs() {
        for (const model of this.dialogModels) {
            model.state = DialogModelPckg.eState.HIDDEN;
        }
    }

    /**
     * Finds Dialog model from its view's id.
     * Sets Dialog model's state.
     * @param id Dialog view's id.
     * @param state new state to be set.
     * @return false if Dialog not found, otherwise new state.
     */
    private changeDialogStateById(id: string, state: DialogModelPckg.eState) {
        if (this.getDialogModelById(id)) {
            return this.getDialogModelById(id).state = state;
        } else {
            return false;
        }
    }
}