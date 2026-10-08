import { beliefText, evidenceForLia } from './reflection.js';
import { outcomeLabels } from './state.js';

const category = cause => {
  if (cause.id.startsWith('conversa-')) return 'conversas';
  if (cause.id === 'final') return 'resultado';
  if (cause.id.startsWith('fonte-')) return 'fontes';
  if (['urgente', 'origem', 'espera', 'acude-cedo'].includes(cause.id)) return 'video';
  if (['compra', 'custo-publico', 'defesa'].includes(cause.id)) return 'feira';
  if (['merenda-suspensa', 'barco-acusado', 'diretora', 'visita-ze'].includes(cause.id)) return 'cidade';
  if (['explicacao', 'apagou', 'silencio-kaique', 'avo-para', 'procura-kaique'].includes(cause.id)) return 'circulacao';
  return 'fala-publica';
};

export function causalItems(state) {
  const groups = new Map();
  for (const cause of state.causes) {
    const key = category(cause);
    groups.set(key, [...(groups.get(key) || []), cause.text]);
  }
  const items = [...groups.values()].map(group => group.join(' '));
  if (!items.length || items.length > 10 || items.some(item => !item.trim())) throw new Error('Reconstrução causal inválida.');
  return items;
}

export function ending(state) {
  const { world: w } = state;
  const corrected = state.corrections.map(item => `Correção: ${item.statement.text} ${item.change.text} Dirigida a ${item.audiences.join(' e ')}; não há confirmação de leitura dos encaminhamentos.`).join(' ');
  const latest = state.revisions.at(-1);
  const interpretation = state.initialInterpretation ? `Interpretação inicial: ${state.initialInterpretation.text}.` : '';
  const revision = latest ? `Lia decidiu ${latest.move}: ${beliefText(latest.to)}. Base recebida: ${evidenceForLia(state).find(item => item.id === latest.evidence.id)?.label || latest.evidence.id}.` : '';
  const water = state.context <= 2
    ? 'Semanas depois, a companhia informou que a água tratada estava dentro do padrão. Os peixes morreram no açude raso, com água quente.'
    : 'Semanas depois, a água tratada continuava dentro do padrão; o problema estava localizado na margem leste, perto do loteamento.';
  const margin = state.context >= 3 ? (state.outcome === 'calma-com-dano'
    ? 'A margem leste, onde havia um problema real, continuou sem resposta pública suficiente.'
    : 'O problema estava localizado na margem leste; a água tratada captada a oeste permaneceu dentro do padrão.') : '';
  const grandma = ({ torneira: 'Dona Rita continuou bebendo água da torneira.', mineral: 'Dona Rita passou a beber água mineral; a procura elevou o preço.', 'para-de-beber': 'Dona Rita deixou de beber água da torneira.' })[w.grandma];
  const ze = ({ suspeito: 'Seu Zé permaneceu sob suspeita.', acusado: 'Seu Zé foi acusado no barco.', defendido: 'Lia defendeu Seu Zé na feira ou o visitou depois; a acusação foi contestada.' })[w.ze];
  const meal = w.meal === 'suspensa' ? 'A merenda escolar ficou suspensa até sair um laudo.' : 'A merenda escolar foi mantida ou voltou após informação sobre a água tratada.';
  const price = w.price === 'muito-alto' ? 'A água mineral ficou muito cara depois do aumento da procura.' : 'O preço da água mineral subiu durante a conversa sobre o vídeo.';
  const kaique = ({ calado: 'Kaique ficou calado.', explicou: 'Kaique explicou o que tinha gravado e ouviu: “Então foi você!”.', reservado: 'Kaique enviou a comparação somente a Lia, preservando seu nome. O grupo não recebeu diretamente essa mensagem.', apagou: 'Kaique apagou o vídeo do celular, mas ele já circulava fora do aparelho.' })[w.kaique];
  const group = w.reach >= 3 ? 'A conversa chegou à escola e se espalhou pela cidade.' : w.reach === 2 ? 'A conversa chegou à feira.' : w.reach === 1 ? 'A conversa ficou entre família e vizinhança.' : 'A circulação perdeu força.';
  const outcomeCopy = {
    panico: 'O fio principal foi a precaução prolongada: o pedido de suspensão circulou enquanto a cidade ainda precisava delimitar a ocorrência e sustentar o custo da espera.',
    'calma-com-dano': 'O fio principal foi a calma com dano: a retomada foi defendida publicamente, mas a situação da margem leste ficou sem resposta suficiente.',
    'verificacao-compartilhada': 'O fio principal foi a verificação compartilhada: a cidade separou o que se sabia do que ainda precisava ser conferido.',
    descrenca: 'O fio principal foi a descrença: contradições públicas fizeram com que alguns passassem a ignorar avisos, enquanto outros pediam a origem.',
    'boato-morreu': 'A circulação enfraqueceu, mas nem todos receberam informação suficiente para reconstruir o episódio.'
  }[state.outcome];
  return {
    title: outcomeLabels[state.outcome], description: outcomeCopy,
    blocks: [
      { title: 'A cidade e a água', text: water + (state.context <= 2 && w.marginReported ? ' Lia encaminhou o registro do raso para verificação; a solicitação não foi uma garantia sobre as casas.' : '') },
      ...(margin ? [{ title: 'A margem leste', text: margin + (w.marginReported ? ' Lia protocolou o local e a data; o pedido de nova verificação permanecia em acompanhamento.' : ' Lia não encaminhou uma solicitação específica da margem; isso não elimina a ocorrência.') }] : []),
      { title: 'A feira e a escola', text: `${price} ${meal}` },
      { title: 'Seu Zé', text: ze + (w.zeDamage ? ' A tinta no barco e as vendas canceladas não foram recuperadas pelo apoio ou pela correção.' : ' Alguns compradores ainda pediam esclarecimento sobre o balde; contestar não provou inocência nem culpa.') },
      { title: 'Dona Rita', text: grandma + (w.gardenDeferred ? ' Ela adiou a compra para a horta para reservar dinheiro; a revisão da mensagem não devolveu esse tempo.' : '') + (w.reserve ? ' Ela combinou uma reserva com Lia; pediu participar da decisão, lembrando a falta d’água que já viveu.' : ' Ela pediu participar da próxima decisão sobre o orçamento e a água.') },
      { title: 'Kaique', text: kaique },
      { title: 'O grupo e Lia', text: `${corrected || 'Não houve retratação explícita recebida pelos públicos da fala.'} ${group} ${interpretation} ${revision} Lia terminou com credibilidade ${w.credibility === 0 ? 'baixa' : w.credibility === 1 ? 'abalada' : w.credibility === 2 ? 'preservada' : 'reforçada'}.` }
    ],
    causes: causalItems(state)
  };
}
