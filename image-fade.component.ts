// component that contains logic for swapping images with a fade in/out effect without leaving a blank background
// written on Angular+

import { Component, OnInit, Renderer2, ViewChild } from '@angular/core';

@Component({
  selector: 'some-app',
  templateUrl: `
  <div>
    <img class="background" src={{frontImage}}>
    <img class="background hidden" src={{backImage}} #background>
  </div>
  `,
  styleUrls: [`
  .background {
    position: fixed;
    object-fit: cover;
    height: 110%; 
  }
  .visible {
    transition: 4s ease-out;
    opacity: 1;
  }
  .hidden {
    transition: 4s ease-out;
    opacity: 0;
  }
  `]
})
export class SomeAppComponent {
    @ViewChild('background') background: ElementRef;

    public gallery = [
        '/assets/1.jpg',
        '/assets/2.jpg',
        '/assets/3.jpg',
        '/assets/4.jpg',
        '/assets/5.jpg'
    ];
    public firstStart: number = 0;
    public secondStart: number = 0;
    public backImage = this.gallery[this.firstStart];
    public frontImage = this.gallery[this.secondStart];

    constructor(private renderer: Renderer2) {}

    ngOnInit() {
        this.backImgSorter();
        this.delayer();
    }

    backImgSorter() {
        setInterval(() => {
            this.backImage = this.gallery[this.firstStart];
            this.firstStart++;
            if (this.firstStart === 5) this.firstStart = 0;
        }, 10000);
    }

    delayer() {
        setTimeout(() => {
            this.frontImgSorter();
        }, 5000);
        setTimeout(() => {
            this.renderer.removeClass(this.background.nativeElement, 'hidden');
            this.renderer.addClass(this.background.nativeElement, 'visible');
        }, 10000);
    }

    frontImgSorter() {
        setInterval(() => {
            this.renderer.removeClass(this.background.nativeElement, 'visible');
            this.renderer.addClass(this.background.nativeElement, 'hidden');
            this.frontImage = this.gallery[this.secondStart];
            this.secondStart++;
            if (this.secondStart === 5) this.secondStart = 0;
            setTimeout(() => {
                this.renderer.removeClass(this.background.nativeElement, 'hidden');
                this.renderer.addClass(this.background.nativeElement, 'visible');
            }, 6000);
        }, 10000);
    }
}
