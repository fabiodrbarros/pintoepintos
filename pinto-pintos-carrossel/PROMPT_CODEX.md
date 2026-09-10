Integra no meu projeto apenas o carrossel incluído nesta pasta, reproduzindo exatamente o seu aspeto e comportamento. Lê primeiro o README.md e reutiliza o código fornecido.

Mantém a geometria de panel-geometry.mjs: cinco painéis visíveis em repouso, o central em destaque, os painéis da esquerda alinhados em perspetiva e os dois da direita próximos do central, com as diagonais superior e inferior contínuas. O painel da ponta direita já tem a altura inferior corrigida. Mantém as posições finais depois de todas as rotações.

Preserva a animação dos corpos completos dos painéis, com espessura, costas opacas em madeira e fotografias fixas às respetivas faces. Conserva as máscaras de recorte e as transformações. A navegação é feita pelas setas, scroll sobre o carrossel, teclas direcionais e gesto horizontal. Clicar numa fotografia abre o popup existente, sem fazer avançar o carrossel.

Usa carrossel.css, carrossel.mjs, panel-geometry.mjs e assets/reference.png. Integra com createPintoCarousel() e adapta apenas o caminho dos ficheiros e o ciclo de montagem/desmontagem ao framework atual. Mantém o código de geometria e os valores de perspetiva, espaçamentos e duração da animação. Se houver estilos globais em conflito, corrige o isolamento do componente.

O carrossel deve usar o fundo que já existe na minha página. Não copies a página de demonstração nem acrescentes o cenário de fundo, menus, títulos, legendas ou outro carrossel. Preserva o resto do site e a sua navegação. O resultado pedido é apenas a integração deste componente na área de catálogo existente.
