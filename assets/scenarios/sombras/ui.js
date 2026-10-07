import { escapeHTML as e } from '../../js/ui.js';
import { choices, debrief, lenses, scenes, sources } from './content.js';
import { ending } from './ending.js';
import { lensApplication } from './lenses.js';

const choiceTitle = state => ({ 1: 'video', 2: 'fair', 4: 'others', 5: 'switch', 6: 'public' })[state.scene];

function phoneMessages(state) {
  const w = state.world;
  const location = w.reach >= 4 ? 'A conversa chegou a diferentes partes da cidade.' : w.reach === 3 ? 'Na escola, perguntam se a merenda é segura.' : w.reach === 2 ? 'Na feira, repetem o que ouviram sobre o vídeo.' : w.reach === 1 ? 'Na rua, alguém comenta o vídeo.' : 'No grupo da família, a conversa continua.';
  const messages = ['Notícias da Serra · vídeo de peixes mortos', 'Voz no vídeo: “Não bebam essa água. A prefeitura está escondendo.”'];
  if (w.videoVersion === 'v3-urgente') messages.push('Grupo da família · “URGENTE”');
  if (state.history.some(item => item.scene === 1 && item.choice === 'B')) messages.push('Lia perguntou quem gravou e onde. “Chegou aqui assim”, respondeu Damião.');
  if (w.videoVersion === 'explicado') messages.push('Grupo · “Então foi você!”');
  if (state.history.some(item => item.scene === 6 && item.choice !== 'D')) messages.push(`Lia falou em público: ${state.history.find(item => item.scene === 6)?.label}.`);
  return `<section class="sb-phone" aria-label="O celular de Lia"><h2>O celular de Lia</h2><div class="sb-messages">${messages.map((message, i) => `<p class="sb-message ${i === 1 ? 'sb-video' : ''}">${e(message)}</p>`).join('')}</div><p class="sb-location">${e(location)}</p></section>`;
}

function choicesFor(state) {
  const key = choiceTitle(state);
  return (choices[key] || []).map(([id, label, description]) => {
    let detail = description;
  if (key === 'public' && id === 'C') detail = state.facts.length ? `Você dirá somente estes fatos: ${state.facts.join(' ')}` : 'Você ainda não consultou fontes; não há fatos verificados para listar.';
    return `<button class="sb-choice" data-sb-action="choose" data-choice="${id}"><span class="sb-choice-title">${e(label)}</span><span class="sb-choice-detail">${e(detail)}</span></button>`;
  }).join('');
}

function phoneSources(state) {
  return `<section class="sb-sources" aria-labelledby="sources-heading"><div class="sb-subhead"><h2 id="sources-heading">Quem você consulta?</h2><p>Até duas consultas. Você pode escolher uma ou duas.</p></div><div class="sb-source-grid">${sources.map(source => {
    const used = state.sources.includes(source.id);
    const text = used ? state.facts[state.sources.indexOf(source.id)] : '';
    const disabled = used || state.sources.length >= 2;
    return `<article class="sb-source"><h3>${e(source.name)}</h3><button class="sb-button" data-sb-action="consult" data-source="${source.id}" ${disabled ? 'disabled' : ''}>${used ? 'Fonte consultada' : e(source.label)}</button>${used ? `<p class="sb-fact">${e(text)}</p>` : ''}</article>`;
  }).join('')}</div><label class="sb-label" for="source-note">O que você sabe agora que não sabia ontem à noite? (opcional)</label><textarea id="source-note" rows="2" maxlength="800" placeholder="Escreva suas palavras; ficam só nesta aba.">${e(state.notes.source)}</textarea><button class="sb-primary" data-sb-action="finish-sources" ${state.sources.length ? '' : 'disabled'}>Ir para a próxima cena</button></section>`;
}

function chain() {
  return `<section class="sb-chain" aria-labelledby="chain-heading"><h2 id="chain-heading">A cadeia do vídeo</h2><ol><li><strong>v1 · 5h40</strong><span>Imagens de peixes mortos. “Olha isso.”</span></li><li><strong>v2</strong><span>As imagens circulam com a frase: “Não bebam essa água.”</span></li><li><strong>v3</strong><span>Uma voz acrescenta: “A prefeitura está escondendo.”</span></li></ol><p>Você não sabe quem acrescentou cada parte.</p></section>`;
}

