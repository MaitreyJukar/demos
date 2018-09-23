// angular
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

// third party
import { AccordionModule, ModalModule, PopoverModule, TabsModule } from 'ngx-bootstrap';
import { NgxPaginationModule } from 'ngx-pagination';
import { VgBufferingModule } from 'videogular2/buffering';
import { VgControlsModule } from 'videogular2/controls';
import { VgCoreModule } from 'videogular2/core';
import { VgOverlayPlayModule } from 'videogular2/overlay-play';

// our componnets
import { AlertComponent } from './components/alert/alert.component';
import { AudioComponent } from './components/audio/audio.component';
import { BottomButtonsComponent } from './components/bottom-buttons/bottom-buttons.component';
import { CardControlComponent } from './components/card-control/card-control.component';
import { ChartComponent } from './components/chart/chart.component';
import { CustomButtonComponent } from './components/custom-button/custom-button.component';
import { DndBaseComponent } from './components/dnd-base/dnd-base';
import { DragAndDrop2Component } from './components/drag-and-drop-2/drag-and-drop-2.component';
import { DragAndDropComponent } from './components/drag-and-drop/drag-and-drop.component';
import { EngineComponent } from './components/engine/engine.component';
import { HeaderComponent } from './components/header/header.component';
import { HotspotComponent } from './components/hotspot/hotspot.component';
import { LearnComponent } from './components/learn/learn.component';
import { LegendsComponent } from './components/legends/legends.component';
import { LikertComponent } from './components/likert/likert.component';
import { MainComponent } from './components/main/main.component';
import { MatchComponent } from './components/match/match.component';
import { McqComponent } from './components/mcq/mcq.component';
import { MrqComponent } from './components/mrq/mrq.component';
import { PaginatorComponent } from './components/paginator/paginator.component';
import { PopupComponent } from './components/popup/popup.component';
import { QuestionComponent } from './components/question/question.component';
import { QuizComponent } from './components/quiz/quiz.component';
import { SelectComponent } from './components/select/select.component';
import { SimpleReportComponent } from './components/simple-report/simple-report.component';
import { TabBarComponent } from './components/tab-bar/tab-bar.component';
import { TextComponent } from './components/text/text.component';
import { VideoPlayerComponent } from './components/video-player/video-player.component';
import { VideoBase } from './components/video/video-base';
import { SafeHtmlPipe } from './safe-html.pipe';
import { ScrollDirective } from './scroll.directive';

import { CardFlipComponent } from './components/card-flip/card-flip.component';
import { CardWithOptionComponent } from './components/card-with-option/card-with-option.component';
import { CardsMcqComponent } from './components/cards-mcq/cards-mcq.component';
import { CarouselComponent } from './components/carousel/carousel.component';
import { ImageCardsMcqComponent } from './components/image-cards-mcq/image-cards-mcq.component';
import { LearnCardQuestionComponent } from './components/learn-card-question/learn-card-question.component';
import { LearnExampleComponent } from './components/learn-example/learn-example.component';
import { LearnIntroComponent } from './components/learn-intro/learn-intro.component';
import { ReplayGifComponent } from './components/replay-gif/replay-gif.component';
import { ScenarioDescribe2Component } from './components/scenario-describe-2/scenario-describe-2.component';
import { ScenarioDescribeComponent } from './components/scenario-describe/scenario-describe.component';
import { TabContentComponent } from './components/tab-content/tab-content.component';

@NgModule({
    declarations: [AlertComponent, BottomButtonsComponent, CardControlComponent, ChartComponent, CustomButtonComponent,
        DndBaseComponent, DragAndDropComponent, DragAndDrop2Component, EngineComponent, HeaderComponent, HotspotComponent, LearnComponent,
        LikertComponent, MainComponent, MatchComponent, McqComponent, MrqComponent, PaginatorComponent, PopupComponent, QuestionComponent,
        QuizComponent, SafeHtmlPipe, SimpleReportComponent, TabBarComponent, TextComponent, VideoPlayerComponent, AudioComponent,
        LegendsComponent, ScrollDirective, SelectComponent, CardFlipComponent, CardsMcqComponent, LearnIntroComponent, ReplayGifComponent,
        ScenarioDescribeComponent, LearnExampleComponent, CardWithOptionComponent, ImageCardsMcqComponent, TabContentComponent,
        ScenarioDescribe2Component, LearnCardQuestionComponent, CarouselComponent
    ],

    exports: [AlertComponent, AudioComponent, BottomButtonsComponent, CardControlComponent, CustomButtonComponent, DndBaseComponent,
        DragAndDropComponent, DragAndDrop2Component, EngineComponent, HeaderComponent, HotspotComponent, LearnComponent, LikertComponent,
        MainComponent, MatchComponent, McqComponent, MrqComponent, PaginatorComponent, PopupComponent, QuestionComponent, QuizComponent,
        SafeHtmlPipe, ScrollDirective, SimpleReportComponent, TabBarComponent, TextComponent, VideoPlayerComponent, SelectComponent,
        CardFlipComponent, CardsMcqComponent, LearnIntroComponent, ReplayGifComponent, ScenarioDescribeComponent, LearnExampleComponent,
        CardWithOptionComponent, ImageCardsMcqComponent, TabContentComponent, ScenarioDescribe2Component, LearnCardQuestionComponent,
        CarouselComponent
    ],

    imports: [
        CommonModule,
        NgxPaginationModule,
        AccordionModule.forRoot(),
        ModalModule.forRoot(),
        PopoverModule.forRoot(),
        TabsModule.forRoot(),
        RouterModule,
        VgBufferingModule,
        VgControlsModule,
        VgCoreModule,
        VgOverlayPlayModule
    ]
})

export class CoreModule { }
