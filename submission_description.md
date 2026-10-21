# Devpost submission

## Project name

TableReady

## Tagline

An Alexa+ dinner-planning simulation that checks the pantry, compares meals and confirms every action before it changes your plan.

## Primary track

Alexa+ — simulated experience using custom local agentic tools.

## Mini challenges

None.

## Inspiration

A dinner request hides several decisions: what is already in the kitchen, what everyone can eat, what needs buying, and whether there is time to prepare it. The useful part of an assistant is carrying those details through a change of mind, a stock problem and a final decision.

TableReady brings them into one inspectable plan. The household keeps control of the ingredients, cost and preparation time before the assistant changes anything.

## What it does

Enter “Dinner tomorrow at 7 pm for four, vegetarian, under $18.” TableReady retrieves pantry lots, compares four recipes, quotes the missing grocery packs and checks the preparation calendar. Each candidate shows its cost, pantry coverage and reasons it can or cannot meet the request.

“Switch to curry, under $8” changes the recipe and budget while retaining the dinner time and diners. In the starting fixture, the curry needs a $7.55 basket and uses 280 grams of pantry rice. If coconut-milk stock changes after that quote, confirmation stops. Replanning exposes the shortage and lets the user choose what to change.

The confirmation shows exact pantry quantities, grocery packs, total and preparation interval. The planner verifies them again before recording the local inventory allocation, simulated order, calendar booking and household preferences. A repeated confirmation returns the same receipt. Saved state survives a page reload.

The latest plan can be cancelled before preparation starts. The pantry and catalogue are restored, and the cancelled order and appointment remain in the history. Newer workspace changes block an older reversal from overwriting them.

## How we built it

TableReady follows the hackathon's **simulated Alexa+ experience** route. Its custom agentic tool is a deterministic JavaScript planner with a bounded English parser and callable pantry, recipe, basket and calendar functions. The tool trace displays the inputs and outputs produced by those calls.

The grocery and calendar adapters are local simulations with authored prices, stock and recipes. The interface uses conversational requests, comparison cards and an explicit confirmation dialog. Browser localStorage retains committed state. Node's built-in test runner exercises the same domain functions used by the app.

The demonstration uses typed conversational requests and shows each proposed action before confirmation.

## Challenges we ran into

A plan must remain correct between comparison and confirmation. We addressed that with a workspace revision, an exact snapshot and fresh calculation at confirmation time. The reverse action needed its own boundary: restoring the latest plan is useful, but restoring an old snapshot over later changes would lose work.

Conversation changes also needed precise context. Recipe, budget or time corrections must preserve the fields the user did not change. The parser supports a defined set of dinner-planning requests and asks for clarification outside them.

## Accomplishments that we're proud of

The demonstration completes a full decision: request, compare, revise, handle changed stock, confirm, reload saved state and cancel. Every calculation and state change runs in the application, with an inspectable tool trace and action ledger.

All 23 automated domain tests pass, covering conversation context, candidate comparisons, constraints, confirmation integrity, duplicate execution and cancellation. The project runs from one command with no package installation or build step.

## What we learned

Showing why an alternative fails can be as useful as showing the selected meal. A clear assistant also needs to distinguish a proposal from a committed action. Tying confirmation to the exact basket and time made the interaction, tests and recovery behavior easier to reason about.

## What's next for TableReady

Connect authorised pantry, supplier and calendar services. Replace the shared revision with individual quote versions, model reservation and delivery separately, and use supplier cancellation responses. Test how households compare alternatives and recover from changes before expanding the recipe catalogue and conversation model.

## Built with

JavaScript, HTML5, CSS3, SVG, localStorage, Node.js, node:test, custom local agentic tools, OpenAI Codex, GitHub Pages.

## Additional information: Alexa+ implementation

**Selected path: simulated Alexa+ experience.** The web app executes custom local agentic tools in `agent.js`, called by `app.js`. `parseRequest` interprets supported dinner requests; `buildPlan` orchestrates pantry retrieval, recipe comparison, basket quotation and calendar checking. `commitPlan` validates and records a confirmed action; `cancelPlan` performs guarded restoration. The repository includes the simulation source, fixture data, setup instructions and tests. The demo shows those functions working through the interface.

## Additional information: product feedback

See `product_feedback.md` for each tool's use, strengths, limitations, onboarding experience and reuse decision. `friction_log.md` records observed specification and implementation friction with reproduction steps and proposed improvements.

## Additional information: work during the submission period

TableReady was created for this hackathon. The October 22 revision clarifies the simulated-experience route, strengthens follow-up request handling, and adds an end-to-end demonstration of stock changes, confirmation, persistence and cancellation. The repository records the implemented changes and tests.

## Testing instructions

Run `npm start` and open `http://127.0.0.1:8766`; run `npm test` for the domain suite. Use the scenario in the README, starting with tomorrow's dinner and the initial fixture data. The complete 160-second recording sequence is in `demo_script.md`.
