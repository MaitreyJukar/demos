export class ScenarioDescribeModel {
    imgSrc: string = '';
    imgFrame: string = '';
    imgAltText: string = '';
    title: string = '';
    description: string = '';
    audioSrc: string = '';
    replayGif: boolean = false;
    gifDuration: number = 0;

    /**
     * constructor - set variables using json data or user response data
     * @param   data - json data or user data for this model
     */
    constructor(data) {
        this.imgSrc = data.imgSrc;
        this.imgAltText = data.altText;
        this.title = data.title;
        this.imgFrame = data.imgFrame;
        this.description = data.description;
        this.audioSrc = data.audioSrc;
        this.replayGif = data.replayGif;
        if (this.replayGif) {
            this.gifDuration = data.gifDuration;
        }
    }
}
