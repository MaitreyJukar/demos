import { AfterViewInit, Component, ElementRef, Input, OnInit, QueryList, ViewChild } from '@angular/core';
import { BaseComponent } from '../base/base.component';
import { QUANTITY } from '../dnd-base/dnd-base';
import { responseType } from '../question/question.model';
import { TextComponent } from './../text/text.component';
import { EVENTTYPE, SelectModel } from './select.model'

@Component({
  selector: 'app-select',
  styleUrls: ['./select.component.scss'],
  templateUrl: './select.component.html'
})
export class SelectComponent extends BaseComponent implements OnInit, AfterViewInit {

  feedbackClass = 'icon select-report-icon ';

  @Input() model: SelectModel;

  select: Array<HTMLElement>;

  @ViewChild('select') selectContainer: ElementRef;

  ngOnInit() {
    this.model.selectStatement = this.model.selectStatement.replace(/select-tag/g, '<span class="select-option-container"></span>');
    this.model.userActions.subscribe((eventType) => {

      eventType === EVENTTYPE.RESET ? this.setDataAccToEvent(EVENTTYPE.RESET) : eventType === EVENTTYPE.STUDENT_RESPONSE ?
        this.setDataAccToEvent(EVENTTYPE.STUDENT_RESPONSE) : this.setDataAccToEvent(EVENTTYPE.CORRECT_ANSWER);

    })
  }

  ngAfterViewInit() {
    this.setDataAccToEvent(EVENTTYPE.RESET);
  }

  setDataAccToEvent(eventType: EVENTTYPE) {

    this.select = [];

    const selectParentContainer = this.selectContainer.nativeElement.getElementsByClassName('select-option-container');

    const arrSelectedIndex = eventType === EVENTTYPE.RESET ? [0, 0, 0, 0] : eventType === EVENTTYPE.STUDENT_RESPONSE ?
      this.model.studentResponse : this.model.correctAnswer;

    const feedbackFlag = eventType === EVENTTYPE.STUDENT_RESPONSE ? this.model.checkCorrectAnswer : [1, 1, 1, 1];

    for (let i = 0; i < this.model.select.length; i++) {

      while (selectParentContainer[i].hasChildNodes()) {
        selectParentContainer[i].removeChild(selectParentContainer[i].firstChild);
      }

      const select = document.createElement('select');

      for (let j = 0; j < this.model.select[i].length; j++) {
        const option = document.createElement('option');
        option.innerHTML = this.model.select[i][j];
        option.innerHTML = this.model.select[i][j];
        if (j === 0) {
          option.disabled = true;
          option.hidden = true;
        }
        if (j === arrSelectedIndex[i]) {
          option.selected = true;
        }
        select.appendChild(option);
      }

      if (eventType === EVENTTYPE.STUDENT_RESPONSE || eventType === EVENTTYPE.CORRECT_ANSWER) {
        const icon = document.createElement('div');
        if (feedbackFlag[i] !== responseType.CORRECT) {
          select.className = 'incorrect';
          icon.className = this.feedbackClass + 'icon-check-cross';
        } else {
          select.className = 'correct';
          icon.className = this.feedbackClass + 'icon-check';
        }
        selectParentContainer[i].appendChild(icon);
      } else {
        select.className = 'italic';
        select.tabIndex = 0;
      }
      
      select.setAttribute('index', i.toString());
      this.attachEvents(select);
      this.select.push(select);
      this.attachAttributes();
      selectParentContainer[i].appendChild(select);
    }
  }

  getPlainText( text: string ): string{
    do{
      const html = text.slice( text.indexOf('<'), text.indexOf('>') + 1);
      const replace = html.indexOf('select-option-container') !== -1 ? 'drop-down  ' : ''; 
      text = text.replace( html , replace);
    } while( text.indexOf('<') !== -1 && text.indexOf('>') !== -1);
    return text;
  }

  attachEvents(select: HTMLElement) {
    select.onchange = this.onChange.bind(this);
    select.onfocus = this.onFocus.bind(this);
  }

  attachAttributes(){
    this.select[0].setAttribute('aria-label', this.getQuestion());
  }

  getQuestion(){
    return this.getPlainText(this.model.text + ' ' + this.model.selectStatement);
  }
 

  onChange(event) {
    const selectedIndex = this.getIndex(event.target);
    if (selectedIndex !== -1) {
      this.model.studentResponse[selectedIndex] = event.target.selectedIndex;
      if (this.model.isSingleSelect) {
        this.model.attempted = true;
      } else {
        if (this.model.selected()) {
          this.model.attempted = true;
        }
        if (this.model.selected(1, QUANTITY.AT_LEAST)) {
          this.model.interacted = true;
        }
      }
      this.select[selectedIndex].classList.remove('italic');
    }
  }


  getIndex( element ): number{
    var index = - 1;
    if( element ){
      index= parseInt(element.getAttribute('index'), 0)
    }
    return index;
  }
}


