# Product feedback

## TableReady local agentic tools

**Use:** request parsing, pantry retrieval, recipe comparison, grocery quotation, calendar checking, confirmation and reversal. This custom tool is the runtime used for the Alexa+ experience simulation.

**What worked well:** pure functions made the tool outputs inspectable and repeatable. Candidate comparison and transaction logic can be tested without the browser. Quote revision checks and idempotency required no external dependency.

**What needs work:** the bounded parser cannot interpret arbitrary conversation. The current one-device revision model is conservative: any later service change blocks automatic cancellation. Real suppliers need independently versioned quotes and compensating actions instead of the demo's local restoration.

**Onboarding:** no service account or API key was needed. A static browser app and Node's built-in test runner were enough to execute the full local workflow.

**Build again:** yes. The separation between planning and explicit mutation provides a useful contract for connected services.

## OpenAI Codex — development tool

**Use:** implementation of the original application, test development and source review.

**What worked well:** the domain engine and executable tests could be developed alongside the interface and documentation. Tests made it possible to verify the exact pending request during confirmation and to guard later changes during reversal.

**What needs work:** browser verification needs a separate working browser session. Code and passing domain tests alone do not establish the quality of the rendered layout or actual browser interactions.

**Onboarding:** an existing development environment and Node installation were used. No new runtime account or paid API was added to the app.

**Build again:** yes, with the same separation between executable domain verification and browser verification.

## Browser standards and Node.js

**Use:** ES modules, semantic HTML, responsive CSS, SVG, localStorage, JSON downloads, static serving and the built-in `node:test` runner.

**What worked well:** the application has no third-party package installation or build requirement. Sixteen domain tests run from one command.

**What needs work:** browser storage is device-specific and can fail or be cleared. The interface reports storage failures, but connected use needs durable account-based storage and access controls.

**Onboarding:** `npm start` runs the static server; `npm test` runs the domain suite.

**Build again:** yes for a portable, testable simulation. A connected product would add authenticated adapters and server-side transaction checks.

No AWS, Alexa API, MCP server, Ring or Bee integration was used. No experience with those services is invented in this feedback.
