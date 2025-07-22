// Create a class for the element
class AudioPlayer extends HTMLElement {
  observedAttributes = ['src', 'title'];

  constructor() {
    super();
    this.onDurationChange = this.onDurationChange.bind(this);
    this.audioPlayer = null;
    this.play = this.play.bind( this );
    this.stop = this.stop.bind( this );
    this.forward = this.forward.bind( this );
    this.back = this.back.bind( this );
    this.onTimeUpdate = this.onTimeUpdate.bind( this );
  }

  makeAudio() {
    const wrapper = document.createElement('div');
    wrapper.classList.add('audio-player');

    wrapper.innerHTML = `<h2></h2>
      <audio preload="metadata"></audio>
      <form>
        <p class="audio-player-track">
          <output name="current-time" for="audio-progress"></output>
          <progress value="0" id="audio-progress" name="audio-progress"></progress>
          <input
            type="range"
            min="0"
            max="1"
            value="0"
            step="0.01"
            name="audio-duration"
            id="audio-duration"
          >
          <label for="audio-duration">-</label>
        </p>
        <p class="audio-player-controls">
          <button type="button" title="Go back 10 seconds" aria-label="Go back 10 seconds" data-action="back">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
              <title>Go back 10 seconds</title><path d="M4 5h3v10H4V5zm12 0v10l-9-5 9-5z">
              </path>
            </svg>
          </button>
          <button type="button" title="Play audio" aria-label="Play audio" data-action="play">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
              <title>Play audio</title>
              <path d="M4 4l12 6-12 6z"></path>
            </svg>
          </button>
          <button type="button" title="Stop audio" aria-label="Stop audio" data-action="stop" hidden="true">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
              <title>Pause audio</title>
              <path d="M5 4h3v12H5V4zm7 0h3v12h-3V4z"></path>
            </svg>
          </button>
          <button type="button" title="Go forward 10 seconds" aria-label="Go forward 10 seconds" data-action="forward">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
              <title>Go forward 10 seconds</title>
              <path d="M13 5h3v10h-3V5zM4 5l9 5-9 5V5z"></path>
            </svg>
          </button>
        </p>
        </form>`;

      this.audioPlayer = wrapper;
  }

  setStyle() {
    const style = document.createElement('link');
    style.setAttribute('rel', 'stylesheet');
    style.setAttribute('type', 'text/css');
    style.setAttribute('href', 'audio-player.css');
    return style;
  }

  getTitle() {
    let title = 'Listen to this post';

    if(
      this.hasAttribute('postTitle') &&
      typeof this.getAttribute('postTitle')  === 'string'
    ) {
      title = this.getAttribute('postTitle');
    }

    return title;
  }

  setSrc() {
    if( !this.audioPlayer ) return;

    const aud = this.getAudioEl();

    if (this.hasAttribute('src')) {
      aud.setAttribute('src', this.getAttribute('src'));
    }
  }

  makeTrack() {
    if(!this.audioPlayer) return;

    const { audioPlayer } = this;

    const curTime = audioPlayer.querySelector('output');
    curTime.textContent = '0:00';
    const audio = audioPlayer.querySelector('audio');

    const scrub = audioPlayer.querySelector('input');

    scrub.addEventListener('input', (domEvent) => {
      const { target } = domEvent;

      const seekTo = this.soughtTime( target.value, audio.duration );

      if ('fastSeek' in audio) {
        audio.fastSeek(seekTo);
      } else {
        audio.currentTime = seekTo;
      }
    });

    const label = audioPlayer.querySelector('[for="audio-duration"]');
    label.textContent = '0:00';
  }

  setControls() {
    if( !this.audioPlayer ) return;
    const buttons = this.audioPlayer.querySelectorAll('button');

    buttons.forEach( (b) => {
      if( b.dataset.action ) {
        const { action } = b.dataset;
        b.addEventListener( 'click', this[ action ] );
      }
    });

  }

  play() {
    if( !this.audioPlayer ) return;

    const { audioPlayer } = this;

    const audioEl = this.getAudioEl();
    const play = audioPlayer.querySelector('[data-action=play]');
    const pause = audioPlayer.querySelector('[data-action=stop]');

    const forward = audioPlayer.querySelector('[data-action=forward]');
    forward.removeAttribute('disabled');

    audioEl.play();

    play.setAttribute('hidden', true);
    pause.removeAttribute('hidden');
    pause.focus();

    if (audioEl.currentTime >= 10) {
      audioPlayer.querySelector('[data-action=back]').removeAttribute('disabled');
    }

    if (audioEl.currentTime < 4) {
      audioPlayer.querySelector('[data-action=back]').setAttribute('disabled', true)
    }
  }

