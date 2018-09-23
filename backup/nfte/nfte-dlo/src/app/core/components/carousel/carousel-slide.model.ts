export class CarouselSlideModel {
    imgSrc: string = '';
    imgAltText: string = '';
    title: string = '';
    description: string = '';
    audioSrc: string = '';
    index: number = 0;
    cardIndex: number = -1;

    /**
     * constructor - set variables using json data or user response data
     * @param   data - json data or user data for this model
     */
    constructor(data) {
        this.imgSrc = data.imgSrc;
        this.imgAltText = data.imgAltText;
        this.title = data.title;
        this.description = data.description;
        this.audioSrc = data.audioSrc;
    }
}
