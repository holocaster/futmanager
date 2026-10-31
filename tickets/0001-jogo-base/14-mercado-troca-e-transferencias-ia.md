# 14: Mercado - Troca e Transferências entre clubes da IA

**What to build:** O Técnico propõe uma Troca: um Jogador seu por um Jogador de um Clube da IA, com dinheiro opcional em qualquer sentido, e a IA aceita ou recusa. Além disso, a cada data com Janela aberta os clubes da IA fazem poucas Transferências entre si, e o Técnico vê a lista de transferências recentes do mercado.

**Blocked by:** 12

**Spec:** `docs/specs/0001-jogo-base.md` - Mercado (Troca, IA x IA).

- [x] Troca: aceita se valor do Jogador oferecido + dinheiro >= preço pedido do Jogador da IA e limites de Elenco e saldo respeitados; dinheiro do Técnico bloqueado por saldo negativo/insuficiente
- [x] IA x IA: poucas Transferências por data de Janela aberta, comprador com saldo suficiente leva Jogador de Clube de Porte igual ou menor melhor que o seu pior na posição; limites de Elenco respeitados; nunca envolve o Clube do Técnico
- [x] Registro de transferências recentes (todas, incluindo as do Técnico) na `Carreira`
- [x] Testes: Troca aceita/recusada nas fronteiras; dinheiro em cada sentido; IA x IA só com Janela aberta, sem violar limites nem deixar saldo do comprador negativo; nunca envolve o Clube do Técnico
- [x] UI: diálogo de Troca a partir do Jogador alvo; lista de transferências recentes no mercado
- [x] `docs/MOTOR.md`: seção Mercado atualizada (Troca, IA x IA)
- [x] `npm test` e `npm run build` (com checagem de tipos) passam; `npm run dev` abre o jogo e o fluxo deste ticket funciona manualmente
- [x] Sem dependências além das listadas em Arquitetura do spec; sem comentários desnecessários; sem emojis
