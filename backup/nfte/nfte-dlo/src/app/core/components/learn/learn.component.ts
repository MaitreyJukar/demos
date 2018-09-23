import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { MessageService } from '../../../core/services/message.service';
import { LearnModel } from './learn.model';

import { DNDModel } from './../../../core/components/dnd-base/dnd.model';
import { HotspotModel } from './../../../core/components/hotspot/hotspot.model';
import { MatchModel } from './../../../core/components/match/match.model';
import { MCQModel } from './../../../core/components/mcq/mcq.model';
import { questionType } from './../../../core/components/question/question.component';

import { VideoPlayerComponent } from '../video-player/video-player.component';

@Component({
  selector: 'app-learn',
  styleUrls: ['./learn.component.scss'],
  templateUrl: './learn.component.html'
})
export class LearnComponent implements OnInit {
  model: LearnModel;
  @Input() jsonText;
  @ViewChild('video') video: VideoPlayerComponent;

  ngOnInit() {
    const data = MessageService.dloData['learn'];
    this.model = new LearnModel(data);
  }

}
