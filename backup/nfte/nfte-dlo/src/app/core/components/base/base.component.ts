import { ElementRef, EventEmitter, Input, Output } from '@angular/core';
import { AccessibilityService } from './../../services/accessibility.service';
import { KeyboardService } from './../../services/keyboard.service';
import { MessageService } from './../../services/message.service';

export class BaseComponent {

    /**
     * Set component Accessible
     * @override
     */
    setAccessible(array, useCommon?: boolean, commonId?: string): void {
        if (useCommon && commonId) {
            for (let j = 0; j < array.length; j++) {
                const elem = document.getElementById(array[j]);
                if (elem) {
                    const properties: Object = AccessibilityService.getAccData(commonId);

                    const propLength = Object.keys(properties).length;
                    for (let i = 0; i < propLength; i++) {
                        elem.setAttribute(Object.keys(properties)[i], properties[Object.keys(properties)[i]]);
                    }
                }
            }


        } else {
            for (let j = 0; j < array.length; j++) {
                const elem = document.getElementById(array[j]);
                if (elem) {
                    const properties: Object = AccessibilityService.getAccData(array[j]);

                    const propLength = Object.keys(properties).length;
                    for (let i = 0; i < propLength; i++) {
                        elem.setAttribute(Object.keys(properties)[i], properties[Object.keys(properties)[i]]);
                    }
                }
            }
        }
    };

    /**
     * handle onfocus event
     * @param  {} event
     */
    onFocus(event): void {
        KeyboardService.setActiveElement(event.target);
    }

    /**
     * handle on blur event
     * @param  {} event
     */
    onBlur(event) {
        KeyboardService.setActiveElement(null);
    }

    /**
     * set dimensions on scroll
     */
    onScroll() { return }

    /**
     * set dimensions on resize
     */
    onResize() { return }

    getAccText(id: string) {
        return AccessibilityService.getAccData(id);
    }

    getScrollBarWidth() {
        const inner = document.createElement('p');
        inner.style.width = '100%';
        inner.style.height = '200px';

        const outer = document.createElement('div');
        outer.style.position = 'absolute';
        outer.style.top = '0px';
        outer.style.left = '0px';
        outer.style.visibility = 'hidden';
        outer.style.width = '200px';
        outer.style.height = '150px';
        outer.style.overflow = 'hidden';
        outer.appendChild(inner);

        document.body.appendChild(outer);
        const w1 = inner.offsetWidth;
        outer.style.overflow = 'scroll';
        let w2 = inner.offsetWidth;
        if (w1 === w2) w2 = outer.clientWidth;

        document.body.removeChild(outer);

        return (w1 - w2);
    }
}
