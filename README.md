# Carpintaria Pinto & Pintos

Website da Carpintaria Pinto & Pintos, desenvolvido em TypeScript, React, Tailwind CSS, Framer Motion e Next.js App Router. Inclui catálogo, projetos, páginas institucionais, animações, tradução PT/EN/FR e um painel de administração em `/admin` para gerir conteúdos e imagens.

## Requisitos

- Produção: Docker Engine com o plugin Docker Compose.
- Desenvolvimento local: Node.js 22.13 ou superior e npm.

## Produção com Docker Compose

Depois de clonar o repositório:

```bash
cp .env.example .env
```

Edite `.env` e defina uma palavra-passe forte em `ADMIN_PASSWORD` e uma chave aleatória com pelo menos 32 caracteres em `ADMIN_SESSION_SECRET`. Pode gerar a chave com:

```bash
openssl rand -base64 48
```

Construa e inicie os serviços:

```bash
docker compose up -d --build
docker compose ps
```

Por omissão, o site fica disponível em `http://127.0.0.1:3000`. Ajuste `BIND_ADDRESS` e `PORT` no `.env` quando necessário. O proxy reverso deve encaminhar pedidos para essa porta.

Comandos de operação:

```bash
# Consultar logs
docker compose logs -f --tail=200 website

# Parar os serviços
docker compose down

# Atualizar para a versão mais recente
git pull --ff-only
docker compose up -d --build --remove-orphans

# A migração do catálogo é aplicada automaticamente no primeiro acesso.
# Para a executar/verificar explicitamente:
docker compose exec website node scripts/migrate-catalog-2026.mjs

# Verificar a saúde da aplicação
curl --fail http://127.0.0.1:${PORT:-3000}/api/health
```

O volume `pintos-data` preserva a base de dados SQLite e as imagens carregadas pelo painel entre reconstruções. O volume `libretranslate-models` preserva os modelos de tradução. `docker compose down` não elimina estes volumes; não use `docker compose down -v` sem uma cópia de segurança.

## Cópia de segurança

Pare temporariamente o serviço `website` e copie o conteúdo do volume `pintos-data`. Esse volume contém `site.db`, os respetivos ficheiros auxiliares SQLite e a pasta `uploads`.

## Desenvolvimento e validação

```bash
npm ci
npm run dev
npm run build
npx tsc --noEmit
npm run lint
```

O script `build` usa o servidor Next.js, necessário para SQLite, autenticação, uploads e rotas API. O script `build:sites` mantém disponível a compilação Vinext usada pelo ambiente Sites.

## Conteúdo e formulário

O conteúdo inicial e os contactos ficam em ficheiros versionados; o conteúdo gerido no painel é guardado em SQLite. As migrações acrescentam apenas registos em falta e preservam conteúdo alterado no painel. O formulário público valida os campos obrigatórios e prepara uma mensagem `mailto:` para `carpintaria.pintos@sapo.pt`; o visitante conclui o envio no seu programa de email e o servidor não guarda dados pessoais do formulário.

Todas as imagens, fontes e outros recursos necessários ao site estão versionados em `public/` ou junto dos respetivos componentes.
