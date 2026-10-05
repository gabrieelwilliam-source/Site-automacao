# Zion Automações — Site Comercial Interativo

Site comercial da **Zion Automações**, desenvolvido em HTML, CSS e JavaScript puro e preparado para hospedagem estática, incluindo GitHub Pages.

O projeto foi desenhado para apresentar automação como uma experiência demonstrável: o visitante pode testar jornadas, simular cenários de negócio, visualizar decisões da automação e estimar um projeto antes de entrar em contato.

## Principais recursos

- Demonstração conversacional para clínicas e estética
- Simulação de reposição e sugestão de pedido
- Qualificação de leads e matching para imobiliária
- Personalização por segmento
- Personalização por URL com `?segmento=` e `?empresa=`
- Calculadora demonstrativa de impacto operacional
- Estimador de projeto
- Relatório pós-demonstração
- Histórico local de interações
- Modo apresentação guiada
- CTA contextual para WhatsApp
- Eventos locais preparados para integração com analytics
- SEO social com Open Graph
- Layout responsivo
- Navegação e componentes com melhorias de acessibilidade

## Estrutura

```text
.
├── assets/
│   ├── og-zion.svg
│   └── zion-mark.svg
├── index.html
├── script.js
├── styles.css
├── AUDIT.md
└── README.md
```

## Como executar localmente

Não há dependências de build.

Você pode abrir o `index.html` diretamente no navegador. Para uma experiência mais próxima da hospedagem real, use qualquer servidor estático local.

Exemplo com Python:

```bash
python -m http.server 8080
```

Depois acesse `http://localhost:8080`.

## Personalização por URL

O site aceita parâmetros para preparar a experiência comercial.

Exemplos:

```text
?segmento=clinica
?segmento=imobiliaria
?segmento=reposicao
?segmento=personalizada
?segmento=clinica&empresa=Empresa%20Exemplo
```

Também é possível abrir demos diretamente por hash:

```text
#demo-clinica
#demo-reposicao
#demo-imobiliaria
```

## Dados e privacidade

As demonstrações atuais são locais e não executam operações reais em CRM, agenda, ERP, banco de dados ou n8n.

Os dados demonstrativos e parte do histórico de interação são armazenados apenas no navegador com `localStorage`. O projeto não contém credenciais, tokens ou segredos de integração.

O botão de WhatsApp abre uma conversa externa com uma mensagem pré-preenchida.

## Analytics

O projeto registra eventos localmente e também está preparado para enviar eventos a `window.dataLayer` quando um gerenciador de tags for instalado.

Nenhum Google Analytics ou Google Tag Manager é carregado por padrão.

## Acessibilidade

Foram incluídos:

- link para pular ao conteúdo;
- foco visível para teclado;
- tabs com estados ARIA;
- nomes acessíveis nos campos de conversa;
- modal de apresentação identificado como diálogo;
- mensagens de status anunciadas por leitores de tela;
- suporte a `prefers-reduced-motion`;
- navegação do seletor de demos por setas do teclado.

## Observação sobre arquitetura

O projeto permanece propositalmente sem framework e sem etapa de build. Como as três demonstrações compartilham estado, UI e fluxos de apresentação, a separação física do JavaScript em vários módulos foi evitada nesta revisão para reduzir risco de regressão funcional.

Em uma evolução com backend real, a recomendação é migrar os motores de demonstração para módulos e separar a camada de interface da camada de integrações.

## Auditoria

As verificações e melhorias aplicadas nesta revisão estão documentadas em [AUDIT.md](AUDIT.md).
