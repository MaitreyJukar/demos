export class LearnIntroModel {
    imgSrc: string = '';
    imgAltText: string = '';
    headingText: string = '';
    descriptionText: string = '';
    audioSrc: string = '';
    imgFrame: string = '';
    replayGif: boolean = false;
    gifDuration: number = 0;

    /**
     * constructor - set variables using json data or user response data
     * @param   data - json data or user data for this model
     */
    constructor(data) {
        this.imgSrc = data.imgSrc;
        this.imgAltText = data.imgAltText;
        this.imgFrame = data.imgFrame;
        this.headingText = data.headingText;
        this.descriptionText = data.descriptionText;
        this.audioSrc = data.audioSrc;
        this.replayGif = data.replayGif;
        if (this.replayGif) {
            this.gifDuration = data.gifDuration;
        }
    }
}
