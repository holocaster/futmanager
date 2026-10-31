# Spec 0001 - Jogo base (FutManager)

Brief: `docs/briefs/0001-jogo-base.md`. Vocabulário: `docs/CONTEXT.md`. ADRs: `docs/adrs/0001-spa-sem-backend.md`, `docs/adrs/0002-jogadores-ficticios.md`.

## Problem Statement

Quem gosta de Elifoot/Brasfoot não tem um simulador de técnico do futebol brasileiro atual, em português, que rode direto no navegador sem instalar nada e sem conta. O Técnico quer escolher um Clube real, montar a Escalação, ver a Rodada acontecer minuto a minuto, mexer no time durante a Partida, negociar Jogadores e jogar temporadas sem fim com acesso e rebaixamento.

## Solution

Um site estático (SPA Vite + React + TypeScript, sem backend) com um motor de simulação em TypeScript puro, determinístico por seed e testado com Vitest. A carreira começa em 2026 com os clubes reais das Séries A, B e C de 2026, um Pool da Série D de 8 clubes, Jogadores fictícios gerados por Porte, Copa do Brasil intercalada às Divisões, mercado com duas Janelas, finanças, contratos, evolução e histórico. Saves em 3 slots no navegador com autosave a cada Rodada. Tema escuro, tabelas densas, cores dos clubes, desktop primeiro e usável no celular. As regras do motor ficam documentadas em `docs/MOTOR.md`.

## User Stories

Os números abaixo (US-n) são os requisitos rastreados pelos tickets em `tickets/0001-jogo-base/index.md`.

### Início de carreira e dados

1. Como Técnico, quero abrir o site e ver uma tela inicial com os 3 slots de Save, para começar ou continuar uma carreira.
2. Como Técnico, quero escolher qualquer Clube das Séries A, B ou C de 2026, vendo nome, cidade, UF, Divisão, Porte e cores, para começar a carreira com ele.
3. Como Técnico, quero que os clubes sejam os reais das Séries A, B e C de 2026, para reconhecer o futebol brasileiro atual.
4. Como Técnico, quero que os Jogadores tenham nomes brasileiros fictícios plausíveis, para o jogo parecer real sem usar nomes reais.
5. Como Técnico, quero que a força do Elenco de cada Clube seja proporcional ao seu Porte, para que clubes grandes sejam mais fortes.
6. Como Técnico, quero ver o Elenco do meu Clube em tabela densa (posição, nome, idade, força, condição, moral, salário, contrato, valor, situação), para decidir a Escalação e o mercado.
7. Como Técnico, quero ver o Elenco de qualquer outro Clube, para avaliar adversários e alvos de mercado.

### Competições e calendário

8. Como Técnico, quero que Série A, B e C tenham 20 clubes em pontos corridos, turno e returno, 38 Rodadas, para reproduzir o Brasileirão.
9. Como Técnico, quero ver a classificação de cada Divisão com P, J, V, E, D, GP, GC, SG, para acompanhar a disputa.
10. Como Técnico, quero que o desempate siga pontos, vitórias, saldo, gols pró, confronto direto e sorteio, nessa ordem.
11. Como Técnico, quero que a Copa do Brasil tenha 64 clubes (60 de A/B/C + 4 do Pool da Série D), jogo único nas 2 primeiras fases e ida e volta depois, com pênaltis em caso de empate, para ter um mata-mata.
12. Como Técnico, quero que a Copa do Brasil seja jogada em datas intercaladas com as Divisões, e ver as chaves e resultados de cada fase.
13. Como Técnico, quero ver o calendário da Temporada com a próxima data e meus próximos adversários.
14. Como Técnico, quero ver os resultados de todas as Partidas de cada Rodada já jogada.
15. Como Técnico, quero ver os artilheiros de cada Divisão e da Copa do Brasil na Temporada atual.

### Partida ao vivo

16. Como Técnico, quero que todas as Partidas da Rodada corram em paralelo minuto a minuto, para acompanhar a data inteira.
17. Como Técnico, quero ajustar a velocidade da simulação e pausar a qualquer momento.
18. Como Técnico, quero que a minha Partida tenha narração de eventos (gols, cartões, lesões, chances), e as demais mostrem só o placar atualizado.
19. Como Técnico, com o jogo pausado, quero fazer Substituições (máximo 5, em até 3 paradas), para reagir ao jogo.
20. Como Técnico, com o jogo pausado, quero mudar a Formação e a Postura (defensiva, equilibrada, ofensiva), e que isso afete o jogo.
21. Como Técnico, quero que a Partida pause automaticamente no intervalo e quando um Jogador meu se lesionar ou for expulso, para eu poder reagir.
22. Como Técnico, quero que os clubes da IA também façam Substituições (por lesão, cansaço ou placar), para o jogo ser justo.
23. Como Técnico, quero que empates no mata-mata da Copa sejam decididos nos pênaltis, narrados na minha Partida.

### Escalação

24. Como Técnico, quero escolher os 11 titulares, o banco de reservas, a Formação e a Postura antes da Partida.
25. Como Técnico, quero um botão de escalação automática que monte o melhor time disponível para a Formação escolhida.
26. Como Técnico, quero ser impedido de iniciar a Rodada com Jogador lesionado ou suspenso entre os titulares, com aviso claro.
27. Como Técnico, quero que os clubes da IA escalem o melhor time disponível.

### Cartões, lesões, condição e moral

