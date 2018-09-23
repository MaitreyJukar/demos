interface EventMap {
    [id: string]: any;
}

/**
 * Abstract class only to be extended.
 * @has useful Event functions uses jQuery's event manager.
 */
export abstract class Manager<EMap extends EventMap> {
    constructor(attr?: any) {
        // Empty constructor
    }

    /**
     * Adds listener with given event name and callback.
     * @param eventName Valid event name from CustomEventMap
     * @param callback Function containing event obj and CustomEventMap data.
     * @param context any context for binding purpose.
     */
    // tslint:disable-next-line:max-line-length
    public on(eventName: any, callback: (event: JQuery.Event<EMap>, data: EMap[any]) => any, context?: any) {
        return $(this).on(eventName, callback, context);
    }

    /**
     * Triggers Custom Event with valid data.
     * @param eventName Valid event name from CustomEventMap
     * @param data Valid CustomEventMap data.
     */
    protected trigger(eventName: any, data: EMap[any]) {
        return $(this).trigger(eventName, data);
    }
}
