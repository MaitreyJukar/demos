import * as Backbone from "backbone";
import * as _ from "underscore";
import { ContextMenuModel } from "../model/context-menu";

export class MenuItems extends Backbone.Collection<ContextMenuModel> {
    public models: ContextMenuModel[];
    public expanded: boolean;

    constructor(models?: ContextMenuModel[] | object[], options?: any) {
        const tempModels = [];
        for (const model of models) {
            if (!(model instanceof ContextMenuModel)) {
                tempModels.push(new ContextMenuModel(model));
            } else {
                tempModels.push(model);
            }
        }
        super(tempModels, options);
    }
}
