import { AfterViewInit, Component, EventEmitter, Input, OnInit, Output, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { AudioManager } from '../../../core/services/AudioManager';
import { KeyboardService } from '../../services/keyboard.service';
import { AudioBase } from '../audio/audio-base';
import { CarouselSlideModel } from '../carousel/carousel-slide.model';
import { BaseComponent } from './../base/base.component';
import { CarouselModel } from './carousel.model';

import { AccordionModule } from 'ngx-bootstrap';

@Component({
  selector: 'app-carousel',
  styleUrls: ['./carousel.component.scss'],
  templateUrl: './carousel.component.html'
})
export class CarouselComponent extends BaseComponent implements OnInit, AfterViewInit {

  currentCardIndex;
  @Input() playAudioDefault: boolean = false;
  @ViewChildren('audioPlayer') audioPlayer: QueryList<AudioBase>;
  arrAudioPlayer: Array<AudioBase>;
  isAudioPlaying: Array<boolean> = [];
  timer;
  clickTimer;
  @Output() defaultAudio: EventEmitter<boolean> = new EventEmitter();
  @Output() screenNavigation = new EventEmitter();



  @Input() model: CarouselModel;
  @Input() playAudioSlideChange: boolean = false;
  swipper(event) {

    let direction: number = event.deltaX < 0 ? 1 : -1;
    if (event.additionalEvent) {
      direction = event.additionalEvent === 'panleft' ? 1 : -1;
    }

    this.threshold(direction, (Math.abs(event.deltaX) / 1000), SWIPETYPE.FULL);
  }

  constructor(private keyboardService: KeyboardService, private audioManager: AudioManager) {
    super();
  }

  threshold(direction: number, swipe: number, swipeType: SWIPETYPE): boolean {

    swipe = (Math.round(swipe * 100) / 100) * direction;

    let result = true;

    for (let i = 0; i < this.model.arrSlides.length; i++) {

      if (direction === -1) {
        if (Math.ceil(this.model.arrSlides[0].cardIndex) !== 0) {
          const exSwipe = Math.floor(this.model.arrSlides[i].cardIndex);
          if (this.model.arrSlides[i].cardIndex >= exSwipe) {
            this.model.arrSlides[i].cardIndex += swipe;
            if (swipeType === SWIPETYPE.PART && this.model.arrSlides[i].cardIndex <= exSwipe) {
              this.model.arrSlides[i].cardIndex = exSwipe;
              result = false;
            }
          }
        } else {
          this.model.arrSlides[i].cardIndex = -i;
          result = false;

        }

      } else if (direction === 1) {
        if (Math.floor(this.model.arrSlides[this.model.arrSlides.length - 1].cardIndex) !== 0) {
          const exSwipe = Math.ceil(this.model.arrSlides[i].cardIndex);
          if (this.model.arrSlides[i].cardIndex <= exSwipe) {
            this.model.arrSlides[i].cardIndex += swipe;
            if (swipeType === SWIPETYPE.PART && this.model.arrSlides[i].cardIndex >= exSwipe) {
              this.model.arrSlides[i].cardIndex = exSwipe;
              result = false;
            }
          }
        } else {
          this.model.arrSlides[i].cardIndex = (this.model.arrSlides.length - 1) - i;
          result = false;

        }
      }

      this.model.arrSlides[i].cardIndex = (Math.round(this.model.arrSlides[i].cardIndex * 100) / 100);
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
        0.3, SWIPETYPE.PART);
      !result ? clearInterval(this.timer) : undefined;
      if (!result && this.keyboardService.playAudioDefault && this.playAudioSlideChange) {
        const index = (this.model.arrSlides.filter(slide => Math.floor(slide.cardIndex) === 0))[0].index;
        this.playAudio(index);
      }
    }, 100);
  }


  ngOnInit() {
    this.currentCardIndex = 0;

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
    const left = num * 50;
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

    const card: CarouselSlideModel = (this.model.arrSlides.filter(result => Math.floor(result.cardIndex) === 0))[0];
    if (card !== undefined) {
      this.currentCardIndex = this.model.arrSlides.indexOf(card);
    }
    return this.currentCardIndex;

  }

  ngAfterViewInit() {
    this.arrAudioPlayer = this.audioPlayer.toArray();
    for (let i = 0; i < this.arrAudioPlayer.length; i++) {
      this.isAudioPlaying.push(true);
      this.arrAudioPlayer[i].api.getDefaultMedia().subscriptions.ended.subscribe(
        () => {
          this.isAudioPlaying[i] = true;
        }
      );
      this.arrAudioPlayer[i].api.getDefaultMedia().subscriptions.pause.subscribe(
        () => {
          this.isAudioPlaying[i] = true;
        }
      );
      this.arrAudioPlayer[i].api.getDefaultMedia().subscriptions.play.subscribe(
        () => {
          this.isAudioPlaying[i] = false;
        }
      );
    }





  }

  playDefaultAudio() {
    const index = (this.model.arrSlides.filter(result => Math.floor(result.cardIndex) === 0))[0].index;
    this.arrAudioPlayer[index].resumeVideo();
  }

  playAudio(index: number) {
    const activeIndex = (this.model.arrSlides.filter(result => Math.floor(result.cardIndex) === 0))[0].index;
    if (index !== activeIndex) {
      return;
    }
    this.defaultAudio.next(true);
    this.arrAudioPlayer[index].resumeVideo();
  }
  pauseAudio(index: number, ignoreEvent?: boolean) {
    if (!ignoreEvent) {
      this.defaultAudio.next(false);
    }
    this.arrAudioPlayer[index].pauseVideo();
  }

  pauseAllAudio() {
    for (let i = 0; i < this.arrAudioPlayer.length; i++) {
      this.arrAudioPlayer[i].pauseVideo();
    }
  }

  addClassForShadow(num: number) {
    const zIndex = this.getZIndex(num);
    if (zIndex <= 100 && zIndex > 90) {
      return 'center-shadow';
    } else if (zIndex <= 90 && zIndex > 80) {
      return 'first-shadow';
    } else if (zIndex <= 80 && zIndex > 70) {
      return 'second-shadow';
    } else if (zIndex <= 70 && zIndex > 60) {
      return 'third-shadow';
    }
  }

  handleClick(index: number) {
    const prevCurrentIndex = (this.model.arrSlides.filter(slide => Math.floor(slide.cardIndex) === 0))[0].index;
    if (prevCurrentIndex === index) {
      return;
    }
    const transition = prevCurrentIndex > index ? -0.25 : 0.25;
    let bClearInterval = false;
    clearInterval(this.clickTimer);

    this.clickTimer = setInterval(() => {

      for (let i = 0; i < this.model.arrSlides.length; i++) {
        this.model.arrSlides[i].cardIndex = this.model.arrSlides[i].cardIndex + transition;
        if (this.model.arrSlides[index].cardIndex === 0) {
          bClearInterval = true;
        }
      }
      if (bClearInterval) {
        clearInterval(this.clickTimer);
        if (this.keyboardService.playAudioDefault) {
          this.playAudio(index);
        }
      }
    }, 100);



  }

  isLastSlide() {
    const card = (this.model.arrSlides.filter(result => Math.floor(result.cardIndex) === 0))[0];
    let index = -1;
    if (card) {
      index = card.index;
      if (index === this.model.arrSlides.length - 1) {
        return true;
      }
    } else {
      return false;
    }
  }

  onAccordianOpen(index: number) {
    this.audioManager.pauseAllAudio();
    setTimeout(() => {
      const top = jQuery('accordion-group')[index].offsetTop;
      window.scrollTo(0, top - 90);
    }, 500);
  }

  setAudioEvent($event) {
    this.defaultAudio.next($event);
  }

}


enum SWIPETYPE {
  FULL = 0,
  PART = 1
}




