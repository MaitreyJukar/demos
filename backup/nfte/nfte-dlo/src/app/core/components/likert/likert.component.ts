import { Component, Input } from '@angular/core';
import { QuestionComponent } from './../question/question.component';
import { LikertModel } from './likert.model';

@Component({
  selector: 'app-likert',
  styleUrls: ['./likert.component.scss'],
  templateUrl: './likert.component.html'
})
export class LikertComponent extends QuestionComponent {

  /**
   * index of question
   */
  @Input() index: number;

  /**
   * model data for likert question
   */
  @Input() model: LikertModel;
  focusedIndex: number;

  /**
   * set currently selected option in model
   * @param  {number} index - index of currently selected option
   */
  setSelected(index: number) {
    this.model.selected = index;
    this.model.attempted = true;
  }

  onInputFocus(index: number) {
    this.focusedIndex = index;
    const ele: any = event.target;
    this.model.selected = index;
  }
  onInputBlur() {
    this.focusedIndex = null;
  }
  // logic of setting different classes for different scenarios is in html

}
