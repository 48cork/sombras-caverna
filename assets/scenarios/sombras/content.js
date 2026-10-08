export const contextFacts = {
  companhia: {
    good: 'A companhia respondeu: “Estamos analisando a água tratada; ainda não concluímos. O vídeo não veio com ponto de coleta.” A atendente anota a demanda da escola; não oferece uma garantia provisória.',
    partial: 'A companhia informou: “A água tratada está dentro do padrão.” O boletim é da saída da estação, com captação a oeste, nesta manhã. Não avalia toda a margem nem cada reservatório das casas.'
  },
  laudo: {
    good: 'O laudo indicava parâmetros normais na saída da estação nesta manhã. Não era uma coleta no raso filmado nem em todas as casas.',
    partial: 'O laudo indicava coliformes acima do limite no ponto 4, na margem leste, próximo ao loteamento, em coleta daquela manhã. Confirma alteração naquele ponto; não identifica responsável nem mede a água nas torneiras.'
  },
  ze: {
    good: 'Seu Zé disse: “Morreu peixe no raso todo, acho que foi o calor.” Ele conta que outros pescadores viram peixes mortos nos rasos. É uma explicação baseada na experiência, ainda não uma análise da causa.',
    partial: 'Seu Zé disse: “Eu só vi peixe morto do lado do loteamento novo.” Seu relato delimita o que viu; não demonstra que o loteamento ou uma pessoa causou a morte.'
  },
  acude: {
    good: 'No açude, Lia viu peixes mortos no raso, água quente e sem cheiro na enseada leste. Um pescador aponta outros rasos; Lia não os percorreu. A ausência de cheiro não comprova segurança da água.',
    partial: 'No açude, Lia sentiu cheiro forte na enseada leste, perto da cerca do loteamento. Não viu despejo nem acompanhou a água até a captação a oeste. Sua visita não identifica a causa ou a segurança da água tratada.'
  }
};

export const sources = [
  { id: 'companhia', name: 'A companhia', label: 'Ligar para a companhia' },
  { id: 'laudo', name: 'Laudo público', label: 'Ler o laudo público' },
  { id: 'ze', name: 'Seu Zé', label: 'Perguntar a Seu Zé' },
  { id: 'acude', name: 'Açude da Pedra Lisa', label: 'Ir ao açude' }
];

export const scenes = [
  { id: 'video', title: 'O VÍDEO', time: '22h', text: 'O celular vibra. No grupo “Notícias da Serra”, um vídeo mostra peixes mortos. Uma voz diz: “Não bebam essa água. A prefeitura está escondendo.” A avó já dorme. A torneira da cozinha pinga.' },
  { id: 'fair', title: 'A FEIRA', time: 'Manhã', text: 'Na bodega, todo mundo fala do vídeo. A água mineral dobrou de preço. Valdir oferece carro-pipa. Celina comenta um balde visto às 5h20 na trilha leste. Damião repete: “Zé mexeu na água”. Seu Zé já brigou pelo acesso ao barco. A coincidência de lugar e horário passou a parecer responsabilidade; ninguém na feira viu o conteúdo do balde.' },
  { id: 'sources', title: 'AS FONTES', time: 'Tarde', text: 'Lia tem a tarde. Dá tempo de consultar até duas fontes. Cada uma conta apenas o que viu ou verificou.' },
  { id: 'others', title: 'ENQUANTO ISSO, OUTRAS PESSOAS AGEM', time: 'Depois', text: 'A diretora decide como conduzir a merenda. Dona Rita procura proteger a casa. Seu Zé responde às suspeitas. As decisões deles também mudam os rumos da conversa.' },
  { id: 'switch', title: 'TROQUE DE LUGAR', time: 'Manhã seguinte', text: 'Kaique espera uma corrida que ajuda a pagar as peças da moto. Antes de sair, precisa decidir se responde ao vídeo que voltou. Nando, seu primo, foi o primeiro destinatário. O celular guarda o original e duas respostas dele; as consultas de Lia não estão aqui.' },
  { id: 'public', title: 'FALAR EM PÚBLICO', time: 'Mais tarde', text: 'Na rádio, ao vivo.' }
];

