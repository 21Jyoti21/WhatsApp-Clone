const audioController = {
  currentWaveform: null,
  currentAudio: null,

  play(waveform, audio) {
    if (
      this.currentWaveform &&
      this.currentWaveform !== waveform &&
      this.currentWaveform.backend
    ) {
      try {
        this.currentWaveform.pause();
      } catch (e) {
        console.warn("Waveform already destroyed");
      }
    }

    if (this.currentAudio && this.currentAudio !== audio) {
      this.currentAudio.pause();
      this.currentAudio.currentTime = 0;
    }

    this.currentWaveform = waveform;
    this.currentAudio = audio;

    waveform.play();
    audio.play();
  },

  stop(waveform, audio) {
    if (waveform?.backend) {
      try {
        waveform.pause();
      } catch {}
    }

    if (audio) {
      audio.pause();
      audio.currentTime = 0;
    }

    if (this.currentWaveform === waveform) {
      this.currentWaveform = null;
      this.currentAudio = null;
    }
  },
};

export default audioController;