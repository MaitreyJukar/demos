import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { CoreModule } from './../../core/core.module';
import { CIMainComponent } from './CI-main/CI-main.component';
import { CIRoutingModule } from './CI-routing-module';
import { ExploreComponent } from './explore/explore.component';
import { ScenarioDescriptionComponent } from './scenario-description/scenario-description.component';
import { Scenario1Component } from './scenario1/scenario1.component';
import { Scenario2Component } from './scenario2/scenario2.component';
import { Scenario3Component } from './scenario3/scenario3.component';
import { BrowserCompatibilityService } from '../../core/services/browser-compatibility.service';

@NgModule({
  declarations: [CIMainComponent, ExploreComponent, Scenario1Component,
    Scenario2Component, Scenario3Component, ScenarioDescriptionComponent],
  exports: [Scenario1Component, Scenario2Component, Scenario3Component, ScenarioDescriptionComponent],
  imports: [
    CommonModule,
    CoreModule,
    CIRoutingModule
  ],
  providers: [BrowserCompatibilityService]
})
export class CIModule { }
