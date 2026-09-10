# Carrossel Pinto & Pintos

Componente extraído da versão final aprovada: só os painéis, os controlos e o popup da imagem. HTML, CSS e JavaScript nativos, sem dependências.

## Ficheiros

| Ficheiro | Função |
| --- | --- |
| `carrossel.mjs` | Montagem do componente, animação dos painéis, navegação e popup. |
| `panel-geometry.mjs` | Geometria e perspetiva exatas da versão aprovada. |
| `carrossel.css` | Estilos isolados com prefixo `pp-`. |
| `assets/reference.png` | Imagem original da qual são recortadas as fotografias e a textura de madeira. |
| `demo.html` | Exemplo mínimo de utilização sobre uma cor lisa. |
| `PROMPT_CODEX.md` | Pedido de integração pronto para entregar ao Codex. |

## Integrar

Copiar os três ficheiros de código e a pasta `assets` para a mesma pasta no projeto. Preservar a estrutura relativa, importar o CSS e montar o componente num elemento existente:

```html
<link rel="stylesheet" href="./carrossel/carrossel.css">
<div id="catalogo"></div>

<script type="module">
  import { createPintoCarousel } from './carrossel/carrossel.mjs';
  const carousel = createPintoCarousel(document.querySelector('#catalogo'));

  // Ao desmontar a página/componente:
  // carousel.destroy();
</script>
```

O elemento de montagem deve ter uma largura definida pelo layout do site. O carrossel ocupa 100% dessa largura e mantém a proporção `1000 / 550`. As setas ficam fora dos limites laterais dos painéis: reservar aproximadamente 60 px à direita e permitir `overflow: visible` nos elementos envolventes. O exemplo usa um contentor com `width: min(80vw, 1100px)`.

Em React, Vue ou outro framework, montar uma vez depois de o elemento existir no DOM e chamar `destroy()` no respetivo cleanup. Não voltar a inicializar a cada render. O módulo resolve a imagem relativamente ao seu próprio endereço com `new URL(..., import.meta.url)`; se o projeto exigir outro caminho, passar `{ imageUrl: '/caminho/reference.png' }` como segundo argumento.

API devolvida: `previous()`, `next()` e `destroy()`.

Para ver o exemplo, servir esta pasta por HTTP com o servidor do projeto ou executar `python -m http.server 8000` e abrir `http://localhost:8000/demo.html`. No Windows, pode usar `py -m http.server 8000`. Os módulos devem ser servidos por HTTP, em vez de abrir o HTML diretamente como ficheiro.

## Preservar a versão aprovada

- Cinco posições visíveis em repouso: dois painéis à esquerda, o central em destaque e dois à direita. Seis fotografias circulam; o sexto corpo fica oculto atrás entre transições.
- Os corpos completos deslocam-se e rodam, levando consigo a fotografia e as faces opacas em madeira.
- As posições finais e os cortes diagonais mantêm-se depois de qualquer número de rotações.
- Os dois painéis da direita estão próximos do central e partilham as diagonais superior e inferior; o painel da ponta direita já está encurtado por baixo.
- Setas, teclas direcionais, scroll sobre a área do carrossel e gesto horizontal no ecrã tátil controlam a rotação.
- Clicar numa fotografia abre o popup. Fechar com o botão, Escape ou um clique no fundo. O clique na imagem não avança o carrossel.
- O componente tem fundo transparente. Não inclui o cenário de fundo, menus, textos visíveis nem o carrossel inferior.

As fotografias usam recortes da imagem `reference.png`, com 1672 × 941 píxeis. O ficheiro completo contém outros elementos da imagem de origem, mas só os recortes das faces são mostrados. Não redimensionar essa imagem nem alterar as coordenadas de recorte para reproduzir o resultado atual. O popup utiliza os mesmos recortes.

O ficheiro de geometria e a imagem são cópias exatas da última versão. A adaptação para componente limita-se ao isolamento de estilos, montagem/desmontagem, caminhos dos recursos e captura do scroll apenas sobre a área do carrossel, para permitir que a restante página continue a deslocar-se.