28. Como Técnico, quero que cartão vermelho (direto ou segundo amarelo) suspenda o Jogador na próxima Partida, e que 3 amarelos acumulados também suspendam.
29. Como Técnico, quero que lesões tirem o Jogador da Partida e o deixem fora por algumas Rodadas.
30. Como Técnico, quero que a condição física caia ao jogar e se recupere entre as datas, e que Jogadores cansados rendam menos.
31. Como Técnico, quero que a moral suba com vitórias e caia com derrotas, e afete o rendimento.
32. Como Técnico, quero ver no Elenco quem está lesionado (e por quantas Rodadas), suspenso, ou pendurado com amarelos.

### Mercado

33. Como Técnico, quero que transferências só aconteçam nas Janelas de início e de meio de Temporada, e ver quando a Janela está aberta.
34. Como Técnico, quero buscar Jogadores de outros clubes com filtros (posição, força, idade, valor) e fazer Proposta de compra.
35. Como Técnico, quero que o clube vendedor aceite, recuse ou faça contraproposta, e poder aceitar a contraproposta.
36. Como Técnico, quero colocar Jogadores à venda com preço pedido, para receber Propostas.
37. Como Técnico, quero receber Propostas da IA pelos meus Jogadores e aceitar, recusar ou contrapropor.
38. Como Técnico, quero propor uma Troca (jogador por jogador, com dinheiro opcional em qualquer sentido).
39. Como Técnico, quero que os clubes da IA façam Transferências entre si, e ver as transferências recentes.
40. Como Técnico, quero que compras sejam bloqueadas quando meu saldo for negativo ou insuficiente, sem fim de jogo.
41. Como Técnico, quero que cada Jogador tenha um valor de mercado coerente com força e idade.

### Finanças e contratos

42. Como Técnico, quero que salários sejam descontados e bilheteria, patrocínio e premiação sejam creditados, para gerir o caixa.
43. Como Técnico, quero ver saldo, folha salarial e um extrato de receitas e despesas da Temporada.
44. Como Técnico, quero que saldo inicial e folha sejam proporcionais ao Porte do Clube.
45. Como Técnico, quero que cada Contrato tenha duração e termine no fim de uma Temporada, e que o Jogador saia se não for renovado.
46. Como Técnico, quero renovar Contratos escolhendo a duração, pagando o salário pedido pelo Jogador.
47. Como Técnico, quero que clubes da IA renovem ou deixem sair seus Jogadores sozinhos.

### Fim de Temporada e carreira infinita

48. Como Técnico, quero que no fim da Temporada os 4 primeiros subam e os 4 últimos desçam entre A/B e B/C, e os 4 últimos da C troquem com 4 clubes do Pool da Série D.
49. Como Técnico, quero receber premiação por posição na Divisão e por fase alcançada na Copa do Brasil.
50. Como Técnico, quero que os Jogadores envelheçam e evoluam (jovens melhoram, veteranos caem), que veteranos se aposentem e que cada Clube receba Jogadores da Base todo ano.
51. Como Técnico, quero ver um resumo do fim da Temporada (campeões, acessos, rebaixamentos) e seguir para a próxima, infinitamente.
52. Como Técnico, quero um Histórico com campeões, artilheiros e tabelas finais de todas as Temporadas passadas.
53. Como Técnico cujo Clube caiu para o Pool da Série D, quero continuar a carreira (Copa do Brasil e mercado) e voltar à Série C na Temporada seguinte.

### Saves e visual

54. Como Técnico, quero salvar em um de 3 slots, carregar e excluir Saves.
55. Como Técnico, quero autosave ao fim de cada Rodada, para não perder progresso.
56. Como Técnico, quero um visual moderno em tema escuro, tabelas densas e cores dos clubes, usável também no celular.

### Documentação do motor

57. Como mantenedor, quero `docs/MOTOR.md` em português explicando simulação da Partida (força, chance por minuto, eventos, fator casa, cansaço, tática), mercado, evolução e finanças, sempre atualizado com o código.
58. Como mantenedor, quero que o motor seja determinístico dado um seed, para testar e reproduzir resultados.

## Implementation Decisions

### Arquitetura

- SPA estática Vite + React + TypeScript, sem backend (ADR 0001). Dependências de runtime: apenas `react` e `react-dom`. Dev: `vite`, `@vitejs/plugin-react`, `typescript`, `vitest`. Sem roteador, sem gerenciador de estado, sem biblioteca de UI, sem CSS framework: CSS puro com variáveis.
- Dois módulos: **motor** (`src/motor/`, TypeScript puro, sem React e sem acesso ao navegador) e **ui** (`src/ui/`, React). O módulo de Save (`src/save.ts`) é o único que toca `localStorage`.
- Identificadores de código usam os termos do glossário em português (Clube, Jogador, Partida, Rodada, Escalação...), respeitando os "Avoid" do `docs/CONTEXT.md`.
- Sem comentários no código salvo onde realmente necessário. Sem emojis.

### Estado da carreira

- Toda a carreira vive em um único objeto `Carreira`, JSON puro (sem classes, sem `Map`, sem funções), serializável diretamente para o Save. Contém: versão do formato, ano, id do Clube do Técnico, estado do RNG, clubes (com Divisão atual, saldo, Formação/Postura/Escalação padrão), Jogadores (registro por id, cada um com `clubeId`), calendário da Temporada (datas com Partidas e resultados), Copa do Brasil (fases e confrontos), Propostas pendentes, transferências recentes, extrato financeiro da Temporada e Histórico.
- Funções do motor recebem a `Carreira` e a modificam no lugar (documentado). A UI guarda a `Carreira` em um contexto React e, após cada ação, incrementa um contador de versão para re-renderizar. Sem cópias profundas por ação.
- Navegação por um estado de "tela" no componente raiz.

### RNG determinístico

