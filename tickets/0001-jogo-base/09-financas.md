# 09: Finanças

**What to build:** O Clube tem caixa vivo: a cada data de Rodada de Divisão saem salários e entra patrocínio; o mandante recebe bilheteria em cada Partida; avançar de fase na Copa paga premiação. O Técnico vê saldo, folha mensal e um extrato da Temporada por categoria. Clubes da IA também têm finanças.

**Blocked by:** 08

**Spec:** `docs/specs/0001-jogo-base.md` - Finanças, Valor de mercado e salário.

- [ ] Salários (folha mensal x 12 / 38) e patrocínio (por Divisão e Porte, Pool com o menor) a cada data de Rodada de Divisão para todos os 68 clubes
- [ ] Bilheteria ao mandante por Partida (Divisão e Copa), base por Porte ajustada pelo desempenho
- [ ] Premiação da Copa por fase alcançada, paga ao avançar; extrato por categoria (salários, patrocínio, bilheteria, premiação, transferências)
- [ ] Testes: saldo muda exatamente pelo extrato após uma Rodada; mandante recebe bilheteria e visitante não; meta de calibração (Clube de meio de tabela com Elenco inicial fecha a Temporada com 80%-150% do saldo inicial, seed fixo, para pelo menos um Clube de cada Divisão)
- [ ] UI: tela de finanças (saldo, folha, extrato da Temporada); saldo visível no painel
- [ ] `docs/MOTOR.md`: seção Finanças (todas as constantes finais)
- [ ] `npm test` e `npm run build` (com checagem de tipos) passam; `npm run dev` abre o jogo e o fluxo deste ticket funciona manualmente
- [ ] Sem dependências além das listadas em Arquitetura do spec; sem comentários desnecessários; sem emojis
