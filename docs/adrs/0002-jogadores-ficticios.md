# ADR 0002 - Jogadores fictícios gerados pelo Porte do Clube

Status: aceito (brief 0001, confirmado pelo usuário na descoberta)

## Contexto

Os Clubes são reais (Séries A, B e C de 2026 e um Pool da Série D). Manter uma base de jogadores reais exige licenciamento de nomes e atualização constante de elencos e atributos.

## Decisão

Todos os Jogadores são fictícios, com nomes brasileiros gerados por RNG com seed. A força do Elenco de cada Clube é gerada a partir do seu Porte (1 a 5). Jogadores da Base também são gerados.

## Consequências

- Sem problemas de direitos de nome e sem manutenção de base de dados de jogadores.
- O equilíbrio do jogo depende das fórmulas de geração por Porte, documentadas em `docs/MOTOR.md`.
- Reverter exige importar e manter uma base real de jogadores e atributos.
