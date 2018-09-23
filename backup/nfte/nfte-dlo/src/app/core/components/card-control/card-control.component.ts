import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MessageService } from './../../services/message.service';
import { BaseComponent } from './../base/base.component';


@Component({
  selector: 'app-card-control',
  styleUrls: ['./card-control.component.scss'],
  templateUrl: './card-control.component.html'

})
export class CardControlComponent extends BaseComponent implements OnInit {

  currentCardIndex;
  cardsInfo: Array<CardInfo>;
  model: Array<Object>;
  @Output() cardSelected = new EventEmitter<CardInfo>();
  anyOneCompleted: boolean = false;
  timer;


  constructor(private router: Router, private activatedRoute: ActivatedRoute) {
    super();
  }

  swipper(event) {

    let direction: number = event.deltaX < 0 ? 1 : -1;

    if (event.additionalEvent) {
      direction = event.additionalEvent === 'panleft' ? 1 : -1;
    }
    this.threshold(direction, (Math.abs(event.deltaX) / 1000), SWIPETYPE.FULL);
  }

  threshold(direction: number, swipe: number, swipeType: SWIPETYPE): boolean {

    swipe = (Math.round(swipe * 100) / 100) * direction;

    let result = true;

    for (let i = 0; i < this.cardsInfo.length; i++) {

      if (direction === -1) {
        if (Math.ceil(this.cardsInfo[0].cardIndex) !== 0) {
          const exSwipe = Math.floor(this.cardsInfo[i].cardIndex);
          if (this.cardsInfo[i].cardIndex >= exSwipe) {
            this.cardsInfo[i].cardIndex += swipe;
            if (swipeType === SWIPETYPE.PART && this.cardsInfo[i].cardIndex < exSwipe) {
              this.cardsInfo[i].cardIndex = exSwipe;
              result = false;
            }
          }
        } else {
          this.cardsInfo[i].cardIndex = -i;
        }

      } else if (direction === 1) {
        if (Math.floor(this.cardsInfo[this.cardsInfo.length - 1].cardIndex) !== 0) {
          const exSwipe = Math.ceil(this.cardsInfo[i].cardIndex);
          if (this.cardsInfo[i].cardIndex <= exSwipe) {
            this.cardsInfo[i].cardIndex += swipe;
            if (swipeType === SWIPETYPE.PART && this.cardsInfo[i].cardIndex > exSwipe) {
              this.cardsInfo[i].cardIndex = exSwipe;
              result = false;
            }
          }
        } else {
          this.cardsInfo[i].cardIndex = (this.cardsInfo.length - 1) - i;
        }
      }

      this.cardsInfo[i].cardIndex = (Math.round(this.cardsInfo[i].cardIndex * 100) / 100);
    }
    return result;
  }

  updatePosition(event) {
    clearInterval(this.timer);
    let direction: number = event.deltaX < 0 ? 1 : -1;
    if (event.additionalEvent) {
      direction = event.additionalEvent === 'panleft' ? 1 : -1;
    }
    this.timer = setInterval(() => {
      const result = this.threshold(direction,
        0.3, SWIPETYPE.PART); !result ? clearInterval(this.timer) : undefined;
    }, 100);
  }


  ngOnInit() {

    this.currentCardIndex = 0;
    this.model = MessageService.dloData['explore']['scenarios'];

    this.cardsInfo = new Array<CardInfo>();
    for (let i = 0; i < this.model.length; i++) {
      this.cardsInfo.push(new CardInfo(-i, i, this.model[i]));
      if (this.model[i]['completed']) {
        this.anyOneCompleted = true;
      }
    }
  }
  setFocus() {
    setTimeout(() => {
      const ele: any = document.querySelector('.card_model');
      if (ele) {
        ele.focus();
      }
    }, 200);
  }
  getScale(num: number): number {

    num = num < 0 ? num * -1 : num;
    return 1 - num * 0.10;

  }


  getLeft(num: number) {
    num = (Math.round(num * 100) / 100);
    const left = num * 25;
    return left + 'px';
  }
  getTransform(num: number) {
    const scale = this.getScale(num);
    return 'scale(' + scale + ',' + scale + ')';
  }
  getZIndex(num: number) {
    const scale = this.getScale(num);

    const zIndex = Math.round(scale * 100);
    return zIndex;

  }

  getCenterNumber(): number {

    const card: CardInfo = (this.cardsInfo.filter(result => Math.floor(result.cardIndex) === 0))[0];
    if (card !== undefined) {
      this.currentCardIndex = this.cardsInfo.indexOf(card);
    }
    return this.currentCardIndex;

  }

  cardClicked(event, index) {

    if (event.target.getAttribute('click') !== 'false') {
      this.cardSelected.emit(this.cardsInfo[index]);
      this.router.navigate(['./' + this.cardsInfo[index]['navigationURL']], { relativeTo: this.activatedRoute });
    }
  }

  goToQuiz() {
    this.router.navigate(['../../take-quiz'], { relativeTo: this.activatedRoute });
  }
}

export class CardInfo {
  index: number;
  imageUrl: string;
  text: string;
  description: string;
  cardIndex: number;
  navigationURL: string;
  altText: string = '';

  constructor(cardIndex: number, index: number, data: Object) {
    this.index = index;
    this.imageUrl = data['imageSrc'];
    this.text = data['title'];
    this.description = data['description'];
    this.cardIndex = cardIndex;
    this.navigationURL = data['navigationURL'];
    if (data['altText']) {
      this.altText = data['altText'];
    }

  }
}

enum SWIPETYPE {
  FULL = 0,
  PART = 1
}



