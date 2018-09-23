import { CardsMCQModel } from '../cards-mcq/cards-mcq-model';

export class ImageCardsMcqModel {
    title: string = '';
    cardsMcqModel: CardsMCQModel;
    imgSrc: string = '';
    altText: string = '';
    constructor(data) {
        this.title = data.title;
        this.cardsMcqModel = new CardsMCQModel(data);
        this.imgSrc = data.imgSrc;
        this.altText = data.altText;
    }
}
