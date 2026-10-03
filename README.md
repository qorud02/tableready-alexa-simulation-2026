# TableReady

**An Alexa+ experience simulation with a real local agentic planner.**

TableReady turns a household dinner request into a plan across pantry inventory, recipe choices, a grocery quote and a preparation calendar. It compares alternatives, responds to changed constraints, and makes the exact actions visible before confirmation.

The planning and local state changes execute in JavaScript. Grocery and calendar integrations are simulated service adapters with fictional data. No card is charged and no external account is connected.

## Run and test

Node.js 20 or later. No dependencies, API keys, Amazon developer account or AWS billing are required.

```sh
npm start
# http://127.0.0.1:8766

npm test
```

The app can be published directly on any static host; there is no build step. Opening index.html as a local file does not work with ES modules. Source repository licensing: MIT.

## A complete demonstration

1. Select **Plan tomorrow**. Four candidates are actually evaluated from the current pantry, catalogue, time and preferences. The lentil bowls use existing ingredients; the peanut noodles conflict with the household's declared exclusion.
2. Select **Try the curry**. The agent retains tomorrow's dinner time and compares a new recipe. The initial curry basket is two chickpea cans, a coconut-milk can and spinach: **$7.55**.
3. Open **Pantry & services**, change coconut milk stock to zero, and return to the earlier plan. Its confirmation is stale and fails. Ask for a new curry plan; the stock constraint now blocks it.
4. Restore coconut stock, request the curry again and inspect the exact confirmation. Confirm. Pantry quantities, catalogue stock, receipt, local calendar, preferences and action ledger change together.
5. Open **Activity & memory** and inspect the recorded action sequence. Reload: saved quantities, preferences and receipts remain.
6. Cancel the latest plan before preparation starts. The original pantry and catalogue are restored; cancellation records remain. Automatic reversal is blocked after newer workspace changes or the start of preparation.

## Supported request language

- “Dinner tomorrow at 7 pm for 4, vegetarian, under $18.”
- “Switch to curry.”
- “Under $8.”
- “Plan dinner tomorrow at 7 pm for six, vegan, under $10, no peanuts.”
- “Avoid milk.”

The parser recognises diners, today/tonight/tomorrow, time, budget, vegetarian/vegan, declared peanuts/milk/wheat exclusions and recipe names. Unknown requests ask a question. It is a bounded intent parser, not a general language model. Pending recipe changes retain the meal time and constraints. Only confirmation updates saved household preferences.

## Agent and tools

`agent.js` is the local agentic tool. It calls pantry retrieval, recipe comparison, basket quotation and calendar checking, then waits for consent. Four feasible/infeasible candidates are shown with actual calculated reasons. The trace displays the inputs and outputs produced by those functions.

Hard constraints: declared ingredient exclusions, diet, shopping budget, pack stock, preparation lead time and calendar overlap. Feasible options are ranked by near-date pantry use, pantry coverage, shopping cost and preparation time. Explicit recipe choice retains all hard constraints. A changed quote requires replanning.

`commitPlan` verifies the revision and freshly computed confirmation snapshot before mutating a clone of the workspace. An idempotency key returns the first receipt on duplicate confirmation. The local transaction updates inventory, catalogue stock, order, calendar, preference memory and action ledger. `cancelPlan` restores the saved inventory/catalogue only where no later action could be overwritten.

## Scope of the service simulation

The hackathon's simulated Alexa+ route allows agentic tools without a specific SDK or MCP runtime. TableReady implements that route with JavaScript planning and local service adapters.

Ingredients, prices, stock and preparation times are authored demonstration fixtures. Ingredients-to-avoid checks use each fixture's declared ingredient list. Connecting a real supplier requires authoritative product labels, fulfilment times, authentication, consent and cancellation policies. Preparation steps accompany the fixture recipes; product instructions belong to the supplier integration.

## Files

| File | Role |
|---|---|
| `agent.js` | Intent parsing, tool orchestration, candidate comparison, confirmation and reversal. |
| `fixtures.js` | Fictional pantry, grocery catalogue and four authored recipes. |
| `app.js` | Conversation, candidate cards, consent dialog and local service controls. |
| `styles.css`, `icon.svg` | Original responsive interface and vector identity. |
| `server.js` | Dependency-free development server. |
| `tests/agent.test.js` | Sixteen domain tests for constraints, snapshot integrity, idempotency and cancellation. |
| `ARCHITECTURE.md` | Planning/state contract and future service integration boundary. |
| `submission_description.md` | Entry text for the Alexa+ primary track. |
| `product_feedback.md`, `friction_log.md` | Required tool feedback and observed specification friction. |
| `demo_script.md` | 2:45 demonstration plan. |

## Privacy and persistence

The app uses localStorage in this browser profile. It makes no external runtime requests, uses no analytics, and loads no external fonts or artwork. Text is escaped before rendering. Exporting is an explicit local download. If browser storage fails, a session-only warning is shown. This version has no cloud backup, encrypted storage or verified reviewer identity. Do not use real private household data in the public demo.

## Verification and next development

Sixteen automated tests cover unknown intent, stateful replanning, actual candidate differences, hard constraints, calendar conflict, atomic confirmation, idempotency, stale quotes, exact restoration and reversal limits. Browser layout and operation checks are recorded separately in `QA.md`.

Next: replace individual adapters with authorised services; maintain independent quote versions; represent reservation, arrival and consumption separately; add structured supplier failures and multi-device confirmation delivery. Retain the same inspect-before-mutate contract.

Created for Build, Ship, Shape: Amazon Developer Hackathon, October 2026, by Kyunghan Bae.
