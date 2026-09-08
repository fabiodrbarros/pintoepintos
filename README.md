# Carpintaria Pinto & Pintos

Website em TypeScript, React, Tailwind CSS e Framer Motion, com rotas App Router compatíveis com Next.js através de Vinext (runtime Sites).

## Desenvolvimento

- `npm install`
- `npm run dev`
- `npm run build`
- `npx tsc --noEmit`
- `npx oxlint app components/site.tsx lib/content.ts`

## Conteúdo editável

`lib/content.ts` reúne contactos, serviços, estudos visuais e estatísticas. O array de estatísticas fica vazio até existirem valores confirmados. `company.logo` recebe o caminho do logótipo oficial em `public/`; enquanto estiver vazio, o cabeçalho apresenta apenas o nome em texto.

As três imagens fornecidas são utilizadas como assets originais. O componente WoodPanels mantém a geometria intacta e permite tamanho, posição, perspetiva e interatividade configuráveis. As imagens de projetos estão claramente identificadas como estudos, não obras executadas.

## Formulário

Valida os campos obrigatórios e prepara uma mensagem `mailto:` para carpintaria.pintos@sapo.pt. O visitante conclui o envio no seu programa de email. Não existe envio automático no servidor ou armazenamento de dados pessoais.

## Pendências de conteúdo

- Logótipo oficial.
- Mockups das páginas desktop/mobile para comparação fiel de layout.
- Fotografias e informações de obras reais.
- História e estatísticas da empresa confirmadas.

## Verificação

Compilação e TypeScript verificados. Lint do código do website verificado. O lint global do starter inclui avisos/erros preexistentes nos componentes de catálogo não alterados.