- RNG próprio (mulberry32 ou equivalente) com estado de 32 bits guardado na `Carreira` (`rng: { estado }`), avançado por todas as decisões aleatórias do motor. Mesmo seed + mesmas ações do Técnico = mesmo resultado. Nenhum uso de `Math.random` no motor.
- Uma Rodada ao vivo usa o RNG da `Carreira`; ações do Técnico durante a Partida fazem parte da entrada, então a reprodução é determinística dada a sequência de ações.

### Dados de clubes (fixos)

Cada Clube: `id` (slug), nome, nome curto, cidade, UF, cor primária, cor secundária, Porte (1 a 5), Divisão inicial. As cores são aproximadas e podem ser ajustadas pelo implementador. Fonte das listas: páginas da Wikipédia (pt) "Campeonato Brasileiro de Futebol de 2026 - Série A/B/C/D", consultadas em 2026-10-02.

Série A 2026:

| Clube | Cidade/UF | Cores | Porte |
|---|---|---|---|
| Athletico Paranaense | Curitiba/PR | vermelho, preto | 4 |
| Atlético Mineiro | Belo Horizonte/MG | preto, branco | 5 |
| Bahia | Salvador/BA | azul, vermelho | 4 |
| Botafogo | Rio de Janeiro/RJ | preto, branco | 5 |
| Chapecoense | Chapecó/SC | verde, branco | 3 |
| Corinthians | São Paulo/SP | branco, preto | 5 |
| Coritiba | Curitiba/PR | verde, branco | 4 |
| Cruzeiro | Belo Horizonte/MG | azul, branco | 5 |
| Flamengo | Rio de Janeiro/RJ | vermelho, preto | 5 |
| Fluminense | Rio de Janeiro/RJ | grená, verde | 5 |
| Grêmio | Porto Alegre/RS | azul, preto | 5 |
| Internacional | Porto Alegre/RS | vermelho, branco | 5 |
| Mirassol | Mirassol/SP | amarelo, verde | 3 |
| Palmeiras | São Paulo/SP | verde, branco | 5 |
| Red Bull Bragantino | Bragança Paulista/SP | branco, vermelho | 4 |
| Remo | Belém/PA | azul-marinho, branco | 3 |
| Santos | Santos/SP | branco, preto | 4 |
| São Paulo | São Paulo/SP | vermelho, branco | 5 |
| Vasco da Gama | Rio de Janeiro/RJ | preto, branco | 4 |
| Vitória | Salvador/BA | vermelho, preto | 4 |

Série B 2026:

| Clube | Cidade/UF | Cores | Porte |
|---|---|---|---|
| América Mineiro | Belo Horizonte/MG | verde, preto | 3 |
| Athletic | São João del-Rei/MG | preto, branco | 2 |
| Atlético Goianiense | Goiânia/GO | vermelho, preto | 3 |
| Avaí | Florianópolis/SC | azul, branco | 3 |
| Botafogo-SP | Ribeirão Preto/SP | vermelho, preto | 2 |
| Ceará | Fortaleza/CE | preto, branco | 4 |
| CRB | Maceió/AL | vermelho, branco | 2 |
| Criciúma | Criciúma/SC | amarelo, preto | 3 |
| Cuiabá | Cuiabá/MT | verde, amarelo | 3 |
| Fortaleza | Fortaleza/CE | azul, vermelho | 4 |
| Goiás | Goiânia/GO | verde, branco | 3 |
| Juventude | Caxias do Sul/RS | verde, branco | 3 |
| Londrina | Londrina/PR | azul-celeste, branco | 2 |
| Náutico | Recife/PE | vermelho, branco | 3 |
| Novorizontino | Novo Horizonte/SP | amarelo, preto | 2 |
| Operário-PR | Ponta Grossa/PR | preto, branco | 2 |
| Ponte Preta | Campinas/SP | preto, branco | 3 |
| São Bernardo | São Bernardo do Campo/SP | amarelo, preto | 2 |
| Sport | Recife/PE | vermelho, preto | 4 |
| Vila Nova | Goiânia/GO | vermelho, branco | 2 |

Série C 2026:

| Clube | Cidade/UF | Cores | Porte |
|---|---|---|---|
| Amazonas | Manaus/AM | amarelo, preto | 2 |
| Anápolis | Anápolis/GO | vermelho, branco | 1 |
| Barra-SC | Balneário Camboriú/SC | azul, branco | 1 |
| Botafogo-PB | João Pessoa/PB | preto, branco | 2 |
| Brusque | Brusque/SC | vermelho, amarelo | 2 |
| Caxias | Caxias do Sul/RS | grená, branco | 2 |
| Confiança | Aracaju/SE | azul, branco | 1 |
| Ferroviária | Araraquara/SP | grená, branco | 2 |
| Figueirense | Florianópolis/SC | preto, branco | 2 |
| Floresta | Fortaleza/CE | verde, branco | 1 |
| Guarani | Campinas/SP | verde, branco | 3 |
| Inter de Limeira | Limeira/SP | preto, branco | 1 |
| Itabaiana | Itabaiana/SE | azul, branco | 1 |
| Ituano | Itu/SP | vermelho, preto | 2 |
| Maranhão | São Luís/MA | azul, vermelho | 1 |
| Maringá | Maringá/PR | azul, branco | 1 |
| Paysandu | Belém/PA | azul-celeste, branco | 3 |
| Santa Cruz | Recife/PE | vermelho, preto | 3 |
| Volta Redonda | Volta Redonda/RJ | amarelo, preto | 2 |
| Ypiranga de Erechim | Erechim/RS | verde, amarelo | 2 |

Pool da Série D (8 clubes, todos participantes da Série D 2026; ABC, CSA, Retrô e Tombense caíram da Série C 2025):

