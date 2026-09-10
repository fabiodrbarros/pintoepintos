# Integrar a sequência completa da homepage

Integra as transições deste pacote na homepage existente. A composição é uma continuação da versão aprovada: logo em madeira → «De Pai para Filhos» → catálogo → prateleira. São quatro etapas ligadas ao mesmo scroll, sem menu incluído no componente.

## O que preservar

- Mantém o menu, o cabeçalho, o rodapé, as restantes secções e a identidade do site. Não alteres `/catalogo-scroll`.
- Conserva os conteúdos existentes correspondentes às secções. Os textos do pacote servem de referência para a colocação e a sincronização.
- Reutiliza os ficheiros de imagem fornecidos, os recortes e as proporções do logo. O fundo continua a ser a parede branca com sombras de luz e chão.
- Não recries os painéis com texturas procedurais, novos renders ou aproximações das diagonais. As imagens da madeira são as mesmas do protótipo aprovado.

## A nova secção de catálogo

Entra entre «De Pai para Filhos» e a prateleira. São **seis painéis verticais dispostos lado a lado na horizontal** no desktop, com perspetiva 3D, espessura de madeira visível e sombras projetadas. Não são nove painéis nem placas deitadas.

Cada painel tem o ícone original e o nome com aspeto de gravação na madeira, sempre visíveis durante esta etapa. A gravação acompanha o plano do painel, incluindo a rotação e o avanço suave ao passar o rato ou dar foco. O painel inteiro move-se como um sólido: não inclines só a imagem ou o texto nem separes as duas metades que formam cada peça. Cada painel inteiro é uma ligação à categoria respetiva:

| Categoria | Destino |
| --- | --- |
| Cozinhas | https://www.carpintariapintos.com/categoria-produto/cozinhas/ |
| Roupeiros | https://www.carpintariapintos.com/categoria-produto/moveis/quartos/ |
| Portas e Janelas | https://www.carpintariapintos.com/categoria-produto/janelas/ |
| Móveis | https://www.carpintariapintos.com/categoria-produto/moveis/ |
| Pavimentos | https://www.carpintariapintos.com/produtos/ |
| Tetos e Revestimentos | https://www.carpintariapintos.com/categoria-produto/estruturas-e-coberturas/ |

As descrições estão em `catalog.mjs`; surgem ao passar o rato ou dar foco e estão associadas aos links para leitores de ecrã. Em retrato móvel, os mesmos painéis distribuem-se por duas filas de três para manter a leitura e o toque utilizáveis.

Só depois desta etapa os painéis se aproximam e aumentam, a madeira muda para as texturas das amostras e os seis painéis se separam em doze peças que encaixam na prateleira à direita. O texto da matéria fica à esquerda. Conserva a seleção que puxa uma amostra para a frente e mostra o respetivo nome e descrição.

## Implementar por reutilização

Lê `README.md`, `pinto-flow.mjs`, `choreography.mjs`, `engraved-catalog.mjs`, `pinto-flow.css` e `sections.html`. O `index.html` é uma demonstração executável, não a homepage inteira a substituir.

Reutiliza os módulos e adapta apenas a montagem, os caminhos dos assets e a ligação ao framework. A parte essencial é **uma cena sticky, um progresso de scroll e os mesmos 12 corpos ao longo de toda a sequência**. No início, os corpos estão unidos em três painéis; depois formam seis painéis abertos e seis categorias; finalmente separam-se nas doze amostras. As gravações são uma camada associada às faces, não outro conjunto de placas.

Não substituas isto por cenas independentes com fades, carrosséis, scroll-snap ou animações de entrada disparadas uma vez. A abertura do logo continua a acontecer enquanto o texto «De Pai para Filhos» sobe, antes de se encontrarem. Ao subir no scroll, a sequência reverte continuamente.

## Montagem na página

- Insere o equivalente a `sections.html` no lugar destas secções, sem duplicar o conteúdo antigo. Mantém o menu fora da cena.
- Inclui `pinto-flow.css`, limitado a `.pinto-flow`.
- Monta com `mountPintoFlow(root)` no cliente e chama `destroy()` ao desmontar ou mudar de rota. Em React/Next, usa um componente cliente e um efeito com limpeza.
- Mantém a altura de percurso: `790svh` no desktop e `730svh` em retrato móvel. Foi alargada para dar tempo à etapa do catálogo.
- O progresso já considera a posição do componente dentro da página através de `getBoundingClientRect()`.
- Se existir um cabeçalho fixo que precise de espaço, usa `--pinto-flow-top` com a altura real.
- Conserva uma única fonte de scroll. O exemplo usa o scroll nativo da janela. Se o site usar outro contentor ou um sistema de scroll personalizado, adapta conjuntamente os eventos e a medição; não sobreponhas dois sistemas de suavização ou pinning.
- Verifica se algum antepassado cria um contentor de scroll involuntário com `overflow` e impede o sticky de funcionar.
- Mantém as máscaras dos ícones, o renderer das fotografias, a alternativa CSS, os controlos de teclado, o movimento reduzido e a limpeza dos recursos.

## Critérios para concluir

O logo e a secção de família mantêm as proporções e a abertura sincronizada. O catálogo apresenta seis painéis verticais na horizontal, com profundidade, laterais de madeira e ícones e nomes gravados, e cada um abre a categoria certa. Depois os painéis crescem, mudam de textura e seguem para a prateleira com 12 amostras. O scroll lento, rápido e inverso não deve duplicar ou trocar os elementos. A montagem repetida não deve duplicar listeners, máscaras ou painéis.

Faz as verificações adequadas ao repositório de destino e indica os ficheiros alterados e as limitações de validação. Não publiques nem faças deploy, salvo se eu o pedir separadamente.
