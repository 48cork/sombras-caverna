import { contextFacts } from './content.js';

export const outcomeIds = ['panico', 'calma-com-dano', 'verificacao-compartilhada', 'descrenca', 'boato-morreu'];
export const outcomeLabels = {
  panico: 'Pânico',
  'calma-com-dano': 'Calma com dano',
  'verificacao-compartilhada': 'Verificação compartilhada',
  descrenca: 'Ninguém acredita em mais nada',
  'boato-morreu': 'O boato morreu sozinho'
};

const fact = (context, source) => contextFacts[source][context <= 2 ? 'good' : 'partial'];

export function createState(context = 4, dupla = false, lensIds = ['socrates', 'platao', 'descartes', 'marx']) {
  return {
    scenario: 'sombras', version: '0.1-experimental', context: [1, 2, 3, 4].includes(Number(context)) ? Number(context) : 4,
    dupla, lensIds: [...lensIds], lensIndex: 0, screen: 'scene', scene: 1,
    handoff: '', sources: [], facts: [], notes: { sources: '', public: '' }, history: [], causes: [], outcome: null,
    world: { reach: 1, peakReach: 1, videoVersion: 'v3', credibility: 2, price: 'alto', grandma: 'torneira', ze: 'suspeito', meal: 'mantida', disbelief: 0, kaique: 'calado', publicHeard: false, shared: false, facts: [] }
  };
}

function addCause(state, id, text, parents = []) {
  if (!text || typeof text !== 'string' || !text.trim()) throw new Error(`Causa vazia: ${id}`);
  if (state.causes.some(item => item.id === id)) throw new Error(`Causa repetida: ${id}`);
  if (parents.some(parent => !state.causes.some(item => item.id === parent))) throw new Error(`Causa sem origem: ${id}`);
  state.causes.push({ id, text, parents });
}

function record(state, scene, choice, label, text) {
  state.history.push({ scene, choice, label, text });
}

function updatePeak(world) { world.peakReach = Math.max(world.peakReach || 0, world.reach); }

function prepareScene4(state) {
  if (state.scene4Prepared) return;
  const w = state.world;
  if (w.reach >= 3) {
    addCause(state, 'merenda-suspensa', 'A escola suspendeu a merenda feita com água da torneira enquanto aguardava informação.', [state.causes.at(-1)?.id].filter(Boolean));
    w.meal = 'suspensa';
  }
  if (w.ze === 'suspeito' && w.reach >= 2) {
    addCause(state, 'barco-acusado', 'No barco de Seu Zé apareceu a acusação “assassino de peixe”.', [state.causes.at(-1)?.id].filter(Boolean));
    w.ze = 'acusado';
  }
  state.scene4Prepared = true;
}

export function consult(state, source) {
  if (state.scene !== 3 || state.screen !== 'scene') throw new Error('As fontes só podem ser consultadas na cena 3.');
  if (!['companhia', 'laudo', 'ze', 'acude'].includes(source)) throw new Error('Fonte indisponível.');
  if (state.sources.includes(source)) return state;
  if (state.sources.length >= 2) throw new Error('Você já consultou duas fontes.');
  state.sources.push(source);
  state.facts.push(fact(state.context, source));
  state.world.facts = [...state.facts];
  const label = { companhia: 'A companhia', laudo: 'Laudo público', ze: 'Seu Zé', acude: 'Açude da Pedra Lisa' }[source];
  addCause(state, `fonte-${source}`, `${label}: ${fact(state.context, source)}`, [state.causes.at(-1)?.id].filter(Boolean));
  record(state, 3, source, label, fact(state.context, source));
  return state;
}

const choiceNames = {
  1: { A: 'Repassar para o grupo da família', B: 'Perguntar no grupo quem gravou e onde', C: 'Não repassar e esperar amanhã', D: 'Combinar de ir ao açude de manhã' },
  2: { A: 'Concordar que é perigoso e comprar água mineral', B: 'Dizer que ninguém sabe de onde veio o vídeo', C: 'Defender Seu Zé', D: 'Ficar calada e ouvir' },
  4: { A: 'Levar o que sabe à diretora', B: 'Visitar Seu Zé', C: 'Procurar quem gravou o vídeo' },
  5: { A: 'Gravar um novo vídeo explicando o que viu', B: 'Apagar o vídeo do celular', C: 'Ficar calado' },
  6: { A: 'Desmentir: “É boato, a água está boa”', B: 'Confirmar: “Não bebam”', C: 'Separar o que verificou do que não sabe', D: 'Não falar' }
};