| Clube | Cidade/UF | Cores | Porte |
|---|---|---|---|
| ABC | Natal/RN | preto, branco | 1 |
| América-RN | Natal/RN | vermelho, branco | 1 |
| CSA | Maceió/AL | azul, branco | 1 |
| Joinville | Joinville/SC | vermelho, preto | 1 |
| Portuguesa | São Paulo/SP | vermelho, verde | 1 |
| Retrô | Camaragibe/PE | azul, laranja | 1 |
| Tombense | Tombos/MG | vermelho, branco | 1 |
| Treze | Campina Grande/PB | preto, branco | 1 |

- O Porte é fixo durante a carreira. Clubes que caem da Série C entram no Pool; o Pool continua com 8.

### Jogador e geração

- Jogador: id, nome, posição (`G`, `D`, `M`, `A`), idade, força (1 a 99, atributo único), potencial (oculto, usado na evolução), salário mensal, `contratoAte` (último ano do Contrato), condição (0 a 100), moral (0 a 100), Rodadas de lesão restantes, jogos de suspensão, amarelos acumulados, estatísticas da Temporada (jogos, gols por competição), `clubeId`, flag/preço "à venda".
- Nomes: listas fixas de prenomes e sobrenomes brasileiros (e alguns apelidos de uma palavra), sorteadas pelo RNG.
- Elenco inicial: 25 Jogadores (3 G, 8 D, 8 M, 6 A), idade 17 a 35. Força média alvo por Porte: 5 = 75, 4 = 70, 3 = 64, 2 = 58, 1 = 52, com dispersão por Jogador (valores iniciais; o implementador calibra e registra no MOTOR.md). Contratos iniciais de 1 a 4 anos.
- Limites de Elenco para qualquer Clube: mínimo 16 (com pelo menos 2 G), máximo 32. Transferências que piorem uma violação dos limites são recusadas; um Clube já abaixo do mínimo pode comprar para se recompor. A reposição no fim da Temporada segue R15-01.
- **R15-01 — Reposição e continuidade:** na virada, a reposição já assentada vale para Técnico e IA, até o alvo de 22 Jogadores e pelo menos 2 G, respeitando o máximo de 32. Durante a Temporada, Transferências preservam o mínimo de 16 e 2 G; a IA prioriza compradores abaixo de 22 e não esvazia vendedores abaixo desse alvo. Não substituir esse comportamento por geração ilimitada ou por compras sem saldo.

### Valor de mercado e salário (pontos de partida)

- Valor = 50.000 x 1,15^(força - 40) x fator de idade (até 21: 1,3; 22 a 27: 1,0; 28 a 30: 0,8; 31 a 33: 0,5; 34+: 0,3), arredondado.
- Salário mensal de referência = máximo(5.000, 1% do valor). Salário pedido em renovação/compra = referência ajustada pela moral (moral baixa pede mais).
- Constantes podem ser recalibradas; a versão final fica no MOTOR.md.

### Calendário da Temporada

- 48 datas: 38 Rodadas das Divisões (as 3 Divisões jogam a Rodada n na mesma data) e 10 datas da Copa do Brasil, inseridas logo após as Rodadas de Divisão 3, 6, 9, 12, 15, 18, 24, 28, 32 e 36. Fases da Copa nessas datas: 1ª fase (jogo único), 2ª fase (jogo único), oitavas ida/volta, quartas ida/volta, semifinal ida/volta, final ida/volta.
- Tabela de pontos corridos: algoritmo de rodízio (círculo) com mando alternado; returno espelha o turno com mando invertido; cada Clube joga uma vez por Rodada.
- Copa do Brasil: participantes = 60 clubes de A/B/C + 4 do Pool sorteados no início da Temporada (o Clube do Técnico, se estiver no Pool, é sempre um dos 4). Sorteio puro pelo RNG a cada fase; no jogo único o primeiro sorteado é mandante; na ida e volta o primeiro sorteado faz a ida em casa. Placar agregado, sem gol fora, sem prorrogação; empate vai direto aos pênaltis (5 cobranças alternadas, depois alternadas até desempatar).

### Motor da Partida

- Uma Partida ao vivo é um objeto serializável com placar, minuto (0 a 90), titulares/banco/Formação/Postura de cada lado, Substituições e paradas usadas, eventos e flags. Interface:
  - `iniciarRodada(carreira)` cria todas as Partidas da próxima data (IA escala os seus clubes; a Escalação do Técnico é validada somente se seu Clube joga nessa data).
  - `avancarMinuto(carreira, rodada)` avança todas as Partidas um minuto e retorna os eventos gerados; inclui decisões da IA (Substituições) e, ao fim, pênaltis quando necessário.
  - Ações do Técnico com a Partida pausada: `substituir`, `mudarFormacao`, `mudarPostura`.
  - `finalizarRodada(carreira, rodada)` grava resultados, classificação, estatísticas, cartões, suspensões, lesões, condição, moral, finanças da data e eventos de mercado da data, e avança o calendário.
  - `fimDeTemporada(carreira)` roda após a última data, quando o Técnico confirma o resumo da Temporada.
  - `simularRodada(carreira)` = iniciar + avançar 90 minutos + finalizar, sem UI; usado em testes e no botão "simular sem assistir".
