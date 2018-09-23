import { HostListener, Injectable } from '@angular/core';
import { ScrollDirective } from '../scroll.directive';
import { MessageService, SECTION } from '../services/message.service';
@Injectable()
export class KeyboardService {
    static activeElement: any;
    static allowFocusRect: Boolean = false;
    static keyEventsBinded: boolean = false;
    static isDragging: boolean = false;
    playAudioDefault: boolean = false;
    scrollDirective: ScrollDirective = null;

    /** keyCode - stores charcode information.
     * @param  {number array} navigationKeys - left, top, right, bottom keys.
     * @param  {number array} systemKeys - shift, control and alt key.
     * @param  {number array} manipulationKeys - backspace, tab, end, home and delete.
     * @param  {number array} numberKeys - between 0 to 9.
     */
    keyCode = { systemKeys: [16, 17, 18], manipulationKeys: [8, 9], numberKeys: [48, 49, 50, 51, 52, 53, 54, 55, 56, 57] };

    static setActiveElement(target) {
        if (target !== null && target && target !== KeyboardService.activeElement) {
            this.setFocusClassToElement(target);
            KeyboardService.activeElement = target;
        }
    }

    static setFocusClassToElement(element) {
        if (typeof (element) !== 'undefined'
            && element !== null
            && element.classList) {
            while (!KeyboardService.isVisible(element) && element.getAttribute('passFocus') === 'true') {
                element = element.parentElement;
            }
            const el = document.getElementsByClassName('showFocusRect');
            for (let i = 0; i < el.length; i++) {
                el[i].classList.remove('showFocusRect');
            }
            if (KeyboardService.allowFocusRect) {
                if (!element.classList.contains('showFocusRect')) {
                    element.classList.add('showFocusRect');
                }
                if (element.classList.contains('hideFocusRect')) {
                    element.classList.remove('hideFocusRect');
                }
            } else {
                if (!element.classList.contains('hideFocusRect')) {
                    element.classList.add('hideFocusRect');
                }
                if (element.classList.contains('showFocusRect')) {
                    element.classList.remove('showFocusRect');
                }
            }
        }
    }

    static isVisible(element) {
        return jQuery(element).is(':visible') && parseInt(jQuery(element).css('opacity')) !== 0 && jQuery(element).css('visibility') !== 'none' && jQuery(element).height() !== 0 && jQuery(element).width() !== 0;
    }

    constructor() {
        if (KeyboardService.keyEventsBinded === false) {
            const self = this;
            KeyboardService.keyEventsBinded = true;
            document.addEventListener('keydown', function (event) { self.handleKeyboardEvent(event) });
            document.addEventListener('touchstart', function (event) { self.handleTouchEvent(event) });
            document.addEventListener('mousedown', function (event) { self.handleTouchEvent(event) });
            document.addEventListener('pointerdown', function (event) { self.handleTouchEvent(event) });
        }
    }

    /** validateInput - checks if char typed is number.
     * @param  {string} key - key which is pressed.
     * @param  {number} charcode - charcode of the key which is pressed.
     * @param  {boolean} shift -true if shift is pressed.
     * @param  {boolean} alt - true if alt is pressed.
     * @param  {boolean} ctrl - true if ctrl is pressed.
     * @param  {InputType} inputtype - type of input i.e. number ot text
     * @returns boolean
     */
    validateInput(key: string, charcode: number, shift: boolean, alt: boolean, ctrl: boolean, inputtype: InputType): boolean {

        let result = true;

        switch (inputtype) {

            case InputType.number:
                {
                    result = false;

                    if (this.validateBasicInput(key, charcode, shift, alt, ctrl) || this.keyCode.numberKeys.indexOf(charcode) !== -1) {
                        result = true;
                    }
                }
                break;

            default:
                break;
        }
        return result;

    }
    /** validateBasicInput - checks if key pressed provides basic functionalities of keyboard.
     * @param  {string} key - key which is pressed.
     * @param  {number} charcode - charcode of the key which is pressed.
     * @param  {boolean} shift -true if shift is pressed.
     * @param  {boolean} alt - true if alt is pressed.
     * @param  {boolean} ctrl - true if ctrl is pressed.
     * @returns boolean
     */
    validateBasicInput(key: string, charcode: number, shift: boolean, alt: boolean, ctrl: boolean): boolean {
        if (this.keyCode.systemKeys.indexOf(charcode) !== -1 || this.keyCode.manipulationKeys.indexOf(charcode) !== -1) {
            return true;
        }

        return false;
    }

    handleTouchEvent(event: any) {
        KeyboardService.allowFocusRect = false;
        KeyboardService.setActiveElement(event.target);
    }

    handleTabAccessibility(tablist: HTMLElement, keyCode: number, currentTab: HTMLElement) {
        const tabs = jQuery(tablist).find('[role="tab"]');
        let index = tabs.index(currentTab);
        index = tabs.index(currentTab);
        if (KeyCodes.left === keyCode) {
            do {
                index--;
                if (index === -1) {
                    index = tabs.length - 1;
                }
            } while (!jQuery(tabs[index]).is(':visible'));

        } else if (KeyCodes.right === keyCode) {
            do {
                index++;
                if (index === tabs.length) {
                    index = 0;
                }
            } while (!jQuery(tabs[index]).is(':visible'));
        }
        tabs[index].focus();
        KeyboardService.activeElement = tabs[index];
    }


    handleKeyboardEvent(event: KeyboardEvent) {
        KeyboardService.allowFocusRect = true;
        KeyboardService.setFocusClassToElement(KeyboardService.activeElement);
        const x: number = event.keyCode;
        const ele: any = event.target;
        if (!KeyboardService.activeElement && ele.tagName !== 'INPUT' && ele.tagName !== 'BUTTON') {
            if (this.stopEvent(x, event.target) && x === KeyCodes.space) {
                event.preventDefault();
            }
        }
        if (x === KeyCodes.down || x === KeyCodes.up) {
            if (this.stopEvent(x, event.target)) {
                event.preventDefault();
            }
        } else if (x === KeyCodes.pageDown) {
            event.preventDefault();
            this.scrollDirective.moveSectionDown();
        } else if (x === KeyCodes.pageUp) {
            event.preventDefault();
            this.scrollDirective.moveSectionUp();
        } else if (x === KeyCodes.enter || x === KeyCodes.space) {
            if (KeyboardService.activeElement) {
                KeyboardService.activeElement.click();
                event.preventDefault();
            }
        } else if (x === KeyCodes.left) {
            if (ele.getAttribute('role') === 'tab') {
                const tablist = ele.closest('[role = "tablist"]');
                this.handleTabAccessibility(tablist, x, ele);
            }
        } else if (x === KeyCodes.right) {
            if (ele.getAttribute('role') === 'tab') {
                const tablist = ele.closest('[role = "tablist"]');
                this.handleTabAccessibility(tablist, x, ele);

            }
        }
    }

    stopEvent(keycode, element): boolean {
        if (MessageService.section === SECTION.TAKE_QUIZ || element.tagName === 'SELECT') {
            return false;
        }
        if (element.getAttribute('role') === ROLE[0].toLowerCase()) {
            return false;
        }
        return true;
    }
}


export enum InputType {
    text = 0,
    number = 1
}

export enum KeyCodes {
    enter = 13,
    space = 32,
    down = 40,
    up = 38,
    pageUp = 33,
    pageDown = 34,
    left = 37,
    right = 39,
    tab = 9
}

export enum ROLE {
    FLIPCARD = 0,
    BUTTON = 1
}