function applyChoice(state, scene, choice, { sourceNote = '', publicNote = '' } = {}) {
  const w = state.world, partial = state.context >= 3, radio = state.context === 2 || state.context === 4;
  const valid = choiceNames[scene];
  if (!valid?.[choice]) throw new Error('Escolha indisponível.');
  const prior = state.causes.at(-1)?.id;
  const cause = (id, text, parents = prior ? [prior] : []) => addCause(state, id, text, parents);
  if (scene === 1) {
    if (choice === 'B') w.reach = 0;
    if (choice === 'A') { w.grandma = 'para-de-beber'; w.videoVersion = 'v3-urgente'; cause('urgente', 'Lia repassou a mensagem ao grupo da família com “URGENTE”.'); }
    else if (choice === 'B') cause('origem', 'Lia perguntou no grupo quem gravou e onde; a origem não foi identificada.');
    else if (choice === 'C') cause('espera', 'Lia não repassou a mensagem e esperou.');
    else { w.reach = 2; updatePeak(w); state.sources = ['acude']; state.facts.push(fact(state.context, 'acude')); w.videoVisit = true; w.facts = [...state.facts]; cause('acude-cedo', 'Lia foi ao açude cedo; a feira começou para ela com alcance 2.'); cause('fonte-acude', `Açude da Pedra Lisa: ${fact(state.context, 'acude')}`, ['acude-cedo']); }
    if (choice !== 'D') state.sources = [];
    record(state, 1, choice, valid[choice], choiceNames[1][choice]);
    state.scene = 2;
  } else if (scene === 2) {
    if (choice === 'A') { w.grandma = 'mineral'; w.price = 'muito-alto'; cause('compra', 'Lia comprou água mineral; a avó passou a usá-la e a procura elevou o preço.'); }
    else if (choice === 'B' && w.reach >= 2) { w.credibility = Math.max(0, w.credibility - 1); cause('custo-publico', 'A fala “ninguém sabe” custou credibilidade na feira.'); }
    else if (choice === 'C') { w.ze = 'defendido'; cause('defesa', 'Lia defendeu Seu Zé na feira.'); }
    record(state, 2, choice, valid[choice], choiceNames[2][choice]);
    w.reach = Math.min(4, w.reach + 1); updatePeak(w);
    state.scene = 3;
  } else if (scene === 4) {
    prepareScene4(state);
    const knowsTreated = partial ? w.facts.includes('A companhia informou: “A água tratada está dentro do padrão.”') : w.facts.includes('O laudo indicava parâmetros normais.');
    if (choice === 'A') {
      if (knowsTreated && w.meal === 'suspensa') w.meal = 'mantida';
      cause('diretora', knowsTreated ? 'Lia levou informação sobre a água tratada à diretora; a merenda voltou.' : 'Lia foi à diretora sem informação sobre a água tratada; a suspensão ficou até sair um laudo.');
    } else if (choice === 'B' && w.ze === 'acusado') { w.ze = 'defendido'; cause('visita-ze', 'Lia visitou Seu Zé; o apoio encerrou a acusação no barco.'); }
    else if (choice === 'B') cause('visita-ze', 'Lia visitou Seu Zé e ofereceu apoio.');
    else cause('procura-kaique', 'Lia procurou quem gravou; Kaique soube da procura.');
    record(state, 4, choice, valid[choice], choiceNames[4][choice]);
    w.reach = Math.min(4, w.reach + 1); updatePeak(w);
    state.scene = 5;
    if (state.dupla) { state.screen = 'handoff'; state.handoff = 'to-kaique'; }
  } else if (scene === 5) {
    if (choice === 'A') { w.kaique = 'explicou'; w.videoVersion = 'explicado'; cause('explicacao', 'Kaique explicou o que gravou e o que não disse; no grupo apareceu “Então foi você!”.'); }
    else { w.kaique = choice === 'B' ? 'apagou' : 'calado'; w.reach = Math.min(4, w.reach + 1); updatePeak(w); if (choice === 'B') cause('apagou', 'Kaique apagou o vídeo do celular, mas ele já circulava fora do aparelho.'); else cause('silencio-kaique', 'Kaique ficou calado, com medo de ser culpado.'); }
    record(state, 5, choice, valid[choice], choiceNames[5][choice]);
    if (w.grandma === 'para-de-beber' || w.reach >= 3) {
      if (w.grandma !== 'para-de-beber') cause('avo-para', 'A avó parou de beber da torneira após a mensagem “URGENTE” que chegou à família.');
      w.grandma = 'para-de-beber';
    }
    state.scene = 6;
    if (state.dupla) { state.screen = 'handoff'; state.handoff = 'to-lia'; }
  } else if (scene === 6) {
    state.notes.public = publicNote;
    if (choice === 'C') w.credibility = Math.min(3, w.credibility + 1);
    if (choice !== 'D') {
      const threshold = radio ? 1 : w.kaique === 'explicou' ? 1 : 2;
      w.publicHeard = w.credibility >= threshold;
      if (w.publicHeard) { w.reach = Math.max(0, w.reach - 1); cause('fala-ouvida', 'A fala de Lia foi ouvida; a circulação perdeu um nível.'); }
    }
    if (w.publicHeard && choice === 'A') {
      if (state.history.some(item => item.scene === 1 && item.choice === 'A')) w.disbelief = Math.min(3, w.disbelief + 1);
      if (partial) w.disbelief = Math.min(3, w.disbelief + 1);
    }
    if (w.publicHeard && choice === 'B') {
      if (!partial) w.disbelief = Math.min(3, w.disbelief + 1);
      if (w.kaique === 'explicou') w.disbelief = Math.min(3, w.disbelief + 1);
    }
    const selected = new Set(state.sources);
    w.evidenceComplete = partial
      ? selected.has('companhia') && ['laudo', 'ze', 'acude'].some(id => selected.has(id))
      : selected.has('laudo') && ['ze', 'acude'].some(id => selected.has(id));
    w.shared = w.publicHeard && choice === 'C' && w.evidenceComplete;
    if (w.disbelief >= 2) state.outcome = 'descrenca';
    else if (w.shared) state.outcome = 'verificacao-compartilhada';
    else if (w.publicHeard && choice === 'A' && partial) state.outcome = 'calma-com-dano';
    else if (w.publicHeard && choice === 'B') state.outcome = 'panico';
    else state.outcome = 'boato-morreu';
    addCause(state, 'final', `O fio principal ficou: ${outcomeLabels[state.outcome]}.`, state.causes.slice(-2).map(item => item.id));
    record(state, 6, choice, valid[choice], choiceNames[6][choice]);
    state.screen = 'scene'; state.scene = 7;
    state.notes.source = sourceNote;
  }
  w.facts = [...state.facts];
  return state;
}

