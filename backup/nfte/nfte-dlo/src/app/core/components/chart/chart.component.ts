import { Component, Input } from '@angular/core';


import { BaseComponent } from 'app/core/components/base/base.component';
@Component({
  selector: 'app-chart',
  styleUrls: ['./chart.component.scss'],
  templateUrl: './chart.component.html'
})
export class ChartComponent {
  @Input() chartMaxTickValue: number;
  @Input() barDataCounter: object;
  @Input() chartData: object[];



  getViewPortWidth() {
    return Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
  }

}
