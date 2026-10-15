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
