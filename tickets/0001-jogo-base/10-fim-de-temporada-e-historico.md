# 10: Fim de Temporada, acesso/rebaixamento e Histórico

**What to build:** Depois da última data, o Técnico vê o resumo da Temporada (campeões de A, B, C e Copa, artilheiros, acessos e rebaixamentos, premiação recebida) e confirma para começar a próxima. Os 4 primeiros sobem e os 4 últimos descem entre A/B e B/C; os 4 últimos da C vão para o Pool e 4 do Pool sobem por sorteio. Começa o novo ano com novo calendário e novo sorteio da Copa, infinitamente. Uma tela de Histórico mostra campeões, artilheiros e tabelas finais de todas as Temporadas passadas. Se o Clube do Técnico cair para o Pool, a carreira segue (Copa e datas sem Partida dele) e ele volta à Série C no ano seguinte.

**Blocked by:** 03, 09

**Spec:** `docs/specs/0001-jogo-base.md` - Fim de Temporada, Finanças (premiação por posição), Save (autosave no início da Temporada), US-53.

- [ ] `fimDeTemporada(carreira)` na ordem do spec (as etapas de Contratos, evolução, aposentadoria e Base ficam para o ticket 11)
- [ ] Premiação por posição final em cada Divisão
- [ ] Histórico na `Carreira`: campeões de A, B, C e Copa, artilheiro de cada competição, tabelas finais das 3 Divisões, acessos e rebaixamentos
- [ ] Estatísticas, amarelos e suspensões zerados; novo calendário e Copa com novos participantes do Pool; autosave após virar o ano
- [ ] Clube do Técnico no Pool: datas de Divisão rodam sem Partida dele; joga a Copa; volta à Série C garantido
- [ ] Testes: 4 sobem/4 descem em cada fronteira e Divisões continuam com 20, Pool com 8; Histórico registra campeões e artilheiros corretos; duas Temporadas seguidas simuladas sem erro; caso do Clube do Técnico rebaixado ao Pool e de volta
- [ ] UI: tela de resumo da Temporada com confirmação; tela de Histórico navegável por ano
- [ ] `docs/MOTOR.md`: seção Fim de Temporada
- [ ] `npm test` e `npm run build` (com checagem de tipos) passam; `npm run dev` abre o jogo e o fluxo deste ticket funciona manualmente
- [ ] Sem dependências além das listadas em Arquitetura do spec; sem comentários desnecessários; sem emojis
