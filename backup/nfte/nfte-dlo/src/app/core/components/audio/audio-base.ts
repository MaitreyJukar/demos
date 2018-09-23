import { ChangeDetectorRef, ElementRef, EventEmitter, HostListener, Input, Output, ViewChild } from '@angular/core';
import { Http } from '@angular/http';
import { VgAPI } from 'videogular2/core';
import { AudioManager } from '../../services/AudioManager';
import { BrowserCompatibilityService } from '../../services/browser-compatibility.service';
import { KeyboardService } from './../../services/keyboard.service';
import { MessageService } from './../../services/message.service';
import { WindowResizeService } from './../../services/window-resize.service';
import { AlertComponent } from './../alert/alert.component';

import { BaseComponent } from './../base/base.component';

export class AudioBase extends BaseComponent {
    static audioPlayers: Array<AudioBase> = [];

    audioData: any;
    videoData: any;
    api: VgAPI;
    videoCompleted: boolean = false;
    timeOutControl: boolean = true;
    timeOut;
    transcriptData: string;
    http: Http;
    cdr: ChangeDetectorRef;
    isIE: boolean = false;
    showHiddenControls: boolean = false;
    browserCompatibilityService: BrowserCompatibilityService;
    audioManager: AudioManager;
    @Input() playDefault: boolean = true;

    @ViewChild('brAlert') alertPopup: AlertComponent;
    @ViewChild('transcript') transcriptRef: ElementRef;

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

    onFocus($event, callSuper?: boolean) {
        clearTimeout(this.timeOut);
        this.timeOutControl = false;
        if (callSuper) {
            super.onFocus($event);
        }
    }
    onBlur($event, callSuper?: boolean) {
        this.onPointerMove();
        if (callSuper) {
            super.onBlur($event);

        }
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
        for (let i = 0; i < AudioBase.audioPlayers.length; i++) {
            AudioBase.audioPlayers[i].api.pause();
        }
        AudioBase.audioPlayers.push(this);
        this.api.play();
        setTimeout(() => {
            const pauseButton: any = document.querySelector('#pauseOverlay');
            if (pauseButton) {
                pauseButton.focus();
            }
        }, 200);
    }

    pauseVideo() {
        const index = AudioBase.audioPlayers.indexOf(this);
        AudioBase.audioPlayers.splice(index, 1);
        this.api.pause();
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
        for (let i = 0; i < AudioBase.audioPlayers.length; i++) {
            AudioBase.audioPlayers[i].api.pause();
        }
        if (!this.audioManager.playedOnce) {
            this.audioManager.playAllAudio(this);
            this.audioManager.playedOnce = true;
        }
        AudioBase.audioPlayers.push(this);
        this.audioManager.pauseAllVideo();

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

    addListeners() {
        document.querySelector('vg-play-pause div').addEventListener('focus', ($event) => this.onFocus($event));
        document.querySelector('vg-play-pause div').addEventListener('blur', ($event) => this.onBlur($event));
    }
    changeThirdPartyAriaLabels() {
        document.querySelector('vg-play-pause div').setAttribute('aria-label', this.getAccText('playPause'));
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
        const modal = document.querySelector('.modal-dialog');
        if (window.innerWidth > 700) {
            jQuery(modal).draggable({
                cancel: '.modal-body',
                containment: '.dlo-container'
            });
        }
    }

    playPauseAudio() {
        if (this.api.getDefaultMedia().state === 'paused') {
            this.playVideo();
        } else {
            this.pauseVideo();
        }
    }
}
