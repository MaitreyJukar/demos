import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CardFlipComponent } from './../card-flip/card-flip.component';

@Component({
  selector: 'app-card-with-option',
  styleUrls: ['./card-with-option.component.scss'],
  templateUrl: './card-with-option.component.html'
})
export class CardWithOptionComponent extends CardFlipComponent {
  isDO: boolean = false;
  @Input() isCardFlipped;
  @Input() model: any;


  showDo() {
    this.isDO = true;
    this.onCardClick();
  }

  showDont() {
    this.isDO = false;
    this.onCardClick();
  }

}
