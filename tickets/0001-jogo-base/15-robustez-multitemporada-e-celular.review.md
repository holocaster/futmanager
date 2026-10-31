# Revisão do ticket 15

status: approved
ticket: 15
reviewed_range: d8c403c5b3eaaaf69d469fd6be1f26c9cf20211c..71a5ab0fcce70483d4dbe44f1c5bcf5f36b6b259
correction_rounds: 1
final_feature_conformance: approved

## Standards

Nenhum finding bloqueante. Arquitetura, ADRs e dependências preservados. Preflight BRANCH com snapshots saneados, 179 hashes de fontes verificados e Gitleaks 8.30.1 sem candidatos; sem vulnerabilidade HIGH/MEDIUM de alta confiança nas mudanças. Não foi auditado todo o histórico Git.

## Spec

R15-01 a R15-12 aprovados. Sem finding bloqueante/importante no escopo ativo. F1–F3 da revisão anterior corrigidos e verificados independentemente:

- F1: validação de G concorda com os setores efetivos em Escalações curtas; permuta manual G/D de nove elegíveis permite iniciar Rodada, mantendo ordem e setores. Escalações completas continuam posicionais.
- F2: automática curta preserva os melhores naturais antes de improvisar excedentes; três Formações, Técnico/IA e permutas manuais cobertos.
- F3: patrocínio satura em limite derivado da precisão de Number antes da potência; rateio salarial evita overflow intermediário, lançamentos não finitos são recusados e Save não sobrescreve slot com perda numérica. Igualdade Técnico/IA, dívida e calibração preservadas.

## Verificações independentes

| Comando/cenário | Resultado |
|---|---|
| `npx vitest run src/motor/tatica.test.ts src/save.test.ts src/motor/artilharia.test.ts src/motor/contratos.test.ts --reporter=verbose` | 62 testes, 4,95 s |
| `npx vitest run src/motor/financas.test.ts -t 'rateia salario\|recusa lancamento\|recusa folha\|mantem receitas\|patrocinio cresce\|virada preserva\|saldo muda\|salario e patrocinio' --reporter=verbose` | 11 testes, 1,56 s; seis não selecionados |
| `npx vitest run src/motor/rodada.test.ts --reporter=verbose` | 27 testes, 13,70 s |
| Probes de setores, Save e anos 2026/2035/2134/2135/2136/5826/10000/MAX_SAFE_INTEGER | Finitude, round-trip e preservação do Save passam; saturação inicia em 2135 |
| Chromium 320/390/1280 px | Permuta G/D, setores exibidos, início/pausa e mudança de Formação passam; nove Jogadores preservados; sem overflow/erros JS |
| `npm run build -- --outDir /tmp/opencode/ticket15-review-independent-build` | Typecheck/build passam; bundle confere com evidência fornecida |
| `git diff --check` do intervalo e status/index | Sem erros, checkout limpo, reviewer não editou nem commitou |

Total independente: 100 testes direcionados. Snapshots, mapeamentos e probes em `/tmp/opencode/ticket15-review-c1`. Comandos de evidência: `evidence-check.py`, `/tmp/opencode/ticket15-final-evidence-check.py`, `correction-probes.mjs` e `browser-correction-probe.cjs`.

## Evidência integrada inspecionada e comparada

- Suíte padrão: 262 testes/16 arquivos, 60,73 s. Log `/tmp/opencode/ticket15-c1-npm-test.log`; não repetida integralmente pelo reviewer.
- Três payloads econômicos completos idênticos às medições anteriores, exceto tempo. Pool T8–10: resultado operacional médio R$2,024 mi/R$5,248 mi/R$7,629 mi; Transferências em cada Temporada exigida.
- Saves de cinco Temporadas: 590122/587588/591525 bytes UTF-8, Histórico preservado e determinismo/continuação testados.
- Evidência original de 108 cenários de navegador inspecionada. Medições e limitações em `docs/medicoes-ticket15.md` e `docs/MOTOR.md`.

## Questão conhecida fora do escopo

F4, `src/motor/partida.ts:203–206,223–227`: vaga de lesão mantém setor antigo após mudar Formação. Remover D no 4-4-2, mudar para 3-4-3 e preencher a vaga produz quatro D. Reproduzido independentemente no base e head. Accept and log no brief, planejamento separado; não exige correção neste ticket nem altera aprovação.

## Limitações

- Verificação móvel por viewport Chromium, não aparelho físico ou Safari/iOS.
- Probes de anos extremos são fixtures aceleradas, não simulação de milhares de Temporadas; precisão de Number e armazenamento são finitos.
- Calibração não garante solvência universal nem estabilidade nominal para todo seed/horizonte.

## Conclusão

Ticket 15 e conformidade final da feature aprovados. Todos os tickets 01–15 podem permanecer `done`; commits locais de correção e registros autorizados pelo usuário. Push exige autorização separada.
