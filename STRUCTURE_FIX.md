# Correção estrutural zAIon 2.1 — 17/10/2026

Os prints de celular mostraram sobreposição visual, cartões claros com texto claro, números sobre faixas escuras, abas deslocadas e identidade em retângulos isolados.

## Causa e correção

O CSS carregava sucessivas versões de tema, várias com `!important`. A folha nova não conseguia ser a proprietária de superfícies e cores; a validação anterior em JSDOM não detectou de forma confiável esse conflito. Essa verificação foi insuficiente.

Foram removidas as camadas de tema V13/V14/V21–V30 e 85 declarações de prioridade forçada no material funcional preservado. O CSS de compatibilidade das demonstrações fica agora em `@layer legacy`. A camada visual normal, não estratificada, é definida em `design.css` e tem precedência de cascata sobre todo esse material legado. As únicas prioridades forçadas restantes na folha visual são utilitários de visibilidade e movimento reduzido.

Abertura e navegação usam uma base clara, com o logo original sem moldura, borda ou reconstrução. A composição usa multiplicação CSS para integrar o fundo da imagem à superfície, preservando proporções e o arquivo original. O cartaz duplicado no hero foi substituído por um exemplo ilustrativo da jornada de atendimento. O leão permanece no favicon; não disputa protagonismo no conteúdo.

O cabeçalho permanece no fluxo normal. A navegação fixa inferior, o CTA flutuante e o progresso fixo foram retirados. As abas das demonstrações ficam estáticas no uso normal; o modo expandido continua disponível apenas quando solicitado pelo visitante. O script de progresso tolera a ausência desse elemento decorativo.

Cartões de soluções, método, personalização, formulário, resultado do estimador, FAQ e rodapé possuem superfícies e textos explícitos. Os chats e seus controles têm escopo próprio escuro. Contadores e personalização complementar ficam em blocos expansíveis. O método vira uma sequência de uma coluna até 520 px; abas viram uma grade 2×2 nesse intervalo. Conteúdo adicional, calculadoras e demonstrações foram preservados.

## Validação

271 verificações passaram: 215 de regressão e 56 novas verificações de estrutura/contraste. Os cenários incluem 360, 390, 520, 768, 1024 e 1440 px. O código confere a ausência das prioridades antigas, fluxo do cabeçalho/abas, ausência de barra inferior, cores dos cartões, números sem faixas, rodapé legível e contraste mínimo de 4,5:1 nos pares de texto testados.

Lint e build estático concluídos. As duas imagens originais continuam idênticas aos anexos. Os módulos `atendimento-real.js`, `salao-demo.js` e `server-demo/` não foram alterados.

A navegação no navegador remoto expirou. **Não foram produzidas capturas reais nem concluída uma revisão renderizada desktop/mobile.** Os testes de CSS e contraste não comprovam ausência de todo defeito visual em navegador. Não houve envio a clientes, alteração de workflows ou credenciais.

Publicação desta correção autorizada pelo proprietário nesta conversa. A instalação continua no GitHub Pages existente.
