# 11: Contratos, evolução, aposentadoria e Base

**What to build:** Cada Jogador tem Contrato com ano de término visível. O Técnico renova Contratos escolhendo de 1 a 5 anos e pagando o salário pedido; quem não for renovado sai do jogo na virada do ano. Clubes da IA renovam sozinhos os melhores e deixam sair os demais. No fim de cada Temporada os Jogadores envelhecem e evoluem (jovens sobem rumo ao potencial, veteranos caem), veteranos se aposentam, cada Clube recebe 2 ou 3 Jogadores da Base e Elencos da IA abaixo do mínimo são completados. O resumo da Temporada lista quem saiu, se aposentou e chegou da Base no Clube do Técnico.

**Blocked by:** 10

**Spec:** `docs/specs/0001-jogo-base.md` - Contratos, Fim de Temporada (evolução, aposentadoria, Base, reposição), Jogador e geração (limites de Elenco), Valor de mercado e salário (salário pedido).

- [ ] Renovação do Técnico a qualquer momento: 1-5 anos, salário pedido conforme o spec (moral baixa pede mais); folha atualizada
- [ ] Fim de Contrato na virada do ano remove o Jogador; IA renova força acima da mediana e idade abaixo de 33
- [ ] Evolução por faixa de idade com potencial; aposentadoria com chance a partir de 34, obrigatória aos 38; Base de 2-3 Jogadores 17-18 anos por Clube; reposição até o mínimo (16, com 2 G)
- [ ] Testes: Contrato vencido sai e renovado fica; IA renova conforme a regra; jovem com potencial alto melhora em média e veterano piora (N grande, seed fixo); ninguém com 38+ continua; todos os Elencos respeitam 16-32 após o fim de Temporada
- [ ] UI: coluna de Contrato e ação "Renovar" no Elenco com duração e salário pedido; lista de saídas/aposentadorias/Base no resumo da Temporada
- [ ] `docs/MOTOR.md`: seções Contratos e Evolução, aposentadoria e Base
- [ ] `npm test` e `npm run build` (com checagem de tipos) passam; `npm run dev` abre o jogo e o fluxo deste ticket funciona manualmente
- [ ] Sem dependências além das listadas em Arquitetura do spec; sem comentários desnecessários; sem emojis
