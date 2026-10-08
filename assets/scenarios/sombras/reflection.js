// Opções construídas somente a partir do que Lia recebeu, nunca dos fatos ocultos do contexto.
export const beliefChoices = [
  ['amplo', 'O aviso pode valer para o açude e a água das casas'],
  ['local', 'O vídeo pode indicar um problema em parte do açude'],
  ['em-aberto', 'Prefiro suspender o julgamento até receber mais informação']
];
export const beliefText = belief => beliefChoices.find(([id]) => id === belief)?.[1] || '';

export function evidenceForLia(state) {
  const labels = { 'video-recebido': 'O vídeo que chegou ao grupo', companhia: 'A resposta da companhia', laudo: 'O laudo recebido', ze: 'O relato de Seu Zé sobre os peixes', acude: 'A visita de Lia ao açude', original: 'A comparação enviada por Kaique', celina: 'O relato de Celina e Damião', 'ze-relato': 'A versão de Seu Zé sobre o balde' };
  const unique = new Map();
  for (const item of state.knowledge.lia) {
    if (!labels[item.id]) continue;
    let topics = ['margem', 'acude', 'casas'];
    if (item.id === 'original') topics = ['video', 'margem', 'acude', 'casas'];
    if (['celina', 'ze-relato'].includes(item.id)) topics = ['ze'];
    if (item.id === 'companhia' || (item.id === 'laudo' && !item.text.includes('ponto 4'))) topics = ['casas'];
    unique.set(item.id, { ...item, label: labels[item.id], topics });
  }
  return [...unique.values()];
}

export function priorStatements(state) {
  const statements = [];
  for (const item of state.history) {
    if (item.scene === 1 && item.choice === 'A') statements.push({ id: 'aviso-familia', text: 'Encaminhei à família “URGENTE: não bebam essa água”, junto da voz sobre ocultação.', topics: ['video', 'margem', 'acude', 'casas'], audience: 'família' });
    if (item.scene === 2 && item.choice === 'A') statements.push({ id: 'perigo-feira', text: 'Concordei na feira que a água era perigosa e comprei água mineral.', topics: ['margem', 'acude', 'casas'], audience: 'feira' });
    if (item.scene === 2 && item.choice === 'B') statements.push({ id: 'origem-feira', text: 'Disse na feira que ninguém sabia de onde vinha o vídeo.', topics: ['video'], audience: 'feira' });
    if (item.scene === 2 && item.choice === 'E') statements.push({ id: 'acusacao-ze', text: 'Associei Seu Zé ao episódio ao avisar os compradores.', topics: ['ze'], audience: 'compradores da feira' });
  }
  return statements;
}

export function correctionOptions(statement, evidence) {
  if (!statement || !evidence) return [];
  const changes = [];
  const allows = topic => statement.topics.includes(topic) && evidence.topics.includes(topic);
  if (allows('video')) changes.push({ id: 'video-origem', topic: 'video', label: 'Autoria e edição do vídeo', text: 'A comparação recebida distingue a gravação original da legenda/voz acrescentadas. Corrijo a apresentação da origem; ainda não se sabe quem editou. Isso não atesta a segurança da água.' });
  if (allows('margem')) changes.push({ id: 'margem-delimitar', topic: 'margem', label: 'Ocorrência no trecho observado', text: 'Delimito a ocorrência ao que as imagens mostram ou a fonte descreve. Não retiro o que foi observado, nem atribuo uma causa ou um responsável sem evidência.' });
  if (allows('acude')) changes.push({ id: 'acude-restringir', topic: 'acude', label: 'Condição do açude inteiro', text: 'Retiro a generalização para o açude inteiro: esta informação tem um recorte. O que acontece em outros pontos permanece por verificar.' });
  if (allows('casas')) {
    const treated = evidence.id === 'companhia' || (evidence.id === 'laudo' && !evidence.text.includes('ponto 4'));
    changes.push({ id: treated ? 'casas-boletim' : 'casas-suspender', topic: 'casas', label: 'Água das casas', text: treated && evidence.text.includes('Estamos analisando')
      ? 'A companhia ainda está analisando: retiro a certeza de perigo geral, sem apresentar uma conclusão sobre a água tratada ou das casas.'
      : treated ? 'Substituo a certeza de perigo geral pela resposta recebida sobre a água tratada, respeitando seus limites. A informação não avalia cada reservatório das casas.'
      : 'Retiro a certeza sobre a água das casas: esta informação sobre imagens ou um trecho do açude não confirma o que chega às torneiras. Mantenho essa questão em aberto.' });
  }
  if (allows('ze')) changes.push({ id: 'ze-indicio', topic: 'ze', label: 'Responsabilidade de Seu Zé', text: 'Retiro a apresentação da suspeita como responsabilidade confirmada. O relato recebido não comprova o conteúdo do balde nem um despejo; não é prova de culpa ou de inocência.' });
  return changes;
}

export function setInitialInterpretation(state, belief) {
  if (state.scene !== 1 || state.screen !== 'scene' || !beliefText(belief)) throw new Error('Interpretação inicial indisponível.');
  state.initialInterpretation = { belief, text: beliefText(belief), evidence: 'video-recebido' };
  state.belief = belief;
  return state;
}

export function reviseInterpretation(state, belief, evidenceId) {
  if (![3, 6].includes(state.scene) || state.screen !== 'scene' || !beliefText(belief)) throw new Error('Revisão indisponível.');
  const evidence = evidenceForLia(state).find(item => item.id === evidenceId);
  if (!evidence) throw new Error('Escolha uma informação que Lia recebeu.');
  const from = state.belief;
  const move = from === belief ? 'manter' : from === 'amplo' && belief === 'local' ? 'restringir' : 'mudar';
  state.revisions.push({ from, to: belief, move, evidence: { id: evidence.id, text: evidence.text, via: evidence.via }, scene: state.scene });
  state.belief = belief;
  return state;
}

export function prepareRetraction(state, statementId, evidenceId, changeId) {
  if (state.scene !== 6 || state.screen !== 'scene') throw new Error('Retratação indisponível.');
  const statement = priorStatements(state).find(item => item.id === statementId);
  const evidence = evidenceForLia(state).find(item => item.id === evidenceId);
  const change = correctionOptions(statement, evidence).find(item => item.id === changeId);
  if (!change) throw new Error('Escolha a afirmação anterior, uma informação recebida e a mudança sustentada por ela.');
  state.retraction = { statement: { ...statement }, evidence: { id: evidence.id, text: evidence.text, via: evidence.via }, change: { ...change } };
  return state;
}
