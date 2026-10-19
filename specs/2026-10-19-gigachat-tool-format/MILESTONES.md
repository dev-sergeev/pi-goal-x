# Implementation log

## Discovery and API baseline

- Captured actual tool definitions through the installed pi 1.0.0 SDK: eight registered tools and the isolated oracle submission tool.
- OAuth succeeded with the supplied authorization key and `GIGACHAT_API_PERS`. Used the documented Russian Trusted Root CA in a temporary file with TLS verification enabled; no credential/token files were created.
- Live `/v1/functions/validate`, rules 1.0.6: seven descriptions failed, two passed. Failures were missing parameter descriptions and union fields without explicit types.
- Two independent read-only investigations covered repository contracts and authoritative API documentation. Public docs do not enumerate the validator's entire recursive dialect; implementation decisions use live evidence rather than inferred blanket keyword bans.

## Implementation

- Added meaningful descriptions at existing root/nested parameter and array-item definitions. Reused pi-ai `StringEnum` for oracle disposition and continuation discriminants.
- Added `goal-gigachat.ts`, composed with the existing provider-request/cache hook. It projects only this package's continuation and nullable drafting-budget declarations, and only for identified GigaChat requests. Both native `functions` and nested OpenAI-style `tools` envelopes are handled; other tool schemas and registered local schemas remain unchanged.
- Preserved local integer/null and ready/wait unions. Transport projection emits a concrete continuation object and integer `nullable: true` budget.
- Added real-SDK argument-validation regressions, provider isolation checks, and malformed continuation state-preservation coverage. Included the new test entry in the runner manifest.

## Failed attempts and corrections

- Bun fetch and system curl initially rejected the GigaChat certificate chain. Downloaded the CA from the location linked by the official certificate guide; authenticated calls then succeeded without disabling TLS verification.
- Nullable integer type arrays passed local validation but failed GigaChat validation. An integer schema with `nullable: true` passed GigaChat but rejected null locally; pi would erase an optional null. This required a wire-only schema projection.
- Adding `type: object` to the existing continuation union passed `/functions/validate` but actual `/chat/completions` returned 422: `Field 'properties.continuation.properties' is missing`. Explicit wire properties are necessary.
- Initially flattened the registered continuation too. Targeted review found that SDK optional-null normalization could erase forbidden wait-only fields on a ready decision. Reproduced all four cases with the real SDK, restored the local union, and restricted flattening to the wire projection. Afterward all four cases fail local validation before execution.
- Initial new test assumptions needed correction: SDK's existing budget union coerces zero to null, so an assertion that all nonpositive inputs throw was unrelated and false. Removed that assumption; explicit null, omission, positive budgets, existing invalid-budget handler coverage remain intact.
- A raw goal-object comparison also treated normalization's removal of own undefined fields (including nested scheduler dispatch) as a mutation. Compare the full JSON-persistable goal state instead; meaningful state changes are still rejected.
- TypeScript checks caught the SDK's `JsonObject` argument requirement and a nullable `asRecord` candidate assigned to an optional record. Used the SDK argument type and an explicit candidate guard; final typecheck and lint both pass.

## Live verification

- Final nine-description validator sweep: all HTTP 200 and `Function is valid`, rules 1.0.6, no errors. Only documented optional `return_parameters`/`few_shot_examples` warnings remain.
- Real SDK capture verifies native/wrapped projections match and explicit `token_budget: null` remains an own property after SDK argument validation. Omission and positive integer budgets retain their meanings.
- Actual GigaChat-2 generation accepts the complete nine-function payload and produces valid `get_goal` summary arguments and an `update_goal` wait decision with kind, reason, and future deadline. Generated get/wait arguments also pass local SDK validation.
- Limitation observed, not hidden: requests to GigaChat-2, GigaChat-2-Pro and GigaChat-3-Pro asking for an explicit null budget sometimes produced numeric values instead. Format acceptance is not a guarantee of model obedience. Kept the existing confirmation dialog and documented reviewing the proposed budget rather than inventing a numeric sentinel or changing budget semantics.

## Final local verification and cleanup

- `npm run check`: passed.
- `npm run lint`: passed.
- `npm run test:all -- --selfcheck`: 1108 passed, 0 failed, 0 skipped. Manifest matches 78 unit, 1 integration, and 5 e2e entry files.
- Removed temporary schema-capture/argument-check scripts and the temporary CA file. No credentials or access tokens were added to project files. README and model/provider configuration remain unchanged.
