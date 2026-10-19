# Implementation

- Add missing schema descriptions at existing tool definitions; reuse `StringEnum` from pi-ai.
- Preserve the local scheduling discriminated union and its exact required/forbidden fields. Project it to a single explicitly typed object only in GigaChat wire declarations: `kind` is required, while wait-only field dependencies are described and remain enforced by local SDK validation and the scheduler.
- Keep the drafting budget's integer/null union for local SDK validation. TypeBox 1.3 does not implement OpenAPI `nullable`, and an integer schema with `nullable: true` would silently discard optional nulls in pi-ai validation.
- Adapt the two incompatible fields in GigaChat requests: project `update_goal.continuation` to an explicit object, and `propose_goal_draft.token_budget` to an integer with `nullable: true`. Preserve descriptions/bounds and copy only changed declaration paths. Both native `functions` and nested OpenAI-style `tools` require GigaChat model/provider/base-URL identification; legacy OpenAI function envelopes must remain unchanged.
- Compose the request transformation with the existing `before_provider_request` cache hook. Do not add authentication/provider registration or transform third-party tool schemas.
- Verify invalid ready/wait inputs, nullable local SDK validation, outgoing nullable declarations, unchanged other-provider payloads, and the oracle enum contract. Run live function validation and a small argument-generation smoke request with real SDK schemas.

# Initial evidence

A real-SDK capture found nine tools. GigaChat validation rules 1.0.6 rejected seven: `get_goal`, `update_goal`, `update_goal_task`, `goal_question`, `goal_questionnaire`, `propose_goal_draft`, and `submit_goal_oracle_advice`. `create_goal` and `set_goal_tasks` were valid. Failures identified missing parameter descriptions and union schemas without explicit types. Valid descriptions reported only optional return-schema/example warnings.

OAuth succeeded using the documented Russian Trusted Root CA in a temporary, process-local certificate file. TLS verification remained enabled. No credentials were written to disk.
