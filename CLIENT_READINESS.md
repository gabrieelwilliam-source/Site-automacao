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

Validação local desta revisão: 380 verificações em 13 suítes, lint e build aprovados. Jornadas n8n são executadas em uma cópia isolada antes da publicação. Reposição utiliza o motor local do site, sem conexão com ERP real. Informações ausentes no catálogo não são ofertas verificadas.

A resposta de escolha numérica no salão identifica o serviço escolhido. No primeiro retorno por IA, a apresentação identifica Iana como assistente virtual; a apresentação não se repete na continuidade.

Um “sim” após “O que você gostaria de saber?” pede esclarecimento e não é aceite de agendamento.
