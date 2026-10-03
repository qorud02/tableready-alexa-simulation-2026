# Observed friction and feature requests

## F1 — locating the simulated-experience requirements
- Task: determine the required runtime for a simulated Alexa+ entry.
- Steps: read the primary track description, technical requirements and simulation exception in https://amazonappdev2026.devpost.com/rules.
- Expected: a route-specific checklist.
- Observed: the simulation exception resolves the requirement but is separated from the initial Agent Skill/MCP description.
- Severity: important documentation friction.
- Workaround: record the chosen route in the README.
- Suggestion: put a simulation checklist beside the integration routes.

## F2 — reusing a quote after a stock update
- Component: TableReady's custom local tools.
- Steps: create the curry plan, set simulated coconut-milk stock to zero, then confirm the original plan.
- Expected: preserve the approved quantities and quote, or request a fresh decision.
- Observed: commitPlan rejected the plan with a workspace-change response. Zero orders and zero calendar entries were created.
- Severity: critical when connecting a purchase tool.
- Workaround: replan and inspect the fresh confirmation.
- Suggestion: return a structured quote-version error with the changed item and a re-quote action.

## F3 — cancelling after newer catalogue work
- Component: TableReady's custom local tools.
- Steps: confirm a meal, update the catalogue in a separate copy of the confirmed workspace, then cancel the earlier meal.
- Expected: reverse that transaction while keeping the later catalogue update.
- Observed: cancellation was blocked because revision 4 followed the confirmed revision 3.
- Severity: important product limitation.
- Workaround: restore only the latest unstarted plan without a later revision.
- Suggestion: use per-transaction compensating changes when connecting independent services.

The reproducible local comparison results are in selection_scenarios_20261004.json. F2 and F3 concern TableReady's own tools.
