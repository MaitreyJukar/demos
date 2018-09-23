import { AfterViewInit, Component, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { BrowserCompatibilityService } from '../../services/browser-compatibility.service';
import { BaseComponent } from '../base/base.component';
import {AudioBase} from './../audio/audio-base';

@Component({
  selector: 'app-learn-card-question',
  styleUrls: ['./learn-card-question.component.scss'],
  templateUrl: './learn-card-question.component.html'
})

export class LearnCardQuestionComponent extends BaseComponent implements AfterViewInit {
  isAudioPlaying = true;
  @Input() model;
  @Input() playAudioDefault: boolean = false;
  @Output() screenNavigation: EventEmitter<any> = new EventEmitter();
  @Input() screenUp: boolean = false;
  @Output() defaultAudio: EventEmitter<boolean> = new EventEmitter();
  @ViewChild('audioPlayer') audioPlayer: AudioBase;
  constructor() {
    super();
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
