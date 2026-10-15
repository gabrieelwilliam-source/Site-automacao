# Validação da demonstração com IA real — 15/10/2026

- 16 etapas executadas contra o webhook de produção do fluxo isolado no n8n: 8 salão, 4 clínica, 4 imobiliária. Todas passaram após correções. As três conversas foram executadas em paralelo.
- Salão: preço sem agenda; geladeira sem recebimento; pedido completo; confirmação pela equipe; Pix declarado; conferência pela equipe; handoff; silêncio após handoff.
- Clínica: preço da avaliação; pedido de horário; dúvida sobre Pix preservando pedido; confirmação explícita.
- Imobiliária: compra sem mostrar aluguel como compra; correção para aluguel com perfil completo; seleção de imóvel e pedido de visita; confirmação explícita.
- 8 verificações no PostgreSQL: origem, sessão, bloqueio simultâneo, isolamento entre sessões, rejeição de resposta antiga, limite de consultas e RLS. Fixtures revertidas com ROLLBACK.
- Transporte HTTP: preflight OPTIONS 204 com origem correta; origem indevida 403; sessão inválida 400.
- 27 testes de regressão das interações locais; 13 da integração de interface; 14 das validações do servidor; 36 de CSS em cinco larguras.

Falhas encontradas e corrigidas: modelo Groq anterior indisponível; memória estática perdendo sessões concorrentes (substituída por tabelas separadas e bloqueios transacionais); estados de serviço incompletos; pausa antes do aceite de handoff; alteração de contagem sem invalidar aprovação do pedido.

As credenciais existentes são referenciadas apenas nos nós do n8n. Não houve envio de WhatsApp, reserva em calendário real ou mudança de dados de clientes. O fluxo público tem salvamento de execuções desabilitado. As tabelas e a memória são exclusivas da demonstração.

A inspeção visual renderizada não foi realizada: o navegador de verificação estava indisponível. Testes DOM e CSS não substituem essa inspeção.


## Regressão imobiliária relatada em 15/10/2026

O caso “apartamento em Costa e Silva, 3 quartos, até R$3mil” passou a rejeitar o apartamento de 2 quartos sem flexibilização implícita. O preço canônico é R$2.650,00/mês quando o cliente aceita mudar para 2 quartos. Um “sim” não escolhe dia ou horário.

19 verificações determinísticas passaram. No n8n, 15 etapas reais passaram: a sequência relatada, ajuste explícito de quartos, apresentação do preço correto, escolha separada de dia e hora, confirmação e o caso positivo de casa com 3 quartos por R$2.850,00. A interface usa a lista de imóveis validada no servidor.


## Varredura clínica, imobiliária e salão — atualização v36

76 casos de conversação passaram, incluindo respostas curtas por contexto, perguntas paralelas, recusa explícita, valores em reais, pagamentos declarados, cancelamento e remarcação. Também passaram 19 casos do filtro imobiliário, 16 do servidor e 15 da integração da interface. Foram repetidos e passaram 27 testes das interações locais e 36 verificações de CSS em cinco larguras. Não houve inspeção renderizada nesta atualização.

O bug do “3” vinha da ausência de uma pergunta pendente persistente. Agora `awaiting` diferencia quartos, orçamento, opção do catálogo, dia, hora e confirmação. Sessões anteriores com a última pergunta de quartos são recuperadas.

Outras correções: posição da opção diferente do ID do imóvel; perguntas de preço sem agenda automática; dinheiro de outro assunto fora do caixa; Pix prometido diferente de declarado e de recebido; remarcação preservando a reserva anterior; cancelamento com confirmação; pausa durante atendimento humano; reset da interface descartando respostas antigas; cenários clínicos de cancelamento com fixture fixa e isolada.

Durante as execuções reais surgiram limites de tokens e falhas de saída estruturada do provedor. O fluxo passou a usar `qwen/qwen3.8-27b` com saída de texto, mantendo a construção de estado e JSON no servidor. Respostas curtas contextuais usam regras explícitas, sem chamada de IA. Perguntas abertas continuam usando IA. Falhas do provedor são exibidas; não há resposta local substituindo uma chamada de IA malsucedida.

Um reteste real de quatro etapas na clínica passou: solicitar avaliação, escolher amanhã, responder “14” e perguntar “Aceita Pix?”. O pedido e a necessidade de confirmação foram preservados.

Bateria final no webhook real: **49/49 etapas passaram** em três sessões independentes: imobiliária 15/15, clínica 16/16 e salão 18/18. Incluiu o caso “3”, orçamento, seleção por posição, visita com dia/hora e confirmação, pergunta intermediária, cancelamento, escolha de serviço, remarcação, confirmação com conflito de duração rejeitado (HTTP 409 esperado), pagamento declarado/conferido e silêncio durante handoff. Chamadas curtas usaram `context_rules`; mensagens abertas usaram `live_ai`. Os testes verificaram o conteúdo e o estado retornados, sem depender da cor dos nós no editor.

As execuções anteriores interrompidas por falha da API não foram contadas como aprovadas. Após corrigir o formato de saída, a bateria completa foi repetida do início. O diagnóstico temporário de erros foi removido do retorno público após a investigação.

Nenhuma mensagem foi enviada para WhatsApp, nenhum calendário real foi reservado e nenhuma tabela de negócio foi modificada. O backup do fluxo anterior e a branch `backup/antes-varredura-conversas-20261015` foram criados antes das alterações. Credenciais existentes foram preservadas. O fluxo isolado tem salvamento de execuções desativado.
