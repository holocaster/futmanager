# 07: Mudanças durante a Partida e Substituições da IA

**What to build:** Com a Rodada pausada, o Técnico faz Substituições (até 5, em até 3 paradas; o intervalo não conta como parada), muda a Formação e a Postura, e retoma. As mudanças têm efeito imediato no motor. Os clubes da IA substituem lesionados na hora, trocam os mais cansados a partir dos 60 minutos e podem mudar a Postura conforme o placar.

**Blocked by:** 06

**Spec:** `docs/specs/0001-jogo-base.md` - Motor da Partida (ações `substituir`/`mudarFormacao`/`mudarPostura`, regras de Substituição, IA).

- [ ] Ações do motor `substituir`, `mudarFormacao`, `mudarPostura` com regras: máximo 5 Substituições, máximo 3 paradas (todas as Substituições feitas numa mesma pausa contam como 1 parada; pausa do intervalo não conta), substituído não volta, expulso não pode ser substituído, só reservas do banco
- [ ] Ações inválidas retornam erro claro sem alterar a Partida
- [ ] IA: Substituição imediata de lesionado se houver Substituição disponível; a partir dos 60 troca titulares com condição abaixo do limite por reservas da mesma posição; ajusta Postura no fim do jogo conforme placar
- [ ] Testes: limites de 5 Substituições e 3 paradas; intervalo não conta como parada; Postura ofensiva no meio da Partida aumenta gols esperados do resto do jogo; determinismo com sequência fixa de ações; IA nunca passa de 5 Substituições
- [ ] UI: painel de mudanças disponível quando pausado (Substituições restantes/paradas restantes visíveis), narração das Substituições
- [ ] `docs/MOTOR.md`: seção Substituições e IA na Partida
- [ ] `npm test` e `npm run build` (com checagem de tipos) passam; `npm run dev` abre o jogo e o fluxo deste ticket funciona manualmente
- [ ] Sem dependências além das listadas em Arquitetura do spec; sem comentários desnecessários; sem emojis
