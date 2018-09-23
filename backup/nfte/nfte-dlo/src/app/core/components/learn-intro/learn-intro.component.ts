import { AfterViewInit, Component, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { BrowserCompatibilityService } from '../../services/browser-compatibility.service';
import { AudioBase } from '../audio/audio-base';
import { BaseComponent } from '../base/base.component';
import { LearnIntroModel } from './learn-intro.model';

@Component({
  selector: 'app-learn-intro',
  styleUrls: ['./learn-intro.component.scss'],
  templateUrl: './learn-intro.component.html'
})
export class LearnIntroComponent extends BaseComponent implements AfterViewInit {
  @Input() model: LearnIntroModel;
  @Input() playAudioDefault: boolean = false;
  @ViewChild('audioPlayer') audioPlayer: AudioBase;
  @Output() screenNavigation = new EventEmitter();
  @Output() defaultAudio: EventEmitter<boolean> = new EventEmitter();
  isAudioPlaying: boolean = true;
  isIE: boolean = false;

  constructor(private browser: BrowserCompatibilityService) {
    super();
    this.isIE = browser.isIE;

  }

  ngAfterViewInit() {
    this.audioPlayer.api.getDefaultMedia().subscriptions.ended.subscribe(
      () => {
        this.isAudioPlaying = true;
      }
    );
    this.audioPlayer.api.getDefaultMedia().subscriptions.pause.subscribe(
      () => {
        this.isAudioPlaying = true;
      }
    );
    this.audioPlayer.api.getDefaultMedia().subscriptions.play.subscribe(
      () => {
        this.isAudioPlaying = false;
      }
    );

  }

  playAudio() {
    this.isAudioPlaying = false;
    this.defaultAudio.next(true);
    this.audioPlayer.resumeVideo();
  }
  pauseAudio(ignoreEvent?: boolean) {
    this.isAudioPlaying = true;
    if (!ignoreEvent) {
      this.defaultAudio.next(false);
    }
    this.audioPlayer.pauseVideo();
  }

}
