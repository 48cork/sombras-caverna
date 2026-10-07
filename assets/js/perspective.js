// Apenas apresentação: nenhum estado do motor é escrito aqui.
export const introductions = {
  sombras: [
    "Serra do Vento, no sertão. Às 22h, chega no grupo da cidade um vídeo de peixes mortos no açude: ‘não bebam essa água’.",
    'Você é Lia, estudante de História, e mora com a sua avó.',
    'Não há resposta certa nem pontuação. O que você decidir muda a cidade, e você só verá o resultado no fim.'
  ]
};
export const identities = {
  lia:{name:'Lia',second:false}, kaique:{name:'Kaique',second:true}
};
export const transitions = {
  kaique: ['Agora você é Kaique, mototaxista que gravou os peixes mortos e mandou o vídeo ao primo.', 'Ele teme ser culpado pelo que circula.', 'O vídeo voltou com uma voz que não é dele. O mundo continua do jeito que você deixou.'],
  lia: ['Agora você é Lia, estudante de História, que mora com a avó.', 'Ela quer entender o que está acontecendo com a água.', 'O mundo continua do jeito que você deixou.']
};
export function opening(scenario, face, attribute) {
  return `<main id="main" class="perspective-screen"><section aria-labelledby="screen-title"><div class="perspective-portrait">${face}</div><h1 id="screen-title" tabindex="-1">${({sombras:'Sombras'})[scenario]}</h1>${introductions[scenario].map(text=>`<p>${text}</p>`).join('')}<button class="perspective-button" ${attribute}="begin">Começar</button></section><p id="error" role="alert"></p></main>`;
}
export function transition(role, face, attribute, action, dupla) {
  return `<main id="main" class="perspective-screen"><section class="swap-copy" aria-labelledby="screen-title"><h1 id="screen-title" tabindex="-1">Troque de lugar</h1><div class="perspective-portrait">${face}</div>${transitions[role].map(text=>`<p>${text}</p>`).join('')}${dupla?'<p class="perspective-pass">Passe o celular para a sua dupla.</p>':''}<button class="perspective-button" ${attribute}="${action}">Continuar como ${identities[role].name}</button></section><p id="error" role="alert"></p></main>`;
}
export function roleBar(root, role, face, flash=false) {
  const person=identities[role];
  root.innerHTML = `<div class="perspective-bar ${person.second?'perspective-second':''} ${flash?'perspective-flash':''}" aria-label="Seu personagem atual"><span class="perspective-mini">${face}</span><span>Você é <strong>${person.name}</strong></span></div>` + root.innerHTML;
}
