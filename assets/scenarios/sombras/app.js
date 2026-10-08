import { createContextPicker } from './contexts.js';
import { interact } from './narrative.js';
import {opening,transition,roleBar} from '../../js/perspective.js';
import {portrait} from '../../js/portrait.js';
const face = role => portrait({shirt:role==='kaique'?'#675c42':'#42665d'});
import { lenses } from './content.js';
import { choose, consult, createState, finishSources, returnToLia, startKaique, reviseBelief, requestRetraction, setInitialInterpretation } from './state.js';
import { render } from './ui.js';

const defaultLenses = ['socrates', 'platao', 'descartes', 'marx'];
function selectedLenses(params) {
  if (!params.has('lentes')) return defaultLenses;
  const raw = (params.get('lentes') || '').trim().toLowerCase();
  if (raw === 'nenhuma') return [];
  const selected = new Set(raw.split(',').map(item => item.trim()).filter(Boolean));
  return lenses.map(item => item.id).filter(id => selected.has(id));
}

export function mount(root, params = new URLSearchParams(window.location.search)) {
  document.title = 'SOCIEDADE — SOMBRAS';
  document.body.classList.add('sombras');
  document.querySelector('.edition b').textContent = 'v0.2.1 narrativa · prévia';
  document.querySelector('.brand').innerHTML = 'SOCIEDADE<span>SIMULAÇÃO SOCIAL · SOMBRAS</span>';
  const css = document.createElement('link');
  css.rel = 'stylesheet'; css.href = new URL('./style.css', import.meta.url).href;
  document.head.append(css);
  const contextPicker = createContextPicker(params);
  const dupla = params.get('dupla') === '1';
  const lensIds = selectedLenses(params);
  let state = createState(contextPicker.next(), dupla, lensIds);
  let showOpening=true, showTransition=false, previousRole='lia';
  const announcement = document.getElementById('announcement');
  const paint = (focus = true) => {
    root.dataset.sbContext = String(state.context);
    const handoff=state.screen==='handoff';
    const toKaique=handoff?state.handoff==='to-kaique':state.scene===5;
    const target=toKaique?'kaique':'lia';
    const role=showOpening?'lia':(handoff||showTransition)?(toKaique?'lia':'kaique'):state.scene===5?'kaique':'lia';
    root.innerHTML = showOpening ? opening('sombras',face('lia'),'data-sb-action') : handoff||showTransition ? transition(target,face(target),'data-sb-action',handoff?(toKaique?'start-kaique':'return-lia'):'continue-role',state.dupla) : render(state);
    roleBar(root,role,face(role),previousRole!==role);
    previousRole=role;
    if(focus)window.scrollTo({top:0,behavior:'instant'});
    if (focus) root.querySelector('#screen-title')?.focus();
    if (state.screen === 'lenses') announcement.textContent = `Lente ${state.lensIndex + 1} de ${state.lensIds.length}: ${lenses.find(item => item.id === state.lensIds[state.lensIndex]).name}`;
    else announcement.textContent = '';
  };
  root.addEventListener('click', event => {
    if (!(event.target instanceof Element)) return;
    const button = event.target.closest('button[data-sb-action]');
    if (!(button instanceof HTMLButtonElement) || button.disabled) return;
    const action = button.dataset.sbAction;
    let focus = true;
    try {
      if (root.querySelector('#source-note')) state.notes.source = root.querySelector('#source-note').value;
      if (root.querySelector('#public-note')) state.notes.public = root.querySelector('#public-note').value;
      if(action==='begin') showOpening=false;
      else if(action==='continue-role') showTransition=false;
      else if (action === 'choose') {
        const previousScene=state.scene;
        choose(state, button.dataset.choice, {
          sourceNote: root.querySelector('#source-note')?.value || state.notes.source,
          publicNote: root.querySelector('#public-note')?.value || ''
        });
        if(!state.dupla&&state.scene!==previousScene&&[5,6].includes(state.scene))showTransition=true;
      } else if (action === 'interact') { interact(state, button.dataset.interaction); focus = false; }
      else if (action === 'initial') { setInitialInterpretation(state, button.dataset.belief); focus = false; }
      else if (action === 'revise') { reviseBelief(state, root.querySelector('#revision-belief').value, root.querySelector('#revision-evidence').value); focus = false; }
      else if (action === 'retract') { requestRetraction(state, root.querySelector('#retraction-statement').value, root.querySelector('#retraction-evidence').value, root.querySelector('#retraction-change').value); focus = false; }
      else if (action === 'consult') {
        consult(state, button.dataset.source); focus = false;
      } else if (action === 'finish-sources') finishSources(state, root.querySelector('#source-note')?.value || '');
      else if (action === 'start-kaique') startKaique(state);
      else if (action === 'return-lia') returnToLia(state);
      else if (action === 'debrief') state.screen = 'debrief';
      else if (action === 'open-lenses') { state.screen = 'lenses'; state.lensIndex = 0; }
      else if (action === 'next-lens') state.lensIndex += 1;
      else if (action === 'back-lens') {
        if (state.lensIndex > 0) state.lensIndex -= 1;
        else state.screen = 'debrief';
      } else if (action === 'finish') state.screen = 'done';
      else if (action === 'restart') { state = createState(contextPicker.next(), dupla, lensIds); showOpening=true;showTransition=false;previousRole='lia'; }
      else return;
      paint(focus);
    } catch (error) {
      const errorNode = document.getElementById('error');
      if (errorNode) errorNode.textContent = error.message;
      else announcement.textContent = error.message;
    }
  });
  root.addEventListener('change', event => {
    if (!(event.target instanceof HTMLSelectElement)) return;
    if (event.target.id === 'retraction-statement') { state.reflectionDraft.statement = event.target.value; state.reflectionDraft.evidence = ''; state.reflectionDraft.change = ''; }
    else if (event.target.id === 'retraction-evidence') { state.reflectionDraft.evidence = event.target.value; state.reflectionDraft.change = ''; }
    else if (event.target.id === 'retraction-change') state.reflectionDraft.change = event.target.value;
    else if (event.target.id === 'revision-belief') { state.reflectionDraft.revisionBelief = event.target.value; return; }
    else if (event.target.id === 'revision-evidence') { state.reflectionDraft.revisionEvidence = event.target.value; state.reflectionDraft.revisionBelief = root.querySelector('#revision-belief').value; }
    else return;
    if (root.querySelector('#public-note')) state.notes.public = root.querySelector('#public-note').value;
    if (root.querySelector('#source-note')) state.notes.source = root.querySelector('#source-note').value;
    const focusedId = event.target.id;
    paint(false);
    root.querySelector(`#${focusedId}`)?.focus({ preventScroll: true });
  });
  paint();
}

export { selectedLenses };
