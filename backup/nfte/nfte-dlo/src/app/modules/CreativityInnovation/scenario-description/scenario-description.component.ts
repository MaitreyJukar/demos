import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-scenario-description',
  styleUrls: ['./scenario-description.component.scss'],
  templateUrl: './scenario-description.component.html'
})
export class ScenarioDescriptionComponent {
  @Input() data;

  animationEnd(event) {
    event.currentTarget.scrollIntoView();
  }

  changeText(event) {
    event.target.innerHTML += ' ';
  }
}
