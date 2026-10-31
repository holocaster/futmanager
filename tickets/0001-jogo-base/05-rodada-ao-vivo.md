# 05: Rodada ao vivo

**What to build:** Ao iniciar a Rodada, o Técnico vê todas as Partidas da data correndo em paralelo minuto a minuto. A Partida dele aparece em destaque com narração de eventos (gols e chances por enquanto); as demais mostram placar atualizado agrupadas por Divisão. Ele ajusta a velocidade (lenta, normal, rápida, instantânea), pausa e retoma. A Partida pausa sozinha no intervalo. No apito final, resultados e classificação são gravados e o autosave roda. "Simular sem assistir" continua disponível.

**Blocked by:** 04

**Spec:** `docs/specs/0001-jogo-base.md` - Motor da Partida (interface `iniciarRodada`/`avancarMinuto`/`finalizarRodada`, pausas automáticas), RNG determinístico, UI (velocidades).

- [ ] Interface do motor: `iniciarRodada`, `avancarMinuto` (retorna eventos), `finalizarRodada`; `simularRodada` passa a ser a composição das três
- [ ] Eventos da Partida do Técnico com minuto e texto em português (gol com autor, chance perdida); intervalo aos 45 sinalizado como pausa automática
- [ ] Testes: rodar a Rodada minuto a minuto dá resultado idêntico a `simularRodada` com o mesmo seed; eventos de gol batem com o placar; após `finalizarRodada` a próxima data está ativa
- [ ] UI: tela da Rodada ao vivo com relógio, controles de velocidade e pausa, narração da Partida do Técnico, placares das demais; ao final, botão para voltar ao painel
- [ ] Datas em que o Clube do Técnico não joga também podem ser assistidas (só placares)
- [ ] `docs/MOTOR.md`: seção Rodada ao vivo (ciclo minuto a minuto, eventos)
- [ ] `npm test` e `npm run build` (com checagem de tipos) passam; `npm run dev` abre o jogo e o fluxo deste ticket funciona manualmente
- [ ] Sem dependências além das listadas em Arquitetura do spec; sem comentários desnecessários; sem emojis
