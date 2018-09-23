import { Component, ElementRef, Input, OnChanges, ViewChild } from '@angular/core';
import { MessageService } from './../../services/message.service';
import { BaseComponent } from './../base/base.component';

@Component({
  selector: 'app-text',
  styleUrls: ['./text.component.scss'],
  templateUrl: './text.component.html'
})

export class TextComponent extends BaseComponent implements OnChanges {

  @Input() textId: string;
  @Input() text: string;

  textFromId: string;

  /**
   * life cycle method ng on changes
   */
  ngOnChanges() {
    this.getJsonText();
  }

  /**
   * get ext from json data
   */
  getJsonText() {
    if (MessageService.dataLoaded) {
      const text = MessageService.getMessage(this.textId);
      if (text) {
        this.textFromId = text;
      }
    } else {
      console.log('data not ready');
    }
  }


}
