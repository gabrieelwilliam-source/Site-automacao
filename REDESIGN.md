# Redesign zAIon — revisão de 17/10/2026

## Auditoria anterior à implementação

Repositório confirmado: `gabrieelwilliam-source/Site-automacao`, branch `main`, base `4d9beb9` (correções de contexto das conversas). Os demais repositórios são projetos de salão, imóveis e portfólio; não houve ambiguidade após a inspeção do conteúdo.

Stack estática: HTML, CSS, JavaScript e GitHub Pages. Não existiam manifesto de dependências, build ou pipeline de CI no repositório. Havia testes Node sem instalação reproduzível. O site incluía quatro cenários, IA em endpoint isolado, estimador de escopo/investimento, calculadora operacional, apresentação guiada, relatório, histórico local e contato comercial no WhatsApp.

Problemas encontrados: assinatura visual anterior em uso; fontes externas de três famílias; camada editorial anterior sobre uma folha extensa; repetição de capítulos comerciais e operacionais; textos muito pequenos nos chats; menu com competição de espaço no tablet; abas sem navegação completa por teclado. O destaque do salão já tinha sido corrigido e foi preservado como opção equivalente às outras.

## Alterações

- Assinatura original com AI e ponte dourados aplicada sem redesenho, recorte ou filtro. Leão original secundário no rodapé e favicon. Os hashes de ambos estão em `assets/brand/provenance.json`.
- Paleta oficial: azul-marinho #071A31, azul real #102C59, dourado #D7B46A e marfim #F4EFE6. Dourado como acento; capítulos claros para leitura e respiro.
- Títulos em Newsreader e interface em Inter. Fontes locais, WOFF2, subconjuntos latinos e licenças incluídas. A tipografia do logotipo é a imagem original.
- Hero geral para empresas, mensagem direta e duas ações: discutir o projeto e experimentar a Iana. Composição arquitetônica ilustrativa que não finge mostrar métricas reais.
- Soluções reais explicadas antes dos quatro cenários. Método, personalização e investimento recebem uma hierarquia própria. Explicações operacionais complementares ficam em um bloco expansível, sem remoção de funcionalidades.
- Chats mais legíveis; grades que se reorganizam entre celular, tablet e desktop; controles de formulário com 16 px para evitar zoom automático no iOS.
- Navegação por setas/Home/End nas abas; Escape no menu; controle de foco na apresentação; conteúdo acessível sem animação e alternativa de navegação sem JavaScript.
- Movimentos e rolagem respeitam a preferência de movimento reduzido.
- Metadados, assinatura verbal e imagens de compartilhamento atualizados. Canonical aponta para a URL existente do GitHub Pages.
- Build estático reproduzível em `dist/`, lint e instalação travada por lockfile. Sem framework ou dependências no runtime do site.

## Preservação

`atendimento-real.js`, `salao-demo.js` e `server-demo/` mantiveram conteúdo idêntico ao commit base. IDs e contratos das demonstrações, estimador, links de contato e formulário continuam presentes. Alterações em `script.js` se limitam a textos de marca/abertura e preferência de rolagem reduzida.

Não foram alteradas credenciais, configurações do n8n, dados de clientes, infraestrutura, fonte do GitHub Pages ou automações. Nenhum contato real foi realizado. Não foram acrescentados cases, depoimentos, números de clientes ou promessas de resultados.

## Validação e limites

- 215 verificações: 27 DOM/interações; 47 cascata/hashes em 360, 390, 768, 1024 e 1440 px; 14 de redesign; 77 regressões de conversa; 19 regras imobiliárias; 16 backend demonstrativo; 15 integração de frontend com respostas controladas.
- Lint: sintaxe JavaScript e parsing das folhas CSS.
- Build: distribuição estática produzida sem publicação.
- Comparação binária dos dois assets oficiais com os anexos.
- Comparação dos módulos de integração com a base.

Foi identificada dependência do dia real nos testes antigos: em um sábado, “amanhã” é domingo e deve ser recusado. O relógio foi fixado somente no processo de testes; um cenário específico confirma a recusa do domingo. A regra de produção não mudou.

**Não houve navegador de QA habilitado.** Não foram geradas capturas reais desktop/mobile, medidos Core Web Vitals ou executado Lighthouse. As verificações de CSS não comprovam ausência de overflow ou colisões em renderização real. Essa revisão continua necessária antes do merge. Os testes de integração usaram respostas controladas, sem consumir o endpoint real ou falar com clientes.

## Publicação

Entrega na branch `redesign/zaion-premium-20261017`, por pull request. `main` e a produção não foram atualizados. A aprovação do proprietário é necessária antes da publicação.
