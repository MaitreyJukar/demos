import { Component, ElementRef, EventEmitter, Input, OnChanges, OnInit, Output, AfterViewInit } from '@angular/core';
import { KeyboardService } from '../../services/keyboard.service';
import { QuestionComponent } from './../question/question.component';
import { MRQModel } from './mrq.model';
@Component({
  selector: 'app-mrq',
  styleUrls: ['./mrq.component.scss'],
  templateUrl: './mrq.component.html'
})
export class MrqComponent extends QuestionComponent {

  mrqModel: MRQModel;
  showCorrectAnswerFlag: boolean = false;
  
  @Input() index: number;
  focusedIndex: number;

  @Input() set model(model: MRQModel) {
    this.mrqModel = model;
  }
  get model(): MRQModel {
    return this.mrqModel;
  }
  @Input() set showCorrectAnswer(showCorrectAnswer: boolean) {
    this.showCorrectAnswerFlag = showCorrectAnswer;
  }


  setSelected(index: number, columnIndex?: number) {
    if (columnIndex !== undefined && columnIndex > 0) {
      index = index + this.mrqModel.columns[columnIndex - 1]['options'].length;
    }
    const boolSelected = this.mrqModel.selected.indexOf(index);
    if (boolSelected !== -1) {
      this.mrqModel.selected.splice(boolSelected, 1);
    } else {
      this.mrqModel.selected.push(index);
      this.mrqModel.selected.sort();
    }
    if (this.mrqModel.selected.length) {
      this.mrqModel.attempted = true;
    } else {
      this.mrqModel.attempted = false;
    }
  }

  setCorrectIncorrectClass(index: number, columnIndex?: number) {
    let classList = '';
    if (columnIndex !== undefined && columnIndex > 0) {
      index = index + this.mrqModel.columns[columnIndex - 1]['options'].length;
    }
    if (this.focusedIndex === index) {
      classList += 'focus';
    }
    if (this.showResult) {
      if (this.showCorrectAnswerFlag) {
        if (this.model.isCorrect(index)) {
          classList += 'correct-answer';
        }
      } else {
        if (this.model.submited) {
          if (this.mrqModel.selected.indexOf(index) !== -1) {
            if (this.model.isCorrect(index)) {
              classList += 'correct-answer';
            } else {
              classList += 'wrong-answer';
            }
          }
        }
      }
    }
    return classList;
  }

  setCorrectIncorrectIconClass(index: number, columnIndex?: number) {
    if (columnIndex !== undefined && columnIndex > 0) {
      index = index + this.mrqModel.columns[columnIndex - 1]['options'].length;
    }
    if (this.showCorrectAnswerFlag) {
      if (this.model.isCorrect(index)) {
        return 'icon-check mcq-feedback-icon';
      }
    } else {
      if (this.mrqModel.selected.indexOf(index) !== -1) {
        if (this.model.isCorrect(index)) {
          return 'icon-check mcq-feedback-icon';
        } else {
          return 'icon-check-cross mcq-feedback-icon';
        }
      }
    }
  }
  setClassRadioBtn(index: number, columnIndex?: number) {
    if (columnIndex !== undefined && columnIndex > 0) {
      index = index + this.mrqModel.columns[columnIndex - 1]['options'].length;
    }
    let classList: string;
    if (this.showCorrectAnswerFlag) {
      if (this.model.isCorrect(index)) {
        classList = 'icon-check_box_selected selected-text';
      } else {
        classList = 'icon-check_box_normal radio-normal';
      }
      classList += ' mcq-radio-button';
    } else {
      if (this.mrqModel.selected.indexOf(index) === -1) {
        classList = 'icon-check_box_normal radio-normal';
      } else {
        classList = 'icon-check_box_selected selected-text';
      }
      classList += ' mcq-radio-button';
      if (this.mrqModel.submited) {
        classList += ' disabled';
      }
    }
    return classList;
  }

  setClassText(index: number, columnIndex?: number) {
    if (columnIndex !== undefined && columnIndex > 0) {
      index = index + this.mrqModel.columns[columnIndex - 1]['options'].length;
    }
    let classList = '';
    if (this.showCorrectAnswerFlag) {
      if (this.model.isCorrect(index)) {
        classList += ' selected-text';
      }
      return classList;
    } else {
      if (this.mrqModel.selected.indexOf(index) !== -1) {
        classList += ' selected-text';
      }
      if (this.mrqModel.submited) {
        classList += ' disabled';
      }
      return classList;
    }
  }

  onInputFocus($event, index: number, columnIndex?: number) {
    if (columnIndex !== undefined && columnIndex > 0) {
      index = index + this.mrqModel.columns[columnIndex - 1]['options'].length;
    }
    this.focusedIndex = index;
    this.onFocus($event);
    
  }
  onInputBlur($event) {
    this.focusedIndex = null;
    super.onBlur($event);
  }
  setLabelId(index: number, columnIndex: number) {
    if (columnIndex > 0) {
      if (columnIndex !== undefined && columnIndex > 0) {
        index = index + this.mrqModel.columns[columnIndex - 1]['options'].length;
      }
    } return 'label-' + this.index + '-' + index;

  }
  getNewIndex(index, columnIndex) {
    if (columnIndex !== undefined && columnIndex > 0) {
      index = index + this.mrqModel.columns[columnIndex - 1]['options'].length;
    }
    return index;
  }

}
