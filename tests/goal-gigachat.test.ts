import assert from "node:assert/strict";
import test from "node:test";
import { validateToolArguments } from "@earendil-works/pi-ai/utils/validation";
import type { JsonObject } from "@earendil-works/pi-ai";
import type { ExtensionAPI, ToolDefinition } from "@earendil-works/pi-coding-agent";
import { asRecord } from "../extensions/goal-record.ts";
import goalExtension from "../extensions/goal.ts";

function harness() {
	const tools = new Map<string, ToolDefinition>();
	type RequestHook = (event: { payload: unknown }, ctx: { model?: unknown }) => unknown;
	let beforeRequest: RequestHook | undefined;
	const pi = {
		registerTool: (tool: ToolDefinition) => tools.set(tool.name, tool),
		registerCommand() {}, registerShortcut() {}, appendEntry() {}, registerMessageRenderer() {},
		on: (event: string, handler: RequestHook) => { if (event === "before_provider_request") beforeRequest = handler; },
		getActiveTools: () => [], setActiveTools() {},
	};
	// This harness implements only the host registration surface; only this hook runs.
	goalExtension(pi as unknown as ExtensionAPI);
	const draft = tools.get("propose_goal_draft");
	const update = tools.get("update_goal");
	assert.ok(update);
	assert.ok(draft);
	const declaration = { name: draft.name, description: draft.description, parameters: draft.parameters };
	return {
		draft, update, declaration,
		request: (payload: unknown, model?: unknown) => {
			assert.ok(beforeRequest);
			return beforeRequest({ payload }, { model });
		},
	};
}

function validate(tool: ToolDefinition, args: JsonObject): Record<string, unknown> {
	return validateToolArguments(tool, { id: "budget", name: tool.name, type: "toolCall", arguments: args });
}

function projectedBudget(payload: unknown): Record<string, unknown> {
	const root = asRecord(payload);
	assert.ok(root);
	const declarations = root.functions ?? root.tools;
	assert.ok(Array.isArray(declarations));
	const entry = asRecord(declarations[0]);
	const fn = asRecord(entry?.function) ?? entry;
	const budget = asRecord(asRecord(asRecord(fn?.parameters)?.properties)?.token_budget);
	assert.ok(budget);
	return budget;
}

test("GigaChat wire budgets are nullable without losing explicit null in local argument validation", () => {
	const h = harness();
	for (const wrapped of [false, true]) {
		const payload = wrapped
			? { model: "GigaChat-2", tools: [{ type: "function", function: h.declaration }] }
			: { model: "GigaChat-2", functions: [h.declaration] };
		const projected = h.request(payload);
		const budget = projectedBudget(projected);
		assert.equal(budget.type, "integer");
		assert.equal(budget.nullable, true);
		assert.equal(budget.minimum, 1);
		assert.equal(budget.anyOf, undefined);

		// SDK normalization must not erase explicit null as though it were omitted.
		const cleared = validate(h.draft, { objective: "Keep the goal", token_budget: null });
		assert.equal(Object.hasOwn(cleared, "token_budget"), true);
		assert.equal(cleared.token_budget, null);
		assert.equal(Object.hasOwn(validate(h.draft, { objective: "Keep the goal" }), "token_budget"), false);
		assert.equal(validate(h.draft, { objective: "Keep the goal", token_budget: 1200 }).token_budget, 1200);
		assert.equal(h.request(projected), undefined, "already projected declarations are unchanged");
	}
});

test("custom GigaChat provider identities project schemas without changing other providers or third-party tools", () => {
	const h = harness();
	const payload = { tools: [{ type: "function", function: h.declaration }] };
	for (const model of [
		{ provider: "gigachat", id: "custom" },
		{ provider: "custom", id: "GigaChat-2-Pro" },
		{ provider: "custom", id: "custom", baseUrl: "https://api.giga.chat/v1" },
		{ provider: "custom", id: "custom", baseUrl: "https://gigachat.devices.sberbank.ru/api/v1" },
	]) {
		assert.equal(projectedBudget(h.request(payload, model)).nullable, true);
	}
	for (const model of [undefined, { provider: "openai", id: "gpt-4.1" }, { provider: "custom", baseUrl: "https://api.giga.chat.example/v1" }]) {
		assert.equal(h.request(payload, model), undefined);
		assert.equal(h.request({ model: "gpt-4.1", functions: [h.declaration] }, model), undefined);
	}
	const foreign = { ...h.declaration, name: "another_package_budget" };
	assert.equal(h.request({ model: "GigaChat-2", functions: [foreign, "text2image"] }), undefined);
	assert.equal(validate(h.draft, { objective: "Keep the goal", token_budget: null }).token_budget, null);
});

test("GigaChat continuation projection preserves local ready/wait rejection before SDK null normalization", () => {
	const h = harness();
	const fn = { name: h.update.name, description: h.update.description, parameters: h.update.parameters };
	for (const wrapped of [false, true]) {
		const payload = wrapped
			? { model: "GigaChat-2", tools: [{ type: "function", function: fn }] }
			: { model: "GigaChat-2", functions: [fn] };
		const root = asRecord(h.request(payload));
		const declarations = root?.functions ?? root?.tools;
		assert.ok(Array.isArray(declarations));
		const entry = asRecord(declarations[0]);
		const wire = asRecord(entry?.function) ?? entry;
		const continuation = asRecord(asRecord(asRecord(wire?.parameters)?.properties)?.continuation);
		assert.ok(continuation);
		assert.equal(continuation.type, "object");
		assert.deepEqual(continuation.required, ["kind"]);
		assert.ok(asRecord(continuation.properties)?.deadline);
		assert.equal(continuation.anyOf, undefined);

		assert.deepEqual(validate(h.update, { continuation: { kind: "ready" } }), { continuation: { kind: "ready" } });
		for (const field of ["reason", "deadline", "wait_id", "polling"]) {
			assert.throws(() => validate(h.update, { continuation: { kind: "ready", [field]: null } }), /Validation failed/, field);
		}
		const incomplete: JsonObject[] = [{ kind: "wait", reason: "Missing deadline" }, { kind: "wait", deadline: "2099-01-01T00:00:00Z" }];
		for (const continuation of incomplete) {
			assert.throws(() => validate(h.update, { continuation }), /Validation failed/);
		}
		const valid = { continuation: { kind: "wait", reason: "Build", deadline: "2099-01-01T00:00:00Z", polling: { interval_seconds: 60, max_checks: 3 } } };
		assert.deepEqual(validate(h.update, valid), valid);
	}
});
