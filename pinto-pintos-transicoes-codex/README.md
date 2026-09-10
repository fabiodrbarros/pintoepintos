# Pinto & Pintos — secções e transições para o Codex

Este pacote contém quatro etapas contínuas: **logo → De Pai para Filhos → catálogo → prateleira**. Não contém menu, rodapé, links de capítulos, barra de progresso ou navegação exterior à experiência. As seis ligações de catálogo e os controlos das amostras fazem parte das secções.

Envia o ZIP ao Codex e pede: «Lê `PROMPT_PARA_CODEX.md` e integra esta sequência na homepage existente, preservando o menu, os conteúdos e o restante site.»

## Demonstração local

Descompacta o ZIP e, dentro desta pasta, executa:

```sh
python3 -m http.server 8000
```

Abre a [demonstração local](http://localhost:8000) e faz scroll. Os módulos precisam de HTTP; não abras o ficheiro diretamente por `file://`. Não há instalação, fontes remotas, bibliotecas externas ou build.

## Ficheiros

| Ficheiro | Função |
| --- | --- |
| `index.html` + `demo.mjs` | Demonstração autónoma das quatro etapas |
| `sections.html` | Fragmento a integrar na página existente |
| `pinto-flow.mjs` | Controlador com montagem, scroll, renderização e limpeza |
| `pinto-flow.css` | Estilos limitados a `.pinto-flow` |
| `choreography.mjs` | Posições, perspetiva e sequência dos mesmos 12 corpos |
| `catalog.mjs` | Seis categorias, nomes, descrições, ícones e destinos |
| `engraved-catalog.mjs` | Ligações e gravações presas às faces dos seis painéis |
| `geometry.mjs` | Projeção das fotografias e contornos |
| `photography.mjs` | Coordenadas dos recortes e caminhos dos assets |
| `photographic-panels.mjs` | Renderização das imagens com amostragem bicúbica |
| `photographic-shelf.mjs` | Prateleira e aproximação da amostra selecionada |
| `inspection.mjs` | Sequência de retirar e devolver amostras |
| `assets/` | Três imagens aprovadas e os seis ícones originais em `catalog/` |
| `assets-manifest.json` | Revisão do código de origem e integridade dos assets |

## Integração

Coloca o fragmento de `sections.html` dentro do `<main>` existente, no lugar das secções correspondentes. Conserva as classes estruturais e adapta o texto aos conteúdos do site. Inclui `pinto-flow.css` depois dos estilos gerais.

```js
import { mountPintoFlow } from './pinto-flow.mjs';

const flow = mountPintoFlow(document.querySelector('.pinto-flow'));

// Se a estrutura exterior mudar de altura:
flow.refresh();

// Ao desmontar o componente ou mudar de rota:
flow.destroy();
```

É seguro importar o módulo durante SSR; a montagem só deve ocorrer no cliente, com o fragmento no DOM. Montar duas vezes a mesma raiz devolve o mesmo controlador. `flow.ready` resolve depois da preparação das imagens e do renderer. Se WebGL não estiver disponível, usa-se a projeção CSS das mesmas fotografias.

Em React, depois de converter o fragmento para JSX:

```jsx
const rootRef = useRef(null);

useEffect(() => {
  const flow = mountPintoFlow(rootRef.current);
  return () => flow.destroy();
}, []);

// <section ref={rootRef} className="pinto-flow story">…fragmento completo…</section>
```

Usa um componente por página: os IDs dos títulos do fragmento são fixos. Os IDs das máscaras, gravações e inspetor são próprios de cada montagem. A limpeza remove listeners, RAF, observadores, elementos criados e recursos gráficos, incluindo quando as imagens ainda estão a carregar.

Copia os módulos junto da pasta `assets`, ou deixa o bundler resolver `new URL(..., import.meta.url)`. O fundo é referenciado relativamente ao CSS.

## Timeline

Há um contentor alto e apenas uma cena sticky. As quatro etapas usam os mesmos corpos; não há substituição de uma cena por outra. O progresso é calculado pela posição da raiz na janela:

```js
travel = story.offsetHeight - cinema.clientHeight;
progress = clamp((stickyTop - story.getBoundingClientRect().top) / travel);
```

O contentor mede `790svh` no desktop e `730svh` em retrato móvel. A resposta de scroll mantém a suavização temporal de 85 ms. Os eventos `wheel` e `touchmove` não são intercetados e os links exteriores ao componente não são alterados.

| Progresso | Etapa |
| --- | --- |
| 0–0,056 | Logo inicial |
| 0,056–0,21 | Deslocação e abertura do logo, com subida do texto de família |
| 0,21–0,431 | Composição aberta, painéis à esquerda e texto à direita |
| 0,431–0,518 | Saída do texto de família |
| 0,455–0,615 | Os seis painéis alinham-se na horizontal, em perspetiva 3D |
| 0,535–0,605 | Revelação dos ícones e nomes gravados |
| 0,615–0,755 | Catálogo com seis painéis clicáveis |
| 0,755–0,805 | Saída das gravações |
| 0,765–0,825 | Aproximação e aumento dos painéis |
| 0,815–0,972 | Separação e deslocação das 12 peças para a prateleira |
| 0,852–0,946 | Mudança para as texturas das amostras |
| 0,879–0,946 | Entrada do texto da matéria à esquerda |
| A partir de 0,976 | Prateleira e seleção das 12 amostras |

`earlyProgress()` mantém a geometria das duas primeiras etapas. `shelfProgress()` remapeia a transformação final para depois do catálogo. `catalogFaceAt()` projeta a gravação sobre a face completa formada por cada par de corpos. Alterar esses intervalos independentemente quebra a sincronização.

No desktop, os seis painéis de catálogo são verticais e ficam numa fila horizontal, com rotação, laterais espessas em madeira e sombra projetada. Ao passar o rato ou dar foco, o sólido completo avança ligeiramente e roda, mantendo as gravações presas à face. A animação partilha a mesma pose nas duas metades de cada painel, evitando fendas no veio. Em retrato móvel, os mesmos seis painéis formam duas filas de três. Os ícones fornecidos pelo site são usados como máscaras transparentes sobre a imagem da madeira, com luz e sombra discretas para o efeito de gravação; os PNG originais não foram alterados.

## Conteúdo e interação

As categorias e os destinos estão em `catalog.mjs`. As descrições ficam associadas aos links para leitores de ecrã e aparecem ao passar o rato ou dar foco. As categorias usam links nativos e só ficam interativas durante a sua etapa. Clicar numa categoria abre o URL respetivo, sem deslocar o scroll da animação.

As 12 madeiras e os seus textos estão em `materials`, em `choreography.mjs`. Na última etapa, o clique retira a amostra e apresenta os detalhes. Um novo clique, o botão de devolução, um clique fora ou Escape devolvem-na. Uma nova seleção devolve primeiro a anterior; recuar no scroll também fecha a seleção.

Com `prefers-reduced-motion`, o progresso acompanha diretamente o scroll, o fundo não faz parallax e a seleção da amostra é imediata. A transformação principal continua ligada ao scroll.

## Cabeçalho fixo

O menu pertence ao site exterior. Se precisar de espaço reservado, define a altura real no componente:

```css
.pinto-flow { --pinto-flow-top: 80px; }
```

A cena ocupa a altura restante e a medição considera esse ponto de fixação. Evita antepassados com `overflow: hidden/auto/scroll` que criem outro contentor de scroll. Se o site tiver um sistema próprio de scroll, adapta conjuntamente a origem dos eventos e a medição, sem duplicar suavização ou pinning.

## Verificação

Esta entrega é código de referência para integração. Foram verificadas a sintaxe, as referências locais, a continuidade geométrica, o alinhamento das seis categorias, o regresso pelo scroll, os destinos, a seleção das amostras e a montagem/limpeza do componente com um DOM simulado. A validação em navegador e a integração no repositório de destino não foram realizadas nesta entrega.
