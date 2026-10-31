# Spec 0002 - Correção: vaga de lesão acompanha a Formação

Brief: `docs/briefs/0002-correcao-vagas-lesao.md`. Vocabulário: `docs/CONTEXT.md`. Issue: F4 em `docs/ISSUES.md`. Motor: `docs/MOTOR.md` (seção Substituições e IA na Partida).

## Problem Statement

Hoje, quando o Técnico lesiona um D em 4-4-2 e em seguida muda a Formação para 3-4-3 (3 D em vez de 4), `mudarFormacaoDoLado` recalcula `lado.setores` mas não reconcilia `lado.vagas`. A vaga de lesão fica presa ao setor antigo (o D excedido do 4-4-2). `substituirNoLado`, ao preencher essa vaga, encaixa um Jogador no setor excedido e produz uma escala incompatível com a Formação atual (G/4D/4M/2A em vez de G/3D/4M/3A). O mesmo caminho é seguido pela IA via `agirIA`, porque ela consome `vagas` na próxima iteração. Mudanças repetidas de Formação (4-4-2 → 3-4-3 → 5-3-2, por exemplo) podem acumular vaga fantasma ou descartar vaga válida, dependendo do caminho.

Reprodução exata em `docs/ISSUES.md` (F4): 4-4-2 → lesionar D → mudar Formação para 3-4-3 → `substituirNoLado(partida, 'casa', 45, null, reservaId)` → resultado atual G/4D/4M/2A; esperado setores compatíveis com 3-4-3.

O modelo atual é `Posicao[]`: uma posição por lesão ainda substituível. Não existe alinhamento por índice entre `vagas` e `titulares`/`setores`. O problema é a falta de reconciliação com a capacidade livre da Formação atual.

## Correção aprovada nesta revisão

Esta seção substitui a proposta de tupla/descarte registrada abaixo. A proposta anterior fica preservada como histórico da edição; seus critérios não são requisitos de implementação.

### Solução e invariante

Manter `lado.vagas: Posicao[]`. Cada elemento representa uma lesão ainda substituível, não um índice em `titulares`/`setores`. Depois de atribuir os setores aos titulares da nova Formação, calcular a capacidade livre por posição: `FORMACOES[formacao][posicao] - ocupados[posicao]`.

Primeiro preservar as vagas antigas que cabem em seus setores, consumindo essa capacidade. Depois redistribuir as demais vagas pelos setores livres restantes na ordem G/D/M/A. Não descartar vagas: mudar Formação não elimina o direito de repor um lesionado.

Para toda posição, `ocupados[posicao] + vagas[posicao] <= FORMACOES[formacao][posicao]`. Mudar Formação não altera a quantidade de titulares nem de vagas. Expulsos não abrem vagas. Substituir um lesionado consome uma vaga e acrescenta um titular naquele setor, mantendo a soma.

### Histórias e critérios vigentes

As histórias 1–4 passam a exigir, respectivamente: preservar o direito de reposição; produzir G/3D/4M/3A no caso F4; manter as invariantes em mudanças repetidas; aplicar a mesma regra à IA. A história 5 mantém os limites e o recálculo existentes.

- AC1. 4-4-2 → lesionar D → mudar para 3-4-3 → substituir, inclusive com reserva D, termina com G/3D/4M/3A, 11 titulares e nenhuma vaga.
- AC2. A capacidade livre é calculada por posição a partir de `FORMACOES`, descontando os setores ocupados.
- AC3. Toda mudança conserva o número de titulares e de vagas, respeitando a capacidade de cada posição.
- AC4. Encadear 3-4-3 → 5-3-2 → 3-4-3 preserva AC3 e permite preencher a vaga depois.
- AC5. Com uma expulsão e duas lesões de M, mudar para 4-3-3 → 3-5-2 → 4-5-1 → 3-4-3 conserva oito titulares e duas vagas. Preencher ambas deixa dez titulares; nova reposição sem saída é recusada.
- AC6. A substituição mantém a preferência pela posição natural do reserva entre as vagas reconciliadas; senão consome a primeira. O reserva ocupa o setor consumido, com a penalidade habitual se improvisado.
- AC7. `agirIA` usa as mesmas vagas reconciliadas, sem exceder os setores da Formação.
- AC8. Permanecem os limites de cinco Substituições/três paradas, a impossibilidade de repor expulsos e o recálculo imediato das forças. Assinaturas e testes preexistentes permanecem compatíveis.
- AC9. Testes, build e aplicação em desenvolvimento passam. O formato do Save permanece versão 8.

