import { ChangeDetectorRef, Component, ElementRef, Input, OnDestroy, ViewChild } from '@angular/core';
import { Http } from '@angular/http';
import { ActivatedRoute, Router } from '@angular/router';
import { VgAPI } from 'videogular2/core';
import { BrowserCompatibilityService } from '../../../core/services/browser-compatibility.service';
import { DragAndDropComponent } from './../drag-and-drop/drag-and-drop.component';
import { LearnModel } from './../learn/learn.model';
import { MatchComponent } from './../match/match.component';
import { questionType } from './../question/question.component';
import { QuestionDataModel, responseType } from './../question/question.model';

import { MessageService } from './../../services/message.service';
import { WindowResizeService } from './../../services/window-resize.service';

import { VideoBase } from './../video/video-base';
import { AudioManager } from '../../services/AudioManager';


export interface ICuePoint {
    title: string;
    description: string;
    src: string;
    href: string;
}

@Component({
    selector: 'app-video-player',
    styleUrls: ['./video-player.component.scss'],
    templateUrl: './video-player.component.html'
})

export class VideoPlayerComponent extends VideoBase implements OnDestroy {
    @ViewChild('match') match: MatchComponent;
    @ViewChild('dnd') dnd: DragAndDropComponent;
    @ViewChild('media') video: ElementRef;
    cuePointData: ICuePoint = null;
    track: TextTrack;
    showCuePointManager = true;
    json: JSON = JSON;
    index = 0;
    hotspotVisible: boolean;
    currentQuestion: any;
    item: QuestionDataModel;
    animationClass = 'in';
    feedback;
    feedbackClass;
    doneClicked;
    doneDisable: boolean = true;
    videoHeight: number;
    videoWidth: number;
    questionContainerHeight: number;
    questionContainerWidth: number;
    videoContainerHeight: number;
    videoContainerWidth: number;
    currentVideoTime;
    data: LearnModel;
    showCorrectAnswerFlag: boolean = false;
    resizeAfterResume: boolean = false;
    isLearnTab: boolean = false;
    @Input() set model(model: LearnModel) {
        this.data = model;

        this.videoData = {
            cuePointFile: this.model.cuePointFile,
            poster: this.model.poster,
            src: this.model.videoSrc,
            subtitle: this.model.subtitle,
            transcript: this.model.transcript,
            type: 'video/mp4'
        };
    }
    get model(): LearnModel {
        return this.data;
    }


    /**
     * constructor
     */
    constructor(http: Http, cdr: ChangeDetectorRef, private router: Router, private activatedRoute: ActivatedRoute,
        private resizeService: WindowResizeService, private browserCompatibility: BrowserCompatibilityService, audioManager: AudioManager) {
        super(http, cdr, browserCompatibility);
        this.resizeService.register(this);
        this.isLearnTab = this.activatedRoute.url['value'][0].path === 'learn';
        this.hotspotVisible = false;
        audioManager.allVideoPlayers.push(this);
        this.audioManager = audioManager;
    }

    convertToBoolean(value): boolean {
        if (typeof (value) === 'boolean') {
            return value;
        } else {
            return value === 'true'
        }
    }

    ngOnDestroy() {
        if (this.activatedRoute.url['value'][0].path === 'learn') {
            MessageService.dloData['learn'] = this.data;
        }
        this.resizeService.deregister(this);
    }

    /**
 * when videogular api is ready
 * @param  {VgAPI} api
 */
    onPlayerReady(api: VgAPI) {
        this.api = api;
        this.api.fsAPI.nativeFullscreen = false;
        this.api.addTextTrack('metadata');
        this.track = this.api.textTracks[0];
        this.track.mode = 'hidden';
        this.addListeners();
        this.changeThirdPartyAriaLabels();
        this.http.get(this.model.transcript)
            .subscribe((res) => {
                this.transcriptData = res.text();
            });

        if (this.data && this.data.currentVideoTime) {
            const canPlaySubscription = this.api.getDefaultMedia().subscriptions.canPlay.subscribe(
                () => {
                    this.api.getDefaultMedia().currentTime = this.data.currentVideoTime;
                    canPlaySubscription.unsubscribe();
                }
            );
        }
        if (this.data && this.data.volume) {
            this.api.volume = this.data.volume;
        }

        this.api.getDefaultMedia().subscriptions.volumeChange.subscribe(
            (event) => {
                this.data.volume = event.target.volume;
            })


        this.api.getDefaultMedia().subscriptions.timeUpdate.subscribe(
            (event) => {
                // Set the video to the beginning
                if (event.target.videoHeight > 0 && this.api.state === 'playing') {
                    this.data.currentVideoTime = event.target.currentTime;
                }
            }
        );
        this.api.getDefaultMedia().subscriptions.ended.subscribe(
            () => {
                // Set the video to the beginning
                // this.api.getDefaultMedia().currentTime = 0;
                this.videoCompleted = true;
                if (this.api && this.api.fsAPI.isFullscreen) {
                    this.api.fsAPI.toggleFullscreen();
                    this.resizeAfterResume = true;
                    setTimeout(() => {
                        this.onResize();
                    }, 200);

                }
            }
        );

        this.cdr.detectChanges();
    }

    getAccText( idAcc: string): string{
        if(idAcc === 'Subtitle') {
            idAcc = this.subtitleVisible ? 'hide' + idAcc : 'show' + idAcc;
        }
        return super.getAccText(idAcc);
    }

