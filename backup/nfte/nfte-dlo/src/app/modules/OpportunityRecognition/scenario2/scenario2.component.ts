import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AudioBase } from 'app/core/components/audio/audio-base';
import { BaseComponent } from 'app/core/components/base/base.component';
import { LearnModel } from '../../../core/components/learn/learn.model';
import { CustomButtonComponent } from './../../../core/components/custom-button/custom-button.component';
import { DNDModel } from './../../../core/components/dnd-base/dnd.model';
import { DragAndDropComponent } from './../../../core/components/drag-and-drop/drag-and-drop.component';
import { responseType } from './../../../core/components/question/question.model';
import { MessageService } from './../../../core/services/message.service';

@Component({
  selector: 'app-scenario2',
  styleUrls: ['./scenario2.component.scss'],
  templateUrl: './scenario2.component.html'
})
export class Scenario2Component extends BaseComponent implements AfterViewInit, OnInit {
  data;
  scenesBoolean: Array<Boolean>
  showButton: boolean = false;
  dndModel1: DNDModel;
  dndModel2: DNDModel;
  activeScene: number = 0;
  private responseType = responseType;
  @ViewChild('dnd1') dnd1: DragAndDropComponent;
  @ViewChild('dnd2') dnd2: DragAndDropComponent;

  @ViewChild('continueButton') continueButton: CustomButtonComponent;
  @ViewChild('endScenarioButton') endScenarioButton: CustomButtonComponent;
  @ViewChild('audioPlayer') audioPlayer: AudioBase;
  private dnd1ShowCorrectAnswer: boolean = true;
  private dnd2ShowCorrectAnswer: boolean = true;
  isAudioPlaying: boolean = true;
  videoCompleted: boolean = false;
  model: LearnModel;
  constructor(private router: Router, private activatedRoute: ActivatedRoute) {
    super();
    this.isAudioPlaying = true;
    this.videoCompleted = false;
  }

  ngOnInit() {
    this.data = JSON.parse(JSON.stringify(MessageService.dloData['explore'].scenarios[1]));
    this.model = new LearnModel(this.data['scenes'][0]);
    this.scenesBoolean = new Array<boolean>(this.data['scenes'].length).fill(false);
    this.scenesBoolean[0] = true;
    this.dndModel1 = new DNDModel(this.data['scenes'][2]);
    this.dndModel2 = new DNDModel(this.data['scenes'][3]);
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
    if (this.scenesBoolean[3]) {
      setTimeout(() => {
        this.endScenarioButton.buttonEle.nativeElement.focus();

      }, 200);
    }
  }
  endScenarioClicked() {
    MessageService.dloData['explore']['scenarios'][1]['completed'] = true;
    this.router.navigate(['../'], { relativeTo: this.activatedRoute });
  }
  submitDND1() {
    this.dndModel1.submit();
  }
  submitDND2() {
    this.dndModel2.submit();
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
