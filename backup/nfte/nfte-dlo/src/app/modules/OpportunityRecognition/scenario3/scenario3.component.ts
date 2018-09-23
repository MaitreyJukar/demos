// angular
import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

// our components
import { AudioBase } from 'app/core/components/audio/audio-base';
import { BaseComponent } from 'app/core/components/base/base.component';
import { LearnModel } from '../../../core/components/learn/learn.model';
import { CustomButtonComponent } from './../../../core/components/custom-button/custom-button.component';
import { DNDModel } from './../../../core/components/dnd-base/dnd.model';
import { DragAndDrop2Component } from './../../../core/components/drag-and-drop-2/drag-and-drop-2.component';
import { responseType } from './../../../core/components/question/question.model';
import { MessageService } from './../../../core/services/message.service';


@Component({
  selector: 'app-scenario3',
  styleUrls: ['./scenario3.component.scss'],
  templateUrl: './scenario3.component.html'
})

export class Scenario3Component extends BaseComponent implements AfterViewInit, OnInit {
  data;
  scenesBoolean: Array<Boolean>
  showButton: boolean = false;
  dndModel: DNDModel;
  activeScene: number = 0;
  private responseType = responseType;
  @ViewChild('dnd') dnd: DragAndDrop2Component;

  @ViewChild('continueButton') continueButton: CustomButtonComponent;
  @ViewChild('endScenarioButton') endScenarioButton: CustomButtonComponent;
  @ViewChild('audioPlayer') audioPlayer: AudioBase;
  private dndShowCorrectAnswer: boolean = true;
  isAudioPlaying: boolean = true;
  videoCompleted: boolean = false;

  model: LearnModel;

  constructor(private router: Router, private activatedRoute: ActivatedRoute) {
    super();
    this.isAudioPlaying = true;
    this.videoCompleted = false;
   }

  ngOnInit() {
    this.data = JSON.parse(JSON.stringify(MessageService.dloData['explore'].scenarios[2]));
    this.model = new LearnModel(this.data['scenes'][0]);
    this.scenesBoolean = new Array<boolean>(this.data['scenes'].length).fill(false);
    this.scenesBoolean[0] = true;
    this.dndModel = new DNDModel(this.data['scenes'][2]);


  }
  ngAfterViewInit() {
    this.continueButton.buttonEle.nativeElement.focus();
  }
  previousClicked() {
    this.isAudioPlaying = true;
    this.scenesBoolean[this.activeScene] = false;
    this.activeScene--;
    this.scenesBoolean[this.activeScene] = true;
    if (this.scenesBoolean[1]) {
      this.videoCompleted = false;
      setTimeout(() => {
        this.audioPlayer.api.getDefaultMedia().subscriptions.ended.subscribe(
          () => {
            this.videoCompleted = true;
            this.isAudioPlaying = false;
          }
        );
      }, 200);
    }
  }
  continueClicked() {
    this.isAudioPlaying = true;
    this.scenesBoolean[this.activeScene] = false;
    this.activeScene++;
    this.scenesBoolean[this.activeScene] = true;
    if (this.scenesBoolean[1]) {
      this.videoCompleted = false;
      setTimeout(() => {
        this.audioPlayer.api.getDefaultMedia().subscriptions.ended.subscribe(
          () => {
            this.videoCompleted = true;
            this.isAudioPlaying = false;
          }
        );
      }, 200);
    }
    if (this.scenesBoolean[2]) {
      setTimeout(() => {
        this.endScenarioButton.buttonEle.nativeElement.focus();

      }, 200);
    }
  }
  endScenarioClicked() {
    MessageService.dloData['explore']['scenarios'][2]['completed'] = true;
    this.router.navigate(['../'], { relativeTo: this.activatedRoute });
  }
  submitDND() {
    this.dndModel.submit();
  }

  playPauseAudio() {
    this.audioPlayer.playPauseAudio();
    if (this.audioPlayer.api.getDefaultMedia().state === 'paused') {
      this.isAudioPlaying = true;
    } else if (this.audioPlayer.api.getDefaultMedia().state === 'ended') {
      this.isAudioPlaying = true;
      this.videoCompleted = false;
      this.audioPlayer.resumeVideo();
    } else if (this.audioPlayer.api.getDefaultMedia().state === 'playing') {
      this.isAudioPlaying = false;
    }
  }
  showTranscript() {
    this.audioPlayer.showTranscript();
  }
}
