import { ChangeDetectorRef, ElementRef, EventEmitter, HostListener, Output, ViewChild } from '@angular/core';
import { Http } from '@angular/http';
import { VgAPI } from 'videogular2/core';
import { BrowserCompatibilityService } from '../../../core/services/browser-compatibility.service';
import { AudioManager } from '../../services/AudioManager';
import { KeyboardService } from './../../services/keyboard.service';
import { MessageService } from './../../services/message.service';
import { WindowResizeService } from './../../services/window-resize.service';
import { AlertComponent } from './../alert/alert.component';
import { BaseComponent } from './../base/base.component';
(window as any).jQuery = jQuery;


export class VideoBase extends BaseComponent {
    videoData: any;
    api: VgAPI;
    videoCompleted: boolean = false;
    timeOutControl: boolean = true;
    timeOut;
    transcriptData: string;
    http: Http;
    cdr: ChangeDetectorRef;
    browserCompatibilityService: BrowserCompatibilityService;
    isIE: boolean = false;
    showHiddenControls: boolean = false;
    audioManager: AudioManager;
    @ViewChild('brAlert') alertPopup: AlertComponent;
    @ViewChild('transcript') transcriptRef: ElementRef;
    showModal: EventEmitter<boolean> = new EventEmitter();
    subtitleVisible: boolean = false;
    @HostListener('document:mousedown', ['$event'])
    onMouseDown(event: MouseEvent) {
        const target: any = event.target;
        if (!target.classList.contains('control') && !target.classList.contains('trackSelector')) {
            this.showHiddenControls = false;
        }
    }
    constructor(http: Http, cdr: ChangeDetectorRef, browserCompatibilityService: BrowserCompatibilityService) {
        super();
        this.http = http;
        this.cdr = cdr;
        this.browserCompatibilityService = browserCompatibilityService;
        if (this.browserCompatibilityService.isIE) {
            this.isIE = true;
        }

    }
    /**
 * add listeners for accessibility
 * adding listeners from ts as they are created using third party library.
 */
    addListeners() {
        document.querySelector('vg-play-pause div').addEventListener('focus', ($event) => this.onFocus($event));
        document.querySelector('vg-play-pause div').addEventListener('blur', ($event) => this.onBlur($event));

        document.querySelector('vg-scrub-bar div').addEventListener('focus', ($event) => this.onFocus($event));
        document.querySelector('vg-scrub-bar div').addEventListener('blur', ($event) => this.onBlur($event));

        document.querySelector('vg-track-selector select').addEventListener('focus', ($event) => this.onFocus($event));
        document.querySelector('vg-track-selector select').addEventListener('blur', ($event) => this.onBlur($event));

        document.querySelector('vg-mute div').addEventListener('focus', ($event) => this.onFocus($event));
        document.querySelector('vg-mute div').addEventListener('blur', ($event) => this.onBlur($event));

        document.querySelector('vg-volume div').addEventListener('focus', ($event) => this.onFocus($event));
        document.querySelector('vg-volume div').addEventListener('blur', ($event) => this.onBlur($event));

        document.querySelector('vg-fullscreen div').addEventListener('focus', ($event) => this.onFocus($event));
        document.querySelector('vg-fullscreen div').addEventListener('blur', ($event) => this.onBlur($event));


    }
    changeThirdPartyAriaLabels() {
        var attrFindQuery = [{element:'vg-play-pause div', aria:'playPause'}, { element: 'vg-mute div', aria: 'mute'} , {element: 'vg-fullscreen div', aria: 'fullscreen'}];

        for( var i = 0; i < attrFindQuery.length; i++){
            var elements = jQuery(document).find(attrFindQuery[i].element);
            for( var j = 0; j < elements.length; j++){
                elements[j].setAttribute('aria-label', this.getAccText(attrFindQuery[i].aria));
            }
        }
     }

    alertYesClicked() {

        const element = document.createElement('a');
        element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURI(this.transcriptData));
        element.setAttribute('download', 'transcript.txt');

        element.style.display = 'none';
        document.body.appendChild(element);

        element.click();

        document.body.removeChild(element);
    }

    showTranscript() {
        this.alertPopup.focusEle = this.transcriptRef;
        this.alertPopup.show();
        this.showModal.emit(true);
        const modal = document.querySelector('.modal-dialog');
        if (window.innerWidth > 700) {

            if (this.browserCompatibilityService.isAndroid && this.browserCompatibilityService.isTouch) {
                jQuery(modal).draggable({
                    containment: '.dlo-container',
                    handle: '.modal-header'
                });
            } else {
                jQuery(modal).draggable({
                    cancel: '.modal-body',
                    containment: '.dlo-container'
                });
            }
        }
    }
    hideTranscript() {
        this.showModal.emit(false);

    }

    fullscreen() {
        this.api.fsAPI.toggleFullscreen();
    }

    toggleMobileHiddenControls() {
        this.showHiddenControls = !this.showHiddenControls;
    }
    onFocus($event, callSuper?: boolean) {
        // clearTimeout(this.timeOut);
        this.timeOutControl = false;
        if (callSuper) {
            super.onFocus($event);
        }
    }
    onBlur($event, callSuper?: boolean) {
        if (callSuper) {
            super.onBlur($event);

        }
    }


    fullscreenBottonBar() {
        this.timeOutControl = false;
        clearTimeout(this.timeOut);
        this.timeOut = setTimeout(() => {
            this.timeOutControl = true;
        }, 5000);
    }

    playOverlayClicked() {
        if (this.api.state === 'paused') {
            setTimeout(() => {
                this.onPointerMove();
            }, 300);
        } else {
            clearTimeout(this.timeOut);
            this.timeOut = setTimeout(() => {
                this.timeOutControl = false;
            }, 5000);
        }
    }



    playVideo() {
        this.audioManager.pauseAllAudio();
        this.api.play();
        setTimeout(() => {
            const pauseButton: any = document.querySelector('#pauseOverlay');
            if (pauseButton) {
                pauseButton.focus();
            }
        }, 200);
    }

    pauseVideo() {
        this.api.pause();
        setTimeout(() => {
            const playButton: any = document.querySelector('#playOverlay');
            if (playButton) {
                playButton.focus();
            }
        }, 200);

    }



    checkIfIOS() {
        if (this.browserCompatibilityService.isIPad || this.browserCompatibilityService.isIPhone ||
             this.browserCompatibilityService.isIPod) {
            return true;
        } else {
            return false;
        }
    }
    getVideoState() {
        return this.api.getDefaultMedia().state;
    }

    onPointerMove() {
        return;
    }
    resumeVideo() {
        this.api.getDefaultMedia().currentTime = 0;
        this.api.play();
        this.videoCompleted = false;
        setTimeout(() => {
            const pauseButton: any = document.querySelector('#pauseOverlay');
            if (pauseButton) {
                pauseButton.focus();
            }
        }, 200);
    }

    showSubtitles() {
        const ele = document.getElementsByClassName('subtitle-icon')[0];
        if (this.api.textTracks[1].mode === 'disabled') {
            this.api.textTracks[1].mode = 'showing';
            ele.classList.add('icon-caption-on');
            ele.classList.remove('icon-closed-caption');
            this.subtitleVisible = true;
        } else {
            this.subtitleVisible = false;
            this.api.textTracks[1].mode = 'disabled';
            ele.classList.remove('icon-caption-on');
            ele.classList.add('icon-closed-caption');
        }
    }

}

