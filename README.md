# TableReady

**An Alexa+ experience simulation that carries a dinner request from pantry check to a confirmed plan.**

TableReady compares four recipes against household ingredients, budget, pack availability and preparation time. Follow-up requests change the plan while retaining the other constraints. Before acting, it shows the exact quantities, basket and calendar interval. A changed quote triggers a fresh decision.

## Hackathon track and runtime

**Alexa+ primary track: simulated experience.** The planner and service actions execute in JavaScript in a web app. Pantry, grocery and calendar adapters use fictional local data. The project uses the [official simulated-experience route](https://amazonappdev2026.devpost.com/rules), which accepts an agentic tool without requiring an Alexa connection, Agent Skill or MCP server.

The runtime is a deterministic tool orchestrator: a bounded English parser calls pantry retrieval, candidate comparison, basket quotation and calendar checks. The visible trace contains those functions' actual inputs and outputs. The service adapters record simulated orders and local appointments.

## Run and test

Use Node.js 20 or later:

```sh
npm start
# Open http://127.0.0.1:8766

npm test
```

There are no package dependencies or build steps. Serve the folder over HTTP; ES modules need a server rather than opening `index.html` directly. The source and original assets use the MIT license.

## Walk through the complete scenario

Start with a fresh demo workspace and use a meal time tomorrow.

1. Enter **Dinner tomorrow at 7 pm for four, vegetarian, under $18.** Inspect all four candidate cards and the tool trace. Lentil bowls use the available pantry; peanut noodles fail the saved peanut exclusion.
2. Enter **Switch to curry, under $8.** Diners and meal time remain. The basket has two chickpea cans ($3.10), one coconut-milk can ($2.20) and one spinach pack ($2.25): **$7.55**. The pantry supplies 280 g of rice.
3. In **Pantry & services**, set coconut-milk stock to **0**. Return to the existing plan and attempt confirmation. The changed revision blocks it. Request curry again to see the stock failure in the new comparison.
4. Restore coconut stock to **5** at **$2.20**. Request curry again, inspect the new basket and preparation interval, then confirm. The workspace records the inventory allocation, simulated order, calendar booking, preferences and action ledger together.
5. Open **Activity & memory**, then reload the page. The receipt, quantities, calendar and confirmed preferences remain in this browser.
6. Cancel the latest plan before preparation starts and before making another service change. Pantry and catalogue quantities return to their previous values, while the cancellation records remain.

The included `demo_script.md` follows this sequence in 160 seconds.

## Requests the parser understands

Examples:

- `Dinner tomorrow at 7 pm for four, vegetarian, under $18`
- `Switch to curry, under $8`
- `Plan dinner tomorrow at 7 pm for six, vegan, under $10, no peanuts`
- `Avoid milk`
- `Make it six people`
- `Raise the budget to $20`
- `Move it to 8:30 pm`

Supported fields are diners (1-8), today/tonight/tomorrow, meal time, budget ($0-$1,000), vegetarian/vegan preference, peanuts/milk/wheat exclusions and one of the four recipe names. The parser handles these patterns and asks for clarification when it cannot form a supported request. Pending context lasts through follow-up requests; confirmation saves household preferences for a later session.

## Planning and confirmation

Hard checks cover declared ingredient exclusions, diet, shopping budget, pack stock, preparation lead time and calendar overlap. Eligible candidates are ranked using near-date pantry lots, pantry coverage, cost and preparation time. Choosing a recipe keeps the hard checks in force.

`commitPlan` checks the workspace revision, the exact confirmation snapshot and a freshly recomputed plan before changing a cloned workspace. Repeating the same confirmed plan returns its first receipt. `cancelPlan` restores the latest unstarted plan only while its revision is still current, preserving later work.

The fixture ingredient declarations support demonstration exclusions; a connected grocery service would need authoritative product labels and fulfilment data. The current inventory model allocates ingredients at confirmation. Reservations, deliveries and physical consumption are separate steps for a future connected adapter.

## Persistence

Workspace data is stored in this browser's localStorage and can be downloaded as JSON. If storage fails, the app displays a session-only notice. Text input and planning run locally. The same request interface is used throughout the demonstration.

## Files

| File | Purpose |
|---|---|
| `agent.js` | Request parsing, planning, snapshot checks, confirmation and cancellation. |
| `fixtures.js` | Authored pantry, prices, stock and four recipe fixtures. |
| `app.js`, `styles.css`, `icon.svg` | Interface, browser persistence and original artwork. |
| `server.js` | Development server. |
| `tests/agent.test.js` | Executable checks for planning, constraints and state transitions. |
| `ARCHITECTURE.md` | Data model, selection policy and service boundaries. |
| `submission_description.md` | Devpost story and track answers. |
| `product_feedback.md`, `friction_log.md` | Tool feedback and observed development friction. |
| `demo_script.md` | English narration and actual recording sequence. |

## Verification and next steps

All **23 domain tests pass**. They exercise candidate selection, conversation changes, hard constraints, stale and altered confirmations, duplicate execution, persistence validation and guarded cancellation. Run `npm test` to reproduce the results.

Next: connect authorised pantry, supplier and calendar adapters; use independent quote versions and supplier cancellation responses; test the experience with households; and keep each action tied to its confirmed basket and time across devices.

Created by Kyunghan Bae for Build, Ship, Shape: Amazon Developer Hackathon, October 2026.
