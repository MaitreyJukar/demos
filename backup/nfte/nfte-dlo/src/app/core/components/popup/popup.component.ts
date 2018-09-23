import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Router, RouterStateSnapshot } from '@angular/router';
import { ModalDirective, ModalModule } from 'ngx-bootstrap';
import { MessageService } from './../../services/message.service';
import { BaseComponent } from './../base/base.component';

@Component({
  selector: 'app-popup',
  styleUrls: ['./popup.component.scss'],
  templateUrl: './popup.component.html',
})

export class PopupComponent extends BaseComponent implements AfterViewInit {
  /**
   * model component reference
   */
  @ViewChild('staticModal') public modal: ModalDirective;

  /**
   * title of modal
   */
  title: string = 'nfte';

  /**
   * description / body of modal
   */
  description: string = MessageService.getMessage('popup-description');

  /**
   * to close popup
   */
  popupButton: string = 'IntroPopupButton';
  /**
   * element on which to set focus
   */
  focusEle: ElementRef;

  /**
   * life cycle method after view init
   */
  ngAfterViewInit() {
    const state: RouterStateSnapshot = this.router.routerState.snapshot;
    // show intro pop up in learn only
    if (state.url.indexOf('learn') > -1) {
      this.show();
    }
  }

  /**
   * constructor
   * @param
   */
  constructor(private router: Router) {
    super();
  }


  /**
   * show modal
   */
  show() {
    this.modal.show();
  }

  /**
   * hide moadl
   */
  hide() {
    this.modal.hide();
    if (this.focusEle) {
      setTimeout(() => {
        this.focusEle.nativeElement.focus();
      }, 300);
    }
  }

  /**
   * set focus on close button to loop focused ele inside modal
   */
  setFocus() {
    const focusEle = document.getElementById('intro-close');
    if (focusEle) {
      focusEle.focus();
    }
  }

}
