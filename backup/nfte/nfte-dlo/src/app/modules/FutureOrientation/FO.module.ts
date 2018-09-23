import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { BrowserCompatibilityService } from '../../core/services/browser-compatibility.service';
import { CoreModule } from './../../core/core.module';

import { FOMainComponent } from './FO-main/FO-main.component';
import { FORoutingModule } from './FO-routing-module';
import { ExploreComponent } from './explore/explore.component';
import { LearnFOComponent } from './learn/learn.component';
import { Scenario1Component } from './scenario1/scenario1.component';
import { Scenario2Component } from './scenario2/scenario2.component';

import {  AccordionModule } from 'ngx-bootstrap/accordion';
import { TabsModule } from 'ngx-bootstrap/tabs';






@NgModule({
  declarations: [FOMainComponent, ExploreComponent, LearnFOComponent, Scenario1Component,
    Scenario2Component],
  exports: [LearnFOComponent, Scenario1Component, Scenario2Component],
  imports: [
    CommonModule,
    CoreModule,
    FORoutingModule,
    TabsModule.forRoot(),
    AccordionModule.forRoot()
  ],
  providers: [BrowserCompatibilityService]
})
export class FOModule { }