  stop(domEvent) {
    if( !this.audioPlayer ) return;
    const { target } = domEvent;
    const audioEl = this.getAudioEl();

    audioEl.pause();
    target.setAttribute('hidden', true);

    const play = this.audioPlayer.querySelector('[data-action=play]');

    play.removeAttribute('hidden');
    play.focus();
  }

  back() {
    const audioEl = this.getAudioEl();
    const forward = this.audioPlayer.querySelector('[data-action=forward]');
    forward.removeAttribute('disabled');

    const goback = audioEl.currentTime -= 10;
    return goback;
  }

  getAudioEl() {
    if( !this.audioPlayer ) return;
    return this.audioPlayer.querySelector('audio');
  }

  forward() {
    const audioEl = this.getAudioEl();
    const ahead = audioEl.currentTime += 10;
    return ahead;
  }

  formatTime(seconds) {
    const SECONDS_IN_MINUTE = 60;
    const minutes = (seconds / SECONDS_IN_MINUTE);
    const minutePart = Math.floor(minutes);
    const sec = SECONDS_IN_MINUTE * (minutes - minutePart);
    return `${minutePart}:${Math.round(sec).toString().padStart(2, 0)}`;
  }
  
  soughtTime(value, duration) {
    return Math.round( +value * duration );
  }

  reflectTime(current, duration) {
    return current / duration;
  }

  onDurationChange( domEvent ) {
    const { duration } = domEvent.target;
    const { audioPlayer } = this;

    const durLabel = audioPlayer.querySelector('label[for=audio-duration]');
    const seconds = document.createTextNode( this.formatTime(duration) );
    durLabel.replaceChild(seconds, durLabel.firstChild);
  }

  onTimeUpdate(domEvent) {
    const { target } = domEvent;
    const { audioPlayer } = this;

    const current = audioPlayer.querySelector('output');
    const time = this.reflectTime(target.currentTime, target.duration);

    const backForward = audioPlayer.querySelectorAll('[data-action=back],[data-action=forward]');

    if (target.currentTime > 10) {
      backForward[0].removeAttribute('disabled');
    } else {
      backForward[0].setAttribute('disabled', true);
    }

    if (target.currentTime >= target.duration) {
      backForward[1].setAttribute('disabled', true);
    } else {
      backForward[1].removeAttribute('disabled');
    }

    const range = audioPlayer.querySelector('[type=range]');
    const progress = audioPlayer.querySelector('progress');

    range.value = time;
    progress.value = range.value;

    current.value = this.formatTime(target.currentTime);

  }

  makeTitle() {
    if( !this.audioPlayer ) return;
    const { audioPlayer } = this;

    const title = audioPlayer.querySelector('h2');
    title.appendChild( document.createTextNode( this.getTitle() ));
  }

  setTimeUpdates() {
    const audioEl = this.getAudioEl();
    audioEl.addEventListener('durationchange', this.onDurationChange );
    audioEl.addEventListener('timeupdate', this.onTimeUpdate );
  }

  togglePlayPause() {
    const audioEl = this.getAudioEl();
    const { audioPlayer } = this;

    const playPause = audioPlayer.querySelectorAll('[data-action=play],[data-action=stop]');

    playPause.forEach((p) => {
      p.toggleAttribute('hidden');
      if( !p.hidden ) {
        p.focus();
      }
    });

    // If the play button is hidden...
    if( playPause[0].hidden ) {
      audioEl.play();
    } else {
      audioEl.pause();
    }
  }

  connectedCallback() {

    const shadow = this.attachShadow({ mode: 'open' });
    shadow.appendChild( this.setStyle() );

    this.makeAudio();
    this.setSrc();
    this.makeTitle();
    this.makeTrack();
    this.setControls();
    this.setTimeUpdates();

    shadow.appendChild(this.audioPlayer);

    shadow.addEventListener('keydown', (e) => {
      if(shadow.activeElement.id === 'audio-duration' && e.code === 'Space') {
        this.togglePlayPause();
      }
    });
  }
}

customElements.define('audio-player', AudioPlayer);
