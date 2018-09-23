import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, OnInit, OnDestroy, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { TabsModule, TypeaheadOptions } from 'ngx-bootstrap';
import { AudioComponent } from '../../../core/components/audio/audio.component';
import { BaseComponent } from '../../../core/components/base/base.component';
import { DNDModel } from '../../../core/components/dnd-base/dnd.model';
import { responseType } from '../../../core/components/question/question.model';
import { MessageService } from '../../../core/services/message.service';
import { SelectModel } from './../../../core/components/select/select.model';
import { LearnComponent } from '../../../core/components/learn/learn.component';
import { ScrollDirective } from '../../../core/scroll.directive';
import { BrowserCompatibilityService } from '../../../core/services/browser-compatibility.service';
import { WindowResizeService } from '../../../core/services/window-resize.service';
import { LearnIntroComponent } from '../../../core/components/learn-intro/learn-intro.component';
import { LearnIntroModel } from '../../../core/components/learn-intro/learn-intro.model';
import { LearnExampleModel } from '../../../core/components/learn-example/learn-example.model';
import { KeyboardService } from '../../../core/services/keyboard.service';
import { LearnExampleComponent } from '../../../core/components/learn-example/learn-example.component';
import { AudioBase } from '../../../core/components/audio/audio-base';
import { TabContentComponent } from '../../../core/components/tab-content/tab-content.component';
import { AudioManager } from '../../../core/services/AudioManager';

@Component({
  selector: 'app-fo-learn',
  styleUrls: ['./learn.component.scss'],
  templateUrl: './learn.component.html'
})
export class LearnFOComponent extends BaseComponent implements AfterViewInit, OnInit, OnDestroy {
  @ViewChildren(TabContentComponent) tabContentAudio: QueryList<TabContentComponent>;
  @ViewChild('learn') learn: LearnComponent;
  @ViewChild(ScrollDirective) scrollDirective: ScrollDirective;
  @ViewChild('learnIntro') learnIntro: LearnIntroComponent;
  @ViewChild('learnExample') learnExample: LearnExampleComponent;

  isAudioPlaying: boolean = true;
  modelData: any;
  responseType = responseType;
  sections: Array<any>;
  currentTabAudio: string;
  selectModel: SelectModel;
  scrollTopOffset: number = 152;
  isFireFox: boolean = false;
  isIE: boolean = false;
  isSafari: boolean = false;
  isEdge: boolean = false;
  learnIntroModel: LearnIntroModel;
  learnExampleModel: LearnExampleModel;
  ignoreClick: boolean = false;
  playAudioDefault: boolean = false;
  activeTab: number = 0;
  tabContentArray: Array<TabContentComponent>;
  isIpad: boolean = false;
  isAccordionSelected = [];

  el: HTMLElement;
  elRef: ElementRef;
  $el: any;

  constructor(el: ElementRef, private resizeService: WindowResizeService, private cdr: ChangeDetectorRef, private browser: BrowserCompatibilityService,
    private keyboardService: KeyboardService, private audioManager: AudioManager) {
    super();
    this.isFireFox = browser.isFireFox;
    this.isIE = browser.isIE;
    this.isEdge = browser.isEdge;
    this.isSafari = browser.isSafari;
    this.isIpad = browser.isIPad;

    this.elRef = el;
    this.el = this.elRef.nativeElement;     
    this.$el = jQuery(this.el);
  }



  ngOnInit() {
    this.modelData = MessageService.dloData['learnSections'];
    this.currentTabAudio = this.modelData[1].tabs[0].audioSrc;
    this.selectModel = new SelectModel(this.modelData[3]);
    this.learnIntroModel = new LearnIntroModel(this.modelData[0]);
    this.learnExampleModel = new LearnExampleModel(this.modelData[4]);
    for (var i = 0; i < this.modelData[1].tabs.length; i++) {
      this.isAccordionSelected.push(false);
    }

    const lstScrollSection =jQuery(this.$el).find('.scroll-section');
    for( var i = 0; i < lstScrollSection.length; i++) {
      lstScrollSection[i].addEventListener('focus', this.performFocus.bind(this), true);
    }
  }

  performFocus(event){
    if( event.target ){
      this.scrollDirective.scrollToSection(parseInt(jQuery(event.target).parents('.scroll-section').attr('index')));
    }
  }

  onAccordionSelected(index: number) {
    this.isAccordionSelected[index] = !this.isAccordionSelected[index];
    if (this.isAccordionSelected[index]) {
      this.playPauseAudio(index);
    } else {
      this.pauseAllMedia();
      this.isAudioPlaying = true;
    }
  }

  ngAfterViewInit() {
    this.keyboardService.scrollDirective = this.scrollDirective;
    this.learn.video.showModal.subscribe((flag) => {
      if (this.browser.isIPad) {
        if (flag) {
          this.scrollDirective.removeHammerEvents();
        } else {
          this.scrollDirective.attachHammerEvents();
        }
      }
    })

    this.tabContentArray = this.tabContentAudio.toArray();
    if (this.keyboardService.playAudioDefault) {
      this.learnIntro.playAudio();
    }
    this.tabContentAudio.forEach((tabcontent) => {
      tabcontent.audioPlayer.api.getDefaultMedia().subscriptions.ended.subscribe(
        () => {
          this.isAudioPlaying = false;
        }
      );
    });

    this.learn.video.api.fsAPI.onChangeFullscreen.subscribe(
      () => {
        if (this.learn.video.api.fsAPI.isFullscreen) {
          this.scrollDirective.listenScroll = false;
        } else {
          this.scrollDirective.listenScroll = true;
        }
      });

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

    this.resizeService.register(this);

    this.onResize();
    if (this.browser.isFireFox) {
      document.body.classList.add('fo-body');
    }
    this.setTabAttributes();
  }