- Modelo por minuto: cada lado tem ataque e defesa calculados dos titulares em campo pela força efetiva (força x fator de condição x fator de moral). Ataque pesa A > M > D; defesa pesa G e D > M > A. A quantidade de Jogadores por setor pesa, não apenas sua média de força. A Postura multiplica ataque/defesa (ofensiva +ataque -defesa; defensiva o inverso). A razão aceita na revisão do motor é `exp((ataque próprio - defesa adversária) / 36)`, multiplicada pelo fator casa para o mandante; chance e conversão dependem dessa razão. Autor do gol sorteado com peso por posição (A > M > D, G quase nunca) e força.
- **R15-02 — Regressões táticas:** preservar o efeito da quantidade por setor, da condição e da moral nesse modelo de diferença. Substituição e mudanças de Formação/Postura recalculam as razões imediatamente; o cansaço também é acompanhado durante a Partida. Preservar os cenários já testados em que ofensiva compensa para favorito/quem está atrás e defensiva para azarão/quem está à frente, além do custo de condição acumulado. Não recalibrar do zero o motor já aceito.
- Eventos por minuto com probabilidades baixas: amarelo, vermelho direto, lesão. Segundo amarelo = expulsão. Expulso sai sem reposição; lesionado sai e pode ser substituído (IA substitui na hora se tiver Substituição disponível).
- Condição: titulares perdem condição por minuto (mais na Postura ofensiva); recuperação entre datas para todos.
- Pausas automáticas da Partida do Técnico: intervalo (minuto 45), lesão ou expulsão de Jogador do Técnico.
- Substituições: até 5, em até 3 paradas; o intervalo não conta como parada. Um Jogador substituído não volta.
- IA: Substitui lesionados na hora; a partir do minuto 60 troca os mais cansados (condição abaixo de um limite) por reservas da mesma posição; pode mudar a Postura conforme o placar no fim do jogo.
- Metas de calibração (vinculantes, verificadas por teste com seed fixo e N grande):
  - média de gols por Partida entre clubes de mesma força: entre 2,2 e 2,9;
  - entre clubes de mesma força: vitória do mandante 40% a 52%, empate 22% a 32%;
  - Clube com força média 10 pontos maior vence pelo menos 60% e perde no máximo 20%;
  - Postura ofensiva aumenta a média de gols da Partida em relação a ambas equilibradas;
  - cerca de 3 a 5 amarelos por Partida, vermelhos em 5% a 15% das Partidas, lesões em 10% a 30% das Partidas.
- Constantes finais e fórmulas exatas ficam no MOTOR.md.

### Cartões, lesões, condição, moral

- Vermelho = 1 jogo de suspensão; 3 amarelos acumulados = 1 jogo de suspensão e zera o acumulado. Contagem única para todas as competições. Suspensão é cumprida na próxima Partida oficial do Clube.
- Lesão: 1 a 6 datas, decrementada a cada data do calendário.
- Recuperação de condição entre datas (ex.: +15 por data, máximo 100). Moral: vitória sobe, derrota desce, empate neutro; reservas que não jogam perdem um pouco.

### Escalação

- Formações disponíveis: 4-4-2, 4-3-3, 4-5-1, 3-5-2, 3-4-3, 5-3-2, 5-4-1. Posturas: defensiva, equilibrada, ofensiva.
- Escalação = até 11 titulares (1 G + números da Formação), banco de até 7. Com pelo menos 11 elegíveis, são exigidos 11; com menos, o Clube joga desfalcado com os elegíveis, sem travar a Rodada. A Escalação do Técnico persiste entre datas; Jogadores indisponíveis precisam ser trocados antes da Partida do Clube. A validação exclui lesionados e suspensos também do banco. Escalação automática: melhores por força efetiva por posição, excluindo lesionados e suspensos; se faltar Jogador de uma posição, usa o de posição mais próxima, nunca um segundo G na linha enquanto houver Jogador de linha disponível. A função mutante já se chama `aplicarEscalacaoAutomatica`.
- Jogador escalado fora de posição rende menos (penalidade fixa, registrada no MOTOR.md).
- **R15-03 — Setores com desfalques:** uma Escalação curta não deve ser encaixada simplesmente nos primeiros N setores da Formação. Preservar primeiro os encaixes naturais disponíveis, dentro da capacidade de cada setor; só improvisar quando necessário e deixar os setores restantes vazios. Reutilizar uma regra determinística de atribuição de setores na criação do lado da Partida, na mudança de Formação e na tela Escalação. Com 11 titulares, preservar a ordem escolhida e as permutas manuais. Com menos, manter a ordem relativa dentro de cada posição e priorizar encaixes naturais antes dos improvisos. Aplicar ao Técnico e à IA; não repor expulsos, inventar titulares ou alterar limites de Substituição.

### Mercado

- Janelas: início = enquanto as Rodadas de Divisão jogadas forem 0 a 3; meio = enquanto forem 19 a 22. Fora delas, nenhuma Transferência ou Troca é concluída (Propostas pendentes expiram ao fechar a Janela).
- Compra: o Técnico oferta um valor. Preço pedido pela IA = valor x fator (1,3 se o Jogador está entre os 11 melhores do Clube, 1,1 caso contrário; à venda pela IA = 1,0). Oferta maior ou igual ao pedido: aceita; entre 70% e o pedido: contraproposta com o pedido; abaixo: recusa. O Técnico pode aceitar a contraproposta.
- Saldo do Técnico negativo ou menor que o valor a pagar bloqueia a compra (sem fim de jogo).
- Ao chegar, o Jogador recebe Contrato de 3 anos com o salário pedido.
- Venda: Jogadores marcados à venda recebem Propostas da IA com mais frequência; Jogadores não marcados recebem ocasionalmente. Propostas chegam a cada data com a Janela aberta, de clubes da IA com saldo suficiente e Porte compatível. O Técnico aceita, recusa ou contrapropõe um valor; a IA aceita a contraproposta se for até um teto (ex.: 1,2 x valor), senão desiste.
- **R15-04 — Política aceita do mercado:** o preço anunciado pelo Técnico continua sendo a base das ofertas da IA mesmo acima do valor de mercado, sem teto adicional (decisão do usuário no brief). Preservar saldo, limites de Elenco, Janelas e invalidação de Propostas após movimentação. Essa decisão não remove o teto já existente de 1,2 x valor para contrapropostas. Propostas e Transferências da IA continuam ocorrendo também em datas da Copa do Brasil com Janela aberta.
- Troca: o Técnico oferece um Jogador seu (+ dinheiro opcional em qualquer sentido) por um Jogador da IA. A IA aceita se valor oferecido + dinheiro >= preço pedido do seu Jogador e se os limites de Elenco forem respeitados.
- IA x IA: a cada data com Janela aberta, poucas Transferências entre clubes da IA: comprador com saldo suficiente leva Jogador de Clube de Porte igual ou menor que seja melhor que o seu pior na posição. Lista de transferências recentes visível ao Técnico.

