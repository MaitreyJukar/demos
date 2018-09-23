import { Component, ElementRef, EventEmitter, Input, OnInit, Output, AfterViewChecked, AfterViewInit } from '@angular/core';
import { BaseComponent } from './../base/base.component';
import { QuestionDataModel } from './question.model';
import { MessageService, SECTION } from '../../services/message.service';


@Component({
  selector: 'app-question',
  styleUrls: ['./question.component.scss'],
  templateUrl: './question.component.html'
})

export class QuestionComponent extends BaseComponent implements  AfterViewInit {

  @Input() questionIndex: number;
  @Input() showResult: boolean = false;
  questionDataModel: QuestionDataModel;

  @Input() model: QuestionDataModel;
  @Output() resetClicked: EventEmitter<boolean> = new EventEmitter();

  el: HTMLElement;
  elRef: ElementRef;
  $el: any;

  constructor(el: ElementRef){
    super();
    this.elRef = el;
    this.el = this.elRef.nativeElement;
    this.$el = jQuery(this.el);
  }

  ngAfterViewInit(){
      if( MessageService.section === SECTION.TAKE_QUIZ ){
        this.setFocus();
      }
  }

  setFocus( element? ): boolean{
    if(!element){
      element = jQuery(this.$el).find('.option-container .user-response')[0];
    }
    if(element){
      element.focus();
      return true;
    }
    return false;
  }

  resetData() {
    this.model.resetData();
    if (this.model.type === questionType.DRAGDROP || this.model.type === questionType.MATCHING) {
      this.resetClicked.next();
    }
  }

  getPlainText( text: string ): string{
    do{
      text = text.replace(text.slice( text.indexOf('<'), text.indexOf('>') + 1),' ');
    } while( text.indexOf('<') !== -1 && text.indexOf('>') !== -1);
    return text;
  }

}
export enum questionType {
  MCQ = 1,
  MRQ = 2,
  MATCHING = 3,
  FIB = 4,
  DRAGDROP = 5,
  HOTSPOT = 6,
  LIKERT = 7,
  TEXT_INFO = 8,
  SELECT = 9
}
