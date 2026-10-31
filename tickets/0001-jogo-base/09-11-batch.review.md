status: approved
ticket: ["09", "10", "11"]
reviewed_range: d2815ee2695523a9970a2bd6f5d6b981e2c32b4e..ee633350626036d675c737c6426c54668f43fb57
criteria: all pass (renewal criterion fixed in round 2)
findings:
  - severity: suggestion (routed to ticket 15 via brief)
    location: src/motor/contratos.ts renovarContrato; src/ui/TabelaElenco.tsx
    impact: shorter renewal than current Contrato silently succeeds and may raise salary without lengthening.
  - severity: suggestion (routed to ticket 15 via brief)
    location: tatica.ts escalarAutomatico + partida.ts criarLado
    impact: short-handed lineups map titulares to the first N sectors, causing needless out-of-position penalties.
checks: 173 tests pass; 8-Temporada probe on 5 seeds with no renewals - 0 invalid lineups; double-Renovar browser check ok
residual_risks:
  - Técnico-in-Pool not clicked through in UI (motor test covers)
