status: approved
ticket: ["03", "04", "05"]
reviewed_range: 5ea430cddd09bbd04a199eb7d5d0bb202db9b79e..7a6333b2fc56989907d8ec947dbc8041c84733ae
criteria: all 21 pass
findings:
  - severity: suggestion (routed to ticket 06 via brief)
    location: src/motor/tatica.ts MULTIPLICADOR_POSTURA, partida.ts forcasDoLado
    impact: ofensiva dominates in expected points in all scenarios; defensiva never helps; 3-4-3 always edges 4-4-2.
  - severity: suggestion (routed via brief)
    location: src/motor/partida.test.ts calibration tests
    impact: rely on default 5000 ms timeout (2253 ms now).
  - severity: suggestion (routed via brief)
    location: src/motor/tatica.ts escalarAutomatico vs escalarAutomaticamente
    impact: confusing names; rename mutating one (e.g. aplicarEscalacaoAutomatica).
residual_risks:
  - saves from intermediate build 1cb4ebf would fail validation (dev-only)
  - mobile layout not exercised
