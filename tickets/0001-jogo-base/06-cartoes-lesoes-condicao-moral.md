# 06: Cartões, lesões, suspensões, condição física e moral

**What to build:** Durante as Partidas surgem amarelos, vermelhos (diretos ou por segundo amarelo) e lesões, narrados na Partida do Técnico; expulsos saem sem reposição e lesionados saem do jogo. A Partida do Técnico pausa sozinha quando um Jogador dele se lesiona ou é expulso. Entre as datas, suspensões são cumpridas, lesões diminuem, a condição se recupera e a moral reage aos resultados. O Elenco mostra lesionados (Rodadas restantes), suspensos, pendurados, condição e moral; a Escalação recusa lesionados e suspensos.

**Blocked by:** 05

**Spec:** `docs/specs/0001-jogo-base.md` - Motor da Partida (eventos, condição, pausas automáticas, metas de cartões/lesões), Cartões, lesões, condição, moral, Escalação.

- [ ] Eventos de amarelo, vermelho e lesão no motor; segundo amarelo vira expulsão; lesionado sai (sem Substituição ainda, o time fica com um a menos até o ticket 07)
- [ ] Vermelho = 1 jogo; 3 amarelos acumulados = 1 jogo e zera; suspensão cumprida na próxima Partida oficial do Clube; lesão de 1 a 6 datas decrementada por data
- [ ] Condição cai por minuto jogado (mais na Postura ofensiva) e recupera entre datas; moral sobe com vitória, cai com derrota, reservas perdem um pouco; ambos entram na força efetiva
- [ ] Escalação (Técnico e IA) não aceita lesionados nem suspensos; escalação automática os ignora
- [ ] Testes: suspensão por vermelho e por 3 amarelos (aplicada e cumprida); lesão some após N datas; calibração (3-5 amarelos por Partida, vermelho em 5-15%, lesão em 10-30% das Partidas); time cansado rende menos que o mesmo time descansado; moral após vitória/derrota
- [ ] UI: narração dos novos eventos; pausa automática por lesão/expulsão do Técnico; colunas/ícones de situação no Elenco e na Escalação
- [ ] `docs/MOTOR.md`: seções Eventos (cartões, lesões), Cansaço e Moral
- [ ] `npm test` e `npm run build` (com checagem de tipos) passam; `npm run dev` abre o jogo e o fluxo deste ticket funciona manualmente
- [ ] Sem dependências além das listadas em Arquitetura do spec; sem comentários desnecessários; sem emojis
