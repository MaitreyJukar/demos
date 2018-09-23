import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { AudioBase } from '../../../core/components/audio/audio-base';
import { BaseComponent } from '../../../core/components/base/base.component';
import { CarouselComponent } from '../../../core/components/carousel/carousel.component';
import { CarouselModel } from '../../../core/components/carousel/carousel.model';
import { DNDModel } from '../../../core/components/dnd-base/dnd.model';
import { LearnExampleComponent } from '../../../core/components/learn-example/learn-example.component';
import { LearnExampleModel } from '../../../core/components/learn-example/learn-example.model';
import { LearnIntroComponent } from '../../../core/components/learn-intro/learn-intro.component';
import { LearnIntroModel } from '../../../core/components/learn-intro/learn-intro.model';
import { LearnComponent } from '../../../core/components/learn/learn.component';
import { ScrollDirective } from '../../../core/scroll.directive';
import { BrowserCompatibilityService } from '../../../core/services/browser-compatibility.service';
import { KeyboardService } from '../../../core/services/keyboard.service';
import { MessageService } from '../../../core/services/message.service';
import { WindowResizeService } from '../../../core/services/window-resize.service';
import { LearnCardQuestionComponent } from '../../../core/components/learn-card-question/learn-card-question.component';

@Component({
  selector: 'app-isr-learn',
  styleUrls: ['./learn.component.scss'],
  templateUrl: './learn.component.html'
})
export class LearnISRComponent extends BaseComponent implements AfterViewInit, OnInit, OnDestroy {
  @ViewChild('scrollParent') mainEle: ElementRef;
  @ViewChild('learnIntro') learnIntro: LearnIntroComponent;
  @ViewChild('learnExample') learnExample: LearnExampleComponent;
  @ViewChild('learn') learn: LearnComponent;
  @ViewChild(ScrollDirective) scrollDirective: ScrollDirective;
  @ViewChild('carousel') carousel: CarouselComponent;
  @ViewChild('cardOption') cardOption: LearnCardQuestionComponent;
  modelData: any;
  sections: Array<any>;
  scrollTopOffset: number = 152;
  isFireFox: boolean = false;
  isIE: boolean = false;
  isSafari: boolean = false;
  isEdge: boolean = false;
  isAudioPlaying: boolean = true;
  learnIntroModel: LearnIntroModel;
  learnExampleModel: LearnExampleModel;
  isIpad: boolean = false;
  playAudioDefault: boolean = false;
  carouselModel: CarouselModel;
  allowCarouselPlayAudio: boolean = false;



  constructor(private resizeService: WindowResizeService, private cdr: ChangeDetectorRef, private browser: BrowserCompatibilityService,
    private keyboardService: KeyboardService) {
    super();
    this.isFireFox = browser.isFireFox;
    this.isIE = browser.isIE;
    this.isEdge = browser.isEdge;
    this.isSafari = browser.isSafari;
    this.isIpad = this.browser.isIPad;
  }

  ngOnInit() {
    this.modelData = MessageService.dloData['learnSections'];
    this.learnIntroModel = new LearnIntroModel(this.modelData[0]);
    this.carouselModel = new CarouselModel(this.modelData[1]);
    this.learnExampleModel = new LearnExampleModel(this.modelData[4]);
  }

  ngAfterViewInit() {
    this.learn.video.showModal.subscribe((flag) => {
      if (this.browser.isIPad) {
        if (flag) {
          this.scrollDirective.removeHammerEvents();
        } else {
          this.scrollDirective.attachHammerEvents();
        }
      }
    })


    this.learn.video.api.fsAPI.onChangeFullscreen.subscribe(
      () => {
        if (this.learn.video.api.fsAPI.isFullscreen) {
          setTimeout(() => {
            jQuery('.scroll')[0].scrollTop = jQuery('.scroll-section')[2].offsetTop - this.scrollTopOffset;
            this.scrollDirective.listenScroll = false;
          }, 200);
        } else {
          setTimeout(() => {
            this.scrollDirective.scrollToSection(2);
            this.scrollDirective.listenScroll = true;
          }, 200);
        }
      });
    if (this.keyboardService.playAudioDefault) {
      this.learnIntro.playAudio();
    }


    this.resizeService.register(this);
    this.onResize();
    if (this.browser.isFireFox) {
      document.body.classList.add('isr-body');
    }

  }

  ngOnDestroy() {
    if (this.browser.isFireFox) {
      document.body.classList.remove('isr-body');
    }
    this.resizeService.deregister(this);

  }

  onResize() {
    if (window.innerWidth > 1366) {
      this.scrollTopOffset = 152;
    } else if (window.innerWidth <= 1366 && window.innerWidth > 1024) {
      this.scrollTopOffset = 112;
    } else if (window.innerWidth >= 1024 && window.innerWidth < 1365) {
      const marginTop = (window.innerHeight - 503 - 88) / 2;
      this.scrollTopOffset = 88 + marginTop;
    } else if (window.innerWidth >= 768 && window.innerWidth < 1024) {
      this.scrollTopOffset = 88 + 24;
    }
    this.cdr.detectChanges();
  }

  playPauseAudio1(audioFile) {
    if (audioFile.api.getDefaultMedia().state === 'paused') {
      if (window.innerWidth > 700) {
        this.keyboardService.playAudioDefault = true;
      }
      audioFile.resumeVideo();
    } else if (audioFile.api.getDefaultMedia().state === 'ended') {
      if (window.innerWidth > 700) {
        this.keyboardService.playAudioDefault = true;
      }
      audioFile.resumeVideo();
    } else if (audioFile.api.getDefaultMedia().state === 'playing') {
      if (window.innerWidth > 700) {
        this.keyboardService.playAudioDefault = false;
      }
      audioFile.api.pause();
    }

  }




  sectionChanged(index: number) {
    this.pauseAllMedia();
    this.allowCarouselPlayAudio = false;
    if (index === 0 && this.playAudioDefault) {
      this.learnIntro.playAudio();
    }
    if (index === 1 && this.playAudioDefault) {
      this.allowCarouselPlayAudio = true;
      this.carousel.playDefaultAudio();
    }
    if (index === 3 && this.playAudioDefault) {
      this.cardOption.playAudio();
    }
    if (index === 4 && this.playAudioDefault) {
      this.learnExample.playAudio();
    }
  }

  pauseAllMedia() {
    this.learnIntro.pauseAudio(true);
    this.carousel.pauseAllAudio();
    this.cardOption.pauseAudio(true);
    this.learnExample.pauseAudio(true);
    if (!this.learn.video.api.fsAPI.isFullscreen) {
      this.learn.video.api.pause();
    }
  }



  goToSection(sectionIndex: number) {
    this.scrollDirective.scrollToSection(sectionIndex);
  }
  setDefaultPlayAudio(flag: boolean) {
    this.playAudioDefault = flag;
    if (window.innerWidth > 700) {
      this.keyboardService.playAudioDefault = flag;

    }
  }
}
