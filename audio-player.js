// Create a class for the element
class AudioPlayer extends HTMLElement {
  static observedAttributes = ['src', 'title'];

  constructor() {
    self = super();
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

    switch(type) {
      case 'pause':
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

  makeButton(action='play', aria='Play audio', icon) {
    const button =  document.createElement('button');
    button.setAttribute('type', 'button');
    button.setAttribute('aria-label', aria);
    button.setAttribute('data-action', action);
    button.innerHTML = icon;
    return button;
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

    const backup =  this.makeButton(
      'back',
      'Go back 10 seconds',
      this.controlIcon('back')
    );

    const play =  this.makeButton(
      'play',
      'Play audio',
      this.controlIcon('play')
    );

    const pause =  this.makeButton(
      'pause',
      'Pause audio',
      this.controlIcon('pause')
    );

    const forward =  this.makeButton(
      'forward',
      'Go back 10 seconds',
      this.controlIcon('forward')
    )

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
