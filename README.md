# zAIon Automações

Landing page institucional com identidade oficial, quatro demonstrações interativas e estimador de projeto. HTML, CSS e JavaScript sem framework ou dependência de produção.

## Executar e verificar

Requer Node.js 20.19+ (verificado com Node 24).

```sh
npm ci --ignore-scripts
npm run lint
npm test
npm run build
```

O build gera `dist/` com os arquivos públicos. **Nenhum comando realiza deploy.** A hospedagem existente continua no GitHub Pages. A branch de redesign deve ser revisada antes de qualquer merge ou publicação.

## Estrutura

- `index.html`: conteúdo semântico e componentes existentes.
- `styles.css`: compatibilidade funcional isolada em `@layer legacy`, sem prioridades forçadas ou temas históricos.
- `design.css`: única camada visual, com superfícies, contraste e layouts responsivos definidos por componente.
- `premium.js`: teclado, foco, menu e exposição progressiva dos detalhes.
- `script.js`, `salao-demo.js`: estimador e demonstrações locais.
- `atendimento-real.js`: integração existente com o webhook isolado de demonstração, preservada.
- `assets/brand/`: imagens oficiais sem alterações; hashes e origem documentados.
- `assets/fonts/`: Inter e Newsreader locais em WOFF2, com licenças OFL.
- `server-demo/`: lógica existente do ambiente de demonstração. Não é incluída no build estático.
- `tests/`: regressões de conversa, integrações com respostas controladas, acessibilidade e cascata CSS.

## Integrações

O WhatsApp comercial e o webhook de IA demonstrativa existentes foram preservados. O formulário abre uma mensagem que o visitante revisa e decide enviar. Nenhuma chave é necessária no frontend. Não inserir credenciais, dados de clientes ou endpoints de envio de produção no código público.

As demonstrações de clínica, imobiliária e salão usam o endpoint isolado existente; a operação de reposição é simulada. Nenhuma dessas experiências cria compromisso real, confirma pagamento bancário ou envia WhatsApp a clientes. A indicação de IA conectada depende da resposta efetiva do backend. Mensagens de erro continuam visíveis.

## Identidade e validação

Paleta e aplicações seguem os materiais oficiais fornecidos em 17/10/2026. O logotipo e o leão são cópias binárias das imagens aprovadas. Não há marca redesenhada ou gerada por IA.

Leia `REDESIGN.md` e `qa/redesign-results.json` para os resultados e limites. As verificações responsivas são de cascata CSS em cinco larguras, **não são capturas ou testes em um navegador renderizado**. A revisão visual desktop/mobile e o Lighthouse permanecem pendentes por indisponibilidade de navegador de QA neste ambiente.

## Correção estrutural 2.1

A revisão dos prints removeu temas históricos conflitantes, a repetição do logo na abertura e as barras fixas que cobriam conteúdo. A marca original é aplicada sem moldura em uma base clara; os chats mantêm seu ambiente escuro isolado. Método, cartões, rodapé e abas receberam regras explícitas de contraste e disposição.

271 verificações passaram, incluindo 56 regressões específicas de estrutura/contraste em seis larguras. A tentativa de navegação no navegador remoto expirou; não houve validação visual renderizada. Consulte `STRUCTURE_FIX.md` e `qa/structure-fix-results.json`.