function handoff(state) {
  const toKaique = state.handoff === 'to-kaique';
  return `<main id="main" class="sb-shell sb-handoff"><p class="sb-kicker">Modo dupla</p><h1 id="screen-title" tabindex="-1">${toKaique ? 'Troque de lugar' : 'Devolva o aparelho'}</h1><p>${toKaique ? 'Passe o aparelho para seu colega. Ele será Kaique e verá apenas o que aconteceu do lado dele.' : 'Passe o aparelho de volta para Lia. O que Kaique viu e escolheu não apareceu antes para ela.'}</p><button class="sb-primary" data-sb-action="${toKaique ? 'start-kaique' : 'return-lia'}">${toKaique ? 'Sou Kaique, começar' : 'Aparelho de volta para Lia'}</button></main>`;
}

function sceneScreen(state) {
  const scene = scenes[state.scene - 1];
  const role = state.scene === 5 ? 'Kaique · você' : 'Lia · você';
  const narrative = `<section class="sb-dialogue"><p class="sb-speaker">${role}${state.scene === 5 ? ' · mototaxista' : ' · estudante de História'}</p><h1 id="screen-title" tabindex="-1">${e(scene.title)}</h1><p class="sb-lead">${e(scene.text)}</p>${state.scene === 1 ? '<p class="sb-context">Serra do Vento · outubro</p>' : ''}</section>`;
  let panel = phoneMessages(state);
  let interaction = '';
  if (state.scene === 3) interaction = phoneSources(state);
  else if (state.scene === 4) {
    const events = [state.world.meal === 'suspensa' ? 'A escola suspendeu a merenda feita com água da torneira até sair um laudo.' : '', state.world.ze === 'acusado' ? 'No barco de Seu Zé apareceu a frase “assassino de peixe”.' : '', state.context === 2 || state.context === 4 ? 'A Rádio Serra FM falará do assunto amanhã e convida quem souber de alguma coisa.' : ''].filter(Boolean);
    interaction = `${events.length ? `<aside class="sb-events" aria-label="O que aconteceu"><ul>${events.map(item => `<li>${e(item)}</li>`).join('')}</ul></aside>` : ''}<section class="sb-actions" aria-labelledby="action-heading"><h2 id="action-heading">O que você faz?</h2><div class="sb-choice-grid">${choicesFor(state)}</div></section>`;
  }
  else if (state.scene === 5) { panel = chain(); interaction = `<section class="sb-actions" aria-labelledby="action-heading"><h2 id="action-heading">O que você faz?</h2><div class="sb-choice-grid">${choicesFor(state)}</div></section>`; }
  else if (state.scene === 6) {
    const publicLabel = state.context === 2 || state.context === 4 ? 'Na Rádio Serra FM, ao vivo.' : 'No grupo “Notícias da Serra”, onde agora todos leem.';
    interaction = `<p class="sb-channel">${publicLabel}</p><label class="sb-label" for="public-note">Se quiser, escreva o que diria (opcional)</label><textarea id="public-note" rows="2" maxlength="800" placeholder="Sua formulação fica só nesta aba.">${e(state.notes.public)}</textarea><section class="sb-actions" aria-labelledby="action-heading"><h2 id="action-heading">O que você faz?</h2><div class="sb-choice-grid">${choicesFor(state)}</div></section>`;
  } else interaction = `<section class="sb-actions" aria-labelledby="action-heading"><h2 id="action-heading">O que você faz?</h2><div class="sb-choice-grid">${choicesFor(state)}</div></section>`;
  return `<main id="main" class="sb-shell"><header class="sb-hud"><div><span class="sb-mark">SOMBRAS</span><span class="sb-edition">v0.1 experimental</span></div><p class="sb-time">${e(scene.time)} <span>· ${role}</span></p></header><div class="sb-layout">${panel}<div class="sb-main-panel">${narrative}${interaction}</div></div><p class="sb-footnote">Serra do Vento é fictícia · Experimento pedagógico</p></main>`;
}

