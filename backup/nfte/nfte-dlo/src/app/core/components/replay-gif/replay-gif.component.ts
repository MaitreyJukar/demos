import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-replay-gif',
  styleUrls: ['./replay-gif.component.scss'],
  templateUrl: './replay-gif.component.html'
})
export class ReplayGifComponent implements OnInit {
  ignoreClick: boolean = false;
  @Input() src: string = '';
  @Input() alt: string = '';
  @Input() imgFrame: string = '';
  @Input() gifDuration: number = 0;

  ngOnInit() {
   this.replay();
  }
  replay() {
    if (this.ignoreClick) {
      return;
    }
    const imgSrc = this.src;
    this.src = this.imgFrame;
    this.ignoreClick = true;
    setTimeout(() => {
      this.ignoreClick = false;
    }, this.gifDuration);
    setTimeout(() => {
      this.src = imgSrc;
    }, 0);
  }

}