    showQuestion() {
        this.timeOutControl = false;
        this.api.pause();
        this.animationClass = 'fadeIn';
        this.item = this.data.questions[this.currentQuestion.id - 1];
        this.index = this.currentQuestion.id;

        if (this.item) {
            this.feedback = this.item.feedback;
        }
        if (this.item.type === 5 || this.item.type === 6) {
            this.onResize();
        }
        if (this.item && this.item.type === 3) {
            setTimeout(() => {
                this.match.onResize();
            }, 200);
        }
        if (this.feedback !== undefined) {
            this.doneClicked = true;
            if (this.item.responseType === responseType.CORRECT) {
                this.feedbackClass = 'correct';
            } else if (this.item.responseType === responseType.INCORRECT) {
                this.feedbackClass = 'incorrect';
            } else {
                this.feedbackClass = 'partially-correct';
            }
        }
        this.cuePointData = JSON.parse(this.currentQuestion.text);
        this.onResize();
    }

    /**
     * handle cue enter event
     * @param  {} $event
     */
    onEnterCuePoint($event) {

        this.currentQuestion = $event;

        if (this.data.questions[this.currentQuestion.id - 1].questionMode === QuestionMode.HOTSPOT) {
            this.hotspotVisible = true;
            this.cdr.detectChanges();
            const css = this.data.questions[this.currentQuestion.id - 1].hotspotcoords;
            if (css) {
                jQuery('.hotspot-question').css({
                    'height': css.size,
                    'left': css.left,
                    'top': css.top,
                    'transform': css.transform,
                    'width': css.size
                });
            }
        } else {
            this.showQuestion();
        }
    }

    /**
     * handle cue leave event
     * @param  {} $event
     */
    onExitCuePoint($event) {

        this.showCorrectAnswerFlag = false;
        this.animationClass = 'fadeOut';
        this.item = null;
        // setTimeout(() => {
        this.cuePointData = null;
        // if(this.api.state !== 'paused')
        if (this.api.time.current !== this.api.time.total) {
            this.api.play();
        }

        this.doneDisable = true;
        this.doneClicked = false;
        // }, 400);

        if ($event !== EVENT_EMITTER_TYPE.SKIP) {
            this.hotspotVisible = false;
        }


    }

    onClick($event) {
        this.onExitCuePoint($event);
    }
    onDoneClick() {
        this.doneClicked = true;
        if (this.item.type === questionType.MATCHING) {
            this.match.onDoneClick();
            this.feedback = this.match.model.feedback;

        } else {
            this.item.submit();
            this.feedback = this.item.feedback;
        }
        if (this.item.responseType === responseType.CORRECT) {
            this.feedbackClass = 'correct';
        } else if (this.item.responseType === responseType.INCORRECT) {
            this.feedbackClass = 'incorrect';
        } else {
            this.feedbackClass = 'partially-correct';
        }

        MessageService.dloData['learn'] = this.data;
    }

    loadData($event) {
        const video = $event.target;
        this.videoHeight = video.videoHeight;
        this.videoWidth = video.videoWidth;
        this.onResize();
    }
    onResize() {

        if ((this.item && (this.item.type === 5 || this.item.type === 6)) || this.resizeAfterResume) {
            if (this.resizeAfterResume) {
                this.resizeAfterResume = false;
            }
            const videoRatio = this.videoHeight / this.videoWidth;
            this.videoContainerHeight = this.video.nativeElement.clientHeight;
            this.videoContainerWidth = this.video.nativeElement.clientWidth;
            let heightRatio;
            let widthRatio;
            heightRatio = this.videoContainerHeight / this.videoHeight;
            widthRatio = this.videoContainerWidth / this.videoWidth;
            if (heightRatio < widthRatio) {
                this.questionContainerHeight = Math.round(heightRatio * this.videoHeight);
                this.questionContainerWidth = Math.round(this.questionContainerHeight / videoRatio);
            } else {
                this.questionContainerWidth = Math.round(widthRatio * this.videoWidth);
                this.questionContainerHeight = Math.round(this.questionContainerWidth * videoRatio);
            }

        } else {
            this.questionContainerWidth = null;
            this.questionContainerHeight = null;
            return;
        }
    }


    goToExplore() {
        this.router.navigate(['../explore'], { relativeTo: this.activatedRoute });

    }

    showCorrectAnswer(flag: boolean) {
        this.showCorrectAnswerFlag = !flag;
    }

    resetData() {
        this.item.resetData();
        if (this.item.type === 5) {
            this.dnd.resetTilesPosition();
        }
        if (this.item.type === 3) {
            this.match.resetMatching();
        }
    }
    fullscreen() {
        this.api.fsAPI.toggleFullscreen();
        if (this.item && this.item.type === 3) {
            this.match.resetMatching();
        }
        setTimeout(() => {
            this.onResize();
            if (this.item && this.item.type === 3) {
                this.match.setFullScreenMode(this.api.fsAPI.isFullscreen);
                this.match.onResize();
            }
        }, 200);
    }

    onPointerMove() {
        if (this.api) {
            this.timeOutControl = false;
            clearTimeout(this.timeOut);
            this.timeOut = setTimeout(() => {
                if (this.api.state === 'playing')
                    this.timeOutControl = true;
            }, 3000);
        }
    }
    resumeVideo() {
        super.resumeVideo();
        for (const question of this.model.questions) {
            question.submited = false;
            if (question.type !== 8) {
                question.resetData();
            }
        }

    }


}

export enum QuestionMode {
    NORMAL = 0,
    HOTSPOT = 1
}

export enum EVENT_EMITTER_TYPE {
    SKIP = 0,
    RESUME = 1,
    DONE = 2,
    FULL_SCREEN = 3,
    SHOW_CORRECT_ANSWER = 4
}