A correção F4 cabe em `mudarFormacaoDoLado`, sem novo tipo de vaga, sem alterar a UI e sem modificar os consumidores `substituirNoLado`/`agirIA`. Os demais consertos da auditoria têm escopo próprio e não mudam esses critérios.

<details>
<summary>Histórico da proposta anterior — substituída, não implementar</summary>

## Solution (histórico)

Trocar o modelo de vaga para uma tupla `{ posicao: Posicao; indiceNaFormacao: number }[]` (tipo `VagaLesao`), onde `indiceNaFormacao` é o índice 0-based da vaga dentro do grupo da mesma `posicao` na Formação em que foi aberta. Com essa informação, `mudarFormacaoDoLado` consegue decidir se a vaga ainda corresponde a um slot válido na Formação nova pela regra exata "se `indiceNaFormacao < contagemNaNovaFormacao[posicao]`, mantém; caso contrário, descarta" — porque em 3-4-3 há 3 D, então um 4º D de 4-4-2 tem `indiceNaFormacao=3` que é `>= 3` e sai.

A invariante passa a ser: para cada vaga `{posicao, indiceNaFormacao}` em `lado.vagas`, o setor correspondente na Formação atual é o `indiceNaFormacao`-ésimo setor da mesma `posicao` em `setoresDaFormacao(formacao)`. `mudarFormacaoDoLado` mantém essa invariante filtrando vagas cuja posição foi excedida na Formação nova; `substituirNoLado` consome a vaga cuja `posicao` é o novo setor do titular; `disciplina`/`removerDoCampo` produzem a tupla no momento da lesão. `criarPartida`, `criarLado`, `simularPartida`, `disputarPenaltis`, `recalcularRazoes` e `forcasDoLado` continuam coerentes com a invariante.

A correção é puramente no motor de simulação; nenhum componente React muda — a UI consome `LadoPartida` lendo `lado.vagas.length` como hoje e tratando cada elemento como a tupla.

### Convenção de contagem (assente)

`indiceNaFormacao` é contado dentro do grupo da mesma `posicao` na Formação em que a vaga foi aberta (0-based). Exemplo em 4-4-2 (G/4D/4M/2A): os D titulares ocupam formation indices 1, 2, 3, 4 após o `sort` por `POSICOES`. Lesionar o primeiro D resulta em `{posicao:'D', indiceNaFormacao:0}`; o segundo D em `{posicao:'D', indiceNaFormacao:1}`; e assim por diante. Essa convenção é a recomendada porque a regra de descarte fica exata (`indiceNaFormacao >= contagemNaNovaFormacao[posicao]`), é trivial de testar e reflete diretamente "não há 4º D em 3-4-3".

## User Stories

Os números abaixo (US-n) são os requisitos rastreados pelos tickets em `tickets/0002-correcao-vagas-lesao/index.md`.

1. Como Técnico, ao lesionar um titular em uma Formação e depois mudar para outra Formação, quero que a vaga aberta pela lesão carregue a posição que excedeu na Formação nova e seja descartada quando essa posição deixar de existir, para que `substituirNoLado` (com `saiId` nulo) nunca produza uma Escala incompatível com a Formação.
2. Como Técnico, ao mudar de 4-4-2 para 3-4-3 com uma vaga aberta de D, quero que o 4º D (vaga com `indiceNaFormacao=3`) seja descartado e que a substituição subsequente, com qualquer reserva, nunca encaixe um quarto zagueiro — evitando a escala G/4D/4M/2A observada na issue F4.
3. Como Técnico, ao encadear mudanças de Formação (por exemplo 4-4-2 → 3-4-3 → 5-3-2), quero que cada `mudarFormacaoDoLado` reaprecie `vagas` do zero: vagas cuja `posicao` ainda tem `contagemNaNovaFormacao[posicao] > indiceNaFormacao` são preservadas com a mesma tupla, vagas excedidas são descartadas, sem acumular vaga fantasma e sem perder vaga válida.
4. Como Técnico, quero que a IA (`agirIA`) respeite a mesma invariante na próxima iteração: ao consumir `vagas[0]`, ela sempre usa `vaga.posicao` como o novo setor do titular — e como `vaga.posicao` é sempre um setor válido da Formação atual, a IA nunca encaixa um Jogador em um setor excedido.
5. Como Técnico, quero que a quantidade em campo, a ausência de reposição para expulsos, o limite de cinco Substituições em três paradas e o recálculo imediato das forças continuem funcionando exatamente como antes.

