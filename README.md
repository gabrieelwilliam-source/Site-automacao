# Zion Automações — Site Comercial Interativo

Site comercial responsivo desenvolvido para apresentar serviços de automação de forma visual, interativa e orientada à conversão.

O projeto combina **landing page, demonstrações interativas, simulações de negócio e estimador comercial** em uma única experiência.

## Objetivo

Criar uma página que não apenas explique um serviço, mas permita ao visitante **testar como ele funciona antes de entrar em contato**.

A navegação conduz o usuário por:

**proposta → demonstração → funcionamento → impacto → investimento → contato**

## Destaques do projeto

- hero comercial com CTAs claros;
- identidade visual premium em navy + gold;
- três demonstrações interativas;
- experiência para clínica/estética;
- simulação de reposição e operação;
- qualificação imobiliária com matching de imóveis;
- cards com imagens de imóveis;
- painel mostrando o que acontece por trás das automações;
- apresentação guiada;
- calculadora de impacto operacional;
- estimador de projeto;
- relatório após demonstração;
- CTA contextual por segmento;
- histórico local;
- navegação responsiva;
- melhorias de acessibilidade;
- SEO e Open Graph.

## Diferenciais de front-end

O projeto foi desenvolvido sem framework e trabalha com uma grande quantidade de estados de interface e interações em JavaScript.

Foram implementados:

- tabs acessíveis;
- estados ativos;
- sliders;
- formulários;
- chat simulado;
- cards dinâmicos;
- scroll guiado;
- personalização por URL;
- feedback visual de execução;
- persistência local com localStorage;
- layout desktop e mobile.

## Tecnologias

- HTML5
- CSS3
- JavaScript
- GitHub Pages

## Meu papel

- estrutura e arquitetura da página;
- desenvolvimento front-end;
- design responsivo;
- identidade visual;
- UX e jornada comercial;
- implementação das interações;
- refinamento de contraste e acessibilidade;
- testes e correções de comportamento;
- publicação via GitHub Pages.

## O que este projeto demonstra

Este projeto é uma amostra de trabalho para criação de:

- landing pages;
- sites comerciais;
- páginas de produto;
- interfaces interativas;
- páginas orientadas a conversão;
- experiências responsivas;
- protótipos funcionais para negócios.

## Estrutura

```text
.
├── assets/
├── index.html
├── script.js
├── styles.css
├── AUDIT.md
└── README.md
```

## Execução local

Não há dependências de build.

```bash
python -m http.server 8080
```

Depois, acesse `http://localhost:8080`.

## Portfólio relacionado

- [Landing Page FR Distribuidora](https://github.com/gabrieelwilliam-source/landingpages)
- [Horizonte Prime](https://github.com/gabrieelwilliam-source/HorizontePrime)
- [Nayara Brososki](https://github.com/gabrieelwilliam-source/Nayara-Brososki)


## Atualização comercial 31 — 15/10/2026

- Jornada principal para atendimento e gestão, com demonstração de salão e serviços.
- Conversa e visão da gestora lado a lado: intenção, orçamento previsto, solicitação de horário, declaração de Pix, conferência humana e pausa da assistente.
- Simulação de conflito por duração, sem nenhuma conexão com agendas reais.
- CTA para proposta com contexto da empresa e revisão manual no WhatsApp.
- Demonstrações antigas e estimador preservados; nenhuma promessa de tempo de resposta ou resultado garantido.
- `salao-demo.js` é um simulador local, não usa um modelo de IA nem chama o n8n. A implantação da IA e das integrações pertence ao projeto de cada empresa. Não inserir chaves, URLs privadas ou dados reais no código público.
- Verificação: `NODE_PATH=/caminho/para/node_modules node tests/site.test.cjs` (JSDOM). Sem dependência de produção.


## Correção visual — 15/10/2026

O logo em `assets/zion-original.png` é o arquivo original aprovado, sem redesenho. `design.css` define a apresentação clara com azul-marinho e dourado e a área de demonstração escura. É carregado depois do CSS legado das demonstrações. O layout da abertura usa uma coluna até 820 px.

Validação: 25 testes de interações e 36 verificações de cascata CSS em 360, 390, 768, 1024 e 1440 px. A ferramenta de navegador ficou indisponível; estes testes não equivalem a inspeção visual renderizada.

Executar com Node e dependências jsdom e css-tree: `node tests/site.test.cjs` e `node tests/design.test.cjs`.


## Simulações reunidas

A abertura apresenta automação para empresas em geral. Clínica, reposição, imobiliária e salão dividem os mesmos cards e abas em `#demos`. O salão não ocupa mais uma seção exclusiva antes das outras soluções. Validação: 27 testes de interação e 36 de CSS; sem inspeção visual renderizada.


## Atendimento com IA real

`atendimento-real.js` conecta clínica, imobiliária e salão ao webhook isolado de demonstração do n8n. A Groq responde de verdade; catálogo, empresas, CRM e agendas são fictícios. Reposição continua sendo uma simulação operacional com cálculo e aprovação. Nenhum cliente real, WhatsApp, tabela de negócio ou Google Calendar é acessado por essa integração.

As credenciais Groq e PostgreSQL ficam protegidas no n8n. O navegador envia apenas identificador aleatório da sessão, segmento, mensagem e eventuais ações do painel demonstrativo. Não há chaves no repositório. Não informe dados pessoais ou sensíveis: as mensagens são processadas pela Groq. A memória da demonstração tem validade de 30 minutos de inatividade e é mantida no schema separado `zion_webdemo_v1`, com RLS e sem concessão pública. As tabelas de negócio existentes são preservadas.

Limites: 24 consultas de IA por sessão; 240 por dia no total; intervalo entre pedidos; trava de concorrência por sessão. SQL usa parâmetros e bloqueios transacionais. CORS permite somente a origem do GitHub Pages. Essas cotas limitam o custo; a demonstração pública não substitui um gateway de proteção contra abuso para operação de grande volume.

Erros de IA/rede são mostrados explicitamente. Não há resposta roteirizada disfarçada de resposta da IA. Handoff pausa a assistente. Botões de confirmação financeira e agenda atuam somente nos dados de teste. O servidor impede que a IA registre recebimento por conta própria e exige ação da equipe de teste para confirmar horários do salão.

Fontes de servidor em `server-demo/`: preparação do contexto, validação do retorno e estrutura SQL. Instalar esses scripts nos nós correspondentes do fluxo isolado; nunca colocar credenciais nesses arquivos. Executar testes `site.test.cjs`, `design.test.cjs`, `live-demo.test.cjs` e `server-demo.test.cjs`. Testes DOM/CSS não equivalem à inspeção visual em navegador.


## Correção do teste imobiliário — 15/10/2026

O servidor valida a carteira antes de oferecer um imóvel: finalidade, tipo, bairro, mínimo de quartos e teto do aluguel precisam coincidir. O visitante precisa aceitar expressamente mudanças de critérios. Preços de aluguel são armazenados em reais e formatados pelo código, sem conversão implícita para centavos. `imobiliaria-guard.js` é incorporado ao nó de validação do n8n antes de `saida.js`. O navegador utiliza os IDs aprovados pelo servidor em `propertyMatches`.

Dia, horário e confirmação da visita são etapas separadas. “Sim” sem horário escolhido não cria visita. Sessões antigas são reconstruídas a partir das mensagens da pessoa quando ainda não possuem a versão atual das regras. Testes de regressão do caso relatado estão em `tests/property-guard.test.cjs`.
