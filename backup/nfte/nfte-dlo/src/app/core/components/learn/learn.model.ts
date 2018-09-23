import { DNDModel } from './../../../core/components/dnd-base/dnd.model';
import { HotspotModel } from './../../../core/components/hotspot/hotspot.model';
import { LikertModel } from './../../../core/components/likert/likert.model';
import { MatchModel } from './../../../core/components/match/match.model';
import { MCQModel } from './../../../core/components/mcq/mcq.model';
import { MRQModel } from './../../../core/components/mrq/mrq.model';
import { questionType } from './../../../core/components/question/question.component';
import { QuestionDataModel } from './../../../core/components/question/question.model';

export class LearnModel {


  questions: Array<QuestionDataModel>;
  currentVideoTime;
  volume;
  videoSrc: string;
  cuePointFile: string;
  transcript: string;
  subtitle: string;
  playText: string;
  poster: string = undefined;
  constructor(data: object) {
    this.videoSrc = data['videoSrc'];
    this.cuePointFile = data['cuePointFile'];
    this.questions = new Array<QuestionDataModel>();
    for (let i = 0; i < data['questions'].length; i++) {
      if (data['questions'][i].type === questionType.MCQ) {
        this.questions.push(new MCQModel(data['questions'][i]));
      } else if (data['questions'][i].type === questionType.DRAGDROP) {
        this.questions.push(new DNDModel(data['questions'][i]));
      } else if (data['questions'][i].type === questionType.HOTSPOT) {
        this.questions.push(new HotspotModel(data['questions'][i]));
      } else if (data['questions'][i].type === questionType.MRQ) {
        this.questions.push(new MRQModel(data['questions'][i]));
      } else if (data['questions'][i].type === questionType.MATCHING) {
        this.questions.push(new MatchModel(data['questions'][i]));
      } else if (data['questions'][i].type === questionType.LIKERT) {
        this.questions.push(new LikertModel(data['questions'][i]));
      } else if (data['questions'][i].type === questionType.TEXT_INFO) {
        this.questions.push(data['questions'][i]);
      }
    }
    if (data['currentVideoTime'] !== undefined) {
      this.currentVideoTime = data['currentVideoTime'];
    }
    if (data['volume'] !== undefined) {
      this.volume = data['volume'];
    }
    if (data['poster']) {
      this.poster = data['poster'];
    }
    this.transcript = data['transcript'];
    this.subtitle = data['subtitle'];
    this.playText = data['playText'];
  }
}
