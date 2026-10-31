# Tickets: 0001-jogo-base

Spec: `docs/specs/0001-jogo-base.md`. Cada ticket deixa o jogo rodando (`npm run dev`) e testado (`npm test`, `npm run build`), e atualiza `docs/MOTOR.md` quando muda regras.

| # | Title | Blocked by | Status |
|---|-------|-----------|--------|
| 01 | Fundação - escolher Clube e ver Elencos | none | done |
| 02 | Divisões - calendário, simulação e classificação | 01 | done |
| 03 | Saves - 3 slots e autosave | 02 | done |
| 04 | Escalação, Formação e Postura | 02 | done |
| 05 | Rodada ao vivo | 04 | done |
| 06 | Cartões, lesões, suspensões, condição física e moral | 05 | done |
| 07 | Mudanças durante a Partida e Substituições da IA | 06 | done |
| 08 | Copa do Brasil | 05 | done |
| 09 | Finanças | 08 | done |
| 10 | Fim de Temporada, acesso/rebaixamento e Histórico | 03, 09 | done |
| 11 | Contratos, evolução, aposentadoria e Base | 10 | done |
| 12 | Mercado - Janelas e compra | 09, 11 | done |
| 13 | Mercado - venda e Propostas da IA | 12 | done |
| 14 | Mercado - Troca e Transferências entre clubes da IA | 12 | done |
| 15 | Robustez de várias Temporadas e uso no celular | 07, 13, 14 | done |

## Cobertura (US do spec -> tickets)

| US | Tickets |
|---|---|
| 1 | 01, 03 |
| 2, 3, 4, 5, 7 | 01 |
| 6 | 01, 06, 11 |
| 8, 9, 10, 14 | 02 |
| 11, 12, 23 | 08 |
| 13, 15 | 02, 08 |
| 16, 17, 18 | 05 |
| 19, 22 | 07 |
| 20 | 04, 07 |
| 21 | 05, 06 |
| 24, 25, 27 | 04 |
| 26 | 04, 06 |
| 28, 29, 30, 31, 32 | 06 |
| 33, 34, 35, 40 | 12 |
| 36, 37 | 13 |
| 38, 39 | 14 |
| 41 | 01, 12 |
| 42, 43 | 09 |
| 44 | 01, 09 |
| 45, 46, 47, 50 | 11 |
| 48, 51, 52, 53 | 10 |
| 49 | 09, 10 |
| 54, 55 | 03 |
| 56 | 01, 15 |
| 57 | 01 a 15 (cada ticket atualiza sua seção), 15 (revisão) |
| 58 | 01, 02, 05, 15 |
