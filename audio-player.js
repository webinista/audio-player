// Create a class for the element
class AudioPlayer extends HTMLElement {
  static observedAttributes = ['src', 'title'];

  constructor() {
    self = super();
  }

  setStyle() {
    const style = document.createElement('link');
    style.setAttribute('rel', 'stylesheet');
    return style;
  }

  getTitle() {
    let title = 'Listen to this post';
    if(this.hasAttribute('title')) {
      title = this.getAttribute('title');
    }
  }

  connectedCallback() {
    console.log(self)
    console.log(this.setStyle())

    const shadow = this.attachShadow({ mode: 'open' });
    shadow.appendChild(this.setStyle());

    const apWrapper = document.createElement('div');
    apWrapper.setAttribute('class', 'audio-player');

    const audio = document.createElement('audio');
    if(this.hasAttribute('src')) {
      audio.setAttribute('src', this.getAttribute('src'));
    }

    const h2 = document.createElement('h2');
    h2.textContent = this.getTitle();

    apWrapper.appendChild(h2);
    apWrapper.appendChild(audio);

    const trackAndControls = document.createElement('form');

    const curTime = document.createElement('output');
    curTime.setAttribute('name', 'current-time');
    curTime.setAttribute('for', 'audio-progress');
    curTime.textContent = '0:00';

    const progress = document.createElement('progress');
    progress.setAttribute('value', 0);
    progress.setAttribute('id', 'audio-progress');
    progress.setAttribute('name', 'audio-progress');

    const scrub = document.createElement('input');
    scrub.setAttribute('type','range');
    scrub.setAttribute('min', 0);
    scrub.setAttribute('max', 0);
    scrub.setAttribute('value', 0);
    scrub.setAttribute('value', 0.01);
    scrub.setAttribute('name', 'audio-duration');
    scrub.setAttribute('id', 'audio-duration');

    const label = document.createElement('label');
    label.setAttribute('for', 'audio-duration');
    label.textContent = '0:00';

    const track = document.createElement('p');
    track.setAttribute('class', 'audio-player-track');

    const trackFrag = document.createDocumentFragment();
    trackFrag.appendChild(curTime);
    trackFrag.appendChild(progress);
    trackFrag.appendChild(scrub);
    trackFrag.appendChild(label);
    track.appendChild(trackFrag);

    const backup =  document.createElement('button');
    backup.setAttribute('type', 'button');
    backup.setAttribute('aria-label', 'Go back 10 seconds');
    backup.setAttribute('data-action', 'back');
    backup.disabled = true;
    backup.textContent = 'Go back 10 seconds';

    const play =  document.createElement('button');
    play.setAttribute('type', 'button');
    play.setAttribute('aria-label', 'Play audio');
    play.setAttribute('data-action', 'play');
    play.textContent = 'Play';

    const pause =  document.createElement('button');
    pause.setAttribute('type', 'button');
    pause.setAttribute('aria-label', 'Pause audio');
    pause.setAttribute('data-action', 'pause');
    pause.textContent = 'Pause';

    const forward =  document.createElement('button');
    forward.setAttribute('type', 'button');
    forward.setAttribute('aria-label', 'Skip ahead 10 seconds');
    forward.setAttribute('data-action', 'forward');
    forward.textContent = 'Skip ahead 10 seconds';

    const controls = document.createElement('p');
    controls.setAttribute('class', 'audio-player-controls');

    const controlFrag = document.createDocumentFragment();
    controlFrag.appendChild(backup);
    controlFrag.appendChild(play);
    controlFrag.appendChild(pause);
    controlFrag.appendChild(forward);
    controls.appendChild(controlFrag);

    trackAndControls.appendChild(track);
    trackAndControls.appendChild(controls);

    apWrapper.appendChild(trackAndControls);
    shadow.appendChild(apWrapper);
  }


  disconnectedCallback() {
    console.log("Custom element removed from page.");
  }

  adoptedCallback() {
    console.log("Custom element moved to new page.");
  }

  attributeChangedCallback(name, oldValue, newValue) {
    console.log(`Attribute ${name} has changed.`);
  }
}

customElements.define('audio-player', AudioPlayer);
