# 02: Divisões - calendário, simulação e classificação

**What to build:** No painel, o Técnico clica em "Simular rodada" e todas as Partidas da próxima Rodada das Séries A, B e C são simuladas instantaneamente pelo motor minuto a minuto. Ele vê os resultados da Rodada, a classificação das três Divisões com desempate correto, o calendário com seus próximos adversários e os artilheiros de cada Divisão. Pode jogar as 38 Rodadas até o fim da Temporada (fim de Temporada ainda não existe: após a 38ª o botão some e aparece "Temporada encerrada").

**Blocked by:** 01

**Spec:** `docs/specs/0001-jogo-base.md` - Calendário da Temporada (parte das Divisões), Motor da Partida (modelo por minuto, `simularRodada`, metas de calibração de gols/mando/força), Testing Decisions.

- [ ] Calendário de pontos corridos por Divisão: 38 Rodadas, cada Clube joga uma vez por Rodada, enfrenta cada adversário uma vez em casa e uma fora; turno e returno com mando invertido. Calendário guardado como lista de datas para que o ticket 08 insira as datas da Copa
- [ ] Motor da Partida minuto a minuto (ataque/defesa por setor, fator casa, chance e conversão, autor do gol por posição e força) acessível por `simularRodada(carreira)`; IA escala o melhor 4-4-2 disponível por enquanto
- [ ] Classificação com P, J, V, E, D, GP, GC, SG e desempate: pontos, vitórias, saldo, gols pró, confronto direto, sorteio pelo RNG
- [ ] Gols contam nas estatísticas da Temporada do Jogador; artilheiros por Divisão
- [ ] Testes: validade do calendário; desempate (casos para cada critério, incluindo confronto direto e sorteio determinístico); calibração com seed fixo e N grande (gols por Partida 2,2-2,9; mandante vence 40-52% e empata 22-32% entre iguais; +10 de força vence >=60% e perde <=20%); determinismo de uma Temporada simulada
- [ ] UI: botão "Simular rodada", resultados da Rodada, classificações A/B/C (Clube do Técnico destacado, zonas de acesso/rebaixamento coloridas), calendário/resultados, artilheiros
- [ ] `docs/MOTOR.md`: seções Calendário, Simulação da Partida (força, chance por minuto, fator casa, constantes finais) e Classificação
- [ ] `npm test` e `npm run build` (com checagem de tipos) passam; `npm run dev` abre o jogo e o fluxo deste ticket funciona manualmente
- [ ] Sem dependências além das listadas em Arquitetura do spec; sem comentários desnecessários; sem emojis
