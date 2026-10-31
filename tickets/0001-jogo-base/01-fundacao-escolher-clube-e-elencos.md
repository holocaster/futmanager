# 01: Fundação - escolher Clube e ver Elencos

**What to build:** O Técnico abre o site, clica em "Nova carreira", vê os 60 clubes das Séries A, B e C de 2026 agrupados por Divisão (com cores, cidade/UF e Porte), escolhe um e cai no painel do seu Clube com saldo inicial e o Elenco em tabela densa. Pode abrir o Elenco de qualquer outro Clube (inclusive do Pool da Série D). Estabelece o projeto (Vite + React + TS + Vitest), o RNG com seed, os dados fixos de clubes, a geração de Jogadores, valor de mercado/salário, o objeto `Carreira`, o tema escuro e o `docs/MOTOR.md`.

**Blocked by:** None (can start immediately)

**Spec:** `docs/specs/0001-jogo-base.md` - Arquitetura, Estado da carreira, RNG determinístico, Dados de clubes, Jogador e geração, Valor de mercado e salário, Finanças (saldo inicial), UI, Documento do motor. **ADRs:** 0001, 0002.

- [ ] Projeto Vite + React + TypeScript com Vitest; scripts `dev`, `build`, `test`; motor em `src/motor/` sem React nem APIs do navegador
- [ ] RNG com seed (estado serializável na `Carreira`); nenhum `Math.random` no motor
- [ ] Dados fixos dos 68 clubes exatamente conforme as tabelas do spec (20 A, 20 B, 20 C, 8 Pool), com id, nome, nome curto, cidade, UF, 2 cores, Porte
- [ ] `novaCarreira(seed, clubeId)` gera Carreira de 2026 com 25 Jogadores fictícios por Clube (3 G, 8 D, 8 M, 6 A), nomes brasileiros, idade 17-35, contratos 1-4 anos, salário e saldo inicial por Porte
- [ ] Testes: mesmo seed gera Carreira idêntica (JSON); seeds diferentes geram Carreiras diferentes; composição dos Elencos; força média do Elenco cresce com o Porte; ids de Jogador únicos; valor de mercado cresce com a força e cai com a idade
- [ ] UI: tela inicial com "Nova carreira", escolha de Clube por Divisão, painel do Clube, tabela de Elenco (posição, nome, idade, força, condição, moral, salário, contrato, valor) e Elenco de outros clubes; tema escuro com variáveis CSS; escudo simplificado com as cores do Clube; layout que empilha no celular
- [ ] `docs/MOTOR.md` criado em português com seções Geração de Jogadores, Valor de mercado e salário e Saldo inicial (fórmulas e constantes reais); demais seções como títulos a preencher pelos próximos tickets
- [ ] `npm test` e `npm run build` (com checagem de tipos) passam; `npm run dev` abre o jogo e o fluxo deste ticket funciona manualmente
- [ ] Sem dependências além das listadas em Arquitetura do spec; sem comentários desnecessários; sem emojis