export const debrief = [
  'Em que momento você acreditou no vídeo? E em que momento deixou de acreditar, se deixou?',
  'O vídeo combinava com o que todo mundo já esperava. Ele correspondia ao que estava acontecendo?',
  'O que mudou no vídeo enquanto ele circulava? Você fez parte dessa mudança?',
  'Quanto custou dizer “não sei” na feira?',
  'Quem ganhou e quem perdeu com o boato? Alguém o criou para ganhar?',
  'Duvidar de tudo teria resolvido?',
  'Havia na cidade um lugar onde todos pudessem conferir juntos?',
  'Conte com suas palavras como a confusão começou, por que Seu Zé foi acusado e o que Rita, Damião e Kaique queriam preservar.'
];

// Núcleos e obras mantêm o estatuto de rascunho da especificação §11.
export const lenses = [
  { id: 'socrates', name: 'Sócrates', work: 'Apologia de Sócrates, de Platão', theme: 'Saber que não se sabe', question: 'Quem, na sua partida, perguntou antes de afirmar?', text: 'Sócrates dizia que sua única sabedoria era reconhecer que não sabia. Em vez de afirmar, perguntava, e examinava as opiniões dos outros até mostrar que elas não se sustentavam. Para ele, uma vida sem esse exame não valia a pena.', finalQuestion: 'Que pergunta, feita a tempo, teria mudado o caminho do boato?' },
  { id: 'platao', name: 'Platão', work: 'A República, livro VII', theme: 'Sombra e coisa', question: 'O que você viu, e o que você só viu na tela?', text: 'Na alegoria da caverna, prisioneiros veem sombras na parede e as tomam pela realidade. Platão distingue a opinião (doxa), que fica nas aparências, do conhecimento (epistéme), que busca o que as coisas são. Sair da caverna é difícil, e quem volta para contar pode não ser ouvido.', finalQuestion: 'Na sua partida, o que era sombra e o que era a coisa?' },
  { id: 'descartes', name: 'Descartes', work: 'Discurso do método (1637)', theme: 'Dúvida como método', question: 'Em que momento você duvidou?', text: 'Descartes propôs não aceitar como verdadeiro nada que não se conheça com evidência. A dúvida, para ele, não era desconfiança de tudo para sempre, e sim um método: duvidar para chegar a algo de que não se possa mais duvidar.', finalQuestion: 'Sua dúvida terminou em alguma certeza? Qual?' },
  { id: 'marx', name: 'Marx', work: 'A ideologia alemã, com Engels (1845–46)', theme: 'Ideias e interesses', question: 'Quem ganhou com o boato?', text: 'Para Marx e Engels, as ideias que circulam numa sociedade não flutuam no ar: estão ligadas às condições materiais e aos interesses de quem vive nela. Ideias que servem a interesses particulares podem aparecer como verdade de todos. Isso não exige complô: basta que a situação favoreça uns e prejudique outros.', finalQuestion: 'Por que algumas ideias se espalham mais do que outras? Quem pode pagar para não acreditar nelas?' },
  { id: 'adorno', name: 'Adorno e Horkheimer', work: 'Dialética do esclarecimento (1947)', theme: 'O mito de volta', question: 'Ter um celular no bolso deixou a cidade mais esclarecida?', text: 'Adorno e Horkheimer argumentaram que o esclarecimento, a promessa de libertar as pessoas do mito pela razão, pode recair em mito. A técnica que deveria esclarecer também pode servir para repetir, padronizar e emocionar sem fazer pensar.', finalQuestion: 'Na sua partida, a técnica ajudou a pensar ou a repetir?' },
  { id: 'husserl', name: 'Husserl', work: 'A crise das ciências europeias (1936)', theme: 'Voltar às coisas mesmas', question: 'O que mudou quando você esteve perto da água?', text: 'Husserl pedia que a filosofia voltasse “às coisas mesmas”, ao modo como as coisas aparecem na experiência. Ele não era contra a ciência: criticava o esquecimento de que toda medição e todo laudo nascem do mundo vivido, o mundo comum em que as pessoas veem, tocam e conversam.', finalQuestion: 'O laudo e a ida ao açude diziam a mesma coisa? O que cada um mostrava que o outro não mostrava?' },
  { id: 'heidegger', name: 'Heidegger', work: 'Ser e tempo (1927)', theme: 'O falatório', question: 'Quem, na sua partida, tinha visto o que todos diziam?', text: 'Em Ser e tempo, Heidegger descreve o “falatório”: falar e repassar o que “se diz” sem relação com a coisa de que se fala. Quem fala é “a gente”, ninguém em particular. O falatório dá a sensação de já saber tudo, e por isso dispensa a pergunta.', finalQuestion: 'Na sua partida, quem falava quando “se dizia” que a água estava envenenada?' },
  { id: 'ranciere', name: 'Rancière', work: 'O mestre ignorante (1987)', theme: 'Qualquer um pode verificar', question: 'Quem, na cidade, podia ter descoberto o que acontecia?', text: 'Em O mestre ignorante, Rancière parte da igualdade das inteligências: qualquer pessoa pode aprender e verificar por si, sem esperar que uma autoridade explique. Emancipar-se é usar a própria inteligência e conferir.', finalQuestion: 'O que teria sido preciso para a cidade inteira verificar junto?' }
];

