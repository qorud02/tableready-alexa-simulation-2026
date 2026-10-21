# Observed friction and feature requests

## F1. Finding the Alexa+ simulation checklist

- **Task:** determine the implementation requirements for the simulated-experience route.
- **Steps:** read the Alexa+ primary-track description and the runtime requirements in the [official rules](https://amazonappdev2026.devpost.com/rules).
- **Expected:** one checklist for each entry path.
- **Observed:** the detailed simulation exception sits after the general Agent Skill/MCP and runtime-integration requirements. Reading that exception resolves the distinction.
- **Severity:** important documentation friction.
- **Workaround:** identify the simulation route explicitly in the project description and link it to the executing code and demonstration.
- **Suggestion:** put separate Agent Skill, MCP and simulated-experience checklists together beside the track description.
- **Priority:** important.

## F2. Recovering from a changed grocery quote

- **Component:** TableReady's custom local tools.
- **Task:** recover a pending curry plan after stock changes.
- **Steps:** request curry; set coconut-milk stock to zero; attempt confirmation; request curry again.
- **Expected:** identify the changed item and offer a fresh comparison without executing the old basket.
- **Observed:** confirmation returns a workspace-change message and creates no order or calendar entry. Replanning identifies the stock constraint. The current revision error does not name the changed item.
- **Severity:** important recovery friction.
- **Workaround:** replan and inspect the updated candidate reasons.
- **Suggestion:** return the changed quote fields with a one-step re-quote action. Preserve the user's constraints while asking for the next decision.
- **Priority:** important.

## F3. Cancelling after a later catalogue change

- **Component:** TableReady's custom local tools.
- **Task:** cancel an earlier confirmed meal while keeping later catalogue work.
- **Steps:** confirm a meal; update the catalogue; attempt to cancel the meal before preparation.
- **Expected:** reverse the meal's own allocations while retaining the later catalogue update.
- **Observed:** the current whole-workspace revision guard blocks automatic reversal.
- **Severity:** important limitation for independent service adapters.
- **Workaround:** automatic restoration is available for the latest unstarted plan before another service update.
- **Suggestion:** store transaction-specific compensating changes and handle each supplier's cancellation response independently.
- **Priority:** important.

F2 and F3 describe the custom simulation tools. The repository's tests and `selection_scenarios_20261004.json` provide reproducible local cases; the latter records the original scenario run.
