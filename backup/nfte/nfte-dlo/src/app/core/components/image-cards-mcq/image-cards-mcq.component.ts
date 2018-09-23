import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { BaseComponent } from '../base/base.component';
import { ImageCardsMcqModel } from './image-cards-mcq.model';

@Component({
  selector: 'app-image-cards-mcq',
  styleUrls: ['./image-cards-mcq.component.scss'],
  templateUrl: './image-cards-mcq.component.html'
})
export class ImageCardsMcqComponent extends BaseComponent {
  @Output() screenNavigation: EventEmitter<any> = new EventEmitter();

  @Input() model: ImageCardsMcqModel;

  @Input() screenUp: boolean = false;
  constructor(private router: Router, private activatedRoute: ActivatedRoute) {
    super();
  }
  backToScenarios() {
    this.router.navigate(['../'], { relativeTo: this.activatedRoute });
  }


}
