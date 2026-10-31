# 04: Escalação, Formação e Postura

**What to build:** Antes de cada Rodada, o Técnico abre a tela de Escalação, escolhe Formação, Postura, os 11 titulares e até 7 reservas, ou usa "Escalação automática". A Rodada só começa com Escalação válida. Os clubes da IA escalam o melhor time disponível. Formação e Postura alteram de fato o jogo do motor.

**Blocked by:** 02

**Spec:** `docs/specs/0001-jogo-base.md` - Escalação, Motor da Partida (Formação muda setores, Postura multiplica ataque/defesa, meta de calibração da Postura ofensiva).

- [ ] Formações 4-4-2, 4-3-3, 4-5-1, 3-5-2, 3-4-3, 5-3-2, 5-4-1; Posturas defensiva, equilibrada, ofensiva; Escalação do Técnico persiste na `Carreira` entre datas
- [ ] Validação: 11 titulares com exatamente 1 G, banco até 7, sem repetidos, todos do Elenco; erro claro impede iniciar a Rodada (lesionados/suspensos entram na validação no ticket 06)
- [ ] Escalação automática por força efetiva por posição, com fallback para posição mais próxima; Jogador fora de posição rende menos
- [ ] IA usa a mesma escalação automática para seus clubes
- [ ] Testes: validação; escalação automática respeita a Formação; ofensiva x ofensiva tem média de gols maior que equilibrada x equilibrada (seed fixo, N grande); Formação mais ofensiva marca mais e sofre mais; Jogador fora de posição reduz força do setor
- [ ] UI: tela de Escalação densa (titulares por setor, banco, demais), troca de Jogadores por clique, seletor de Formação e Postura, botão de escalação automática
- [ ] `docs/MOTOR.md`: seção Tática (Formação, Postura, fora de posição)
- [ ] `npm test` e `npm run build` (com checagem de tipos) passam; `npm run dev` abre o jogo e o fluxo deste ticket funciona manualmente
- [ ] Sem dependências além das listadas em Arquitetura do spec; sem comentários desnecessários; sem emojis
