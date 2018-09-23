import * as Backbone from "backbone";
import * as $ from "jquery";
import * as _ from "underscore";

export declare class InteractiveDesmosAttributes {

}

export class InteractiveDesmos extends Backbone.Model {
    constructor(attr: InteractiveDesmosAttributes) {
        super(attr);
    }

    get defaultState(): string { return this.get("defaultState"); }
    set defaultState(value: string) { this.set("defaultState", value); }

    get desmosSettings(): any { return this.get("desmosSettings"); }
    set desmosSettings(value: any) { this.set("desmosSettings", value); }

    get expressions(): any { return this.get("expressions"); }
    set expressions(value: any) { this.set("expressions", value); }

    get propname(): any { return this.get("propname"); }
    set propname(value: any) { this.set("propname", value); }

    public defaults() {
        return {
            defaultState: "",
            desmosSettings: null as any,
            expressions: null as any
        };
    }

}
