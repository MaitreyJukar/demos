import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { BrowserCompatibilityService } from '../../core/services/browser-compatibility.service';
import { CoreModule } from './../../core/core.module';

import { CWRMainComponent } from './CWR-main/CWR-main.component';
import { CWRRoutingModule } from './CWR-routing-module';
import { ExploreComponent } from './explore/explore.component';
import { LearnCWRComponent } from './learn/learn.component';
import { Scenario1Component } from './scenario1/scenario1.component';
import { Scenario2Component } from './scenario2/scenario2.component';
import { Scenario3Component } from './scenario3/scenario3.component';

import {  AccordionModule } from 'ngx-bootstrap/accordion';
import {  TabsModule } from 'ngx-bootstrap/tabs';






@NgModule({
  declarations: [CWRMainComponent, ExploreComponent, LearnCWRComponent, Scenario1Component,
    Scenario2Component, Scenario3Component],
  exports: [ LearnCWRComponent, Scenario1Component, Scenario2Component, Scenario3Component],
  imports: [
    CommonModule,
    CoreModule,
    CWRRoutingModule,
    TabsModule.forRoot(),
    AccordionModule.forRoot()
  ],
  providers: [BrowserCompatibilityService]
})
export class CWRModule { }
