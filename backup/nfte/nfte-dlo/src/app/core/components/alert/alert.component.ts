// angular
import { AfterViewInit, Component, ElementRef, EventEmitter, HostListener, Input, Output, ViewChild, OnChanges, SimpleChanges } from '@angular/core';

// our comopnents
import { AccessibilityService } from './../../services/accessibility.service';
import { MessageService } from './../../services/message.service';
import { BaseComponent } from './../base/base.component';

// third party
import { ModalDirective } from 'ngx-bootstrap';
import { KeyCodes } from '../../services/keyboard.service';

@Component({
    selector: 'app-alert',
    styleUrls: ['./alert.component.scss'],
    templateUrl: './alert.component.html'
})
export class AlertComponent extends BaseComponent implements OnChanges, AfterViewInit {

    @Input() description: string;
    @Input() descId: string;
    @Input() focusEle: ElementRef;
    @Input() title: string;
    @Input() noButtonText: string = 'no';
    @Input() noOfButtons: number = 2;
    @Input() yesButtonText: string = 'yes';

    @Output() yesClickedEvent: EventEmitter<string> = new EventEmitter();
    @Output() noClickedEvent: EventEmitter<string> = new EventEmitter();
    @Output() okClickedEvent: EventEmitter<string> = new EventEmitter();

    @ViewChild('popup') public popup: ModalDirective;

    isVisible: boolean = false;


    el: HTMLElement;
    elRef: ElementRef;
    $el: any;

    @HostListener('window:focus', ['$event'])
    onWindowFocus(event: FocusEvent) {
        if (this.isVisible) {
            this.setFocus( jQuery(this.$el).find('[role=dialog]')[0]);
        }
    }

    

    constructor(el: ElementRef) {
        super();
        this.elRef = el;
        this.el = this.elRef.nativeElement;
        this.$el = jQuery(this.el);
    }

    /**
     * hide alert popup
     */
    hide() {
        this.isVisible = false;
        this.popup.hide();
        if (this.focusEle) {
            this.focusEle.nativeElement.focus();
        }
        this.noClickedEvent.next();
        this.okClickedEvent.emit();
    }

    ngOnChanges(changes: SimpleChanges) {
        if (changes.descId) {
            this.description = MessageService.getMessage(changes.descId.currentValue);
        }
    }

    // set focus back to close after last button
    setFocus(focusEle) {
        if (focusEle) {
            setTimeout(() => {
                focusEle.focus();
            }, 0);
        }
    }

    ngAfterViewInit() {
        var ele = jQuery(this.$el).find('[tabindex=0]');
        for (var i = 0; i < ele.length; i++) {
            ele[i].addEventListener('keydown', (event) => {
                 if(this.handleTab(event)){
                    event.preventDefault();
                 }

            });
        }
    }

    /**
     * show alert popup
     */
    show() {
        this.popup.show();
        this.isVisible = true;
    }

    /**
     * handle yes or similar button clicked
     */
    yesClicked() {
        this.yesClickedEvent.next();
        this.hide();
    }

    handleTab(event) {
        var target = event.target;
        var selectIndex = 0;
        var ele = jQuery(this.$el).find('[tabindex=0]');
        for (var i = 0; i < ele.length; i++) {
            if (ele[i] === target) {
                selectIndex = i;
                break;
            }
        }
        
            if (selectIndex === 0 && (event.keyCode === KeyCodes.tab && event.shiftKey)) {
                this.setFocus(ele[ele.length - 1]);
                return true;
            }
            else if (selectIndex === ele.length - 1 && (event.keyCode === KeyCodes.tab && !event.shiftKey)) {
                this.setFocus(ele[0]);
                return true;
            }
       
            return false;
        }
    }

