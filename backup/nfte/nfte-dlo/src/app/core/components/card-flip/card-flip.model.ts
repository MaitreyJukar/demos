export class CardFlipModel {
    frontText: string = '';
    backText: string = '';
    correct: boolean = false;
    constructor(data) {
        this.frontText = data.frontText;
        this.backText = data.backText;
        this.correct = data.correct;
    }
}
