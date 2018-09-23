import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { BaseComponent } from 'app/core/components/base/base.component';
import { ScenarioDescribeComponent } from '../../../core/components/scenario-describe/scenario-describe.component';
import { ScenarioDescribeModel } from '../../../core/components/scenario-describe/scenario-describe.model';
import { ScrollDirective } from '../../../core/scroll.directive';
import { BrowserCompatibilityService } from '../../../core/services/browser-compatibility.service';
import { KeyboardService } from '../../../core/services/keyboard.service';
import { MessageService } from '../../../core/services/message.service';
import { WindowResizeService } from '../../../core/services/window-resize.service';
@Component({
  selector: 'app-scenario3',
  styleUrls: ['./scenario3.component.scss'],
  templateUrl: './scenario3.component.html'

})
export class Scenario3Component extends BaseComponent implements AfterViewInit, OnDestroy, OnInit {
  data: any;
  @ViewChild('scenarioEle') scenarioEle: ScenarioDescribeComponent;
  @ViewChild(ScrollDirective) scrollDirective: ScrollDirective;

  scrollTopOffset: number = 152;
  scenarioDescribeModel: ScenarioDescribeModel;
  isIpad: boolean = false;
  keyboardService: KeyboardService;

  el: HTMLElement;
  elRef: ElementRef;
  $el: any;

  ngOnInit() {
    this.data = JSON.parse(JSON.stringify(MessageService.dloData['explore'].scenarios[2]));
    this.scenarioDescribeModel = new ScenarioDescribeModel(this.data['scenes'][0]);

    const lstScrollSection =jQuery(this.$el).find('.scroll-section');
    for( var i = 0; i < lstScrollSection.length; i++) {
      lstScrollSection[i].addEventListener('focus', this.performFocus.bind(this), true);
    }
  }
  ngAfterViewInit(): void {
    jQuery(jQuery('.scroll-section')[0]).addClass('active');
    jQuery(window).scrollTop(0);
    this.resizeService.register(this);
    this.onResize();
    this.keyboardService.scrollDirective = this.scrollDirective;
  }
  ngOnDestroy() {
    this.resizeService.deregister(this);
    this.keyboardService.scrollDirective = null;
  }


  constructor(el: ElementRef, private router: Router, private activatedRoute: ActivatedRoute, private cdr: ChangeDetectorRef,
    private resizeService: WindowResizeService, private browser: BrowserCompatibilityService, keyboardService: KeyboardService) {
    super();
    this.isIpad = this.browser.isIPad;
    this.keyboardService = keyboardService;
    this.elRef = el;
    this.el = this.elRef.nativeElement;     
    this.$el = jQuery(this.el);
  }

  performFocus(event){
    if( event.target ){
      this.scrollDirective.scrollToSection(parseInt(jQuery(event.target).parents('.scroll-section').attr('index')));
    }
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
    this.setDownArrowPosition();
    this.cdr.detectChanges();
  }

  backToScenarios() {
    this.router.navigate(['../'], { relativeTo: this.activatedRoute });
  }

  sectionChanged(index: number) {
    this.scenarioEle.sectionChanged(index);
  }
  goToSection(sectionIndex: number) {
    this.scrollDirective.scrollToSection(sectionIndex);
  }
  setDownArrowPosition() {
    // ipad portrait view
    setTimeout(() => {
      const arrow = document.getElementsByClassName('screen-navigation-button');
      if (arrow.length) {
        for (let i = 1; i < arrow.length; i++) {
          if (window.innerWidth >= 1024) {
            arrow[i].parentElement.style.bottom = '';
          } else {
            arrow[i].parentElement.style.bottom = arrow[i].parentElement.offsetTop -
              arrow[i].parentElement.parentElement.offsetTop - arrow[i].parentElement.parentElement.offsetHeight + 'px';
          }
        }
      }
    }, 500);
  }

}
