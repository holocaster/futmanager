status: approved
ticket: ["12", "13", "14"]
reviewed_range: 5cde57e33468d3e7afc6d1c98fd2f31e2c1d4197..463cc5448dd54f8559f3eeeb4e50a34e4e7dbbdc
working_tree_snapshot: /tmp/futmanager-batch12-14-working.patch
snapshot_sha256: 8b5e8a7db79d3a0969964aea426e4ae72c3030b9a7e1d195e7cfbb9ef5fa7407
review_round: 2
user_decision: "2026-10-03: proposals based on asking price above market value are accepted; no additional ceiling. Corrections reviewed as an uncommitted snapshot; user subsequently authorized the local commit."
criteria: all acceptance criteria pass
findings: []
corrections: stale offers removed on every market move; acceptance/counterproposal require ownership and pending offer; swap requires explicit selection; market runs on Copa dates during open windows; financial calibration uses 30 consecutive seeds with >=90% pass rate per division
checks:
  - independent serial suite: 232 tests / 14 files passed in 194.05s (npm test -- --no-file-parallelism)
  - independent build and TypeScript check: passed
  - independent browser: swap starts empty with submit disabled; explicit selection enables it
  - frozen snapshot verified against checkout; HEAD unchanged
out_of_scope: payroll/Pool stability remains ticket 15; parallel suite timed out in an existing promotion test at 5s, same unchanged test passed alone and full serial suite passed; use explicit long-simulation budgets in ticket 15
