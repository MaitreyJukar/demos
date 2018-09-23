import { AfterViewInit, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { BaseComponent } from 'app/core/components/base/base.component';
import { MessageService } from '../../../core/services/message.service';
import { WindowResizeService } from '../../../core/services/window-resize.service';
import { ScrollDirective } from '../../../core/scroll.directive';
import { ScenarioDescribeComponent } from '../../../core/components/scenario-describe/scenario-describe.component';
import { ScenarioDescribeModel } from '../../../core/components/scenario-describe/scenario-describe.model';
import { BrowserCompatibilityService } from '../../../core/services/browser-compatibility.service';
import { KeyboardService } from '../../../core/services/keyboard.service';
import { MatchModel } from '../../../core/components/match/match.model';
import { responseType } from '../../../core/components/question/question.model';

@Component({
  selector: 'app-scenario2',
  styleUrls: ['./scenario2.component.scss'],
  templateUrl: './scenario2.component.html'

})
export class Scenario2Component extends BaseComponent implements AfterViewInit, OnDestroy, OnInit {
  data: any;
  @ViewChild('scenarioEle') scenarioEle: ScenarioDescribeComponent;
  @ViewChild(ScrollDirective) scrollDirective: ScrollDirective;
  responseType = responseType;

  scrollTopOffset: number = 152;
  scenarioDescribeModel: ScenarioDescribeModel;
  matchModel: MatchModel;
  isIpad: boolean = false;
  keyboardService: KeyboardService;
  matchShowCorrectAnswer: boolean = true;
  ngOnInit() {
    this.data = JSON.parse(JSON.stringify(MessageService.dloData['explore'].scenarios[1]));
    this.scenarioDescribeModel = new ScenarioDescribeModel(this.data['scenes'][0]);
    this.matchModel = new MatchModel(this.data['scenes'][1]);
  }
  ngAfterViewInit(): void {
    jQuery(jQuery('.scroll-section')[0]).addClass('active');
    jQuery(window).scrollTop(0);
    this.resizeService.register(this);
    this.onResize();
  }
  ngOnDestroy() {
    this.resizeService.deregister(this);
  }


  constructor(private router: Router, private activatedRoute: ActivatedRoute, private cdr: ChangeDetectorRef,
    private resizeService: WindowResizeService, private browser: BrowserCompatibilityService, keyboardService: KeyboardService) {
    super();
    this.isIpad = this.browser.isIPad;
    this.keyboardService = keyboardService;
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
