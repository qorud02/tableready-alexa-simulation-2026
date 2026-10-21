# Product feedback

## Custom local agentic tools

**Use:** the Alexa+ simulation runtime: request parsing, pantry retrieval, recipe comparison, grocery quotation, calendar checking, confirmation and cancellation.

**Worked well:** callable domain functions made the candidate reasons and tool trace inspectable. The same functions serve the interface and automated tests. Exact snapshots and plan IDs let the app check stale decisions and repeated confirmations.

**Needs work:** the English parser covers a limited set of meal-planning patterns. A shared workspace revision is conservative: unrelated service changes can invalidate a pending plan or block cancellation. Independent supplier integrations need their own quote versions and compensating actions.

**Onboarding:** the runtime started as plain JavaScript modules and authored fixtures. A static server and Node's built-in test runner support development without a service account.

**Would we build with it again?** Yes. Keeping planning and explicit mutation separate provides a practical contract for future connected adapters.

## OpenAI Codex

**Use:** application implementation, domain tests, source review and submission documentation.

**Worked well:** the planner and its tests could be developed alongside the interface. Executable scenarios exposed the difference between a proposed plan, a confirmed receipt and a safe reversal.

**Needs work:** source inspection and domain tests do not inspect the rendered interaction. A separate browser pass remains necessary for layout, keyboard behavior and the recorded demonstration.

**Onboarding:** we used the existing development environment and Node installation. Codex is a development tool; the shipped planner runs its JavaScript directly.

**Would we build with it again?** Yes, with domain tests and browser verification as separate checks.

## Browser standards and Node.js

**Use:** ES modules, HTML, CSS, SVG, localStorage, JSON exports, local static serving and `node:test`.

**Worked well:** the project runs without package dependencies or a build step. All 23 domain tests pass with one command. Committed data can be retained and inspected on the same device. Text input supports the complete demonstration.

**Needs work:** localStorage is tied to a browser profile and can be cleared or unavailable. Connected use needs durable account-based storage.

**Onboarding:** `npm start` serves the application and `npm test` executes the domain suite.

**Would we build with it again?** Yes for a portable simulation, with authenticated service adapters and server-side transaction checks for a connected product.

## GitHub Pages

**Use:** host the static application from its source repository.

**Worked well:** the existing deployment completed successfully, and the same static files can be served locally. Source, setup instructions and the MIT license are available together.

**Needs work:** the initial Pages API status was null. A later query to the latest-build endpoint was needed to confirm completion.

**Onboarding:** the source was placed in a public repository and Pages was enabled using the existing GitHub account.

**Would we build with it again?** Yes for this static application and downloadable source package.

## AI Voice Generator

**Use:** generate the demonstration's English narration with the standard `clear` voice preset.

**Worked well:** short scene transcripts returned downloadable MP3 clips. Eight clips could be measured and placed against the application's recording timeline.

**Needs work:** the full voiceover response linked to a viewer page rather than a direct audio file. We used the short-clip download URLs and aligned the scene audio locally.

**Onboarding:** the connected tool accepted the transcript and voice preset. Each scene paragraph was kept within its 500-character preview limit.

**Would we build with it again?** Yes, with separate scene files for easier timing adjustments.

## FFmpeg

**Use:** decode the narration clips, normalize their levels, make small timing adjustments where needed, and assemble a 160-second audio master.

**Worked well:** measured PCM sample counts provide a reproducible duration and subtitle scene boundaries.

**Needs work:** timing audio does not establish that the corresponding screen action is visible. Each clip still needs to be checked against the real app recording.

**Onboarding:** an existing local FFmpeg installation was used by the audio assembly script.

**Would we build with it again?** Yes for repeatable audio assembly and final video encoding.