### Finanças

- Saldo inicial por Porte (pontos de partida): 5 = R$ 60 mi, 4 = R$ 30 mi, 3 = R$ 12 mi, 2 = R$ 5 mi, 1 = R$ 2 mi. Folha decorre dos salários gerados (proporcional à força, logo ao Porte).
- A cada data de Rodada de Divisão, para todos os clubes (inclusive os do Pool, que não jogam): débito de salários (folha mensal x 12 / 38) e crédito de patrocínio (anual por Divisão e Porte, / 38; o Pool tem o menor valor).
- Bilheteria: crédito ao mandante em cada Partida, base por Porte ajustada pelo desempenho recente.
- Premiação: por fase alcançada na Copa (paga ao avançar) e por posição final na Divisão (paga no fim da Temporada).
- Transferências movem dinheiro na hora. Extrato da Temporada por categoria.
- Meta de calibração já aceita: na primeira Temporada, após a última data e antes da premiação por posição na virada, o 10º colocado de cada Divisão termina com 80% a 150% do saldo inicial do Porte, descontado o resultado líquido de Transferências, em pelo menos 90% de 30 seeds consecutivas (1 a 30). Mercado ligado; preservar também a regressão existente após premiação nas seeds 1, 2 e 3. Não estender a garantia a todas as posições ou Temporadas.
- Clubes da IA com saldo negativo não compram.
- **R15-05 — Economia de longo prazo:** calibrar receitas recorrentes do Pool e das Divisões para sustentar a economia e a atividade do mercado com renovação, evolução, Base e reposição ligadas. Ajustar o patrocínio na costura financeira existente, documentando fórmula, constantes e eventual evolução anual; não criar resgate, piso de saldo, perdão de dívida, teto novo para ofertas ou exceção para o Técnico. A mesma regra usa os mesmos dados para Técnico e IA, sem depender da identidade do Clube humano. Saldo negativo continua permitido e bloqueia compras; não há garantia de solvência de todos os clubes nem redução de salário renovado.
  - A receita nova entra no extrato e no saldo apenas quando creditada. Um Clube já endividado continua com a dívida até receitas/despesas efetivas a alterarem, inclusive na virada.
  - Calibração determinística de 10 Temporadas completas nos cenários seed 1/Flamengo, seed 8/Ceará e seed 42/Guarani, sem negociação ou renovação do Técnico e sem injetar dinheiro. Registrar antes/depois: folha, saldo, receitas/despesas operacionais, quantidade de clubes da IA negativos e número de Transferências IA x IA por Temporada e Divisão/Pool.
  - Em cada cenário, deve haver pelo menos uma Transferência IA x IA real em cada uma das Temporadas 8, 9 e 10, sem relaxar Janelas, saldo ou limites de Elenco. Contar eventos ao ocorrerem, não inferir atividade somente da lista limitada às últimas 100 Transferências.
  - Para o Pool, o resultado operacional anual agregado (patrocínio + bilheteria + premiação + salários, excluindo Transferências) deve ter média não negativa nas Temporadas 8 a 10 de cada cenário. Agrupar pelos clubes que disputaram a Temporada no Pool, capturando extratos antes de acesso/rebaixamento e da zeragem. Essa meta combate o déficit estrutural, não garante saldo positivo para cada Clube. A faixa de saldo e a atividade das Divisões são medidas separadamente para não esconder degradação atrás do agregado do Pool.
  - Preservar a calibração da primeira Temporada do 10º colocado. Fórmulas concretas e constantes ficam a cargo da implementação, dentro dessas metas e das decisões do brief.

### Contratos

- `contratoAte` = último ano de vínculo. No fim da Temporada, Contratos com `contratoAte` menor que o novo ano terminam e o Jogador sai do jogo (sem agentes livres).
- O Técnico pode renovar qualquer Jogador seu a qualquer momento: escolhe 1 a 5 anos; término = máximo(término atual, ano atual + duração), nunca além de ano atual + 5 em Contratos válidos. Salário = máximo(atual, pedido). Repetir renovação não acumula duração além desse limite. Pode recusar renovar.
- IA renova automaticamente Jogadores com força acima da mediana do Elenco e idade abaixo de 33; os demais saem. Preservar salário renovado nunca abaixo do atual.
- **R15-06 — Renovação transparente:** quando ano atual + duração for menor que o término atual, avisar antes da confirmação que o vínculo não será encurtado nem estendido e que o salário ainda pode subir; exibir término efetivo e salário máximo(atual, pedido). A confirmação mantém a regra do motor, sem alterar silenciosamente salário ou Contrato ao trocar a seleção de duração. Também mostrar os valores efetivos nas demais durações. Reutilizar `renovarContrato`; o aviso não muda a política de renovação.

### Fim de Temporada

