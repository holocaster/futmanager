# 12: Mercado - Janelas e compra

**What to build:** O Técnico vê se a Janela está aberta (início: enquanto as Rodadas de Divisão já jogadas forem 0 a 3; meio: enquanto forem 19 a 22). Com ela aberta, busca Jogadores de outros clubes com filtros (posição, força, idade, valor), faz Proposta de compra e recebe aceite, recusa ou contraproposta, que pode aceitar. Compras são bloqueadas com saldo negativo ou insuficiente. O Jogador comprado chega com Contrato de 3 anos e salário pedido.

**Blocked by:** 09, 11

**Spec:** `docs/specs/0001-jogo-base.md` - Mercado (Janelas, Compra), Valor de mercado e salário, Jogador e geração (limites de Elenco), Finanças.

- [x] Estado de Janela derivado das Rodadas de Divisão jogadas conforme o spec; fora da Janela nenhuma Transferência é concluída
- [x] Regra de resposta da IA: aceita >= preço pedido (1,3 x valor se entre os 11 melhores, 1,1 caso contrário), contraproposta entre 70% e o pedido, recusa abaixo; limites de Elenco respeitados nos dois lados
- [x] Bloqueio por saldo negativo ou insuficiente com mensagem; dinheiro movido na hora e lançado no extrato; Jogador muda de `clubeId`, sai da Escalação do vendedor
- [x] Testes: cada faixa de resposta; bloqueio por saldo; bloqueio fora da Janela; limites de Elenco; saldos dos dois clubes após a Transferência; Contrato de 3 anos
- [x] UI: tela de mercado com indicador de Janela, busca com filtros em tabela densa, diálogo de Proposta/contraproposta
- [x] `docs/MOTOR.md`: seção Mercado (Janelas, preço pedido, resposta da IA)
- [x] `npm test` e `npm run build` (com checagem de tipos) passam; `npm run dev` abre o jogo e o fluxo deste ticket funciona manualmente
- [x] Sem dependências além das listadas em Arquitetura do spec; sem comentários desnecessários; sem emojis
