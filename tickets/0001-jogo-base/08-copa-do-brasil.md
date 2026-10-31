# 08: Copa do Brasil

**What to build:** A Temporada passa a ter a Copa do Brasil com 64 clubes (60 de A/B/C + 4 do Pool sorteados), jogada nas 10 datas intercaladas do calendário: 1ª e 2ª fases em jogo único, oitavas a final em ida e volta, empate decidido nos pênaltis (narrados na Partida do Técnico). O Técnico vê as chaves e resultados de cada fase, os artilheiros da Copa, e as datas da Copa aparecem no calendário e na Rodada ao vivo.

**Blocked by:** 05

**Spec:** `docs/specs/0001-jogo-base.md` - Calendário da Temporada (datas e fases da Copa, sorteio, mando, pênaltis).

- [ ] Datas da Copa logo após as Rodadas de Divisão 3, 6, 9, 12, 15, 18, 24, 28, 32, 36; fases conforme o spec
- [ ] Sorteio pelo RNG a cada fase; mando do primeiro sorteado; agregado sem gol fora e sem prorrogação; pênaltis 5 alternados e depois alternados até desempatar
- [ ] 4 clubes do Pool sorteados no início da Temporada (o Clube do Técnico entra sempre se estiver no Pool)
- [ ] Clubes eliminados não jogam nas datas seguintes da Copa; nas datas da Copa o Técnico eliminado assiste só placares
- [ ] Testes: 64 participantes sem repetição; número de confrontos por fase; vencedor de jogo único e de ida e volta (agregado e pênaltis); campeão único ao fim; determinismo
- [ ] UI: tela da Copa com chaves por fase, resultados de ida/volta e agregado, pênaltis; artilheiros da Copa; datas da Copa no calendário
- [ ] `docs/MOTOR.md`: seção Copa do Brasil (calendário, sorteio, pênaltis)
- [ ] `npm test` e `npm run build` (com checagem de tipos) passam; `npm run dev` abre o jogo e o fluxo deste ticket funciona manualmente
- [ ] Sem dependências além das listadas em Arquitetura do spec; sem comentários desnecessários; sem emojis
