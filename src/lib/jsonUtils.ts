/* ─── Shared JSON path utilities ─────────────────────────────────────────── */

export type JsonPrimitive = string | number | boolean | null;
export interface JsonObject { [key: string]: JsonValue; }
export type JsonValue = JsonPrimitive | JsonObject | JsonValue[];

/**
 * Immutably sets a value at an arbitrarily deep dot-path.
 * Numeric segments are treated as array indices.
 */
export function setDeep(obj: JsonObject, pathStr: string, newVal: JsonValue): JsonObject {
  const clone = structuredClone(obj);
  const parts = pathStr.split(".");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let cur: any = clone;
  for (let i = 0; i < parts.length - 1; i++) {
    const k = /^\d+$/.test(parts[i]) ? Number(parts[i]) : parts[i];
    cur = cur[k];
  }
  const last = parts[parts.length - 1];
  cur[/^\d+$/.test(last) ? Number(last) : last] = newVal;
  return clone;
}

/**
 * Reads a value from a nested object by dot-path.
 * Returns undefined if any segment is missing.
 */
export function getByPath(obj: unknown, pathStr: string): unknown {
  let cur: unknown = obj;
  for (const part of pathStr.split(".")) {
    if (cur === null || cur === undefined) return undefined;
    const k = /^\d+$/.test(part) ? Number(part) : part;
    cur = (cur as Record<string | number, unknown>)[k];
  }
  return cur;
}

/**
 * Normalises a dot-path so numeric array indices become "*".
 * e.g. "events.3.image" → "events.*.image"
 */
export function normalizePathForSpec(path: string): string {
  return path
    .split(".")
    .map((p) => (/^\d+$/.test(p) ? "*" : p))
    .join(".");
}
