import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const CATALOG_PATH = new URL("../site/catalog.json", import.meta.url);
const MODULE_ID_PATTERN = /^[a-z0-9][a-z0-9-]*$/;

function isRecord(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function assertNonEmptyString(value, label) {
  assert.equal(typeof value, "string", `${label} must be a string`);
  assert.notEqual(value.trim(), "", `${label} must not be empty`);
}

function assertPublicHttpsUrl(value, label) {
  assertNonEmptyString(value, label);

  const url = new URL(value);
  assert.equal(url.protocol, "https:", `${label} must use HTTPS`);
  assert.equal(url.username, "", `${label} must not include a username`);
  assert.equal(url.password, "", `${label} must not include a password`);
}

function validateEntry(key, entry) {
  assert.match(key, MODULE_ID_PATTERN, `modules.${key} has a non-canonical key`);
  assert.ok(isRecord(entry), `modules.${key} must be an object`);
  assert.equal(entry.trustTier, undefined, `modules.${key} must not assign trust`);
  assert.equal(entry.moduleId, key, `modules.${key}.moduleId must match its key`);
  assert.match(entry.moduleId, MODULE_ID_PATTERN, `modules.${key}.moduleId is not canonical`);
  assertNonEmptyString(entry.title, `modules.${key}.title`);
  assertPublicHttpsUrl(entry.repository, `modules.${key}.repository`);
  assertPublicHttpsUrl(entry.manifest, `modules.${key}.manifest`);

  if (entry.description !== undefined) {
    assertNonEmptyString(entry.description, `modules.${key}.description`);
  }

  if (entry.tags !== undefined) {
    assert.ok(Array.isArray(entry.tags), `modules.${key}.tags must be an array`);
    const tags = entry.tags.map((tag, index) => {
      assertNonEmptyString(tag, `modules.${key}.tags[${index}]`);
      return tag.trim();
    });
    assert.equal(new Set(tags).size, tags.length, `modules.${key}.tags must be unique`);
  }
}

const catalog = JSON.parse(await readFile(CATALOG_PATH, "utf8"));

assert.ok(isRecord(catalog), "catalog must be an object");
assert.equal(catalog.schemaVersion, "sheet-delver-catalog.v1", "unsupported schemaVersion");
assert.ok(
  Number.isSafeInteger(catalog.generatedAt) && catalog.generatedAt >= 0,
  "generatedAt must be a non-negative safe integer",
);
assertNonEmptyString(catalog.publisher, "publisher");
assert.ok(isRecord(catalog.modules), "modules must be an object");
assert.ok(Object.keys(catalog.modules).length > 0, "modules must not be empty");

for (const [key, entry] of Object.entries(catalog.modules)) {
  validateEntry(key, entry);
}

console.log(`Validated ${Object.keys(catalog.modules).length} catalog modules.`);