## Acceptance Criteria

- AC1. Reprodução exata da issue F4 (4-4-2 → lesionar um D → `mudarFormacaoDoLado('3-4-3')` → `substituirNoLado(partida, 'casa', 45, null, reservaId)`) produz `setores` compatíveis com 3-4-3 (G/3D/4M/3A) e não G/4D/4M/2A. `vagas` fica vazia, `titulares.length === 11`, sem reposição para expulso e dentro do limite de Substituições.
- AC2. A `contagemNaNovaFormacao[posicao]` é calculada por posição a partir de `FORMACOES[formacao]`, não por contagem em `setores.length`: ela reflete o número de slots que a Formação reserva para cada `posicao` na Formação nova (ex.: `FORMACOES['3-4-3'].D === 3`).
- AC3. A regra de descarte em `mudarFormacaoDoLado` é exata: para cada vaga `{posicao, indiceNaFormacao}` em `lado.vagas`, a vaga é descartada se `indiceNaFormacao >= FORMACOES[formacao][posicao]`; caso contrário, mantida com a mesma tupla. Não há "vaga fantasma" e não há descarte indevido.
- AC4. Mudanças repetidas de Formação (4-4-2 → 3-4-3 → 5-3-2, por exemplo) preservam AC3 em cada passo: nenhuma vaga fantasma se acumula, nenhuma vaga válida é perdida por engano.
- AC5. Teste unitário da nova regra com M (mais discriminante que D porque 4-4-2 tem 4 M, 4-3-3 tem 3 M, 3-5-2 e 4-5-1 têm 5 M, 3-4-3 tem 4 M): 4-4-2 → lesionar o primeiro M → `mudarFormacaoDoLado('4-3-3')` (3 M); a vaga M em `indiceNaFormacao=0` permanece. Lesionar o segundo M → `mudarFormacaoDoLado('3-5-2')` (5 M); `vagas` contém `[{posicao:'M', indiceNaFormacao:0}, {posicao:'M', indiceNaFormacao:1}]`, ambas mantidas. Mudar para `4-5-1` (5 M): ambas mantidas. Mudar para `3-4-3` (4 M): a vaga `{posicao:'M', indiceNaFormacao:1}` é descartada, sobra `[{posicao:'M', indiceNaFormacao:0}]`.
- AC6. `substituirNoLado`, no ramo `sai === null`, consome a vaga cuja `posicao` casa com a do reserva quando houver (preferência) e, no caso genérico, consome `vagas[0]` usando `vaga.posicao` como o setor a ser inserido em `lado.setores` — exatamente como o modelo novo exige, porque `vaga.posicao` é sempre um setor válido da Formação atual.
- AC7. `agirIA` consome `vagas[0]` e usa `vaga.posicao` como filtro de posição (`lado.banco.filter((j) => j.posicao === vaga.posicao)`) e como setor de inserção. A IA nunca encaixa um Jogador em um setor excedido porque o filtro só enxerga setores válidos da Formação atual.
- AC8. Comportamento já garantido continua valendo: `criarPartida`, `criarLado`, `simularPartida` e `disputarPenaltis` seguem coerentes com a invariante; quantidade em campo, ausência de reposição para expulsos, máximo de cinco Substituições em três paradas e recálculo imediato das forças em `mudarFormacaoDoLado` e `substituirNoLado` ficam preservados.
- AC9. `npm test`, `npm run build` e `npm run dev` continuam verdes.

