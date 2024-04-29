function formatTime(seconds) {
  const SECONDS_IN_MINUTE = 60;
  const minutes = (seconds / SECONDS_IN_MINUTE);

  const minutePart = Math.floor(minutes);
  const sec = SECONDS_IN_MINUTE * (minutes - minutePart);

  return `${minutePart}:${Math.round(sec).toString().padStart(2, 0)}`;
}

function currentTime(value, duration) {
  return Math.round(+value * duration);
}

function reflectTime(current, duration) {
  return current / duration;
}

// Create a class for the element
class AudioPlayer extends HTMLElement {
  observedAttributes = ['src', 'title'];

  constructor() {
    super();
    this.onDurationChange = this.onDurationChange.bind(this);
  }

  setStyle() {
    const style = document.createElement('link');
    style.setAttribute('rel', 'stylesheet');
    style.setAttribute('type', 'text/css');
    style.setAttribute('href', 'audio-player.css');
    return style;
  }

  controlIcon(type) {
    let icon;

    switch (type) {
      case 'stop':
        icon = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><title>Pause audio</title><path d="M5 4h3v12H5V4zm7 0h3v12h-3V4z"/></svg>';
        break;
      case 'back':
        icon = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><title>Go back 10 seconds</title><path d="M4 5h3v10H4V5zm12 0v10l-9-5 9-5z"/></svg>';
        break;
      case 'forward':
        icon = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><title>Go forward 10 seconds</title><path d="M13 5h3v10h-3V5zM4 5l9 5-9 5V5z"/></svg>';
        break;
      default:
        icon = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><title>Play audio</title><path d="M4 4l12 6-12 6z"/></svg>';
    }

    return icon;
  }

  // eslint-disable-next-line default-param-last
  makeButton(action = 'play', aria = 'Play audio', handler = null, icon) {
    const button = document.createElement('button');
    button.setAttribute('type', 'button');
    button.setAttribute('aria-label', aria);
    button.setAttribute('data-action', action);
    button.innerHTML = icon;
    button.addEventListener('click', handler);
    return button;
  }

  getTitle() {
    let title = 'Listen to this post';
    if (this.hasAttribute('title')) {
      title = this.getAttribute('title');
    }
    return title;
  }

  makeTitle() {
    const h2 = document.createElement('h2');
    h2.textContent = this.getTitle();
    return h2;
  }

  makeTrack() {
    const curTime = document.createElement('output');
    curTime.setAttribute('name', 'current-time');
    curTime.setAttribute('for', 'audio-progress');
    curTime.textContent = '0:00';

    const progress = document.createElement('progress');
    progress.setAttribute('value', 0);
    progress.setAttribute('id', 'audio-progress');
    progress.setAttribute('name', 'audio-progress');

    const scrub = document.createElement('input');
    scrub.setAttribute('type', 'range');
    scrub.setAttribute('min', 0);
    scrub.setAttribute('max', 1);
    scrub.setAttribute('value', 0);
    scrub.setAttribute('step', 0.01);
    scrub.setAttribute('name', 'audio-duration');
    scrub.setAttribute('id', 'audio-duration');
    scrub.addEventListener('input', (domEvent) => {
      const { target } = domEvent;
      const audio = target.parentElement.parentElement.previousElementSibling;
      const seekTo = currentTime(domEvent.target.value, audio.duration);

      if ('fastSeek' in audio) {
        audio.fastSeek(seekTo);
      } else {
        audio.currentTime = seekTo;
      }
    });

    const label = document.createElement('label');
    label.setAttribute('for', 'audio-duration');
    label.textContent = '0:00';

    const trackFrag = document.createDocumentFragment();
    trackFrag.appendChild(curTime);
    trackFrag.appendChild(progress);
    trackFrag.appendChild(scrub);
    trackFrag.appendChild(label);

    const track = document.createElement('p');
    track.setAttribute('class', 'audio-player-track');
    track.appendChild(trackFrag);

    return track;
  }

