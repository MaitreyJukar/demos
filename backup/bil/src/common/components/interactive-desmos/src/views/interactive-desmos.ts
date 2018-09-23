import * as Backbone from "backbone";
import * as _ from "underscore";
import "../../css/interactive-desmos.styl";
import * as InteractiveDesmosPkg from "../models/interactive-desmos";

const interactiveDesmosTemplate: (attr?: any) => string = require("./../../tpl/interactive-desmos.hbs");

declare let Desmos: any;

export class InteractiveDesmos extends Backbone.View<InteractiveDesmosPkg.InteractiveDesmos> {
    public desmos: any;

    constructor(attr?: Backbone.ViewOptions<InteractiveDesmosPkg.InteractiveDesmos>) {
        super(attr);
        this.render();
    }

    public events(): Backbone.EventsHash {
        return {};
    }

    public render(): InteractiveDesmos {
        this.$el.html(interactiveDesmosTemplate());
        this.renderDesmosCalculator(this.model.toJSON(), $(".interactive-desmos")[0]);
        return this;
    }

    public renderDesmosCalculator(desmosData: any, desmosDiv: HTMLElement): void {
        const settings = desmosData.desmosSettings && desmosData.desmosType !== "geometry" ? desmosData.desmosSettings : {};

        const desmos = Desmos.GraphingCalculator(desmosDiv, settings);

        this.desmos = desmos;
        if (this.model.defaultState) {
            $.getJSON(this.model.defaultState, (resp: any) => {
                desmos.setState(resp.state);
                this.setInitialExpression();
            });
        } else {
            this.setInitialExpression();
        }
        desmos.observeEvent("change", () => {
            if (desmos.isAnyExpressionSelected) {
                // Handle change event
            }
        });
    }

    public setInitialExpression() {
        if (this.model.expressions[0]) {
            this.desmos.setExpression(this.model.expressions[0]);
        }
    }

    public onUpdateQuestion(questionIndex: number) {
        const desmosData = this.model.toJSON();
        const expressionList = desmosData.expressions;
        let expression;

        if (expressionList && expressionList[questionIndex]) {
            expression = expressionList[questionIndex];
            if (expression.remove) {
                for (const id of expression.remove) {
                    this.desmos.removeExpression({ id });
                }
                delete expression.remove;
            }
            this.desmos.setExpression(expression);
            this.$el.data("question-index", questionIndex);
        }

    }
}