## Implementation Decisions

- **Modelo de vaga**: `lado.vagas: VagaLesao[]`, onde `VagaLesao = { posicao: Posicao; indiceNaFormacao: number }`. Substitui o `Posicao[]` atual em `LadoPartida`.
- **Convenção de contagem**: `indiceNaFormacao` é 0-based dentro do grupo da mesma `posicao` na Formação em que a vaga foi aberta (ver seção "Convenção de contagem"). Aplica-se consistentemente no spec, no ticket, no código e nos testes.
- **Pontos de entrada da correção** em `src/motor/partida.ts`:
  - `criarLado`: inicializa `vagas: []` (já é vazio; a tipagem muda para `VagaLesao[]`).
  - `removerDoCampo`: muda a assinatura de retorno de `Posicao` para `VagaLesao` (retorna `{ posicao, indiceNaFormacao }`). O `indiceNaFormacao` é calculado no momento da remoção: é a contagem de titulares da mesma `posicao` que estão sendo removidos nesse instante (em `disciplina`, sempre 1) somada à contagem atual de titulares da mesma `posicao` que permanecem com índice menor ao setor sendo removido — equivalente à contagem 0-based dos titulares da mesma `posicao` antes da remoção, ordenados por índice em `setores` (que após `sort` em `mudarFormacaoDoLado` é estável por `POSICOES`). O cálculo exato fica a cargo do implementer, desde que AC2-AC5 sejam satisfeitas.
  - `disciplina`: consome `removerDoCampo` e faz `lado.vagas.push(removerDoCampo(lado, jogador))` (a tupla já vem pronta).
  - `mudarFormacaoDoLado`: depois de `atribuirSetores`, filtra `lado.vagas` descartando toda vaga cujo `indiceNaFormacao >= FORMACOES[formacao][posicao]` (a `formacao` já está atribuída no momento do filtro). Forma inline ou helper privado fica a critério do implementer, desde que a invariante seja preservada.
  - `substituirNoLado`: no ramo `sai === null`, encontra a vaga cuja `posicao === entra.posicao` se houver (preferência, comportamento atual), senão pega `vagas[0]`; usa `vaga.posicao` como setor a inserir em `lado.setores`. Remove a vaga de `lado.vagas` e segue como hoje.
  - `agirIA`: lê `vagas[0]` como tupla e usa `vaga.posicao` (não mais a vaga diretamente) tanto no filtro `lado.banco.filter((j) => j.posicao === vaga.posicao)` quanto no fallback `melhor(lado.banco)`. O setor inserido continua sendo decidido por `substituirNoLado`.
  - `recalcularRazoes` e `forcasDoLado`: nenhuma mudança além do tipo (`VagaLesao` em vez de `Posicao`).
- **Sem novo arquivo**: a correção cabe em `src/motor/partida.ts` (e tipos vizinhos se necessário); os testes ficam em `src/motor/partida.test.ts` (arquivo já cobre `substituirNoLado`, `mudarFormacaoDoLado`, `agirIA` e a regressão do F4).
- **Testes existentes que tocam em `vagas`** (`lesionado deixa vaga que o banco pode preencher sem escolher quem sai` e `IA: substitui o lesionado na hora, por reserva da mesma posicao` em `partida.test.ts`) precisam ser ajustados para empurrar a tupla em vez de `Posicao` — isso é parte do ticket e não introduz regressão.
- **Documentação**: o `docs/MOTOR.md` pode receber uma frase curta de observação na seção relevante (a invariante já é a regra; o que muda é o cumprimento dela após mudança de Formação). A critério do implementer.
- **Sem reformulação maior**: nenhuma outra mudança além das listadas acima. Regras de Substituição, IA, expulsão, limites e recálculo ficam intactos.
- **Sem comentários supérfluos e sem emojis** no código alterado.

## Out of Scope

- Estatísticas, interface, saldo, mercado, evolução, calendário, calendário da copa, contratação.
- Qualquer outra issue fora da F4.
- Reformular a regra de Substituição ou IA (apenas o tipo da vaga muda; a lógica de `substituirNoLado` e `agirIA` só lê a tupla em vez da `Posicao` crua).

</details>
