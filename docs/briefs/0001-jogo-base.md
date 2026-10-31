# 0001 - Jogo base (FutManager)

## Objetivo

Um site em português que simula carreira de técnico de futebol brasileiro no estilo Elifoot/Brasfoot: escolher um clube, escalar, acompanhar as partidas ao vivo, mexer no time durante o jogo, negociar jogadores e jogar temporadas seguidas com acesso e rebaixamento.

## Escopo

- **Tecnologia**: SPA Vite + React + TypeScript, sem backend. Motor de simulação em TypeScript puro, testado com Vitest. Saves no navegador.
- **Dados**: clubes reais das Séries A, B e C de 2026 (nome, cidade, UF, cores, porte) + pool fixo de clubes da Série D. Jogadores fictícios com nomes brasileiros gerados; força do elenco proporcional ao porte.
- **Competições**:
  - Séries A, B, C: 20 clubes, pontos corridos, 38 rodadas, 4 sobem / 4 descem. Os 4 últimos da C trocam com 4 do pool da Série D.
  - Copa do Brasil: 64 clubes (60 de A/B/C + 4 do pool), mata-mata, jogo único nas 2 primeiras fases, ida e volta depois, pênaltis. Jogada em datas intercaladas com as divisões.
  - Desempate: pontos, vitórias, saldo, gols pró, confronto direto, sorteio.
  - Carreira começa na temporada 2026; temporadas infinitas.
- **Partida ao vivo**: todos os jogos da rodada correm em paralelo, minuto a minuto, velocidade ajustável e pausa. Partida do técnico com narração de eventos (gols, cartões, lesões, chances); demais com placar. Pausado: substituições (5, em até 3 paradas), formação e postura (defensiva/equilibrada/ofensiva). IA também substitui.
- **Sistemas**:
  1. Escalação, formação e postura
  2. Mercado: comprar, vender, troca (jogador por jogador + dinheiro opcional), propostas da IA pelos jogadores do técnico, e transferências simples entre clubes da IA
  3. Duas janelas por temporada (início e meio)
  4. Finanças: salários, bilheteria, patrocínio, premiação, saldo. Saldo inicial e folha proporcionais ao porte. Saldo negativo bloqueia compras (sem game over)
  5. Contratos com duração e renovação
  6. Lesões, cartões e suspensões (vermelho ou 3 amarelos)
  7. Condição física/cansaço e moral
  8. Evolução por idade, aposentadoria, geração de jogadores da base
  9. Histórico: campeões, artilheiros, tabelas finais de temporadas passadas
- **Saves**: 1 técnico humano, 3 slots no navegador, autosave a cada rodada.
- **Visual**: moderno, tema escuro, tabelas densas, cores dos clubes; desktop primeiro, usável no celular.
- **Documento do motor**: `docs/MOTOR.md` em português explicando simulação da partida (força, chance por minuto, eventos, fator casa, cansaço, tática), mercado, evolução e finanças. Mantido junto com o código.

## Fora do escopo

- Estaduais, Libertadores, Sul-Americana, Série D jogável
- Demissão do técnico e propostas de outros clubes
- Estádio (ampliação) e preço de ingresso configurável
- Multiplayer / hot-seat, contas de usuário, backend
- Nomes reais de jogadores

## Decisões assentadas

- Tudo acima foi confirmado pelo usuário na descoberta.
- O motor de jogo é escolha nossa (planner/implementer), desde que documentado em `docs/MOTOR.md` e testável de forma determinística (RNG com seed).
- Commit e push exigem autorização do usuário; commit local das correções do lote 12–14 autorizado em 2026-10-03.
- Revisão 12–14: usuário aceitou propostas da IA acima do valor de mercado quando baseadas no preço anunciado. Manter esse comportamento, sem teto adicional.
- Ticket 15: usuário autorizou calibrar receitas recorrentes do Pool da Série D e das Divisões para sustentar a economia e a atividade do mercado no longo prazo. Regras iguais para Técnico e IA, preservando dívida existente, salário renovado nunca inferior ao atual e reposição até 22; sem resgate automático ou garantia de solvência de todos os clubes.
- Ticket 15: gols permanecem na competição em que foram marcados após Transferência, com o Clube pelo qual foram feitos nas listas de artilheiros e no Histórico.

## Propostas de ADR (planner escreve em `docs/adrs/`)

