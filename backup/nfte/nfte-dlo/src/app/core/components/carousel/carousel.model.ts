import { CarouselSlideModel } from './carousel-slide.model';

export class CarouselModel {
    arrSlides: Array<CarouselSlideModel> = [];
    title: string;
    slideNames: Array<string>;
    /**
     * constructor - set variables using json data or user response data
     * @param   data - json data or user data for this model
     */
    constructor(data) {
        this.slideNames = data.slideNames;
        this.title = data.title;
        for (let i = 0; i < data.slides.length; i++) {
            this.arrSlides.push(new CarouselSlideModel(data.slides[i]));
            this.arrSlides[i].cardIndex = -i;
            this.arrSlides[i].index = i;
        }
    }
}
