import { Component, ElementRef, EventEmitter, Input, Output, AfterViewInit } from '@angular/core';
import { BaseComponent } from '../../../core/components/base/base.component';
import { AudioManager } from '../../services/AudioManager';
import { CardFlipModel } from './card-flip.model';

@Component({
  selector: 'app-card-flip',
  styleUrls: ['./card-flip.component.scss'],
  templateUrl: './card-flip.component.html'

})
export class CardFlipComponent extends BaseComponent {

  el: HTMLElement;
  elRef: ElementRef;
  $el: any;

  isCardFlipped: boolean = false;
  @Input() questionAria: string;
  @Input() model: CardFlipModel;
  @Input() clickHandledByParent: boolean = false;
  @Output() cardClicked: EventEmitter<CardFlipComponent> = new EventEmitter();

  constructor(el: ElementRef,private audioManager: AudioManager) {
    super();
    this.elRef = el;
    this.el = this.elRef.nativeElement;
    this.$el = jQuery(this.el);
  }

  onCardClick() {
    if (this.clickHandledByParent) {
      this.cardClicked.next(this);
    } else {
      this.isCardFlipped = !this.isCardFlipped;
    }
    this.setFocus(jQuery(this.$el).find('.card'), true);
    this.audioManager.pauseAllAudio();
  }

  setFocus(element, force: boolean) {
    if (force) {
      element.blur();
    }
    element.focus();
  }

  getAriaLabel(): string {
    let aria = '';
    if (this.questionAria) {
      aria += this.questionAria;
    }
    if (this.isCardFlipped) {
      aria += this.model.backText;
    } else {
      aria += this.model.frontText;
    }
    return aria;
  }


}
