// angular
import { ModuleWithProviders } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

// our components
import { EngineComponent } from './core/components/engine/engine.component';

// main routes
const routes: Routes = [
    { path: 'CI', loadChildren: './modules/CreativityInnovation/CI.module#CIModule' },
    { path: 'OR', loadChildren: './modules/OpportunityRecognition/OR.module#ORModule' },
    { path: 'CWR', loadChildren: './modules/ComfortWithRisk/CWR.module#CWRModule' },
    { path: 'dlo', loadChildren: './modules/dlo/dlo.module#DLOModule' },
    { path: 'FO', loadChildren: './modules/FutureOrientation/FO.module#FOModule' },
    { path: 'FAA', loadChildren: './modules/FlexibilityAndAdaptability/FAA.module#FAAModule' },
    { path: 'ISR', loadChildren: './modules/InitiativeAndSelfReliance/ISR.module#ISRModule' },
    { path: '**', component: EngineComponent }
];

export const routing: ModuleWithProviders = RouterModule.forRoot(routes, { useHash: true });
