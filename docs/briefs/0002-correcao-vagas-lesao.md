# 0002 - Correção: vaga de lesão acompanha a formação

## Objetivo

Fechar a issue F4 documentada em `docs/ISSUES.md`: a vaga de lesão não acompanha os setores da formação atual. Hoje, lesionar um D em 4-4-2 e depois mudar para 3-4-3 mantém a vaga presa ao setor antigo, permitindo que `substituirNoLado` encaixe um quarto zagueiro e produza uma escalaçao incompatível (G/4D/4M/2A em vez de G/3D/4M/3A).

## Escopo

- Reconciliar `lado.vagas` em `mudarFormacaoDoLado` (em `src/motor/partida.ts`) com a capacidade livre de cada setor da Formação atual, sem alterar a quantidade de vagas.
- Cobrir o caminho do Técnico e o caminho da IA: `agirIA` consome vagas durante o jogo, então a reconciliação precisa ser respeitada na próxima iteração.
- Cobrir mudanças repetidas de formação: cada nova `mudarFormacaoDoLado` reaplica a reconciliação, sem acumular vaga fantasma.
- Regressão pelo fluxo lesão → mudança de formação → Substituição, com teste cobrindo a reprodução exata do `docs/ISSUES.md`.
- Preservar comportamento já garantido: quantidade em campo, ausência de reposição para expulsos, máximo de cinco Substituições em três paradas, recálculo imediato das forças.
- Confirmar que `criarPartida`, `criarLado`, `simularPartida` e `disputarPenaltis` continuam coerentes após a mudança.

## Fora do escopo

- Estatísticas, interface, saldo, mercado, evolução, calendário, calendário da copa, contratação.
- Reformular o modelo de vaga: permanece `Posicao[]`, uma posição por lesão substituível, sem alinhamento por índice a `titulares`/`setores`.
- Qualquer outra issue fora da F4.

## Decisões assentadas

- Revisão da auditoria: substituir o descarte por índice pela redistribuição nos setores livres. Em 3-4-3 com G/3D/4M/2A, a vaga D passa a A; não se perde o direito de substituir o lesionado.
- Cada mudança de formação reconcilia as vagas de novo (decidido na descoberta).
- Cobre o caminho da IA também (decidido na descoberta).
- **Modelo preservado**: `Posicao[]`; não há novo tipo nem necessidade de identificar qual D se lesionou na Formação antiga.
- Em cada posição, setores ocupados mais vagas não excedem a capacidade da Formação. Preservar primeiro as vagas nas posições antigas ainda livres; distribuir as restantes pelos setores livres em G/D/M/A.
- A correção F4 fica em `mudarFormacaoDoLado`; os consumidores e produtores de vagas mantêm o modelo e as assinaturas atuais.
- A correção é puramente no motor de simulação; nenhum componente React precisa mudar (a UI consome `LadoPartida` como hoje).

## Questões em aberto

- A regra fica em `mudarFormacaoDoLado`, após atribuir os setores e antes do recálculo das forças.
- O recálculo de forças já acontece em `mudarFormacaoDoLado` e `substituirNoLado`. Não precisa mudar.

## Critérios de aceitação (nível brief)

- O teste de regressão do fluxo `lesão → mudar formação → substituir` passa e produz setores compatíveis com a formação nova (G/3D/4M/3A no caso 4-4-2 → 3-4-3 com 1 D lesionado).
- Mudanças repetidas preservam a quantidade de vagas e titulares e a capacidade por setor, sem repor expulsos.
- `npm test`, `npm run build` e `npm run dev` continuam verdes.
- O critério exato de teste e a forma do helper ficam a cargo do implementer, desde que a invariante seja preservada.
