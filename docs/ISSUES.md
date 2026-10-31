# Questões pendentes

## F4 — Vaga de lesão mantém setor antigo após mudança de Formação

**Status:** corrigido em 0.1.1. Reprodução original e histórico abaixo; a substituição agora produz G/3D/4M/3A.
**Origem:** revisão independente do ticket 15; preexistente, reproduzido no base `d8c403c` e no head `71a5ab0`. Não bloqueia a aprovação da feature `0001-jogo-base`.

### Reprodução

1. Criar um lado completo em 4-4-2 com um reserva disponível.
2. Remover um D por lesão, mantendo a vaga de substituição.
3. Mudar a Formação para 3-4-3.
4. Preencher a vaga de lesão com `substituirNoLado(partida, lado, 45, null, reservaId)`.

**Resultado atual:** a substituição é aceita, mas os setores ficam G/4D/4M/2A, incompatíveis com a Formação 3-4-3.
**Esperado:** a vaga acompanha os setores da Formação atual; preencher a lesão não excede a capacidade dos setores nem acrescenta Jogadores além dos permitidos.

### Causa e pontos de entrada

Em `src/motor/partida.ts`, `mudarFormacaoDoLado` recalcula `lado.setores`, mas não reconcilia `lado.vagas`. `substituirNoLado` reaproveita o setor antigo da vaga e o acrescenta aos setores atuais.

### Verificação da correção

- Regressão pelo fluxo lesão → mudança de Formação → Substituição, incluindo os caminhos do Técnico e IA.
- Preservar quantidade em campo, ausência de reposição para expulsos, máximo de cinco Substituições em três paradas e recálculo imediato das forças.
- Confirmar que vagas de lesão e setores efetivos permanecem coerentes após mudanças repetidas de Formação.

Evidência original: `tickets/0001-jogo-base/15-robustez-multitemporada-e-celular.review.md` e `docs/briefs/0001-jogo-base.md`.

Regressões em `src/motor/partida.test.ts`: caminhos Técnico/IA, mudanças repetidas, duas lesões com uma expulsão, contagens e recálculo imediato. Vagas são redistribuídas nos setores livres, sem descarte por índice e sem novo formato.
