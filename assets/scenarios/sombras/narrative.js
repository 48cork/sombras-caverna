// Informações desta camada só chegam a um papel por uma interação ou mensagem explícita.
export const occurrence = context => context <= 2
  ? 'Na enseada leste havia peixes mortos no raso e água quente. Depois, outros pescadores relataram o mesmo em trechos rasos. A imagem não estabelece a causa; o calor é a explicação de Seu Zé, confirmada apenas no desfecho.'
  : 'Na enseada leste havia peixes mortos e cheiro forte perto do loteamento. Isso delimita uma ocorrência; o registro não identifica substância, autor nem condição da água tratada.';

export function original(context) {
  return `Kaique: “Na manhã em que o vídeo começou a circular, às 5h40, parei na trilha leste antes da primeira corrida. Filmei o raso por 18 segundos e mandei ao primo Nando: olha isso, na enseada leste. Não fui à captação nem às casas.” ${context <= 2 ? '“Vi os peixes e a água muito baixa; não medi nada.”' : '“Senti cheiro forte junto ao loteamento; não sei de onde vinha.”'}`;
}
export const suspect = 'Celina: “Às 5h20 vi Zé carregando um balde azul perto da trilha leste. Depois recebi o vídeo e pensei: será que ele jogou alguma coisa? Contei assim a Damião.” Damião: “No grupo tiraram o será que. Eu repeti: Zé mexeu na água. Ele já discutiu com o loteamento pelo acesso ao barco; essa história fez muita gente aceitar a ligação.” Celina: “Minha neta vai para a escola perto dali. Eu queria que conferissem antes da merenda; não quero que pintem o barco.” Ela não viu o conteúdo do balde nem um despejo.';
export const zeReply = 'Seu Zé: “O balde era para tirar a água que entrou no barco. Celina me viu na trilha, sim. Minha filha entrega o peixe que vendo; duas entregas ficaram em dúvida. Eu reclamei da cerca do loteamento para conseguir trabalhar, não por querer estragar a água. Não publique o nome de Celina para resolver meu nome. Quero que perguntem o que ela realmente viu.” O relato dele esclarece sua versão, mas não comprova o conteúdo do balde.';
export const forwarded = 'Nando → Kaique, 6h12, dia da gravação: “Mandei o original à minha tia que mora perto. Ela devolveu uma cópia só com os oito segundos dos peixes, sem tua frase sobre a enseada. Já veio escrito NÃO BEBAM ESSA ÁGUA.” Nando → Kaique, 21h48: “Agora chegou narrado: a prefeitura está escondendo. Não sei quem pôs a voz.” A legenda ampliou o raso filmado para “essa água”; a voz sugeriu ocultação e os encaminhamentos passaram a mencionar as torneiras. Não há identificação confirmada de quem editou.';

export function interactions(state) {
  const seen = new Set(state.interactions);
  const options = {
    1: [ ['rita', 'Conversar com Dona Rita antes de encaminhar', 'Rita acorda para encher a garrafa: “Cuidei de vocês em outra falta d’água. Posso separar uma reserva até amanhã, mas não quero gastar a semana toda sem saber de que água estão falando.”'] ],
    2: [ ['celina', 'Pedir a Celina que conte o que viu', suspect], ['damiao', 'Perguntar por que Damião encaminhou', 'Damião: “Minha irmã trabalha na cozinha da escola. Em outra interrupção, o aviso chegou tarde. Mandei para ela não ficar sem saída amanhã. Valdir vende água, mas também emprestou o caminhão quando faltou abastecimento. Ganhar com a procura não prova que inventaram o vídeo.”'] ],
    3: [ ['scope', 'Reler os limites das fontes com Lia', 'Lia: “Um relato pode orientar outra pergunta. Cheiro, calor e uma gravação não medem potabilidade. Preciso distinguir onde houve observação, onde houve análise e a que momento cada resposta se refere.”'] ],
    4: [ ['school', 'Ouvir a necessidade da diretora', 'Diretora: “Minha cozinha atende crianças que não almoçam em casa. Suspender também tem custo. Preciso de informação da água usada aqui, não apenas de uma imagem da margem. A visita de hoje pode ajudar; não dá tempo de cuidar de todas as conversas.”'] ],
    5: [ ['original', 'Abrir a gravação e a mensagem enviada', original(state.context)], ['forwarded', 'Ler as duas respostas de Nando', forwarded] ],
    6: [ ['rita-return', 'Ouvir Dona Rita antes da fala', `Rita: “${state.world.grandma === 'mineral' ? 'Paguei mais caro para guardar água; esse gasto já aconteceu.' : state.world.grandma === 'para-de-beber' ? 'Deixei de beber da torneira por causa dos avisos; preciso combinar o que faremos enquanto falta resposta.' : 'Continuei usando a torneira, mas ainda quero entender o aviso.'} Se você mudou de ideia, diga o que mudou. Não basta me mandar esquecer.”`] ]
  };
  if (state.scene === 1 && seen.has('rita')) options[1].push(['reserve', 'Combinar uma reserva com Rita para esta noite', 'Rita: “Eu separo o que já temos. Amanhã conversamos de novo; a reserva não responde sobre a torneira.”'], ['budget', 'Pedir a Rita que reserve dinheiro para comprar água', 'Rita: “Posso adiar a compra para a horta e separar esse dinheiro. Só não trate isso como prova de que a torneira faz mal.”']);
  if (state.scene === 3 && (state.sources.includes('acude') || (state.context >= 3 && state.sources.includes('laudo')))) options[3].push(['margin-report', 'Encaminhar o registro da margem e pedir coleta com localização', 'Lia registra o ponto e a data recebidos, sem atribuir autor. O protocolo responde: recebemos a solicitação; ainda não há nova coleta ou conclusão. O envio não resolve imediatamente a ocorrência.']);
  return (options[state.scene] || []).map(([id, label, text]) => ({ id, label, text, seen: seen.has(id) }));
}

export function interact(state, id) {
  const item = interactions(state).find(item => item.id === id);
  if (!item || state.screen !== 'scene') throw new Error('Conversa indisponível.');
  if (item.seen) return state;
  state.interactions.push(id);
  state.causes.push({ id: `conversa-${id}`, text: `${state.scene === 5 ? "Kaique" : "Lia"}: ${item.label}.`, parents: [] });
  const role = state.scene === 5 ? 'kaique' : 'lia';
  state.knowledge[role].push({ id, text: item.text, via: 'conversa' });
  if (id === 'reserve') state.world.reserve = true;
  if (id === 'budget') state.world.gardenDeferred = true;
  if (id === 'margin-report') state.world.marginReported = true;
  if (id === 'celina') state.world.suspicionInvestigated = true;
  return state;
}

export function narrativePanel(state, escape) {
  const items = interactions(state);
  const role = state.scene === 5 ? 'kaique' : 'lia';
  const messages = state.knowledge[role].filter(item => item.via === 'mensagem');
  return `<section class="sb-events" aria-label="Conversas e mensagens">${messages.map(item => `<p>${escape(item.text)}</p>`).join('')}${items.map(item => item.seen ? `<p>${escape(item.text)}</p>` : `<button class="sb-button" data-sb-action="interact" data-interaction="${item.id}">${escape(item.label)}</button>`).join('')}</section>`;
}
