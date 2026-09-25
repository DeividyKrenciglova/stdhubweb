# STDHub Web — clone estático (HTML + CSS + JS puros)

Landing + app do STDHub sem build, sem frameworks e sem CDN: qualquer
navegador moderno abre, online ou com duplo clique offline.

## Rodar

- **Duplo clique**: abra `index.html` (landing) — tudo funciona, inclusive `app.html`.
- **Servidor local**: `python -m http.server` (ou `npx serve`) dentro de `web/`.
- **Vercel**: importe o repositório com **Root Directory = `web`**, sem
  comando de build e sem output directory customizado (estático puro).

## Tour guiado

Coach marks de 10 passos apontando para o controle real de cada passo
(`data-tour="…"`), com a mesma matemática de posicionamento do app mobile
(`mobile/src/lib/tour.ts`). Sem lib: só `getBoundingClientRect` + CSS.

- Aparece sozinho na primeira visita ao app (marcado em `localStorage`).
- De novo quando quiser: botão **?** na barra lateral, em Configurações ou
  direto em `app.html?tour=1` (é o que o CTA da landing usa).
- `→`/Enter avançam, `←` volta, `Esc` fecha, clicar no fundo avança.
- Passo sem alvo visível (ex.: celular) cai para o cartão centralizado — o
  tour nunca trava.

## Estrutura

```
index.html        landing (PT-BR)
app.html          login de visitante + shell do app
css/theme.css     variáveis dark/light estilo shadcn + base
css/landing.css   landing
css/app.css       shell, notebook, calculadora, chat, modais
assets/logo.svg   logo oficial
js/calculator.js  engine da calculadora (porte 1:1 do desktop)
js/stmd.js        parser + renderer StudyMD (porte 1:1, com escape de HTML)
js/i18n.js        PT/EN embutidos (sem fetch — funciona em file://)
js/store.js       tema/idioma/chaves em localStorage
js/ai.js          cliente OpenAI-compatível (fetch; só com rede)
js/notebook.js    arquivos demo/localStorage/pasta local, editor, toolbar,
                  caderno interativo, desenho à caneta, gaveta de arquivos
                  no celular
js/calcview.js    calculadora com histórico
js/chat.js        tutor (precisa de chave de API + rede)
js/search.js      pesquisa no Google (sem chave) + Brave + resumo por IA
js/settings.js    modal de configurações + teste de conexão
js/app.js         sidebar, abas, dock à direita
js/tour.js        tour guiado (coach marks na UI real, sem libs)
js/boot.js        registra as views no shell
js/landing.js     menu mobile + ano
```

## Diferenças honestas vs. o app desktop

- **Sem terminal** (navegador não tem pty) — removido por decisão.
- **IA só com sua chave + rede**: Pollinations sem chave responde 403 a
  `Origin` de navegador (testado); use um endpoint OpenAI-compatível.
  Sem rede, todo o resto funciona.
- **Pesquisa vai para o Google**: sem chave de API, a Pesquisa abre
  `google.com/search` com a sua consulta (nova aba + link clicável no log).
  Com a chave Brave, os resultados e o resumo por IA aparecem no app — e o
  botão "Abrir no Google" continua lá.
- **Editor é textarea** (Monaco exigiria bundler/CDN): sem live-collapse
  do `#std` ao digitar — o modo Caderno renderiza tudo.
- **Pastas locais** via File System Access API (Chrome/Edge); fora disso,
  arquivos de exemplo persistem em `localStorage` (sem saída para disco).
