// angular
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

// our components
import { CardControlComponent } from './../../core/components/card-control/card-control.component';
import { LearnComponent } from './../../core/components/learn/learn.component';
import { QuizComponent } from './../../core/components/quiz/quiz.component';
import { ExploreComponent } from './explore/explore.component';
import { ORMainComponent } from './OR-main/OR-main.component';
import { Scenario1Component } from './scenario1/scenario1.component';
import { Scenario2Component } from './scenario2/scenario2.component';
import { Scenario3Component } from './scenario3/scenario3.component';

// child routes for opportunity recognition
const routes: Routes = [
    {
        children: [
            {
                path: '', pathMatch: 'full', redirectTo: 'learn'
            },
            {
                component: LearnComponent, path: 'learn',
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
        ], component: ORMainComponent, path: '', pathMatch: 'prefix',

    }
];

@NgModule({
    exports: [RouterModule],
    imports: [RouterModule.forChild(routes)]
})
export class ORRoutingModule { }
