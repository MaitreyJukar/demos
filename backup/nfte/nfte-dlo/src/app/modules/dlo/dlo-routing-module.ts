import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DLOMainComponent } from './dlo-main/dlo-main.component';
import { ExploreComponent } from './explore/explore.component';

import { LearnComponent } from './../../core/components/learn/learn.component';
import { QuizComponent } from './../../core/components/quiz/quiz.component';

import { CardControlComponent } from './../../core/components/card-control/card-control.component';





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
                    }
                ],
                component: ExploreComponent, path: 'explore',
            },
            {
                component: QuizComponent, path: 'take-quiz'
            }
        ], component: DLOMainComponent, path: '', pathMatch: 'prefix',

    }
];

@NgModule({
    exports: [RouterModule],
    imports: [RouterModule.forChild(routes)]
})
export class DLORoutingModule { }
