/**
 * Abstract class only to be extended.
 * @has useful Event functions uses jQuery's event manager.
 */
export abstract class Manager<EventMap extends { [id: string]: any; }> {
    constructor(attr?: any) {

    }

    /**
     * Adds listener with given event name and callback.
     * @param eventName Valid event name from CustomEventMap
     * @param callback Function containing event obj and CustomEventMap data.
     * @param context any context for binding purpose.
     */
    public on<E extends keyof EventMap>(eventName: E, callback: (event: JQuery.Event<Manager<EventMap>>, data: EventMap[E]) => any, context?: any) {
        return $(this).on(eventName, callback, context);
    }

    /**
     * Triggers Custom Event with valid data.
     * @param eventName Valid event name from CustomEventMap
     * @param data Valid CustomEventMap data.
     */
    protected trigger<E extends keyof EventMap>(eventName: E, data: EventMap[E]) {
        return $(this).trigger(eventName, data);
    }
}