- Ordem: premiação por posição -> Histórico (campeões de A, B, C e Copa, artilheiros de cada competição, tabelas finais) -> acesso/rebaixamento (A/B e B/C: 4 e 4; C: 4 últimos vão ao Pool e 4 do Pool sobem por sorteio; se o Clube do Técnico estiver no Pool, ele é sempre um dos 4 que sobem) -> fim de Contratos -> evolução por idade e aposentadoria -> Base (2 ou 3 Jogadores de 17 a 18 anos por Clube, força abaixo da média do Porte, potencial variável) -> reposição de Elencos de todos os clubes até 22 e pelo menos 2 G -> zera estatísticas, cartões e suspensões -> novo ano, novo calendário, novas chaves de desempate e novo sorteio da Copa.
- Evolução por idade (pontos de partida): até 21 sobe em direção ao potencial; 22 a 27 leve variação positiva; 28 a 30 estável/leve queda; 31 a 33 queda; 34+ queda forte. Aposentadoria: chance a partir de 34, obrigatória aos 38.
- O Técnico vê uma tela de resumo da Temporada e confirma para iniciar a próxima.
- Clube do Técnico no Pool (decisão do planner para um caso não coberto pelo brief): a carreira continua; ele joga a Copa do Brasil e o mercado, as datas de Divisão rodam sem Partida dele, e ele volta à Série C no fim da Temporada.

### Artilharia após Transferências

- **R15-07 — Competição e Clube de origem dos gols:** gols pertencem à competição em que foram marcados (A, B, C ou Copa do Brasil) e ao Clube pelo qual foram feitos, conforme decisão do usuário no brief. Transferência ou Troca não reatribui nem apaga gols, mesmo entre Divisões ou ao Pool. Gols posteriores são creditados ao novo Clube na competição da nova Partida; cobranças de pênaltis de desempate não contam.
- Guardar agregados da Temporada por Jogador, competição e Clube em JSON na `Carreira`, sem guardar um evento por gol ou copiar Partidas completas. Preservar identificação/nome do autor para a consulta não depender de seu vínculo atual. `finalizarRodada` registra os gols usando a competição agendada e o lado que marcou, antes de processar o mercado da data. As estatísticas gerais do Jogador podem continuar para a tabela do Elenco, mas não são a fonte de atribuição da artilharia.
- `artilheiros` e `artilheirosCopa` retornam linhas próprias de artilharia, não `Jogador[]` filtrado pelo Clube atual. Por competição, somar o total do Jogador para ordenar, mantendo o desempate por menos partidas e id; exibir os Clubes e a parcela de gols de cada um quando houver mais de um. Um Jogador com 2 gols por um Clube e 3 por outro na mesma competição tem 5 no total, com as duas origens explícitas, sem duplicar ou escolher arbitrariamente um Clube.
- O Histórico registra o artilheiro, seu total e as origens por Clube antes da virada. Essas origens não mudam após acesso, rebaixamento, novas Transferências ou saída do Jogador; nome/ids dos Clubes continuam resolvíveis. A virada zera somente os agregados da Temporada atual, não o Histórico.

### Save

- `localStorage`, chave por slot (`futmanager:save:1..3`), valor = JSON da `Carreira` com `versao`. Tela inicial lista os slots (Clube, ano, data do save) com carregar/excluir/novo. Autosave no slot ativo ao fim de cada Rodada e no início da Temporada. Save com versão diferente é mostrado como incompatível (sem migração nesta feature). Erro de cota é exibido ao Técnico.
- **R15-08 — Save multitemporada:** após 5 Temporadas completas, o JSON da `Carreira` deve ocupar menos de 2.000.000 bytes UTF-8; medir também o registro efetivamente salvo, incluindo o envelope de versão/data. Esse orçamento é uma regressão de tamanho, não promessa de cota universal ou espaço infinito. Preservar Histórico de todas as Temporadas e o tratamento de cota, sem descartar temporadas antigas para caber. A mudança de formato da artilharia incrementa a versão do Save; versões antigas permanecem incompatíveis, sem migração. Round-trip preserva origens dos gols e continuação determinística.

### UI

- Telas: inicial (slots), escolha de Clube, painel do Clube (próxima data, resumo), Elenco, Escalação, Rodada ao vivo, classificações (A, B, C), Copa do Brasil (chaves), calendário/resultados, artilheiros, mercado (busca, à venda, Propostas, Troca, transferências recentes), finanças, Histórico, resumo do fim de Temporada.
- Tema escuro por variáveis CSS; cores do Clube em escudo simplificado (círculo/faixa com as duas cores) e destaques; tabelas densas; layout que empilha em telas estreitas.
- Velocidades da Rodada ao vivo: 4 níveis (lenta, normal, rápida, instantânea) mais pausa.
- **R15-09 — Uso no celular:** revisar todas as telas listadas, incluindo Propostas, Troca, renovação e resumo da Temporada, nas larguras de 320 e 390 px e em desktop. Sem conteúdo essencial cortado ou rolagem horizontal da página; tabelas podem rolar no próprio contêiner. Controles, seleções, mensagens de erro e confirmações precisam permanecer alcançáveis e legíveis por toque, com rótulos claros e foco visível. Cores dos Clubes não podem esconder texto/controles no tema escuro; conservar o layout denso no desktop. A tela Escalação mostra os mesmos setores efetivos usados pelo motor.

### Documento do motor

- `docs/MOTOR.md` em português, criado no primeiro ticket e atualizado por todo ticket que altere regras do motor, mercado, finanças, evolução, calendário ou Save. Cada seção traz fórmulas e constantes reais do código.
- **R15-10 — Reconciliação final:** revisar o documento contra o código, incluindo artilharia por origem, setores desfalcados, renovação, receitas recorrentes, mercado, versão/tamanho do Save e medições de longo prazo. Conciliar as seções Tática e Cansaço e Moral: o custo anual da ofensiva é uma faixa dependente da força/cenário, não 18% fixo (medições anteriores: aproximadamente -20% para dominantes e -35% para meio de tabela da A). Identificar seeds, ações, horizonte e limitações de novas medições, sem transformar números antigos em garantias novas.

