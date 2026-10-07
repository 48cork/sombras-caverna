import { mount } from '../scenarios/sombras/app.js';
mount(document.getElementById('game'), new URLSearchParams(window.location.search));