  makeControls() {
    const back = this.makeButton(
      'back',
      'Go back 10 seconds',
      this.back,
      this.controlIcon('back'),
    );

    const play = this.makeButton(
      'play',
      'Play audio',
      this.play,
      this.controlIcon('play'),
    );

    const pause = this.makeButton(
      'stop',
      'Stop audio',
      this.stop,
      this.controlIcon('stop'),
    );

    const forward = this.makeButton(
      'forward',
      'Go forward 10 seconds',
      this.forward,
      this.controlIcon('forward'),
    );

    pause.setAttribute('hidden', true);

    const controlFrag = document.createDocumentFragment();
    controlFrag.appendChild(back);
    controlFrag.appendChild(play);
    controlFrag.appendChild(pause);
    controlFrag.appendChild(forward);

    const controls = document.createElement('p');
    controls.setAttribute('class', 'audio-player-controls');
    controls.appendChild(controlFrag);

    return controls;
  }

  play(domEvent) {
    const { target } = domEvent;
    const audioEl = target.parentElement.parentElement.previousElementSibling;

    const forward = target.parentElement.querySelector('[data-action=forward]');
    forward.removeAttribute('disabled');

    audioEl.play();
    target.setAttribute('hidden', true);
    target.parentElement.querySelector('[data-action=stop]').removeAttribute('hidden');

    if (audioEl.currentTime >= 10) {
      audioEl.parentNode.querySelector('[data-action=back]').removeAttribute('disabled')
    }

    if (audioEl.currentTime < 10) {
      audioEl.parentNode.querySelector('[data-action=back]').setAttribute('disabled', true)
    }
  }

  stop(domEvent) {
    const { target } = domEvent;
    const audioEl = target.parentElement.parentElement.previousElementSibling;

    audioEl.pause();
    const play = target.parentElement.querySelector('[data-action=play]');
    play.removeAttribute('hidden');

    target.setAttribute('hidden', true);
  }

  back(domEvent) {
    const { target } = domEvent;
    const audioEl = target.parentElement.parentElement.previousElementSibling;
    const forward = target.parentElement.querySelector('[data-action=forward]');
    forward.removeAttribute('disabled');

    const goback = audioEl.currentTime - 10;
    return goback;
  }

  forward(domEvent) {
    const { target } = domEvent;
    const audioEl = target.parentElement.parentElement.previousElementSibling;
    const ahead = audioEl.currentTime + 10;

    return ahead;
  }

  onDurationChange(domEvent) {
    const dur = domEvent.target.parentElement.querySelector('label[for=audio-duration]');
    const seconds = document.createTextNode(formatTime(domEvent.target.duration));
    dur.replaceChild(seconds, dur.firstChild);
  }

  onTimeUpdate(domEvent) {
    const { target } = domEvent;
    const current = target.parentElement.querySelector('output');
    const controls = target.nextElementSibling
    const time = reflectTime(target.currentTime, target.duration);

    if (target.currentTime > 10) {
      controls.querySelector('[data-action=back]').removeAttribute('disabled');
    } else {
      controls.querySelector('[data-action=back]').setAttribute('disabled', true);
    }

    if (target.currentTime >= target.duration) {
      controls.querySelector('[data-action=forward]').setAttribute('disabled', true);
    } else {
      controls.querySelector('[data-action=forward]').removeAttribute('disabled');
    }

    const range = controls.querySelector('[type=range]');
    const progress = controls.querySelector('progress');

    range.value = time;
    progress.value = range.value;

    current.value = formatTime(target.currentTime);
  }

  makeAudio() {
    const audio = document.createElement('audio');
    if (this.hasAttribute('src')) {
      audio.setAttribute('src', this.getAttribute('src'));
    }

    audio.addEventListener('durationchange', this.onDurationChange);
    audio.addEventListener('timeupdate', this.onTimeUpdate);

    return audio;
  }

  connectedCallback() {
    const shadow = this.attachShadow({ mode: 'open' });
    shadow.appendChild(this.setStyle());

    const apWrapper = document.createElement('div');
    apWrapper.setAttribute('class', 'audio-player');

    const audio = this.makeAudio();
    apWrapper.appendChild(this.makeTitle());
    apWrapper.appendChild(audio);

    const trackAndControls = document.createElement('form');

    const track = this.makeTrack();
    const controls = this.makeControls();

    trackAndControls.appendChild(track);
    trackAndControls.appendChild(controls);

    apWrapper.appendChild(trackAndControls);
    shadow.appendChild(apWrapper);
  }
}

customElements.define('audio-player', AudioPlayer);
