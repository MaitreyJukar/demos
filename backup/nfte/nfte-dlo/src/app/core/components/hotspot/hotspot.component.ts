import {
  Component, ElementRef, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild
} from '@angular/core';

import { QuestionComponent } from 'app/core/components/question/question.component';
import { WindowResizeService } from './../../services/window-resize.service';
import { HotspotModel } from './hotspot.model';

@Component({
  selector: 'app-hotspot',
  styleUrls: ['./hotspot.component.scss'],
  templateUrl: './hotspot.component.html'
})

export class HotspotComponent extends QuestionComponent implements OnInit, OnDestroy {
  imgSrc: string;
  allOptions: Array<Object>;
  imageOriginalWidth: number;
  imageOriginalHeight: number;
  imageWidth: string;
  imageHeight: string;
  @Input() index: number;
  hotspotModel: HotspotModel;
  @ViewChild('centerAlign') centerAlign;
  @ViewChild('image') image;
  @Input() handleWidth: boolean = false;
  isFullscreen = false;
  @Output() checkFullScreen: EventEmitter<boolean> = new EventEmitter<boolean>();
  timeOutControl: boolean = true;
  timeOut: number;

  @Input() set model(model: HotspotModel) {
    this.hotspotModel = model;
    if (this.hotspotModel.backup !== undefined) {
      this.hotspotModel.userResponse = this.hotspotModel.backup;
    }

    if (this.hotspotModel.userResponse !== undefined && this.hotspotModel.userResponse.length > 0) {
      this.hotspotModel.attempted = true;
    }

  }

  get model(): HotspotModel {
    return this.hotspotModel;
  }
  constructor(el: ElementRef, private resizeService: WindowResizeService) {
    super(el);
  }

  ngOnInit() {
    this.resizeService.register(this);
    this.allOptions = this.hotspotModel.options;
    this.imgSrc = this.hotspotModel.imageUrl;
    this.image.nativeElement.addEventListener('load', function () {
      this.imageOriginalHeight = this.image.nativeElement.naturalHeight;
      this.imageOriginalWidth = this.image.nativeElement.naturalWidth;
      this.onResize();
    }.bind(this));
  }

  ngOnDestroy() {
    this.resizeService.deregister(this);
  }

  @Input() set showCorrectAnswer(showCorrectAnswer: boolean) {
    if (this.hotspotModel.userResponse !== undefined && this.hotspotModel.backup === undefined) {
      this.hotspotModel.backup = this.hotspotModel.userResponse;
    }
    if (showCorrectAnswer) {
      this.hotspotModel.userResponse = this.hotspotModel.question.arrCorrectOption;
    } else {
      this.hotspotModel.userResponse = this.hotspotModel.backup;
    }
  }

  onResize() {
    let ratio = (3 / 4);
    let padding = 16;
    if (this.isFullscreen) {
      padding = 0;
    }
    // set image height width ratio
    if (this.imageOriginalHeight && this.imageOriginalWidth) {
      ratio = this.imageOriginalHeight / this.imageOriginalWidth;
      const maxWidth = this.centerAlign.nativeElement.offsetWidth - this.getScrollBarWidth() - (2 * padding);
      const maxHeight = this.centerAlign.nativeElement.offsetHeight - this.getScrollBarWidth() - (2 * padding);
      let newWidth: string = this.imageOriginalWidth.toString();
      let newHeight: string = this.imageOriginalHeight.toString();
      if (this.handleWidth) {
        if (this.imageOriginalWidth > maxWidth) {
          newWidth = maxWidth.toString();
          newHeight = (maxWidth * ratio).toString();
        }
      } else {
        if (maxHeight < ratio * maxWidth) {
          if (this.imageOriginalHeight > maxHeight) {
            newHeight = maxHeight.toString();
            newWidth = (maxHeight / ratio).toString();
          }
        } else {
          if (this.imageOriginalWidth > maxWidth) {
            newWidth = maxWidth.toString();
            newHeight = (maxWidth * ratio).toString();
          }
        }
      }
      this.imageHeight = newHeight;
      this.imageWidth = newWidth;
      this.imageHeight = parseInt(this.imageHeight, 10) + 'px';
      this.imageWidth = parseInt(this.imageWidth, 10) + 'px';
    }
  }

  calcIconPosition(left: string, hotspotWidth: string) {
    left.replace('%', '');
    hotspotWidth.replace('%', '');
    return 'calc(' + (parseInt(left, 10) + parseInt(hotspotWidth, 10)) + '% - 20px)';
  }

  calcTopPosition(top: string) {
    top.replace('%', '');
    return 'calc(' + parseInt(top, 10) + '% - 3px)';
  }

  hotspotClicked(id: number) {
    this.hotspotModel.attempted = true;
    if (!this.hotspotModel.userResponse) {
      this.hotspotModel.userResponse = [];
    }
    if (this.hotspotModel.isSingleSelect) {
      if (this.hotspotModel.userResponse && this.hotspotModel.userResponse.length >= 1) {
        this.hotspotModel.userResponse.pop();
      }

      this.hotspotModel.userResponse.push(id);
    } else {
      if (this.hotspotModel.userResponse.indexOf(id) > -1) {
        const index = this.hotspotModel.userResponse.indexOf(id);
        this.hotspotModel.userResponse.splice(index, 1);
      } else {
        this.hotspotModel.userResponse.push(id);
      }
    }

  }

  fullscreen() {
    this.isFullscreen = !this.isFullscreen;
    this.checkFullScreen.emit(this.isFullscreen);
    setTimeout(() => {
      this.onResize();
      this.fullscreenBottonBar();
    }, 200);
  }
  fullscreenBottonBar() {
    this.timeOutControl = false;
    clearTimeout(this.timeOut);
    this.timeOut = Number(setTimeout(() => {
      this.timeOutControl = true;
    }, 5000));
  }

}
