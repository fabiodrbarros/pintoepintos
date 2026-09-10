# Publicação na VPS

1. Instale Docker Engine e o plugin Docker Compose no Ubuntu.
2. Copie o projeto para a VPS e crie `.env` a partir de `.env.example`.
3. No Cloudflare Zero Trust, crie um Tunnel e configure o hostname público para `http://website:3000`.
4. Coloque o token do Tunnel em `CLOUDFLARE_TUNNEL_TOKEN`.
5. Inicie a aplicação com `docker compose up -d --build`.

O painel fica em `/admin`. A base de dados e as imagens carregadas ficam no volume Docker `pintos-data`, pelo que sobrevivem à substituição do container.

Antes da primeira publicação, use valores fortes e únicos em `ADMIN_PASSWORD` e `ADMIN_SESSION_SECRET`. A tradução automática é feita pelo serviço LibreTranslate incluído no Docker e não requer chave nem subscrição paga.

## Cópia de segurança

Pare temporariamente o serviço `website` e faça uma cópia do conteúdo do volume `pintos-data`. Esse volume contém `site.db` e a pasta `uploads`.