  ngOnDestroy() {
    if (this.browser.isFireFox) {
      document.body.classList.remove('fo-body');
    }
    this.resizeService.deregister(this);
    this.keyboardService.scrollDirective = null;

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

  playPauseAudio(index: number) {
    const audioFile = this.tabContentAudio.toArray()[index].audioPlayer;
    if (audioFile.api.getDefaultMedia().state === 'paused') {
      this.isAudioPlaying = false;
      this.playAudioDefault = true;
      if (window.innerWidth > 700) {
        this.keyboardService.playAudioDefault = true;
      }
      audioFile.resumeVideo();
    } else if (audioFile.api.getDefaultMedia().state === 'ended') {
      this.isAudioPlaying = false;
      this.playAudioDefault = true;
      if (window.innerWidth > 700) {
        this.keyboardService.playAudioDefault = true;
      }
      audioFile.resumeVideo();
    } else if (audioFile.api.getDefaultMedia().state === 'playing') {
      this.isAudioPlaying = true;
      this.playAudioDefault = false;
      if (window.innerWidth > 700) {
        this.keyboardService.playAudioDefault = false;
      }

      audioFile.api.pause();
    }

  }

  onTabSelected(index: number) {
    this.currentTabAudio = this.modelData[1].tabs[index].audioSrc;
    this.pauseAllMedia();
    this.pauseAllMedia();
    this.activeTab = index;
    setTimeout(() => {
      if (this.playAudioDefault) {
        if (this.activeTab === 0) {
          this.tabContentArray[0].audioPlayer.resumeVideo();
          this.isAudioPlaying = false;
        } else if (this.activeTab === 1) {
          this.tabContentArray[1].audioPlayer.resumeVideo();
          this.isAudioPlaying = false;
        } else if (this.activeTab === 2) {
          this.tabContentArray[2].audioPlayer.resumeVideo();
          this.isAudioPlaying = false;
        } else if (this.activeTab === 3) {
          this.tabContentArray[3].audioPlayer.resumeVideo();
          this.isAudioPlaying = false;
        } else if (this.activeTab === 4) {
          this.tabContentArray[4].audioPlayer.resumeVideo();
          this.isAudioPlaying = false;
        }
      }
     
    }, 1000);

    this.setTabAttributes();
  }

  setTabAttributes( attr?: ATTRIBUTE_TYPE ){
    const tabs = jQuery('tabset ul').find('.nav-item');
      for( var i = 0; i < tabs.length; i++) {
        var eleTabIndex = jQuery(tabs[i]).find('a.nav-link')[0];
        switch( attr ){
         case ATTRIBUTE_TYPE.TABINDEX: {
            if( i === this.activeTab ) {
              eleTabIndex.setAttribute('tabindex', '0');
            }else{
              eleTabIndex.setAttribute('tabindex', '-1');
            }
          }
          break;
          case ATTRIBUTE_TYPE.ROLE:{
            eleTabIndex.setAttribute('role','tab');
          }
          break;
          case ATTRIBUTE_TYPE.ARIA_LABEL: {
            eleTabIndex.setAttribute('aria-label', this.modelData[1].tabs[i].title);
          }
          break;
          default:{
            this.setTabAttributes(ATTRIBUTE_TYPE.ROLE);
            this.setTabAttributes(ATTRIBUTE_TYPE.TABINDEX);
            this.setTabAttributes(ATTRIBUTE_TYPE.ARIA_LABEL);
          }
          
        }
      
      }  
  }

  sectionChanged(index: number) {
    this.pauseAllMedia();
    setTimeout(() => {
      if (index === 0 && this.playAudioDefault) {
        this.learnIntro.playAudio();
      } else if (index === 1 && this.playAudioDefault) {
        if (this.activeTab === 0) {
          this.tabContentArray[0].audioPlayer.resumeVideo();
          this.isAudioPlaying = false;
        } else if (this.activeTab === 1) {
          this.tabContentArray[1].audioPlayer.resumeVideo();
          this.isAudioPlaying = false;
        } else if (this.activeTab === 2) {
          this.tabContentArray[2].audioPlayer.resumeVideo();
          this.isAudioPlaying = false;
        } else if (this.activeTab === 3) {
          this.tabContentArray[3].audioPlayer.resumeVideo();
          this.isAudioPlaying = false;
        } else if (this.activeTab === 4) {
          this.tabContentArray[4].audioPlayer.resumeVideo();
          this.isAudioPlaying = false;
        }

      } else if (index === 4 && this.playAudioDefault) {
        this.learnExample.playAudio();
        this.isAudioPlaying = false;
      }

    }, 1000);

  }
  onAccordianOpen(index: number) {
    this.audioManager.pauseAllAudio();
    setTimeout(() => {
      const top = jQuery('accordion-group')[index].offsetTop;
      window.scrollTo(0, top - 90);
    }, 500);
  }

  pauseAllMedia() {
    this.tabContentAudio.forEach((tabcontent) => {
      tabcontent.pauseAudio(true);
    });
    this.isAudioPlaying = true;
    this.learnIntro.audioPlayer.api.pause();
    this.learnExample.audioPlayer.api.pause();
    if (!this.learn.video.api.fsAPI.isFullscreen) {
      this.learn.video.api.pause();
    }
  }
  setDefaultPlayAudio(flag: boolean) {
    this.playAudioDefault = flag;
    if (window.innerWidth > 700) {
      this.keyboardService.playAudioDefault = flag;

    }
  }



}

export enum ATTRIBUTE_TYPE {
  TABINDEX = 0,
  ROLE = 1,
  ARIA_LABEL = 2
}
