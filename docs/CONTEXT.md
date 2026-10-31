# FutManager

Simulador de técnico de futebol brasileiro no navegador, no estilo Elifoot/Brasfoot, em português.

## Language

### Mundo

**Clube**:
Time de futebol real brasileiro, com nome, cidade, estado, cores e porte.
_Avoid_: Time (em código), equipe

**Porte**:
Nível histórico/financeiro de um clube que define a força inicial do elenco, saldo e folha salarial.
_Avoid_: Tier, reputação

**Elenco**:
Conjunto de jogadores com contrato vigente com um clube.
_Avoid_: Plantel, squad

**Jogador**:
Atleta fictício com posição, idade, atributos, salário, contrato, condição física e moral.
_Avoid_: Atleta, player

**Pool da Série D**:
Grupo fixo de clubes fora das divisões jogáveis que trocam de lugar com os 4 últimos da Série C.

### Competições

**Temporada**:
Um ano de calendário com Série A, B, C e Copa do Brasil; termina com acesso/rebaixamento e virada de ano.

**Divisão**:
Liga de pontos corridos (Série A, B ou C), 20 clubes, turno e returno, 4 sobem e 4 descem.
_Avoid_: Liga, campeonato (para divisões)

**Copa do Brasil**:
Torneio mata-mata de 64 clubes; jogo único nas 2 primeiras fases, ida e volta depois, pênaltis no empate.
_Avoid_: Copa (sozinho)

**Rodada**:
Conjunto de partidas disputadas na mesma data do calendário.

**Partida**:
Um jogo entre dois clubes simulado minuto a minuto.
_Avoid_: Jogo (em código), match

### Partida

**Escalação**:
Os 11 titulares e o banco de reservas escolhidos para uma partida.

**Formação**:
Disposição tática dos titulares (ex.: 4-4-2, 4-3-3, 3-5-2).

**Postura**:
Intenção tática do clube na partida: defensiva, equilibrada ou ofensiva.
_Avoid_: Mentalidade, estilo

**Substituição**:
Troca de um titular por um reserva durante a partida; máximo de 5, em até 3 paradas.

**Suspensão**:
Impedimento de jogar a próxima partida por cartão vermelho ou 3 amarelos acumulados.

### Mercado

**Janela**:
Período em que transferências são permitidas: início e meio da temporada.

**Transferência**:
Mudança de clube de um jogador mediante pagamento.
_Avoid_: Compra/venda (no modelo)

**Troca**:
Transferência de jogador por jogador entre dois clubes, com ou sem dinheiro de complemento.
_Avoid_: Permuta. Não confundir com Substituição.

**Proposta**:
Oferta de um clube por um jogador de outro, que pode ser aceita, recusada ou contraproposta.

**Contrato**:
Vínculo de um jogador com um clube, com salário e data de término; pode ser renovado.

### Carreira

**Técnico**:
O jogador humano, que comanda um único clube.
_Avoid_: Usuário, manager

**Save**:
Estado completo de uma carreira guardado em um de 3 slots no navegador.

**Base**:
Jogadores jovens gerados para o clube a cada temporada.
_Avoid_: Juniores, academia

## Decisions

- Aplicação só no navegador (SPA), sem servidor; saves ficam no navegador. ADR proposto no brief 0001.
- Clubes reais; jogadores sempre fictícios, gerados conforme o porte do clube.
- Escopo de competições: Série A, B, C e Copa do Brasil. Sem estaduais e sem competições continentais.
- Um único técnico humano por save.
- Gols pertencem à competição e ao Clube em que foram marcados, mesmo após Transferência do Jogador.
- Receitas recorrentes seguem as mesmas regras para Técnico e IA; o equilíbrio econômico não apaga dívida nem garante solvência de todos os clubes.
- Como o motor funciona está documentado em `docs/MOTOR.md`.
