import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ExploreComponent } from './explore/explore.component';
import { FAAMainComponent } from './FAA-main/FAA-main.component';

import { QuizComponent } from './../../core/components/quiz/quiz.component';

import { CardControlComponent } from './../../core/components/card-control/card-control.component';
import { LearnFAAComponent } from './learn/learn.component';
import { Scenario1Component } from './scenario1/scenario1.component';
import { Scenario2Component } from './scenario2/scenario2.component';




const routes: Routes = [
    {
        children: [
            {
                path: '', pathMatch: 'full', redirectTo: 'learn'
            },
            {
                component: LearnFAAComponent, path: 'learn',
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
                    }
                ],
                component: ExploreComponent, path: 'explore',
            },
            {
                component: QuizComponent, path: 'take-quiz'
            }
        ], component: FAAMainComponent, path: '', pathMatch: 'prefix',

    }
];

@NgModule({
    exports: [RouterModule],
    imports: [RouterModule.forChild(routes)]
})
export class FAARoutingModule { }
