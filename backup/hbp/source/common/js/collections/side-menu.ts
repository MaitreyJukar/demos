import * as Backbone from "backbone";
import ItemModel from "../models/item-model";

export default class SideMenuCollection extends Backbone.Collection<ItemModel> {
    public models: ItemModel[];
    public levelLables: string[] = ["Chapter", "Unit", "Lesson", "Topic"];

    /**
     * Returns array of given model's parents.
     * @param itemModel any child model.
     */
    getParentModels(itemModel: ItemModel) {
        let tabs = [];
        const arr: any[] = [];
        let res = this.getParentModelsByModel(itemModel, this.models, arr);
        res = res.reverse();
        tabs = res;
        return tabs;
    }

    /**
     * Recursive function returning parent models.
     * @param itemModel to map child model.
     * @param currModels currenly recusive model array.
     * @param resModels returning results array.
     */
    getParentModelsByModel(itemModel: ItemModel, currModels: ItemModel[] = this.models, resModels: ItemModel[] = []): ItemModel[] {
        for (const model of currModels) {
            if (model === itemModel) {
                resModels.push(model);
                return resModels;
            }
            if (model.subMenuItems !== void 0 && model.subMenuItems.models && model.subMenuItems.models.length !== 0) {
                const oldResLen = resModels.length;
                resModels = this.getParentModelsByModel(itemModel, model.subMenuItems.models, resModels);
                if (oldResLen !== resModels.length) {
                    resModels.push(model);
                }
            }
        }
        return resModels;
    }

    /**
     * Returns page number (model's index) from given item model.
     * @param itemModel 
     */
    getPageNoByModel(itemModel: ItemModel): number {
        return this.customRecurse(itemModel, (indexLvl: number, depth: number, parentModel?: ItemModel) => {
            if (parentModel !== void 0) {
                return indexLvl + 1;
            }
        });
    }

    /**
     * Recursive function returning parent models.
     * @param itemModel to map child model.
     * @param finalFnc function to be executed when child model is mapped, can return any thing.
     * @param currModels currenly recusive model array.
     */
    customRecurse(itemModel: ItemModel, finalFnc: (indexLvl: number, depth: number, parentModel?: ItemModel) => any = () => { }, currModels: ItemModel[] = this.models, parentModel?: ItemModel, depth = 0) {
        let counter = 0;
        for (const model of currModels) {
            if (model === itemModel) {
                return finalFnc(counter, depth, parentModel);
            }
            if (model.subMenuItems !== void 0 && model.subMenuItems.models && model.subMenuItems.models.length !== 0) {
                depth++;
                const res: any = this.customRecurse(itemModel, finalFnc, model.subMenuItems.models, model, depth);
                if (res !== void 0) {
                    return res;
                }
            }
            if (model.subMenuItems !== void 0 && model.subMenuItems.models && model.subMenuItems.models.length !== 0) {
                depth--;
            }
            counter++;
        }
    }

    /**
     * Travers recursively and executes give each function with 4 Parameters.
     * @param eachFnc executes give each function with 4 Parameters, If function returns true, recusion will end.
     * @param currModels currently recursing models.
     * @param parentModel parent model of current model.
     * @param depth depth of current recursing model.
     */
    forEachModel(eachFnc: (model: ItemModel, counter: number, depth: number, parentModel: ItemModel) => any, currModels: ItemModel[] = this.models, parentModel?: ItemModel, depth = 0) {
        let counter = 0;
        for (const model of currModels) {
            const res2: any = eachFnc(model, counter, depth, parentModel);
            if (res2 === true) {
                return res2;
            }
            if (model.subMenuItems !== void 0 && model.subMenuItems.models && model.subMenuItems.models.length !== 0) {
                depth++;
                const res: any = this.forEachModel(eachFnc, model.subMenuItems.models, model, depth);
                if (res !== void 0) {
                    return res;
                }
            }
            if (model.subMenuItems !== void 0 && model.subMenuItems.models && model.subMenuItems.models.length !== 0) {
                depth--;
            }
            counter++;
        }
    }

    /**
     * Returns corresponding `ItemModel` from given hash.
     * @param hash Valid hash url, (Not containing `#` char).
     */
    getModelByHash(hash: string) {
        let retModel: ItemModel;
        this.forEachModel((currModel, counter, depth, parentModel) => {
            if (currModel.hash === hash) {
                retModel = currModel;
                return true;
            }
        });
        return retModel;
    }

    /**
     * Returns corresponding `{ model: ItemModel, depth: number }` from given hash.
     * @param hash Valid hash url, (Not containing `#` char).
     */
    getDepthNModelByHash(hash: string) {
        let retModel: ItemModel = null;
        let retDepth: number = -1;
        this.forEachModel((currModel, counter, depth, parentModel) => {
            if (currModel.hash === hash) {
                retModel = currModel;
                retDepth = depth;
                return true;
            }
        });
        return { model: retModel, depth: retDepth };
    }
}