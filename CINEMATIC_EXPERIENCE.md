# Experiência cinematográfica — 17/10/2026

A seção de valor passa a contar uma sequência visual: conversa, contexto e continuidade. No desktop, a ilustração permanece ao lado da leitura e muda conforme as etapas entram na área de leitura. Também pode ser controlada pelos botões. No celular, o mesmo espaço acomoda as três cenas, com seleção manual e uma descrição por vez; não há três telas de rolagem obrigatória.

A marca ganha um explorador interativo. As descrições vêm das definições já aprovadas no manual e mantidas no HTML; os botões não reproduzem nem redesenham o logotipo. O arquivo original e suas proporções permanecem intactos.

Entradas suaves destacam títulos e composições. O conteúdo não depende da animação para aparecer. Não há captura de rolagem, reprodução por temporizador, vídeos, bibliotecas de animação ou chamadas externas novas. A apresentação é marcada como ilustrativa, sem fingir execução de um fluxo real.

## Acessibilidade e controle

- Seleção por toque, mouse e teclado, incluindo setas, Home e End.
- Preferência do sistema por movimento reduzido respeitada, inclusive se mudar durante a visita.
- Botão Reduzir movimento no rodapé; a preferência é local e reversível. Também elimina rolagem suave das navegações guiadas e cancela animações em andamento.
- Sem JavaScript, as três descrições e as definições completas da marca continuam disponíveis. Sem IntersectionObserver, controles manuais continuam funcionando.
- Nenhuma modificação em mensagens, agendamentos, credenciais ou automações.

## Verificação

Lint, build e testes de regressão/interação. Evidências em qa/cinematic-results.json. Os novos testes verificam controle manual, troca por interseção simulada, teclado, fallback e movimento reduzido. A renderização real e a qualidade das transições em dispositivos físicos permanecem sem verificação: não há sessão de navegador funcional disponível. Não foram produzidas capturas de tela.
