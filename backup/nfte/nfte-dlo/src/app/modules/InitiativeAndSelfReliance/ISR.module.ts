import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { BrowserCompatibilityService } from '../../core/services/browser-compatibility.service';
import { CoreModule } from './../../core/core.module';

import { ExploreComponent } from './explore/explore.component';
import { ISRMainComponent } from './ISR-main/ISR-main.component';
import { ISRRoutingModule } from './ISR-routing-module';
import { LearnISRComponent } from './learn/learn.component';
import { Scenario1Component } from './scenario1/scenario1.component';
import { Scenario2Component } from './scenario2/scenario2.component';







@NgModule({
  declarations: [ISRMainComponent, ExploreComponent, LearnISRComponent, Scenario1Component,
    Scenario2Component, ISRMainComponent],
  exports: [ LearnISRComponent, Scenario1Component, Scenario2Component,
    ISRMainComponent],
  imports: [
    CommonModule,
    CoreModule,
    ISRRoutingModule
  ],
  providers: [BrowserCompatibilityService]
})
export class ISRModule { }
