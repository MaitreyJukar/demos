import * as Handlebars from "handlebars";

Handlebars.registerHelper("times", (n: number, block: any) => {
    let accum = "";
    for (let i = 0; i < n; ++i) {
        accum += block.fn(i);
    }
    return accum;
});

Handlebars.registerHelper("for", (from: number, to: number, incr: number, block: any) => {
    let accum = "";
    for (let i = from; i < to; i += incr) {
        accum += block.fn(i);
    }
    return accum;
});
