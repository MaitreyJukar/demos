import { AfterViewInit, HostListener, Injectable, OnDestroy } from '@angular/core';
import { BaseComponent } from './../components/base/base.component';
import { BrowserCompatibilityService } from './browser-compatibility.service';

@Injectable()
export class WindowResizeService implements OnDestroy {
    // array of components opted to listen to resize event
    arrComponents: Array<BaseComponent> = [];
    oldWidth: number = 0;
    scroll: Boolean = true;
    constructor(private browserCompatibilityService: BrowserCompatibilityService) {
        window.addEventListener('resize', this.resizeWindow.bind(this));
        //  window.addEventListener('scroll', this.onScroll.bind(this), true);
    }



    onScroll() {
        if (this.scroll) {
            setTimeout((me) => {
                me.scroll = true;
                const arrLength = this.arrComponents.length;
                if (arrLength !== 0) {
                    for (let i = 0; i < arrLength; i++) {
                        this.arrComponents[i].onScroll();
                    }
                }
            }, 100, this)
        }
        this.scroll = false;
    }

    resizeWindow(forceResize?) {
        const arrLength = this.arrComponents.length;
        if (this.oldWidth === window.innerWidth && !forceResize) {
            return;
        }

        this.oldWidth = window.innerWidth;
        if (arrLength !== 0) {
            for (let i = 0; i < arrLength; i++) {
                this.arrComponents[i].onResize();
            }
        }
    }



    deregister(component: BaseComponent) {
        const index = this.arrComponents.indexOf(component);
        this.arrComponents.splice(index);
    }

    /**
     * add component to array to listen to resize event
     * @param  {BaseComponent} component
     */

    register(component: BaseComponent) {
        this.arrComponents.push(component);
    }

    ngOnDestroy() {
        window.removeEventListener('resize', this.resizeWindow);
    }
}

