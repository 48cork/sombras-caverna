import { setInitialInterpretation, reviseInterpretation, prepareRetraction } from './reflection.js';
import { original, forwarded, zeReply, interact } from './narrative.js';
import { contextFacts } from './content.js';

export const outcomeIds = ['panico', 'calma-com-dano', 'verificacao-compartilhada', 'descrenca', 'boato-morreu'];
export const outcomeLabels = {
  panico: 'Precaução prolongada',
  'calma-com-dano': 'Calma com dano',
  'verificacao-compartilhada': 'Verificação compartilhada',
  descrenca: 'Confiança abalada',
  'boato-morreu': 'Circulação enfraquecida'
};

const fact = (context, source) => contextFacts[source][context <= 2 ? 'good' : 'partial'];

export function createState(context = 4, dupla = false, lensIds = ['socrates', 'platao', 'descartes', 'marx']) {
  return {
    scenario: 'sombras', version: '0.2.1-narrativa', context: [1, 2, 3, 4].includes(Number(context)) ? Number(context) : 4,
    dupla, lensIds: [...lensIds], lensIndex: 0, screen: 'scene', scene: 1,
    interactions: [], knowledge: { lia: [{ id: 'video-recebido', text: 'O vídeo recebido mostra peixes mortos, com a voz “Não bebam essa água. A prefeitura está escondendo.” Não há informação de coleta nas casas ou identificação de quem gravou.', via: 'grupo' }], kaique: [] }, initialInterpretation: null, reflectionDraft: { statement: '', evidence: '', change: '', revisionBelief: '', revisionEvidence: '' }, belief: 'em-aberto', revisions: [], corrections: [], handoff: '', sources: [], facts: [], notes: { sources: '', public: '' }, history: [], causes: [], outcome: null,
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
  if (['suspeito', 'acusado'].includes(w.ze) && w.reach >= 2) {
    addCause(state, 'barco-acusado', 'No barco de Seu Zé apareceu a acusação “assassino de peixe”.', [state.causes.at(-1)?.id].filter(Boolean));
    w.ze = 'acusado'; w.zeDamage = true;
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
  state.knowledge.lia.push({ id: source, text: fact(state.context, source), via: 'fonte' });
  if (source === 'ze') state.knowledge.lia.push({ id: 'ze-relato', text: zeReply, via: 'mensagem' });
  state.world.facts = [...state.facts];
  const label = { companhia: 'A companhia', laudo: 'Laudo público', ze: 'Seu Zé', acude: 'Açude da Pedra Lisa' }[source];
  addCause(state, `fonte-${source}`, `${label}: ${fact(state.context, source)}`, [state.causes.at(-1)?.id].filter(Boolean));
  record(state, 3, source, label, fact(state.context, source));
  return state;
}

const choiceNames = {
  1: { A: 'Repassar para o grupo da família', B: 'Perguntar no grupo quem gravou e onde', C: 'Não repassar e esperar amanhã', D: 'Combinar de ir ao açude de manhã' },
  2: { A: 'Concordar que é perigoso e comprar água mineral', B: 'Dizer que ninguém sabe de onde veio o vídeo', C: 'Contestar a acusação contra Seu Zé', D: 'Ficar calada e ouvir', E: 'Repassar a suspeita contra Seu Zé' },
  4: { A: 'Levar o que sabe à diretora', B: 'Visitar Seu Zé', C: 'Procurar quem gravou o vídeo' },
  5: { A: 'Gravar um novo vídeo explicando o que viu', B: 'Apagar o vídeo do celular', C: 'Ficar calado', D: 'Enviar o original e seus limites em reservado a Lia' },
  6: { A: 'Pedir retomada do uso da água tratada', B: 'Pedir suspensão temporária enquanto se verifica', C: 'Publicar a comparação das fontes e cobrar resposta', D: 'Conversar em reservado antes de se expor' }
};

function applyChoice(state, scene, choice, { sourceNote = '', publicNote = '' } = {}) {
  if (scene === 1 && !state.initialInterpretation) throw new Error('Antes de agir, registre como Lia está interpretando o aviso.');
  const w = state.world, partial = state.context >= 3, radio = state.context === 2 || state.context === 4;
  if (scene === 5 && !['original', 'forwarded'].every(id => state.interactions.includes(id))) throw new Error('Leia o original e as respostas de Nando antes de decidir.');
  const valid = choiceNames[scene];
  if (!valid?.[choice]) throw new Error('Escolha indisponível.');
  const prior = state.causes.at(-1)?.id;
  const cause = (id, text, parents = prior ? [prior] : []) => addCause(state, id, text, parents);
  if (scene === 1) {
    if (choice === 'B') w.reach = 0;
    if (choice === 'A') { w.grandma = 'para-de-beber'; w.videoVersion = 'v3-urgente'; cause('urgente', 'Lia repassou a mensagem ao grupo da família com “URGENTE”.'); }
    else if (choice === 'B') cause('origem', 'Lia perguntou no grupo quem gravou e onde; a origem não foi identificada.');
    else if (choice === 'C') cause('espera', 'Lia não repassou a mensagem e esperou.');
    else { w.reach = 2; updatePeak(w); state.sources = ['acude']; state.facts.push(fact(state.context, 'acude')); state.knowledge.lia.push({ id: 'acude', text: fact(state.context, 'acude'), via: 'visita' }); w.videoVisit = true; w.facts = [...state.facts]; cause('acude-cedo', 'Lia foi ao açude cedo; a feira começou para ela com alcance 2.'); cause('fonte-acude', `Açude da Pedra Lisa: ${fact(state.context, 'acude')}`, ['acude-cedo']); }
    if (choice !== 'D') state.sources = [];
    record(state, 1, choice, valid[choice], choiceNames[1][choice]);
    state.scene = 2;
  } else if (scene === 2) {
    if (choice === 'A') { w.grandma = 'mineral'; w.price = 'muito-alto'; cause('compra', 'Lia comprou água mineral; a avó passou a usá-la e a procura elevou o preço.'); }
    else if (choice === 'B' && w.reach >= 2) { w.credibility = Math.max(0, w.credibility - 1); cause('custo-publico', 'A fala “ninguém sabe” custou credibilidade na feira.'); }
    else if (choice === 'E') { w.ze = 'acusado'; w.zeDamage = true; w.reach = Math.min(4, w.reach + 1); cause('acusacao-lia', 'Lia encaminhou a suspeita do balde como acusação; dois compradores cancelaram entregas.'); }
    else if (choice === 'C') { w.ze = 'defendido'; w.credibility = Math.max(0, w.credibility - 1); cause('defesa', 'Lia defendeu Seu Zé na feira.'); }
    record(state, 2, choice, valid[choice], choiceNames[2][choice]);
    w.reach = Math.min(4, w.reach + 1); updatePeak(w);
    state.scene = 3;
  } else if (scene === 4) {
    prepareScene4(state);
    const knowsTreated = state.sources.includes(partial ? 'companhia' : 'laudo');
    if (choice === 'A') {
      const wasSuspended = w.meal === 'suspensa';
      if (knowsTreated && w.meal === 'suspensa') w.meal = 'mantida';
      cause('diretora', knowsTreated ? (wasSuspended ? 'Lia levou informação sobre a água tratada à diretora; a merenda voltou.' : 'Lia levou informação sobre a água tratada à diretora; a merenda foi mantida.') : (wasSuspended ? 'Lia foi à diretora sem informação sobre a água tratada; a suspensão ficou até sair um laudo.' : 'A diretora ouviu Lia, manteve a merenda e pediu informação sobre a água usada na escola.'));
    } else if (choice === 'B' && w.ze === 'acusado') { w.ze = 'defendido'; cause('visita-ze', 'Lia contestou a acusação e ouviu Seu Zé; a marca no barco e as vendas perdidas persistiram.'); }
    else if (choice === 'B') cause('visita-ze', 'Lia visitou Seu Zé e ofereceu apoio.');
    else cause('procura-kaique', 'Lia procurou quem gravou; Kaique soube da procura.');
    if (choice === 'B') state.knowledge.lia.push({ id: 'ze-relato', text: zeReply, via: 'mensagem' });
    if (choice === 'C') state.knowledge.kaique.push({ id: 'pedido-lia', text: 'Lia → Kaique: Quero entender onde você filmou. Pode me responder sem que eu publique seu nome? Não enviei a ele minhas consultas.', via: 'mensagem' });
    record(state, 4, choice, valid[choice], choiceNames[4][choice]);
    w.reach = Math.min(4, w.reach + 1); updatePeak(w);
    state.scene = 5;
    if (state.dupla) { state.screen = 'handoff'; state.handoff = 'to-kaique'; }
  } else if (scene === 5) {
    if (choice === 'A') { state.knowledge.lia.push({ id: 'original', text: original(state.context) + ' ' + forwarded, via: 'mensagem' }); w.kaique = 'explicou'; w.videoVersion = 'explicado'; cause('explicacao', 'Kaique explicou o que gravou e o que não disse; no grupo apareceu “Então foi você!”.'); }
    else if (choice === 'D') { w.kaique = 'reservado'; state.knowledge.lia.push({ id: 'original', text: 'Kaique → Lia, reservado: Pode citar o local e comparar as versões, sem publicar meu nome. ' + original(state.context) + ' ' + forwarded, via: 'mensagem' }); cause('envio-reservado', 'Kaique enviou a Lia o original e as mensagens recebidas; o grupo não recebeu a comparação.'); }
    else { w.kaique = choice === 'B' ? 'apagou' : 'calado'; w.reach = Math.min(4, w.reach + 1); updatePeak(w); if (choice === 'B') cause('apagou', 'Kaique apagou o vídeo do celular, mas ele já circulava fora do aparelho.'); else cause('silencio-kaique', 'Kaique ficou calado, com medo de ser culpado.'); }
    record(state, 5, choice, valid[choice], choiceNames[5][choice]);
    if (w.grandma === 'para-de-beber' || (w.reach >= 3 && w.grandma !== 'mineral')) {
      if (w.grandma !== 'para-de-beber') cause('avo-para', 'A avó parou de beber da torneira após os avisos sobre a água que chegaram à família.');
      w.grandma = 'para-de-beber';
    }
    state.scene = 6;
    if (state.dupla) { state.screen = 'handoff'; state.handoff = 'to-lia'; }
  } else if (scene === 6) {
    state.notes.public = publicNote;
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
      // Precaução provisória não é uma afirmação de contaminação confirmada.
      // Autoria da voz não determina a condição da água.
    }
    if (state.retraction && choice === 'C' && w.publicHeard) { state.corrections.push({ ...state.retraction, audiences: [state.retraction.statement.audience, radio ? 'ouvintes da rádio' : 'grupo Notícias da Serra'], downstreamConfirmed: false }); cause('retratacao', `Lia corrigiu: ${state.retraction.statement.text} Mudança: ${state.retraction.change.text} Base recebida: ${state.retraction.evidence.text} A correção foi dirigida a ${state.retraction.statement.audience} e ao público da fala; encaminhamentos e prejuízos persistiram.`); }
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
  setInitialInterpretation(state, 'em-aberto');
  choose(state, c1);
  choose(state, c2);
  for (const source of sourceIds) consult(state, source);
  finishSources(state);
  choose(state, c4);
  interact(state, 'original'); interact(state, 'forwarded');
  choose(state, c5);
  choose(state, c6);
  return state;
}

export { setInitialInterpretation };
export const reviseBelief = reviseInterpretation;
export const requestRetraction = prepareRetraction;
