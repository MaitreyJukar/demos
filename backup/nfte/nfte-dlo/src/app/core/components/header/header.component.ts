import {
  Component, EventEmitter, Input, Output
} from '@angular/core';
import { BaseComponent } from './../base/base.component';

@Component({
  selector: 'app-header',
  styleUrls: ['./header.component.scss'],
  templateUrl: './header.component.html'
})
export class HeaderComponent extends BaseComponent {

  /**
   * name of dlo
   */
  @Input() dloName: string = 'DLO';

}
