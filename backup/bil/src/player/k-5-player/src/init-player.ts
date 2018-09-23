import { Utilities } from "./../../../common/helper/utilities";

export abstract class PlayerInit {
    /**
     * A context starts listening to current Object <Player>.
     * @param eventName string name.
     * @param handler callback function.
     * @param context type Object context (optional).
     */
    public on(eventName: string, handler: (event?: any, data?: any) => any, context?: any): void {
        if (context !== void 0) {
            handler = handler.bind(context);
        }
        $(this).on(eventName, handler);
    }

    /**
     * Listens to event from given context.
     * @param context any type of context, prefer Object.
     * @param eventName string name.
     * @param handler callback function.
     */
    public listenTo(context: any, eventName: string, handler: (event?: any, data?: any) => any): void {
        if (typeof context.on === "function") {
            context.on(eventName, handler.bind(this));
        } else {
            Utilities.logger.warn("Your context", context, " does not support 'on' method, using binding it to jQuery's event manager.");
            $(context).on(eventName, handler.bind(this));
        }
    }

    /**
     * Triggers an event using jQuery's event maanger.
     * @param eventName string name.
     * @param data any event data (optional).
     */
    public trigger(eventName: string, data?: any): void {
        $(this).trigger(eventName, data);
    }
}
