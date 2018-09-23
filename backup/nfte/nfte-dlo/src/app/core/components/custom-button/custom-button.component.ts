import { Component, ElementRef, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { BaseComponent } from './../base/base.component';

@Component({
  selector: 'app-custom-button',
  styleUrls: ['./custom-button.component.scss'],
  templateUrl: './custom-button.component.html'
})

export class CustomButtonComponent extends BaseComponent {

  /**
   * button text to be displayed
   */
  @Input() buttonText: string = 'Button';

  /**
   * class name for icon
   */
  @Input() iconClass: string;

  /**
  * class name for icon
  */
  @Input() buttonClass: string;

  /**
* id for icon
*/
  @Input() inputId: string;
  @Input() disabled: boolean = false;

  /**
   * boolean to identify whether to show icon or not before and after button text
   */
  @Input() showIconBefore: boolean = false;
  @Input() showIconAfter: boolean = false;

  /**
 * aria-label of icon
 */
  @Input() ariaLabel: string;

  /**
   * trigger button click event
   */
  @Output() buttonClickEvent = new EventEmitter<boolean>();
  @ViewChild('button') buttonEle: ElementRef
  /**
   * handle button click event
   */
  onButtonClick() {
    this.buttonClickEvent.next();
  }

}
