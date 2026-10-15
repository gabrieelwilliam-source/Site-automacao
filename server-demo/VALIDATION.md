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
