import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { BrowserCompatibilityService } from '../../core/services/browser-compatibility.service';
import { CoreModule } from './../../core/core.module';

import { ExploreComponent } from './explore/explore.component';
import { FAAMainComponent } from './FAA-main/FAA-main.component';
import { FAARoutingModule } from './FAA-routing-module';
import { LearnFAAComponent } from './learn/learn.component';
import { Scenario1Component } from './scenario1/scenario1.component';
import { Scenario2Component } from './scenario2/scenario2.component';







@NgModule({
  declarations: [FAAMainComponent, ExploreComponent, LearnFAAComponent, Scenario1Component,
    Scenario2Component, FAAMainComponent],
  exports: [ LearnFAAComponent, Scenario1Component, Scenario2Component,
    FAAMainComponent],
  imports: [
    CommonModule,
    CoreModule,
    FAARoutingModule
  ],
  providers: [BrowserCompatibilityService]
})
export class FAAModule { }
