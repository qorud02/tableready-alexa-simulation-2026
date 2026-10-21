# TableReady demonstration — 160 seconds

## Recording setup

Record the working app at a readable desktop size, beginning with fresh fictional fixture data. Use tomorrow's dinner so the preparation interval remains in the future. Keep the browser's date and local timezone visible when useful. Use English narration and readable English interface text. Publish the final video publicly on YouTube or Vimeo and place its URL in the Devpost video field.

Use typed conversational requests in the working application. Capture every operation shown in the final edit from the running app.

## Timeline and narration

| Time | Actual screen action | English narration |
|---|---|---|
| 0:00–0:14 | Show TableReady and the Alexa+ simulation label. Enter `Dinner tomorrow at 7 pm for four, vegetarian, under $18`. | “TableReady is an Alexa+ dinner-planning simulation. One request checks the pantry, meal options, grocery basket and preparation time. The services use fictional data; the planner and state changes run here.” |
| 0:14–0:36 | Submit. Show the four cards and expand `recipes.compare` input/output. | “Four recipes are calculated against the same request. Lentil bowls use the pantry. Peanut noodles conflict with the household's peanut exclusion. The trace shows the actual tool inputs, costs and reasons behind the comparison.” |
| 0:36–0:54 | Enter `Switch to curry, under $8`. Show four diners, tomorrow at 7 pm, and $7.55 total. | “I can change my mind without repeating everything. Curry, under eight dollars, keeps the diners and dinner time. The pantry supplies the rice; chickpeas, coconut milk and spinach cost seven dollars fifty-five.” |
| 0:54–1:22 | Open Pantry & services; set coconut stock to 0 and save. Return to planner, inspect and attempt confirmation. Show stale rejection. Enter `Switch to curry` again; show stock failure. | “Now stock changes after the quote. Confirming the old basket is blocked. A fresh request finds the unavailable ingredient and asks for a change. The assistant preserves the decision boundary when service conditions change.” |
| 1:22–1:48 | Restore coconut stock to 5, price $2.20. Return and request curry again. Open exact confirmation; show rice 280 g, basket $7.55, 25-minute preparation interval. Confirm. | “Restoring stock produces a new plan. Before committing, I see the exact pantry quantities, grocery packs and preparation interval. Confirmation checks the quote again, then records the inventory allocation, simulated order and calendar booking together.” |
| 1:48–2:10 | Show Pantry & services: rice 340 g, coconut stock 4, scheduled meal. Show Activity & memory and reload. | “The rice quantity falls from six hundred twenty to three hundred forty grams. The receipt, calendar and action ledger are saved. Reloading keeps the confirmed state and household preferences on this device.” |
| 2:10–2:29 | Return to planner; cancel the latest plan before any further service update. Show cancelled receipt, then restored rice 620 g and coconut stock 5. | “Plans change after confirmation, too. Cancelling this unstarted plan restores the previous quantities and retains its cancellation history. Later workspace changes would block an older reversal from replacing newer work.” |
| 2:29–2:40 | Show tool trace or Agent method, then the real app and repository URLs. | “TableReady carries a conversation through comparison, service failure, confirmation and recovery. The source, setup instructions and executable tests make each step inspectable.” |

## Continuity checks

- Fresh fixture curry basket: chickpeas 2 x $1.55, coconut milk 1 x $2.20, spinach 1 x $2.25 = **$7.55**.
- The pantry supplies **280 g rice**. Confirmation changes rice **620 -> 340 g**, coconut stock **5 -> 4**, chickpea stock **10 -> 8**, and spinach stock **4 -> 3**.
- Reload only after confirmation. Pending conversations are session state; confirmed workspace data persists.
- Do not update any service after the successful confirmation and before cancellation. Reloading or navigating pages does not alter the revision.
- The film demonstrates one successful confirmation. Duplicate-confirmation behavior belongs to the automated tests unless it is separately captured in the application.
- Keep source/service disclosures concise. Show the working simulation rather than substituting a narrated slideshow for the required demonstration.
