status: approved
ticket: ["06", "07", "08"]
reviewed_range: 74ad3f80eb2bb7136922b1baf36cdd5b9c3b49ea..539d4d5628c66e6e53f35f43e8ba97ffcadd7e28
criteria: all pass (06, 07, 08, save version rule, full test+build)
findings:
  - severity: suggestion (routed via brief)
    location: docs/MOTOR.md ofensiva season cost
    impact: documented as ~18%; real cost ranges ~-20% (dominant clubs) to ~-35% (mid-table Série A).
notes:
  - VERSAO_CARREIRA = 2 resolves the old-save crash; full suite 133 tests passed (reviewer ran it)
residual_risks:
  - UI not re-run in round 2 (constant/version/docs change only)
