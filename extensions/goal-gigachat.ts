import { asRecord } from "./goal-record.ts";
import { PROPOSE_DRAFT_TOOL_NAME, UPDATE_GOAL_TOOL_NAME } from "./goal-tool-names.ts";

type ModelIdentity = { provider?: string; id?: string; baseUrl?: string };

function isGigaChat(payload: Record<string, unknown>, model?: ModelIdentity): boolean {
	return /^gigachat$/i.test(model?.provider ?? "")
		|| /^gigachat(?:$|[-:/])/i.test(model?.id ?? "")
		|| (typeof payload.model === "string" && /^gigachat(?:$|[-:/])/i.test(payload.model))
		|| /^https:\/\/(?:api\.giga\.chat|gigachat\.devices\.sberbank\.ru)(?::\d+)?(?:\/|$)/i.test(model?.baseUrl ?? "");
}

function gigaChatFunction(value: unknown): Record<string, unknown> | undefined {
	const fn = asRecord(value);
	if (fn?.name !== PROPOSE_DRAFT_TOOL_NAME && fn?.name !== UPDATE_GOAL_TOOL_NAME) return undefined;
	const parameters = asRecord(fn.parameters);
	const properties = asRecord(parameters?.properties);
	if (!parameters || !properties) return undefined;
	let key: string;
	let projected: Record<string, unknown>;
	if (fn.name === PROPOSE_DRAFT_TOOL_NAME) {
		const budget = asRecord(properties.token_budget);
		if (!budget || !Array.isArray(budget.anyOf) || budget.anyOf.length !== 2) return undefined;
		const integer = budget.anyOf.find(branch => asRecord(branch)?.type === "integer");
		if (!integer || !budget.anyOf.some(branch => asRecord(branch)?.type === "null")) return undefined;
		const { anyOf: _anyOf, ...metadata } = budget;
		key = "token_budget";
		projected = { ...integer, ...metadata, type: "integer", nullable: true };
	} else {
		const continuation = asRecord(properties.continuation);
		if (!continuation || !Array.isArray(continuation.anyOf) || continuation.anyOf.length !== 2) return undefined;
		let wait: Record<string, unknown> | undefined;
		for (const branch of continuation.anyOf) {
			const candidate = asRecord(branch);
			const kind = asRecord(asRecord(candidate?.properties)?.kind);
			if (candidate && Array.isArray(kind?.enum) && kind.enum.length === 1 && kind.enum[0] === "wait") wait = candidate;
		}
		const waitProperties = asRecord(wait?.properties);
		if (!wait || !waitProperties) return undefined;
		const { anyOf: _anyOf, ...metadata } = continuation;
		key = "continuation";
		projected = {
			...wait, ...metadata, type: "object", required: ["kind"],
			properties: {
				...waitProperties,
				kind: { type: "string", enum: ["ready", "wait"], description: "ready continues work and forbids wait-only fields; wait requires reason and deadline." },
			},
		};
	}
	return {
		...fn,
		parameters: { ...parameters, properties: { ...properties, [key]: projected } },
	};
}

/**
 * GigaChat needs explicit object properties and scalar nullable types, while
 * pi's local validator needs unions to retain ready/wait and budget-removal rules.
 * Project only wire declarations, never registered/locally checked schemas.
 * Handle native functions and OpenAI-shaped declarations used by GigaChat adapters.
 */
export function normalizeGigaChatTools(payload: unknown, model?: ModelIdentity): unknown {
	const root = asRecord(payload);
	if (!root || !isGigaChat(root, model)) return undefined;
	let output: Record<string, unknown> | undefined;
	for (const key of ["functions", "tools"] as const) {
		const declarations = root[key];
		if (!Array.isArray(declarations)) continue;
		let changed: unknown[] | undefined;
		for (let i = 0; i < declarations.length; i++) {
			const entry = asRecord(declarations[i]);
			const wrapped = key === "tools" && entry?.type === "function";
			const fn = gigaChatFunction(wrapped ? entry.function : key === "functions" ? entry : undefined);
			if (!fn) continue;
			changed ??= declarations.slice();
			changed[i] = wrapped ? { ...entry, function: fn } : fn;
		}
		if (changed) {
			output ??= { ...root };
			output[key] = changed;
		}
	}
	return output;
}
