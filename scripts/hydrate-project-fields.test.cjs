#!/usr/bin/env node

const assert = require("node:assert/strict");
const {
  parseMetadataBlock,
  mapLabelsToFieldHints,
  parseProjectRef,
  parseDryRun,
  isEmptyCurrent,
  sameValue,
  planHydration,
  validateRequiredProjectFields,
} = require("./hydrate-project-fields.cjs");

function runSelfTests() {
  let metadata = parseMetadataBlock("No metadata");
  assert.equal(metadata.found, false);

  metadata = parseMetadataBlock(
    [
      "<!-- arbiter-project",
      "project: arbiter-systems/2",
      "repo: arbiter-systems/.github",
      "status: Inbox",
      "project_priority: Low",
      "phase: mvp",
      "release_gate: local-mvp",
      "implementation_readiness: ready",
      "scope_risk: medium",
      "confidence: high",
      "agent: codex",
      "workstream: GitHub Project Management",
      "validation_command: npm test",
      "blocked_by:",
      "implementation_order: 7",
      "-->",
    ].join("\n"),
  );
  assert.equal(metadata.found, true);
  assert.equal(metadata.values.project, "arbiter-systems/2");
  assert.equal(metadata.values.repo, "arbiter-systems/.github");
  assert.equal(metadata.unknownKeys.length, 0);
  assert.equal(metadata.values.status, "Inbox");
  assert.equal(metadata.values.project_priority, "Low");
  assert.equal(metadata.values.phase, "mvp");
  assert.equal(metadata.values.release_gate, "local-mvp");
  assert.equal(metadata.values.implementation_readiness, "ready");
  assert.equal(metadata.values.scope_risk, "medium");
  assert.equal(metadata.values.confidence, "high");
  assert.equal(metadata.values.agent, "codex");
  assert.equal(metadata.values.workstream, "GitHub Project Management");
  assert.equal(metadata.values.validation_command, "npm test");
  assert.equal(metadata.values.blocked_by, "");
  assert.equal(metadata.values.implementation_order, "7");
  assert.equal(metadata.explicitKeys.has("blocked_by"), false);
  assert.equal(metadata.explicitKeys.has("project_priority"), true);

  metadata = parseMetadataBlock("<!-- arbiter-project\nstatus Inbox\nproject_priority: High\n-->");
  assert.equal(metadata.found, true);
  assert.equal(metadata.warnings.length, 1);

  metadata = parseMetadataBlock("<!-- arbiter-project\npriority: High\n-->");
  assert.equal(metadata.unknownKeys.includes("priority"), true);
  assert.equal(metadata.values.project_priority, undefined);

  metadata = parseMetadataBlock("<!-- arbiter-project\nlane: active-mvp\n-->");
  assert.equal(metadata.unknownKeys.includes("lane"), true);
  assert.equal(metadata.values.lane, undefined);

  metadata = parseMetadataBlock("<!-- arbiter-project\narea: ci\n-->");
  assert.equal(metadata.unknownKeys.includes("area"), true);

  metadata = parseMetadataBlock("<!-- arbiter-project\nphase:\n-->");
  assert.equal(metadata.explicitKeys.has("phase"), false);

  let labels = mapLabelsToFieldHints(["active-mvp"]);
  assert.equal(labels.priority, null);
  assert.equal(labels.status, null);
  assert.equal(labels.lane, undefined);

  labels = mapLabelsToFieldHints(["blocked"]);
  assert.equal(labels.status, "Blocked");

  labels = mapLabelsToFieldHints(["ready"]);
  assert.equal(labels.status, null);
  labels = mapLabelsToFieldHints(["status: ready"]);
  assert.equal(labels.status, null);

  labels = mapLabelsToFieldHints(["triage"]);
  assert.equal(labels.status, "Triage");

  labels = mapLabelsToFieldHints(["priority: high"]);
  assert.equal(labels.priority, "High");

  labels = mapLabelsToFieldHints(["priority: medium"]);
  assert.equal(labels.priority, "Medium");

  labels = mapLabelsToFieldHints(["priority: low"]);
  assert.equal(labels.priority, "Low");

  labels = mapLabelsToFieldHints([]);
  assert.equal(labels.priority, null);
  assert.equal(labels.status, null);

  labels = mapLabelsToFieldHints(["priority: high", "priority: low"]);
  assert.equal(labels.priority, null);
  assert.equal(labels.warnings.length > 0, true);

  assert.deepEqual(parseProjectRef("arbiter-systems/2"), { org: "arbiter-systems", number: 2 });
  assert.throws(() => parseProjectRef("arbiter-systems/project-two"), /org\/number format/);

  assert.equal(parseDryRun("true"), true);
  assert.equal(parseDryRun("false"), false);
  assert.equal(parseDryRun(undefined), false);
  assert.equal(parseDryRun(""), false);
  assert.equal(parseDryRun("1"), true);
  assert.equal(parseDryRun("0"), false);

  let warned = "";
  const originalWarn = console.warn;
  console.warn = (message) => {
    warned = String(message);
  };
  try {
    assert.equal(parseDryRun("not-a-bool"), false);
  } finally {
    console.warn = originalWarn;
  }
  assert.equal(warned.includes("[warn] Unrecognized DRY_RUN value 'not-a-bool', defaulting to false"), true);

  assert.equal(isEmptyCurrent(null), true);
  assert.equal(isEmptyCurrent({ type: "text", value: "" }), true);
  assert.equal(isEmptyCurrent({ type: "single-select", value: "Inbox" }), false);
  assert.equal(isEmptyCurrent({ type: "number", value: null }), true);
  assert.equal(isEmptyCurrent({ type: "number", value: 3 }), false);

  assert.equal(sameValue("single-select", { type: "single-select", value: "Inbox" }, "inbox"), true);
  assert.equal(sameValue("text", { type: "text", value: "abc" }, "abc"), true);
  assert.equal(sameValue("number", { type: "number", value: 7 }, 7), true);
  assert.equal(sameValue("number", { type: "number", value: 7 }, 8), false);

  const fields = [
    {
      id: "f-status",
      name: "Status",
      options: [
        { id: "o-inbox", name: "Inbox" },
        { id: "o-triage", name: "Triage" },
        { id: "o-blocked", name: "Blocked" },
      ],
    },
    {
      id: "f-priority",
      name: "Project Priority",
      options: [
        { id: "o-high", name: "High" },
        { id: "o-medium", name: "Medium" },
        { id: "o-low", name: "Low" },
      ],
    },
    {
      id: "f-phase",
      name: "Phase",
      options: [{ id: "o-mvp", name: "mvp" }],
    },
    {
      id: "f-validation",
      name: "Validation Command",
    },
    {
      id: "f-workstream",
      name: "Workstream",
      options: [
        { id: "o-github-project-management", name: "GitHub Project Management" },
        { id: "o-mvp-execution", name: "MVP Execution" },
        { id: "o-security-compliance", name: "Security & Compliance" },
        { id: "o-documentation-site", name: "Documentation & Site" },
        { id: "o-infrastructure-ops", name: "Infrastructure & Ops" },
      ],
    },
  ];

  const metadataMissing = {
    found: false,
    values: {},
    explicitKeys: new Set(),
    warnings: [],
    unknownKeys: [],
  };

  let plan = planHydration(
    metadataMissing,
    { priority: "High", status: "Ready", warnings: [] },
    new Map([
      ["status", { type: "single-select", value: "Triage" }],
      ["project priority", { type: "single-select", value: "Medium" }],
    ]),
    fields,
  );
  assert.equal(plan.operations.some((op) => op.key === "project_priority"), false);
  assert.equal(plan.operations.some((op) => op.key === "status"), false);
  assert.equal(plan.errors.length, 0);

  plan = planHydration(metadataMissing, { priority: null, status: null, warnings: [] }, new Map(), fields);
  assert.equal(plan.operations.some((op) => op.key === "status" && op.value === "Inbox" && op.source === "default"), true);
  assert.equal(plan.errors.length, 0);

  plan = planHydration(
    {
      found: true,
      values: { project_priority: "High", workstream: "GitHub Project Management" },
      explicitKeys: new Set(["project_priority", "workstream"]),
      warnings: [],
      unknownKeys: [],
    },
    { priority: null, status: null, warnings: [] },
    new Map([["project priority", { type: "single-select", value: "Medium" }]]),
    fields,
  );
  assert.equal(plan.operations.some((op) => op.key === "project_priority" && op.source === "metadata"), true);
  assert.equal(
    plan.operations.some(
      (op) =>
        op.key === "workstream" &&
        op.value === "GitHub Project Management" &&
        op.optionId === "o-github-project-management" &&
        op.source === "metadata",
    ),
    true,
  );
  assert.equal(plan.errors.length, 0);

  plan = planHydration(
    {
      found: true,
      values: { workstream: "security-privacy" },
      explicitKeys: new Set(["workstream"]),
      warnings: [],
      unknownKeys: [],
    },
    { priority: null, status: null, warnings: [] },
    new Map(),
    fields,
  );
  assert.equal(
    plan.operations.some(
      (op) =>
        op.key === "workstream" &&
        op.value === "Security & Compliance" &&
        op.optionId === "o-security-compliance",
    ),
    true,
  );
  assert.equal(plan.errors.length, 0);

  plan = planHydration(
    {
      found: true,
      values: { phase: "mvp", validation_command: "npm test" },
      explicitKeys: new Set(["phase", "validation_command"]),
      warnings: [],
      unknownKeys: [],
    },
    { priority: null, status: null, warnings: [] },
    new Map(),
    fields.filter((field) => field.name !== "Phase"),
  );
  assert.equal(plan.operations.some((op) => op.key === "phase"), false);
  assert.equal(
    plan.warnings.some((warning) => warning.includes("Optional project field for 'phase' was not found")),
    true,
  );

  assert.throws(
    () => validateRequiredProjectFields(fields.filter((field) => field.name !== "Project Priority")),
    /Missing required project fields/,
  );

  plan = planHydration(
    {
      found: true,
      values: { project_priority: "Critical" },
      explicitKeys: new Set(["project_priority"]),
      warnings: [],
      unknownKeys: [],
    },
    { priority: null, status: null, warnings: [] },
    new Map(),
    fields,
  );
  assert.equal(plan.operations.some((op) => op.key === "project_priority"), false);
  assert.equal(
    plan.errors.some((error) =>
      error.includes("Unknown single-select option 'Critical' for field 'Project Priority'."),
    ),
    true,
  );
  assert.equal(plan.errors.some((error) => error.includes("Configured taxonomy")), true);
  assert.equal(plan.errors.some((error) => error.includes("Live project options")), true);

  const missingOptionFields = fields.map((field) =>
    field.name === "Project Priority"
      ? { ...field, options: [{ id: "o-medium", name: "Medium" }] }
      : field,
  );
  plan = planHydration(
    {
      found: true,
      values: { project_priority: "High" },
      explicitKeys: new Set(["project_priority"]),
      warnings: [],
      unknownKeys: [],
    },
    { priority: null, status: null, warnings: [] },
    new Map(),
    missingOptionFields,
  );
  assert.equal(plan.operations.some((op) => op.key === "project_priority"), false);
  assert.equal(
    plan.errors.some((error) =>
      error.includes("Single-select option 'High' is not present in the live project field 'Project Priority'."),
    ),
    true,
  );

  const emptyOptionFields = fields.map((field) =>
    field.name === "Project Priority" ? { ...field, options: [] } : field,
  );
  plan = planHydration(
    {
      found: true,
      values: { project_priority: "High" },
      explicitKeys: new Set(["project_priority"]),
      warnings: [],
      unknownKeys: [],
    },
    { priority: null, status: null, warnings: [] },
    new Map(),
    emptyOptionFields,
  );
  assert.equal(plan.operations.some((op) => op.key === "project_priority"), false);
  assert.equal(plan.errors.some((error) => error.includes("Live project options: (none)")), true);

  console.log("[self-test] ok");
}

if (require.main === module) {
  runSelfTests();
}

module.exports = { runSelfTests };
