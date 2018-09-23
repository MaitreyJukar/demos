import {
  ChangeDetectorRef, Component, ElementRef, EventEmitter, Input, OnDestroy, Output, ViewChild,
} from '@angular/core';
import { Http } from '@angular/http';
import { AudioBase } from 'app/core/components/audio/audio-base';
import { VgAPI } from 'videogular2/core';
import { AudioManager } from '../../services/AudioManager';
import { BrowserCompatibilityService } from '../../services/browser-compatibility.service';
import { KeyboardService } from '../../services/keyboard.service';
import { WindowResizeService } from '../../services/window-resize.service';

@Component({
  selector: 'app-audio',
  styleUrls: ['./audio.component.scss'],
  templateUrl: './audio.component.html',
})
export class AudioComponent extends AudioBase implements OnDestroy {
  data;
  @Input() set audioSrc(src: string) {
    this.audioData = {
      instructionText: 'Instructions',
      src: './assets/' + src,
      type: 'audio/mp3',
    }
  }
  @Input() transcript: string;
  constructor(http: Http, cdr: ChangeDetectorRef, browserCompatibilityService: BrowserCompatibilityService, audioManager: AudioManager,
    private resizeService: WindowResizeService, private keyboardService: KeyboardService) {
    super(http, cdr, browserCompatibilityService);
    this.audioManager = audioManager;
    this.audioManager.allPlayers.push(this);
    this.resizeService.register(this);
  }

  ngOnDestroy() {
    this.resizeService.deregister(this);
  }

  onResize() {
    if (window.innerWidth < 750) {
      this.playDefault = false;
      this.keyboardService.playAudioDefault = false;
    }
  }

  onPlayerReady(api: VgAPI) {
    this.api = api;
    if (this.playDefault) {
      this.playVideo();
    }
    this.api.fsAPI.nativeFullscreen = false;
    this.addListeners();
    this.changeThirdPartyAriaLabels();
    if (this.transcript) {
      this.http.get('assets/' + this.transcript)
        .subscribe((res) => {
          this.transcriptData = res.text();
        });

    }


    if (this.data && this.data.currentVideoTime) {
      const canPlaySubscription = this.api.getDefaultMedia().subscriptions.canPlay.subscribe(
        () => {
          this.api.getDefaultMedia().currentTime = this.data.currentVideoTime;
          canPlaySubscription.unsubscribe();
        }
      );
    }

    this.api.getDefaultMedia().subscriptions.ended.subscribe(
      () => {
        // Set the video to the beginning
        // this.api.getDefaultMedia().currentTime = 0;
        this.videoCompleted = true;
        if (this.api && this.api.fsAPI.isFullscreen) {
          this.api.fsAPI.toggleFullscreen();
        }
      }
    );
    this.cdr.detectChanges();
  }

  onPointerMove() {
    if (this.api && this.api.state !== 'paused') {
      this.timeOutControl = false;
      clearTimeout(this.timeOut);
      this.timeOut = setTimeout(() => {
        this.timeOutControl = true;
      }, 5000);
    }
  }

}
