# ADR 0001 - SPA só no navegador, com saves locais

Status: aceito (brief 0001, confirmado pelo usuário na descoberta)

## Contexto

O FutManager é um jogo single-player de técnico de futebol. Não há contas, multiplayer nem sincronização entre dispositivos no escopo.

## Decisão

O jogo é uma SPA estática (Vite + React + TypeScript) sem backend. Todo o estado da carreira roda no navegador e os Saves ficam no `localStorage` (3 slots). O motor de simulação é TypeScript puro, sem dependência do navegador.

## Consequências

- Hospedagem estática, custo zero de servidor, jogo funciona offline depois de carregado.
- Saves presos ao navegador/dispositivo; limpar dados do navegador apaga os Saves.
- O tamanho do Save precisa caber na cota do `localStorage` (alguns MB).
- Reverter exige criar servidor, persistência e contas de usuário.