export function choose(state, choice, notes = {}) {
  if (state.screen !== 'scene' || state.scene === 3 || state.scene === 7) throw new Error('Ação indisponível nesta tela.');
  return applyChoice(state, state.scene, choice, notes);
}

export function startKaique(state) {
  if (state.screen !== 'handoff' || state.handoff !== 'to-kaique') throw new Error('Troca indisponível.');
  state.screen = 'scene'; state.handoff = '';
  return state;
}
export function returnToLia(state) {
  if (state.screen !== 'handoff' || state.handoff !== 'to-lia') throw new Error('Troca indisponível.');
  state.screen = 'scene'; state.handoff = '';
  return state;
}

export function finishSources(state, note = '') {
  if (state.scene !== 3 || !state.sources.length || state.screen !== 'scene') throw new Error('Consulte ao menos uma fonte.');
  if (state.sources.length > 2) throw new Error('O limite de consultas foi excedido.');
  state.notes.source = note;
  state.world.reach = Math.min(4, state.world.reach + 1); updatePeak(state.world);
  state.scene = 4;
  prepareScene4(state);
  return state;
}

export function simulatePath(context, path) {
  const [c1, c2, sourceIds, c4, c5, c6] = path;
  const state = createState(context);
  choose(state, c1);
  choose(state, c2);
  for (const source of sourceIds) consult(state, source);
  finishSources(state);
  choose(state, c4);
  choose(state, c5);
  choose(state, c6);
  return state;
}
