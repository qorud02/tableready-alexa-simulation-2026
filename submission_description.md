# TableReady — dinner planned across the details

## Tagline

A pantry-aware dinner agent that compares the options, checks the constraints and waits for exact confirmation.

## Primary track

Alexa+ — simulated experience using local agentic tools.

Mini challenges: None.

## Inspiration

“What should we make for dinner?” often means several tasks at once: check what is already available, find a meal everyone can eat, keep the shopping within budget, and leave enough time to prepare it. A conversational assistant becomes useful when it carries those details into a plan people can inspect and act on.

## What it does

TableReady is a working web simulation of that experience. A request such as “Dinner tomorrow at 7 pm for four, vegetarian, under $18” starts a local agentic planner. It retrieves pantry lots, compares four scaled recipes, quotes missing ingredient packs and checks a preparation calendar. Each candidate shows its pantry coverage, shopping total, preparation time and constraint failures.

The user can choose another recipe or change the request. The planner recomputes the actual quantities and quote while retaining the pending meal time. Unknown requests prompt a question. Ingredient exclusions, diet, budget, stock, lead time and overlapping bookings are hard constraints.

Before action, TableReady presents an exact confirmation: pantry quantities, grocery packs, total and preparation interval. Confirmation checks the current revision and re-runs the plan. A changed price, inventory, stock or timing blocks a stale decision. Repeating a confirmation returns the original receipt without double-ordering or double-reserving.

The transaction updates local pantry quantities, simulated grocery stock and receipt, preparation calendar, preferences and an action ledger. The latest plan can be cancelled before preparation starts, restoring the pantry and catalogue while retaining the cancellation history. Later changes prevent an automatic reversal from overwriting newer work.

## How it was built

The custom agentic tool is implemented in dependency-free JavaScript. Its intent parser, candidate comparator, pantry allocation, basket quote and calendar checks run as callable functions. The interface shows the actual tool inputs and outputs, including rejected candidates. HTML, CSS and original SVG artwork create a responsive household workspace, with a conversation, rich recipe cards, consent dialog and service-state controls.

This follows the permitted simulated Alexa+ path. Grocery quotes, inventory and calendar bookings use fictional local adapters. The planner, confirmation checks and state changes execute in the browser. The app requires no account, API key or paid runtime.

## Challenges

The critical challenge was preserving a decision through change. A quote can look reasonable and still become stale after stock, price or timing changes. The confirmation snapshot and re-computation protect that boundary. Reversal required a second boundary: cancellation can restore the latest action, but must not erase later work.

Stateful conversation was another challenge. A recipe correction needs to keep diners, time and budget rather than start over. The bounded parser retains that context and makes unsupported requests explicit.

## Accomplishments

Sixteen domain tests cover actual candidate comparison, request changes, exclusion and budget checks, stock and time failures, calendar overlap, atomic mutations, duplicate confirmation and exact cancellation. The complete workflow is implemented in a browser with persistent local state and readable tool traces.

## What was learned

An agent feels useful when the reason for its choice and the consequences of confirmation are both visible. The interface needs to show rejected alternatives, not only the chosen result. Keeping consent tied to a specific quote also makes replanning and recovery clearer.

## What's next

Replace the local adapters with authorised pantry, supplier and calendar integrations. Use supplier quote versions and cancellation responses, represent reservations and consumption separately, and validate product data. Keep each action tied to its confirmed basket and time across devices.

## Built with

JavaScript, HTML5, CSS3, SVG, localStorage, Node.js, node:test, custom local agentic tools, OpenAI Codex, GitHub Pages.
