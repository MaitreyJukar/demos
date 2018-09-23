import { Injectable } from '@angular/core';
import { AudioBase } from '../components/audio/audio-base';
import { VideoBase } from '../components/video/video-base';

@Injectable()
export class AudioManager {
    audioPlayer: AudioBase;
    allPlayers: Array<AudioBase> = [];
    allVideoPlayers: Array<VideoBase> = [];
    playedOnce: boolean = false;

    playAllAudio(audioBase: AudioBase) {
        for (let i = 0; i < this.allPlayers.length; i++) {
            if (this.allPlayers[i] !== audioBase) {
                this.allPlayers[i].playVideo();
                this.allPlayers[i].pauseVideo();
            }
        }
    }

    pauseAllVideo() {
        for (let i = 0; i < this.allVideoPlayers.length; i++) {
            this.allVideoPlayers[i].api.pause();
        }
    }
    pauseAllAudio() {
        for (let i = 0; i < this.allPlayers.length; i++) {
            this.allPlayers[i].api.pause();
        }
    }


}
