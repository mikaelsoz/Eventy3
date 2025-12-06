# Eventy3 Landing + 3D iPhone Embed

Projeto composto por uma landing page estática na raiz e um mini-app React (`iphone-3d-react`) que gera o embed 3D em `/iphone-embed`. Foi organizado para facilitar versionamento no GitHub e deploy automatizado na Netlify.

## Estrutura
- `index.html`, `css/`, `js/`, `assets/`: landing estática.
- `iphone-3d-react/`: código-fonte do embed em React/Three.js.
- `iphone-embed/`: saída gerada do build do React (não precisa ser versionada).
- `netlify.toml`: receita de build/deploy.

## Requisitos
- Node 20+ (configurado em `netlify.toml`).

## Como buildar tudo (landing + embed)
Na raiz:
```bash
npm run build
```
O script vai:
1. Instalar dependências em `iphone-3d-react` via `npm ci`;
2. Rodar o `react-scripts build`;
3. Publicar a saída em `iphone-embed/` (limpando o que havia antes).

Use `npm run clean` para limpar build e node_modules do subprojeto.

## Deploy na Netlify
1. Conecte o repositório.
2. Build command: `npm run build`
3. Publish directory: `.`
4. Node version: 20 (já definida no `netlify.toml`).
5. `iphone-embed` é gerada no pipeline, não precisa estar no repositório.

O redirect em `netlify.toml` garante que `/iphone-embed/*` sirva o `index.html` do embed (útil se ele ganhar rotas no futuro).

## Publicar no GitHub
1. `git init` (se ainda não houver repositório).
2. `git add . && git commit -m "chore: projeto pronto para deploy"`
3. `git remote add origin git@github.com:<seu-usuario>/<repo>.git`
4. `git push -u origin main`

Arquivos gerados (`iphone-embed/`, `iphone-3d-react/build/`, `node_modules/`) já estão ignorados em `.gitignore`. Nunca suba `secrets` ou `.env`.

## Desenvolvimento rápido
- Landing: basta abrir `index.html` no navegador ou servir com `npx serve .`.
- Embed React: `cd iphone-3d-react && npm install && npm start`.

