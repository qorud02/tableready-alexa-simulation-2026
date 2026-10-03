# Observed friction and feature requests

## F1 — understanding the simulation route

- **Task attempted:** determine which technology must actually run in an Alexa+ simulation submission.
- **Steps:** read the primary track requirements, the runtime-technology requirement and the later simulated-experience exception in the official rules.
- **Expected:** one clear route-specific checklist.
- **Observed:** the primary description starts with Agent Skill/MCP, while the detailed exception permits any AI or agentic tool without that surface. The exception resolves the requirement, but requires reading several sections together.
- **Severity:** important.
- **Workaround:** record the chosen simulation route explicitly in the README and demonstrate the actual local agentic tool calls.
- **Suggestion:** put a separate “simulated Alexa+” checklist alongside the Agent Skill and MCP paths, with a minimal accepted runtime example.

## F2 — quote and consent contract

- **Task attempted:** keep one dinner plan valid while the simulated supplier price or stock changes.
- **Steps:** create a curry quote, change coconut-milk price or stock, then attempt the original confirmation.
- **Expected:** either the exact approved quote executes or a changed condition asks for a new decision.
- **Observed:** a simple unchecked action could execute against changed service state. The implementation now recomputes the plan and blocks a mismatched revision or snapshot.
- **Severity:** critical for a connected purchase integration.
- **Workaround:** snapshot-based consent, fresh feasibility checks and an idempotency key.
- **Suggestion:** a reference purchase-agent pattern with quote versions, expiry, consent summary and structured stale-quote responses would help developers build consistent confirmations.

## F3 — reversal after newer work

- **Task attempted:** cancel a confirmed plan after another catalogue update.
- **Steps:** confirm a meal, change catalogue stock, then cancel the earlier meal.
- **Expected:** cancellation should affect only the earlier transaction.
- **Observed:** restoring an old whole-state snapshot could erase later changes. The current demo therefore blocks automatic reversal after a newer revision.
- **Severity:** important.
- **Workaround:** allow exact restoration only for the latest unstarted plan.
- **Suggestion:** document a compensating-action example across order, inventory and calendar tools, including partial supplier cancellation and retained receipt history.

F2 and F3 are observed development issues in the custom local tools; they are not claims of defects in an Amazon API. F1 concerns the reviewed official entry specification.
