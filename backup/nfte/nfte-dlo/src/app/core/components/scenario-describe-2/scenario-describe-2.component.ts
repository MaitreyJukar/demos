import { AfterViewInit, Component, ElementRef, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { BrowserCompatibilityService } from '../../services/browser-compatibility.service';
import { KeyboardService } from '../../services/keyboard.service';
import { AudioBase } from '../audio/audio-base';
import { BaseComponent } from '../base/base.component';
import { ScenarioDescribe2Model } from './scenario-describe-2.model';

@Component({
  selector: 'app-scenario-describe-2',
  styleUrls: ['./scenario-describe-2.component.scss'],
  templateUrl: './scenario-describe-2.component.html'
})
export class ScenarioDescribe2Component extends BaseComponent implements AfterViewInit {

  @ViewChild('audioPlayer1') audioPlayer1: AudioBase;
  @ViewChild('img') img: ElementRef;
  isAudioPlaying1: boolean = false;
  @Output() screenNavigation: EventEmitter<any> = new EventEmitter();

  @Input() data: any;
  @Input() bReplayGif: boolean = true;
  @Input() model: ScenarioDescribe2Model;
  @Input() playAudioDefault: boolean = false;
  ignoreClick: boolean = false;
  @Input() imageLeft: boolean = false;

  constructor(private router: Router, private activatedRoute: ActivatedRoute, private keyboardService: KeyboardService) {
    super();
  }

  ngAfterViewInit() {
    if (this.keyboardService.playAudioDefault) {
      const subscription = this.audioPlayer1.api.getDefaultMedia().subscriptions.canPlay.subscribe(
        () => {
          this.audioPlayer1.resumeVideo();
          this.isAudioPlaying1 = true;
          subscription.unsubscribe();
        }
      )
    }
    this.audioPlayer1.api.getDefaultMedia().subscriptions.ended.subscribe(
      () => {
        this.isAudioPlaying1 = false;
      }
    );
    this.audioPlayer1.api.getDefaultMedia().subscriptions.pause.subscribe(
      () => {
        this.isAudioPlaying1 = false;
      }
    );
    this.audioPlayer1.api.getDefaultMedia().subscriptions.play.subscribe(
      () => {
        this.isAudioPlaying1 = true;
      }
    );
  }

  playPauseAudio1(audioFile) {
    if (audioFile.api.getDefaultMedia().state === 'paused') {
      this.isAudioPlaying1 = true;
      audioFile.resumeVideo();
      if (window.innerWidth > 700) {
        this.keyboardService.playAudioDefault = true;
      }
    } else if (audioFile.api.getDefaultMedia().state === 'ended') {
      this.isAudioPlaying1 = true;
      if (window.innerWidth > 700) {
        this.keyboardService.playAudioDefault = true;
      }
      audioFile.resumeVideo();
    } else if (audioFile.api.getDefaultMedia().state === 'playing') {
      this.isAudioPlaying1 = false;
      if (window.innerWidth > 700) {
        this.keyboardService.playAudioDefault = false;
      }
      audioFile.api.pause();
    }

  }

  backToScenarios() {
    this.router.navigate(['../'], { relativeTo: this.activatedRoute });
  }

  sectionChanged(index: number) {
    this.pauseAllMedia();
    if (index === 0 && this.playAudioDefault) {
      this.audioPlayer1.resumeVideo();
      this.isAudioPlaying1 = true;
    }

  }

  pauseAllMedia() {
    this.audioPlayer1.api.pause();
    this.isAudioPlaying1 = false;
  }
  replayGif() {
    if (this.ignoreClick) {
      return;
    }
    if (this.bReplayGif) {
      const imgSrc = this.data.imgSrc;
      this.img.nativeElement.src = '';
      setTimeout(() => {
        this.img.nativeElement.src = this.data.imgSrc;
      }, 0);
    }
  }
  onImageLoad() {
    this.ignoreClick = true;
    setTimeout(() => {
      this.ignoreClick = false;
    }, this.data.gifDuration);
  }
}