## Testing Decisions

- Um bom teste exercita comportamento observável pela interface pública do motor (`novaCarreira`, `iniciarRodada`/`avancarMinuto`/`finalizarRodada`/`simularRodada`, ações da Partida, classificação, funções de mercado/renovação, `fimDeTemporada`) e verifica resultados, não estado interno nem a fórmula reescrita no teste.
- Costura principal: o motor (`src/motor/`) testado com Vitest, sempre com seed fixo. Não há necessidade de mocks: o motor é puro em memória.
- Testes de calibração rodam muitas Partidas com seed fixo e verificam as faixas das metas acima (estatísticos, não valores exatos).
- Testes de determinismo: mesmo seed e mesmas ações produzem `Carreira` idêntica (comparação JSON); executar a Rodada minuto a minuto produz o mesmo resultado que `simularRodada`.
- **R15-11 — Invariantes e determinismo de longo prazo:** simular 5 Temporadas completas com seed 42/Guarani, repetidas com as mesmas ações (Escalação automática antes das datas, sem negociações/renovações do Técnico). Mercado da IA, Copa e todas as etapas da virada permanecem ligados. Comparar JSON da `Carreira`, não o timestamp do envelope do Save. Aproveitar o mesmo cenário na calibração de 10 Temporadas para não multiplicar simulações desnecessariamente.
  - Em cada data: resultados gravados válidos, calendário avançando, titulares/banco elegíveis quando o Clube joga, Elencos entre 16 e 32 com pelo menos 2 G, ids únicos e todo Jogador vivo com Clube válido; não exigir que ids históricos de autores ainda pertençam a Jogadores vivos.
  - Em cada virada: A/B/C com 20 clubes e Pool com 8; Elencos entre 22 e 32 com pelo menos 2 G; ano, Histórico, calendário de 48 datas, Copa de 64 participantes e chaves de desempate renovados; estatísticas da nova Temporada zeradas e Histórico anterior preservado.
  - Saldo, extrato, força, potencial, salário e valor de mercado finitos; força/potencial em 1..99 e condição/moral em 0..100. Média de força de cada Divisão não deve variar mais de 15 pontos em relação ao início do mesmo cenário nas primeiras 10 Temporadas; registrar médias por Divisão e Porte no MOTOR.md para distinguir efeito do acesso/rebaixamento de deriva do motor.
  - Regressões específicas cobrem Transferências/Trocas entre e dentro de Divisões e gols de Copa, Save e Histórico; desfalques antes/durante a Partida; renovação menor; dívida preservada e receitas iguais para Técnico/IA. Reutilizar `novaCarreira`, ações públicas, `simularRodada`, `fimDeTemporada` e o Storage em memória, sem novo framework ou camada de simulação.
- Save: testado com um `Storage` em memória injetado na função de Save (único ponto que toca o navegador); round-trip de JSON da `Carreira`.
- UI: sem testes automatizados nesta feature; cada ticket verifica manualmente no `npm run dev` e mantém `npm run build`, `npm test` e checagem de tipos passando.
- **R15-12 — Orçamento dos testes:** prior art: testes atuais de Temporada, finanças, tática, Partida, mercado e Save. A suíte serial de referência passou com 232 testes em 183,55 s; o teste de acesso passou isolado em 1.744 ms, mas já excedeu o default de 5 s sob concorrência. Definir limites explícitos por teste que simula Temporadas completas, inclusive os existentes ainda com default: referência inicial de 30 s para uma Temporada, 60 s para cinco e 120 s por cenário de dez, ajustadas com margem a partir de medições isoladas e na suíte padrão. Manter os limites explícitos já existentes nas calibrações. Registrar tempos e comando; não tratar lentidão como falha funcional nem usar somente execução serial para esconder timeout da suíte padrão. Se precisar reduzir N ou separar testes lentos, manter execução de todas as calibrações e explicar a evidência/cobertura equivalente; não afrouxar metas estatísticas para fazer passar.

### Cobertura da emenda do ticket 15

- Todos os requisitos R15-01 a R15-12 são cobertos pelos critérios com os mesmos identificadores no ticket 15. São complementos às US existentes (15, 20, 24–27, 33–40, 42–58), não novos tickets. A cobertura das demais US e o estado concluído dos tickets 01–14 permanecem no index original.

## Out of Scope

- Estaduais, Libertadores, Sul-Americana, Série D jogável (o Pool não disputa liga).
- Demissão do Técnico e propostas de outros clubes ao Técnico.
- Estádio (ampliação) e preço de ingresso configurável.
- Multiplayer/hot-seat, contas, backend, sincronização de Saves.
- Nomes reais de Jogadores.
- Agentes livres, empréstimos, cláusulas contratuais, prorrogação, gol fora de casa, VAR.
- Migração de Saves entre versões do formato.
- Testes automatizados de UI.

## Further Notes

- Listas de clubes conferidas na Wikipédia (pt) em 2026-10-02. Porte é uma decisão de jogo do planner (não um dado oficial).
- As constantes numéricas acima são pontos de partida; as metas de calibração são o requisito. O MOTOR.md registra os valores finais.
- A emenda do ticket 15 incorpora as decisões econômicas e de atribuição de gols registradas no brief. Notas de implementação já resolvidas viram regressões/documentação, não trabalho de reconstrução dos tickets 01–14. Nenhuma nova autorização de commit ou push faz parte da emenda.
