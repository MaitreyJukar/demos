import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CWRMainComponent } from './CWR-main/CWR-main.component';
import { ExploreComponent } from './explore/explore.component';

import { QuizComponent } from './../../core/components/quiz/quiz.component';

import { CardControlComponent } from './../../core/components/card-control/card-control.component';
import { LearnCWRComponent } from './learn/learn.component';
import { Scenario1Component } from './scenario1/scenario1.component';
import { Scenario2Component } from './scenario2/scenario2.component';
import { Scenario3Component } from './scenario3/scenario3.component';




const routes: Routes = [
    {
        children: [
            {
                path: '', pathMatch: 'full', redirectTo: 'learn'
            },
            {
                component: LearnCWRComponent, path: 'learn',
            },
            {
                children: [
                    {
                        component: CardControlComponent, path: ''
                    },
                    {
                        component: Scenario1Component, path: 'scenario1',
                    },
                    {
                        component: Scenario2Component, path: 'scenario2'
                    },
                    {
                        component: Scenario3Component, path: 'scenario3'
                    }
                ],
                component: ExploreComponent, path: 'explore',
            },
            {
                component: QuizComponent, path: 'take-quiz'
            }
        ], component: CWRMainComponent, path: '', pathMatch: 'prefix',

    }
];

@NgModule({
    exports: [RouterModule],
    imports: [RouterModule.forChild(routes)]
})
export class CWRRoutingModule { }
