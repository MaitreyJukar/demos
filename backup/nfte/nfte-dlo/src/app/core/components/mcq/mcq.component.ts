import { Component, Input } from '@angular/core';
import { responseType } from 'app/core/components/question/question.model';
import { KeyboardService } from '../../services/keyboard.service';
import { QuestionComponent } from './../question/question.component';
import { MCQModel } from './mcq.model';

@Component({
  selector: 'app-mcq',
  styleUrls: ['./mcq.component.scss'],
  templateUrl: './mcq.component.html'
})

export class McqComponent extends QuestionComponent {

  /**
   * index of question
   */
  @Input() index: number;

  /**
   * model data for mcq question
   */
  @Input() model: MCQModel;

  /**
   * boolean representing whether to show correct answer or student response
   */
  @Input() showCorrectAnswer: boolean = false;

  focusedIndex: number;

  /**
   * set currently selected option in model
   * @param  {number} index - index of currently selected option
   */
  setSelected(index: number) {
    this.model.selected = index;
    this.model.attempted = true;
  }

  setOptionContainerClass(index: number) {
    let classList = '';
    if (this.focusedIndex === index) {
      classList += 'focus';
    }
    if (this.showResult) {
      if (this.showCorrectAnswer && this.model.submited && this.showResult && this.model.correctOption === index) {
        classList += 'correct-answer';
      } else if (this.model.submited && this.showResult && !this.showCorrectAnswer && this.model.selected === index) {
        if (this.model.responseType === responseType.CORRECT) {
          classList += 'correct-answer';
        } else {
          classList += 'wrong-answer';
        }
        if (this.index === undefined) {
          classList += 'no-index';
        }
      }
    }
    return classList;
  }

  onInputFocus(event, index: number) {
    this.focusedIndex = index;
    this.onFocus(event);
  }
  onInputBlur() {
    this.focusedIndex = null;
    this.onBlur(null);
  }
  // logic of setting different classes for different scenarios is in html

}
