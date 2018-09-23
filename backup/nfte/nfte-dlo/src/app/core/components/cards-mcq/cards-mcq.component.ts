import { AfterViewInit, Component, Input, OnInit, QueryList, ViewChildren } from '@angular/core';
import { CardFlipComponent } from './../card-flip/card-flip.component';
import { CardsMCQModel } from './cards-mcq-model';

@Component({
  selector: 'app-cards-mcq',
  styleUrls: ['./cards-mcq.component.scss'],
  templateUrl: './cards-mcq.component.html'
})
export class CardsMcqComponent implements OnInit, AfterViewInit {
  @Input() data: any;
  model: CardsMCQModel;
  @Input() index: number;
  @ViewChildren('cards') cardComponentsList: QueryList<CardFlipComponent>;
  cardComponents: Array<CardFlipComponent>
  ngOnInit() {
    this.model = new CardsMCQModel(this.data);
  }
  ngAfterViewInit() {
    this.cardComponents = this.cardComponentsList.toArray();
  }


  handleCardClick(card: CardFlipComponent) {
    card.isCardFlipped = !card.isCardFlipped;
    // for (let i = 0; i < this.cardComponents.length; i++) {
    //   if (this.cardComponents[i] !== card) {
    //     this.cardComponents[i].isCardFlipped = false;
    //   }
    // }
  }

}
