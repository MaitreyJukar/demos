// angular
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { CoreModule } from './../../core/core.module';
import { BrowserCompatibilityService } from '../../core/services/browser-compatibility.service';
// our components
import { ExploreComponent } from './explore/explore.component';
import { ORMainComponent } from './OR-main/OR-main.component';
import { ORRoutingModule } from './OR-routing-module';
import { ScenarioDescriptionComponent } from './scenario-description/scenario-description.component';
import { Scenario1Component } from './scenario1/scenario1.component';
import { Scenario2Component } from './scenario2/scenario2.component';
import { Scenario3Component } from './scenario3/scenario3.component';


@NgModule({
  declarations: [ExploreComponent, ORMainComponent, ScenarioDescriptionComponent, Scenario1Component, Scenario2Component,
    Scenario3Component],
  imports: [
    CommonModule,
    CoreModule,
    ORRoutingModule
  ],
  providers: [BrowserCompatibilityService]
})
export class ORModule { }
