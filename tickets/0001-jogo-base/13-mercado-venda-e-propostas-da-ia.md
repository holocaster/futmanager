# 13: Mercado - venda e Propostas da IA

**What to build:** O Técnico marca Jogadores à venda com preço pedido. A cada data com Janela aberta, clubes da IA fazem Propostas pelos Jogadores dele (mais frequentes para os marcados), que aparecem numa caixa de Propostas no painel. Ele aceita, recusa ou contrapropõe um valor; a IA aceita a contraproposta até seu teto ou desiste. Propostas pendentes expiram quando a Janela fecha.

**Blocked by:** 12

**Spec:** `docs/specs/0001-jogo-base.md` - Mercado (Venda).

- [x] Marcar/desmarcar à venda com preço pedido
- [x] Geração de Propostas da IA por data de Janela aberta: compradores com saldo suficiente, Porte compatível e espaço no Elenco; frequência maior para Jogadores à venda
- [x] Aceitar (Transferência imediata), recusar, contrapropor (IA aceita até 1,2 x valor ou desiste); expiração ao fechar a Janela
- [x] Testes: Propostas só com Janela aberta; Jogador à venda recebe mais Propostas (N grande, seed fixo); contraproposta dentro/fora do teto; expiração; limite mínimo de Elenco do Técnico impede a venda
- [x] UI: ação "Colocar à venda" no Elenco; caixa de Propostas com aceitar/recusar/contrapropor; aviso de nova Proposta no painel
- [x] `docs/MOTOR.md`: seção Mercado atualizada (Propostas da IA, contraproposta)
- [x] `npm test` e `npm run build` (com checagem de tipos) passam; `npm run dev` abre o jogo e o fluxo deste ticket funciona manualmente
- [x] Sem dependências além das listadas em Arquitetura do spec; sem comentários desnecessários; sem emojis