- SPA só no navegador com saves locais (sem backend): reverter exige servidor, persistência e contas.
- Jogadores fictícios gerados por porte do clube em vez de base de jogadores reais.

## Questões em aberto

- Listas exatas de clubes de 2026 (A, B, C) e do pool da Série D: fato a pesquisar pelo planner.
- Fórmulas concretas do motor, finanças e valor de mercado: decisão técnica do planner.

## Notas para tickets futuros (descobertas na implementação)

- Ticket 10: `carreira.desempate` (chaves de sorteio) precisa ser renovado a cada Temporada.
- Ticket 15: corrigir `artilheiros()` para preservar a competição e o Clube dos gols após Transferência, conforme decisão assentada.
- Tickets 04/06: o motor usa razão exp((ataque - defesa)/36) (aceito na revisão do 02). Condição, moral e Postura devem ser calibradas pensando nesse modelo de diferença (um multiplicador sobre força tira mais pontos em força alta).
- Ticket 04: ataque/defesa usa média de força por setor, então o número de Jogadores no setor não pesa; a Formação precisa passar a influenciar.
- Ticket 07: razaoCasa/razaoFora são fixadas em criarPartida; mudanças de Escalação/Formação/Postura no meio da Partida precisam recalculá-las.
- Ticket 06: validarEscalacao ainda não considera lesionados e suspensos.
- Ticket 10: o Painel valida a Escalação do Técnico mesmo em datas em que o Clube não joga (relevante quando o Clube estiver no Pool).
- Ticket 06 (da revisão 03-05): hoje ofensiva rende mais pontos esperados que equilibrada/defensiva em todo cenário e 3-4-3 sempre supera 4-4-2. Com o custo de condição da ofensiva, garantir que defensiva e ofensiva tenham cada uma uma situação em que compensam, e registrar no MOTOR.md.
- Limpeza pequena (qualquer ticket que mexa nos arquivos): timeout explícito nos testes de calibração de partida.test.ts; renomear escalarAutomaticamente (mutante) para aplicarEscalacaoAutomatica.
- Tickets 09/10 (do Batch 06-08): premiação da Copa (09) e renovação de `copa` e `desempate` a cada Temporada (10).
- npm test já leva ~43s por causa das séries de calibração; se crescer, reduzir N ou separar um projeto de testes lentos.
- Limpeza (da revisão 06-08): no MOTOR.md, descrever o custo da ofensiva na Temporada inteira como faixa por força do Clube (~-20% para dominantes, ~-35% para meio de tabela da Série A), não 18% fixo.
- Decisões da revisão 09-11 (orquestrador): renovação termina no máximo 5 anos após a Temporada atual e o salário renovado nunca fica abaixo do atual; Escalação automática nunca põe 2º G na linha; com menos de 11 elegíveis o Clube joga desfalcado em vez de travar; reposição de Elenco vai até 22 (mín. 2 G).
- Ticket 15: finanças do Pool da Série D afundam (clube fica no Pool ~50% por ano, saldo chega a -2,3x o inicial); avaliar piso ou fator maior. Calibração financeira só garantida para o 10º colocado (aceito).
- Tickets 12-14: com o drift de Elencos, IA deve repor jogadores pelo mercado.
- Ticket 15 (da revisão 09-11): Renovar com duração menor que o Contrato atual deve dar aviso ou ficar indisponível; escalação desfalcada deve encaixar os titulares nos setores corretos (hoje usa os N primeiros setores e gera penalidade de posição à toa).
- Ticket 15 (da revisão 12-14): inflação de folha salarial no longo prazo (renovação max(atual, pedido), reposição, Base) faz ~40% dos clubes da IA ficarem com saldo negativo na 8ª Temporada e o mercado da IA secar; decidir como folha e receita se equilibram em muitas Temporadas.

- Ticket 15 (da revisão independente 12–14): teste existente de acesso excedeu timeout de 5s na suíte concorrente, mas passou isolado sem alterações e a suíte serial passou (232 testes). Definir limites explícitos para simulações longas com base no tempo medido.

## Questão conhecida fora do ticket 15

- Revisão do ticket 15, F4: vaga de lesão mantém setor antigo após mudança de Formação; substituir D lesionado depois de 4-4-2 para 3-4-3 pode produzir quatro D. Reproduzido antes e depois do ticket 15. Registrado para planejamento separado; não integra as correções F1–F3 nem bloqueia o veredito deste ticket.
