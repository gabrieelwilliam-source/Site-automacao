# Demonstrações — revisão de 19/10/2026

- Catálogo recolhível da clínica com os nove serviços já configurados, duração e valor. A escolha abre a conversa sobre aquele procedimento.
- Carteira recolhível de quatro imóveis fictícios, com imagens ilustrativas, características e aluguel. Consultas na conversa também exibem os imóveis.
- Busca imobiliária conserva finalidade, bairro, tipo, quartos e orçamento; não apresenta dois quartos como compatíveis com três e não converte R$ 2.650 em R$ 26,50.
- Catálogo, preço, agenda e confirmação passam pelas regras do servidor antes da IA. Perguntas livres continuam conectadas à IA.
- Groq permanece principal, com Gemini protegido como reserva quando o primeiro provedor não devolve texto. Credenciais existentes reutilizadas no n8n; nenhuma chave no navegador.
- Clínica, salão, imobiliária e reposição permanecem cenários de demonstração. Nenhum WhatsApp, cobrança ou compromisso real é criado.

Validação: `npm test`, `npm run lint`, `npm run build`, conversas contra cópia isolada do n8n e conferência da publicação. Resultados locais em `qa/client-readiness-results.json`. As verificações de larguras no código não substituem toda combinação possível de aparelho e navegador.

Revisão de continuidade: respostas sociais (como “No aguardo”, “Entendi” e “Obrigado”) preservam a etapa da conversa sem repetir imóveis ou procedimentos, confirmar visitas ou cancelar horários. “Venda” e “locar” também são reconhecidos. A carteira geral usa identificação neutra dos imóveis, sem apresentar a primeira opção como mais aderente antes da qualificação.

Carteira de compra e locação: os quatro imóveis fictícios possuem referências de venda e aluguel separadas. Preços de venda do cenário (IDs 1–4): R$ 680 mil, R$ 720 mil, R$ 480 mil e R$ 420 mil. Não são ofertas reais. A troca de finalidade limpa orçamento, seleção e visita anteriores; fotos são ilustrativas.


## Jornadas consultivas — revisão de 19/10/2026

- Comprar/alugar inicia uma conversa sobre preferências; a carteira completa continua disponível quando solicitada.
- Selecionar um cartão conserva o imóvel em foco sem inventar orçamento ou preferências pessoais.
- Dúvidas recebem prioridade. Metragem, quartos, bairro e vagas vêm da ficha; condições ausentes dependem do corretor.
- Perguntas durante a escolha de um horário conservam a etapa. Uma dúvida interrompendo a confirmação exige reapresentar o resumo antes do aceite.
- Cartões deixam de ser recriados ao final de cada mensagem. O painel acompanha o imóvel sem empurrar o histórico para cima.
- Consultar ou selecionar um serviço no catálogo não inicia um agendamento. Pedidos explícitos continuam coletando serviço, data e hora.
- Reposição apresenta unidades e caixas por produto no pedido aprovado, bloqueia pedido zerado e invalida a aprovação ao mudar a contagem.

Validação local desta revisão: 381 verificações em 13 suítes, lint e build aprovados. Jornadas n8n são executadas em uma cópia isolada antes da publicação. Reposição utiliza o motor local do site, sem conexão com ERP real. Informações ausentes no catálogo não são ofertas verificadas.

A resposta de escolha numérica no salão identifica o serviço escolhido. No primeiro retorno por IA, a apresentação identifica Iana como assistente virtual; a apresentação não se repete na continuidade.

Um “sim” após “O que você gostaria de saber?” pede esclarecimento e não é aceite de agendamento.

Validação integrada: 60 execuções na cópia isolada do n8n; 59 aprovadas. A única falha inicial (escolha do salão sem identificar o serviço) foi corrigida e passou na reexecução. Inclui controles da gestora, conflito de horário, conferência de pagamento, cancelamento e retomada após handoff. Nenhuma falha reproduzida ficou aberta nesta bateria. Evidências resumidas em `qa/n8n-customer-journeys.json`.

Revisão da conferência pública: perguntas combinadas sobre um imóvel (por exemplo, metragem e garagem) recebem todos os dados conhecidos em uma resposta, sem modificar as preferências pessoais ou repetir cartões.


## Revisão profissional — 20/10/2026 UTC

- O agendamento guarda seu próprio serviço, preço, duração e protocolo. Consultar outro procedimento não altera o atendimento confirmado; remarcação e cancelamento identificam o serviço correto.
- Perguntas de duração não recebem preço por engano. Perguntas combinadas recebem duração e valor quando solicitados.
- Recusar um novo pedido não cancela o horário já confirmado. Confirmações imobiliárias com ressalvas não concluem uma visita.
- O estoque crítico invalida a análise anterior, e recalcular pedido confirmado não libera duplicidade.
- Falhas de conexão oferecem repetição da mensagem sem criar outra bolha de usuário. O chat expõe o estado de processamento à acessibilidade.
- O painel clínico mostra a duração real da requisição; as etapas de estoque usam status em vez de tempos ilustrativos.

Validação: 403 verificações locais em 14 suítes, lint e build aprovados; 53 etapas integradas aprovadas na cópia isolada do n8n. Evidências em `qa/professional-journeys-results.json`. Dados de clientes, credenciais existentes e integrações de produção comercial preservados.


## Conferência final de perguntas e contexto — 20/10/2026 UTC

Comparações entre procedimentos e perguntas sobre dois preços ou durações recebem os dados de todos os serviços mencionados. Uma explicação sobre outro procedimento interrompe a marcação sem substituir seu serviço ou horário. “Tenho uma dúvida antes de confirmar” solicita a pergunta, sem tratar a mensagem como confirmação.

Cinco regressões foram reproduzidas antes da correção e passaram depois. A revisão local totaliza 408 verificações em 14 suítes. O catálogo continua sendo a fonte de preços, durações e descrições; indicação clínica exige avaliação profissional. O site apresenta cenários isolados: não cria reservas reais no Calendar, não envia WhatsApp e não emite pedidos no ERP.

Validação integrada final: 58/58 etapas aprovadas na cópia isolada do n8n; cópia desativada ao concluir. Evidências: `qa/final-conversation-results.json`.