export const choices = {
  video: [
    ['A', 'Repassar para o grupo da família', 'Para a avó não beber.'],
    ['B', 'Perguntar no grupo quem gravou e onde', 'Tentar encontrar a origem do vídeo.'],
    ['C', 'Não repassar e esperar amanhã', 'A mensagem pode esperar até haver mais informação.'],
    ['D', 'Combinar de ir ao açude de manhã', 'Você chega tarde à feira. A visita conta como uma fonte.']
  ],
  fair: [
    ['A', 'Concordar que é perigoso e comprar água mineral', 'A avó passa a usar água mineral.'],
    ['B', 'Dizer: “Ninguém sabe ainda de onde veio esse vídeo”', 'Na feira, a dúvida pode ter um custo social.'],
    ['C', 'Contestar a acusação contra Seu Zé', '“O balde não prova o que ele fez.” Damião teme que isso desarme o aviso; responder pode custar confiança.'],
    ['D', 'Ficar calada e ouvir', 'Registrar o que as pessoas dizem.'],
    ['E', 'Repassar a suspeita contra Seu Zé', 'Avisar os compradores para que se protejam enquanto falta resposta; seu nome circulará ligado ao episódio.']
  ],
  others: [
    ['A', 'Levar o que você sabe à diretora', 'Ela decide sobre a merenda.'],
    ['B', 'Visitar Seu Zé', 'Saber como ele está e oferecer apoio.'],
    ['C', 'Procurar quem gravou o vídeo', 'Kaique saberá que você o procura.']
  ],
  switch: [
    ['A', 'Gravar um novo vídeo', 'Explicar o que você viu e o que não disse.'],
    ['B', 'Apagar o vídeo do celular', 'O vídeo já circula fora do seu aparelho.'],
    ['C', 'Guardar o original e adiar a resposta', 'Atender a corrida agora; o vídeo alterado continuará sem sua comparação.'],
    ['D', 'Enviar o original em reservado a Lia', 'Autorizar a comparação sem publicar seu nome; o grupo ainda não receberá a resposta.']
  ],
  public: [
    ['A', 'Pedir retomada do uso da água tratada', 'Dar prioridade à merenda e ao orçamento; a retomada não resolve o que houve na margem.'],
    ['B', 'Pedir suspensão temporária enquanto se verifica', 'Ganhar tempo para novas respostas; famílias e escola precisarão sustentar o custo da espera.'],
    ['C', 'Publicar a comparação das fontes e cobrar resposta', 'Expor a investigação e enfrentar perguntas; uma explicação demorada pode alcançar menos gente.'],
    ['D', 'Conversar em reservado antes de se expor', 'Preservar relações e preparar a fala; o público ainda não receberá sua resposta.']
  ]
};
