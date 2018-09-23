import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { CoreModule } from './../../core/core.module';
import { DLOMainComponent } from './dlo-main/dlo-main.component';
import { DLORoutingModule } from './dlo-routing-module';
import { ExploreComponent } from './explore/explore.component';
import { BrowserCompatibilityService } from '../../core/services/browser-compatibility.service';

@NgModule({
  declarations: [DLOMainComponent, ExploreComponent],
  exports: [],
  imports: [
    CommonModule,
    CoreModule,
    DLORoutingModule
  ],
  providers: [BrowserCompatibilityService]
})
export class DLOModule { }
