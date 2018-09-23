// angular
import { NgModule } from '@angular/core';
import { HttpModule } from '@angular/http';
import { BrowserModule } from '@angular/platform-browser';

// our components
import { AppComponent } from './app.component';
import { routing } from './app.routing';
import { CoreModule } from './core/core.module';
import { AccessibilityService } from './core/services/accessibility.service';
import { AudioManager } from './core/services/AudioManager';
import { BrowserCompatibilityService } from './core/services/browser-compatibility.service';
import { KeyboardService } from './core/services/keyboard.service';
import { MessageService } from './core/services/message.service';
import { WindowResizeService } from './core/services/window-resize.service';

import { AccordionModule, TabsModule } from 'ngx-bootstrap';

// third party
import 'hammer-timejs';

import * as Hammer from 'hammerjs';


import { HAMMER_GESTURE_CONFIG, HammerGestureConfig } from '@angular/platform-browser';

export class HammerConfig extends HammerGestureConfig {
  overrides = <any>{
    'swipe': { direction: Hammer.DIRECTION_ALL }
  };
}
@NgModule({
  bootstrap: [AppComponent],

  declarations: [
    AppComponent
  ],

  imports: [
    BrowserModule,
    CoreModule,
    HttpModule,
    AccordionModule.forRoot(),
    TabsModule.forRoot(),
    routing],


  providers: [AccessibilityService, AudioManager, KeyboardService, MessageService, WindowResizeService, BrowserCompatibilityService, {
    provide: HAMMER_GESTURE_CONFIG,
    useClass: HammerConfig
  }]
})

export class AppModule { }
