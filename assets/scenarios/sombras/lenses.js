const record = (state, scene) => state.history.find(item => item.scene === scene);
const visited = state => state.videoVisit || state.sources.includes('acude');
const factLabel = state => state.facts.join(' ');

export function lensApplication(state, id) {
  const c1 = record(state, 1), c2 = record(state, 2), c4 = record(state, 4), c5 = record(state, 5), c6 = record(state, 6);
  const sourceNames = state.sources.map(source => ({ companhia: 'companhia', laudo: 'laudo público', ze: 'Seu Zé', acude: 'açude' })[source]);
  const facts = factLabel(state);
  switch (id) {
    case 'socrates': {
      const question = c1?.choice === 'B' ? 'Você perguntou no grupo quem gravou e onde.' : 'Você não perguntou no grupo quem gravou e onde.';
      return `${question} Depois, consultou ${sourceNames.join(' e ') || 'nenhuma fonte'}. ${c6?.choice === 'C' ? 'Em público, você separou o que sabia do que ainda não sabia.' : 'Em público, você escolheu o que dizer a partir do que tinha vivido.'}`;
    }
    case 'platao':
      return `${visited(state) ? `Você esteve perto da água e percebeu: ${state.facts.find((_, i) => state.sources[i] === 'acude') || 'o que aparecia no açude'}` : 'Você não foi ao açude; conheceu o lugar por mensagens e pelas fontes que consultou.'} ${facts ? `As fontes também disseram: ${facts}` : ''} O vídeo mostrava imagens reais, mas a voz acrescentava uma afirmação que Kaique não gravou.`;
    case 'descartes': {
      const publicChoice = c6?.label || 'não falar';
      const contradiction = state.context >= 3 && c6?.choice === 'A' ? ' A margem leste tinha um problema localizado.' : state.context <= 2 && c6?.choice === 'B' ? ' A companhia informou depois que a água tratada estava dentro do padrão.' : '';
      return `Em público, você escolheu: “${publicChoice}”.${contradiction} As fontes consultadas foram ${sourceNames.join(' e ') || 'nenhuma'}; elas não respondiam todas às mesmas perguntas.`;
    }
    case 'marx':
      return `${state.world.price === 'muito-alto' ? 'A procura elevou muito o preço da água mineral.' : 'O preço da água mineral já havia dobrado na feira.'} ${state.world.ze === 'acusado' ? 'Seu Zé foi acusado.' : state.world.ze === 'defendido' ? 'Seu Zé foi defendido.' : 'Seu Zé permaneceu sob suspeita.'} ${state.world.grandma === 'mineral' ? 'Dona Rita passou a comprar água mineral.' : state.world.grandma === 'para-de-beber' ? 'Dona Rita deixou de beber da torneira.' : 'Dona Rita continuou bebendo da torneira.'} Seu Damião e Valdir vendiam ou ofereciam água, e não há identificação de quem acrescentou a legenda e a voz.`;
    case 'adorno':
      return `O vídeo começou no grupo e circulou até ${state.world.peakReach >= 3 ? 'a escola e a cidade' : state.world.peakReach >= 2 ? 'a feira' : 'a família e a vizinhança'}. ${c5?.choice === 'A' ? 'Kaique usou o próprio celular para explicar o que tinha gravado; a mensagem também o expôs.' : 'Na sua partida, Kaique não publicou uma explicação nova.'} ${visited(state) ? 'Lia também foi ao açude e consultou fontes para conferir.' : state.sources.length ? 'Lia consultou fontes para conferir, mas não foi ao açude.' : 'Lia não foi ao açude nem consultou fontes para conferir.'}`;
    case 'husserl': {
      const lake = state.sources.includes('acude') ? state.facts[state.sources.indexOf('acude')] : 'Você conheceu o açude por imagens e relatos, sem ir até a água.';
      const report = state.sources.includes('laudo') ? state.facts[state.sources.indexOf('laudo')] : 'Você não consultou o laudo.';
      return `${report} ${lake} O laudo e a observação direta mostraram aspectos diferentes da situação.`;
    }
    case 'heidegger':
      return `No grupo, o vídeo chegou sem autoria conhecida. Kaique havia visto os peixes, mas a voz que circulou não era dele. ${c5?.choice === 'A' ? 'Kaique explicou publicamente o que tinha gravado.' : c5?.choice === 'B' ? 'Kaique apagou o vídeo do celular; ele já circulava fora do aparelho.' : c5?.choice === 'D' ? 'Kaique enviou a comparação apenas a Lia; o público não recebeu diretamente essa resposta.' : 'Kaique guardou o original e adiou a resposta.'}`;
    case 'ranciere':
      return `${sourceNames.length ? `Você consultou ${sourceNames.join(' e ')} e recebeu estes fatos: ${facts}` : 'Você não consultou fontes na Cena 3.'} ${c4?.choice === 'B' ? 'Lia também ouviu a versão de Seu Zé sobre o balde; esse relato não comprova o conteúdo.' : ''} ${state.world.shared ? 'Na sua trajetória, os fatos verificados chegaram a ser compartilhados.' : 'Na sua trajetória, os fatos não chegaram a formar uma verificação compartilhada ouvida pela cidade.'}`;
    default: return 'Observe as escolhas e os fatos que realmente apareceram nesta partida.';
  }
}
