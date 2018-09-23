import {  AfterViewInit, Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { AudioBase } from './../audio/audio-base';
import { BaseComponent } from './../base/base.component';
@Component({
  selector: 'app-tab-content',
  styleUrls: ['./tab-content.component.scss'],
  templateUrl: './tab-content.component.html'

})
export class TabContentComponent extends BaseComponent implements AfterViewInit {
  isAudioPlaying: boolean = true;

  @Input() heading: string = '';
  @Input() description: string = '';
  @Input() imgSrc: string = null;
  @Input() altText: string = '';
  @Input() audioSrc: string = '';
  @Output() screenNavigation = new EventEmitter();
  @Output() defaultAudio: EventEmitter<boolean> = new EventEmitter();
  @ViewChild('audioPlayer') audioPlayer: AudioBase;
  playAudioDefault: boolean = false;


  constructor() {
    super();
  }

  ngAfterViewInit() {
    this.audioPlayer.api.getDefaultMedia().subscriptions.ended.subscribe(
      () => {
        this.isAudioPlaying = true;
      }
    );
    this.audioPlayer.api.getDefaultMedia().subscriptions.play.subscribe(
      () => {
        this.isAudioPlaying = false;
      }
    );
    this.audioPlayer.api.getDefaultMedia().subscriptions.pause.subscribe(
      () => {
        this.isAudioPlaying = true;
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
