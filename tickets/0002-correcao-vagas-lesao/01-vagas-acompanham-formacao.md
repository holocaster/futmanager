# 01: Reconciliar `vagas` em `mudarFormacaoDoLado` para fechar F4

**Status:** implementado e validado na correção da auditoria, versão 0.1.1.

**Critérios vigentes:** seção "Correção aprovada nesta revisão" de `docs/specs/0002-correcao-vagas-lesao.md`. Todo o planejamento antigo abaixo desta nota fica substituído e preservado somente como histórico.

- [x] Reconciliar vagas pela capacidade livre da Formação, sem alterar a quantidade de titulares ou vagas.
- [x] Cobrir Técnico/IA, mudanças repetidas, múltiplas lesões com expulsão e recálculo das forças.
- [x] Preservar `Posicao[]`, consumidores, limites de Substituição e versão 8 dos saves.
- [x] Suíte completa: 281 testes em 17 arquivos; build passa. Fluxos de gestão/persistência verificados em Chromium a 1280/390 px.

## Histórico do planejamento substituído

**What to build:** Em `src/motor/partida.ts`, `mudarFormacaoDoLado` precisa manter a invariante `vagas[i]` alinhada a `setores[i]` (naquele \u00edndice) enquanto o \u00edndice existir ap\u00f3s a mudan\u00e7a de Forma\u00e7\u00e3o. Quando uma vaga aponta para um \u00edndice `i >= setores.length` da Forma\u00e7\u00e3o nova, ela \u00e9 descartada (porque aquele setor deixou de existir). A regra vale para toda nova chamada de `mudarFormacaoDoLado`, sem acumular vaga fantasma em mudan\u00e7as repetidas. `substituirNoLado` e `agirIA` consomem vagas j\u00e1 reconciliadas; o caminho do T\u00e9cnico e o caminho da IA ficam cobertos com a mesma mudan\u00e7a. Comportamento j\u00e1 garantido (quantidade em campo, aus\u00eencia de reposi\u00e7\u00e3o para expulsos, m\u00e1ximo de 5 Substitui\u00e7\u00f5es em 3 paradas, rec\u00e1lculo imediato das for\u00e7as) fica preservado.

**Blocked by:** none

**Spec:** `docs/specs/0002-correcao-vagas-lesao.md`

- [ ] Em `src/motor/partida.ts`, dentro de `mudarFormacaoDoLado`, depois de `lado.setores = atribuirSetores(lado.titulares, formacao)`, descartar as vagas cujo \u00edndice `i >= lado.setores.length` (filtro inline ou helper privado - decis\u00e3o do implementer). Forma inline ou helper novo fica a crit\u00e9rio do implementer, desde que a invariante seja preservada.
- [ ] Regress\u00e3o em `src/motor/partida.test.ts` (ou arquivo de teste existente que cubra naturalmente a regress\u00e3o) com a reprodu\u00e7\u00e3o exata de `docs/ISSUES.md` (F4): criar lado completo em 4-4-2 com um reserva dispon\u00edvel; lesionar um D (via `removerDoCampo` + `vagas.push(...)` ou equivalente, mantendo a vaga); chamar `mudarFormacaoDoLado(partida, lado, '3-4-3')`; chamar `substituirNoLado(partida, lado, 45, null, reservaId)`. Asserts esperados: `setores` compat\u00edveis com 3-4-3 (G/3D/4M/3A, n\u00e3o G/4D/4M/2A), `vagas` vazias, `titulares.length === 11`, sem reposi\u00e7\u00e3o e dentro do limite de Substitui\u00e7\u00f5es.
- [ ] Regress\u00e3o de mudan\u00e7as repetidas de Forma\u00e7\u00e3o (4-4-2 \u2192 3-4-3 \u2192 5-3-2, por exemplo, partindo de uma les\u00e3o em D): cada `mudarFormacaoDoLado` reaprecia `vagas` do zero - vagas cujo \u00edndice ainda existe na Forma\u00e7\u00e3o atual s\u00e3o preservadas naquele \u00edndice; vagas cujo \u00edndice estourou `setores.length` s\u00e3o descartadas; nenhuma vaga fantasma se acumula.
- [ ] Regress\u00e3o do caminho da IA: ap\u00f3s lesionar um D em 4-4-2 e mudar para 3-4-3, `agirIA(partida, lado, 60)` n\u00e3o consome vaga cujo \u00edndice j\u00e1 n\u00e3o existe em `setores` (ou seja, n\u00e3o encaixa um quarto zagueiro); o n\u00famero de trocas e o estado final do lado s\u00e3o coerentes com a Forma\u00e7\u00e3o atual.
- [ ] Cobertura dos caminhos j\u00e1 garantidos continua valendo (n\u00e3o regredir): quantidade em campo, aus\u00eancia de reposi\u00e7\u00e3o para expulsos, m\u00e1ximo de 5 Substitui\u00e7\u00f5es em 3 paradas, rec\u00e1lculo imediato das for\u00e7as em `mudarFormacaoDoLado` e `substituirNoLado`.
- [ ] `npm test` e `npm run build` (com checagem de tipos) passam; `npm run dev` abre o jogo e o fluxo deste ticket funciona manualmente.
- [ ] Sem depend\u00eancias al\u00e9m das listadas em Arquitetura do spec 0001; sem coment\u00e1rios desnecess\u00e1rios; sem emojis.
