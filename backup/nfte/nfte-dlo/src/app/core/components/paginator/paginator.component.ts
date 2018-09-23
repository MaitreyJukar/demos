import { AfterViewInit, Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { BaseComponent } from './../base/base.component';
import { QuestionDataModel } from './../question/question.model';
@Component({
  selector: 'app-paginator',
  styleUrls: ['./paginator.component.scss'],
  templateUrl: './paginator.component.html'
})

export class PaginatorComponent extends BaseComponent implements OnInit {
  @ViewChild('prevoiusButton') prevButton;
  @ViewChild('nextButton') nextButton;
  p: number = 1;
  totalPages: number;
  pa: HTMLElement;
  @Output() pageChange = new EventEmitter<number>();
  displayQuestionList: boolean = false;
  @Input() model: Array<QuestionDataModel>;
  previousLabel = this.getAccText('previousLabel');
  nextLabel = this.getAccText('nextLabel');
  screenReaderPaginationLabel = this.getAccText('screenReaderPaginationLabel');
  screenReaderPageLabel = this.getAccText('screenReaderPageLabel');
  screenReaderCurrentLabel = this.getAccText('screenReaderCurrentLabel');

  ngOnInit() {
    this.totalPages = this.model.length;
  }
  onPageChange($event) {
    if ($event)
      this.pageChange.next($event);
  }
  setDisplayQuestionList() {
    this.displayQuestionList = !this.displayQuestionList;
  }
  setFocus(event) {
    // setTimeout(() => {
    //   const element: any = document.querySelector('.current div');
    //   if (element) {
    //     element.focus();
    //   }
    // }, 500);
  }
}
