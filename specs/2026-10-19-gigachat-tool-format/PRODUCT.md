# GigaChat tool descriptions

## Goal

Make pi-goal-x function descriptions accepted by GigaChat's `POST /v1/functions/validate` and usable for argument generation, without changing goal/task/drafting behavior or adding a model provider.

## Requirements

- Cover all eight registered goal tools and the isolated blocker oracle's submission tool.
- Describe parameters, including nested object fields and array items, with explicit supported types and meaningful descriptions.
- Use string enums instead of literal unions for closed string choices.
- Describe scheduling continuation as an object; retain the ready/wait input rules and reject malformed decisions before changing scheduling state.
- Preserve positive integer, omitted, and explicit-null drafting budget semantics. Explicit null still removes the budget. Adapt the nullable schema only at the GigaChat request boundary so local TypeBox validation and other providers retain their existing contract.
- Support native GigaChat `functions` declarations and GigaChat's OpenAI-compatible `tools` declarations. Do not alter other providers' tools or tools belonging to other packages.
- Verify real registered descriptions against GigaChat using the supplied credential. Never persist credentials or access tokens in project files, documentation, or logs.

## Sources

- https://developers.sber.ru/docs/ru/gigachat/api/reference/rest/function-validation
- https://developers.sber.ru/docs/ru/gigachat/guides/functions/describing-custom-function
- https://developers.sber.ru/docs/files/openapi/gigachat/api.yml

Optional `return_parameters` and `few_shot_examples` are not required for validity; retain the existing pi tool-result contract rather than inventing return schemas or sample executions.