function finalScreen(state) {
  const result = ending(state);
  return `<main id="main" class="sb-shell sb-ending"><header class="sb-hud"><div><span class="sb-mark">SOMBRAS</span><span class="sb-edition">v0.1 experimental</span></div><p class="sb-time">Três semanas depois · Lia</p></header><p class="sb-kicker">O mundo que ficou</p><h1 id="screen-title" tabindex="-1">${e(result.title)}</h1><p class="sb-lead">${e(result.description)}</p><div class="sb-ending-blocks">${result.blocks.map(block => `<article class="sb-ending-block"><h2>${e(block.title)}</h2><p>${e(block.text)}</p></article>`).join('')}</div><section class="sb-causal" aria-labelledby="causal-heading"><h2 id="causal-heading">Como este mundo foi produzido</h2><ol>${result.causes.map(item => `<li>${e(item)}</li>`).join('')}</ol></section><p class="sb-route">O mundo que ficou → Conversar → Reler pela Filosofia</p><p class="sb-prompt">Como você chegou a este mundo?</p><button class="sb-primary" data-sb-action="debrief">Continuar: conversar sobre a experiência →</button></main>`;
}

function debriefScreen(state) {
  const emptyLens = state.lensIds.length === 0;
  const notes = `${state.notes.source ? `<p>Você escreveu depois das fontes:</p><blockquote>${e(state.notes.source)}</blockquote>` : ''}${state.notes.public ? `<p>Você escreveu sobre sua fala:</p><blockquote>${e(state.notes.public)}</blockquote>` : ''}`;
  return `<main id="main" class="sb-shell sb-ending"><header class="sb-hud"><div><span class="sb-mark">SOMBRAS</span><span class="sb-edition">Conversa</span></div><p class="sb-time">O mundo que ficou → Conversar${emptyLens ? '' : ' → Reler pela Filosofia'}</p></header><h1 id="screen-title" tabindex="-1">Conversar sobre a experiência</h1><ol class="sb-debrief">${debrief.map(question => `<li>${e(question)}</li>`).join('')}</ol><section class="sb-debrief-context"><h2>Na sua partida</h2><p>Você consultou ${e(state.sources.map(id => ({ companhia: 'a companhia', laudo: 'o laudo', ze: 'Seu Zé', acude: 'o açude' })[id]).join(' e ') || 'nenhuma fonte')}. ${e(state.history.find(item => item.scene === 6)?.label || '')}</p><p>Converse sobre suas razões. O jogo não as classifica.</p>${notes}</section>${emptyLens ? '<p class="sb-note">A conversa termina aqui, antes da leitura filosófica.</p><button class="sb-primary" data-sb-action="finish">Encerrar</button>' : '<button class="sb-primary" data-sb-action="open-lenses">Reler a partida pela Filosofia →</button>'}</main>`;
}

function lensScreen(state) {
  const lens = state.lensIds[state.lensIndex];
  const data = lenses.find(item => item.id === lens);
  const index = state.lensIndex;
  return `<main id="main" class="sb-shell sb-lens"><header class="sb-hud"><div><span class="sb-mark">SOMBRAS</span><span class="sb-edition">Rascunho para revisão do professor</span></div><p class="sb-time">Depois da experiência · Lente ${index + 1} de ${state.lensIds.length}</p></header><h1 id="screen-title" tabindex="-1">${e(data.name)}</h1><p class="sb-work">${e(data.work)}</p><p class="sb-kicker">${e(data.theme)}</p><p class="sb-question">${e(data.question)}</p><p class="sb-core">${e(data.text)}</p><section class="sb-application"><h2>Na sua trajetória</h2><p>${e(lensApplication(state, data.id))}</p></section><p class="sb-question sb-final-question">${e(data.finalQuestion)}</p><div class="sb-lens-nav"><button class="sb-button" data-sb-action="back-lens">${index === 0 ? 'Voltar ao debrief' : 'Lente anterior'}</button>${index + 1 < state.lensIds.length ? '<button class="sb-primary" data-sb-action="next-lens">Próxima lente →</button>' : '<button class="sb-primary" data-sb-action="finish">Encerrar leitura</button>'}</div></main>`;
}

export function render(state) {
  if (state.screen === 'handoff') return handoff(state);
  if (state.screen === 'debrief') return debriefScreen(state);
  if (state.screen === 'lenses') return lensScreen(state);
  if (state.screen === 'done') return `<main id="main" class="sb-shell sb-done"><h1 id="screen-title" tabindex="-1">Fim da leitura</h1><p>A conversa e as lentes permanecem nesta aba.</p><button class="sb-primary" data-sb-action="restart">Recomeçar</button></main>`;
  if (state.scene === 7) return finalScreen(state);
  return sceneScreen(state);
}
