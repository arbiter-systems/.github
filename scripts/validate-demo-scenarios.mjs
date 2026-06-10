#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const repoRoot = process.cwd();
const schemaPath = path.join(repoRoot, 'contracts', 'demo-scenarios', 'demo-scenario.schema.json');
const examplesDir = path.join(repoRoot, 'examples', 'demo-scenarios');

const scenarioIdPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const errorCodePattern = /^[A-Z0-9_]+$/;
const metadataKeyPattern = /^[A-Za-z0-9_.:-]+$/;
const allowedFakeProviderKeys = new Set([
  'behavior',
  'tokenChunks',
  'delayFirstTokenMs',
  'terminalErrorCode'
]);
const allowedFakeProviderBehaviors = new Set([
  'successful-stream',
  'provider-timeout',
  'provider-error',
  'slow-first-token',
  'prompt-privacy',
  'unsupported-provider-metadata'
]);
const restrictedMetadataFragments = [
  'authorization',
  'secret',
  'credential',
  'providerresponse',
  'providerpayload',
  'rawprovider',
  'rawprompt',
  'customer',
  'employee',
  'apikey',
  'token'
];

const errors = [];

function addError(fileName, message) {
  errors.push(`${fileName}: ${message}`);
}

function readJson(filePath, label) {
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch (error) {
    addError(label, `invalid JSON (${error.message})`);
    return null;
  }
}

function isObject(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function isScalar(value) {
  return ['string', 'number', 'boolean'].includes(typeof value);
}

function requireString(fileName, scenario, field, maxLength) {
  const value = scenario[field];
  if (typeof value !== 'string' || value.trim() === '') {
    addError(fileName, `${field} must be a non-empty string`);
    return;
  }
  if (maxLength && value.length > maxLength) {
    addError(fileName, `${field} must not exceed ${maxLength} characters`);
  }
}

function validateScenario(fileName, scenario, seenIds) {
  if (!isObject(scenario)) {
    addError(fileName, 'scenario root must be an object');
    return;
  }

  if (scenario.schemaVersion !== 'demo-scenario/v1') {
    addError(fileName, 'schemaVersion must be demo-scenario/v1');
  }

  requireString(fileName, scenario, 'id', 120);
  requireString(fileName, scenario, 'title', 120);
  requireString(fileName, scenario, 'description', 500);
  requireString(fileName, scenario, 'model', 120);
  requireString(fileName, scenario, 'prompt', 64000);

  if (typeof scenario.id === 'string') {
    if (!scenarioIdPattern.test(scenario.id)) {
      addError(fileName, 'id must be stable lowercase kebab-case');
    }

    const expectedFileName = `${scenario.id}.json`;
    if (fileName !== expectedFileName) {
      addError(fileName, `file name must match id (${expectedFileName})`);
    }

    if (seenIds.has(scenario.id)) {
      addError(fileName, `duplicate scenario id ${scenario.id}`);
    }
    seenIds.add(scenario.id);
  }

  if (scenario.publicSafe !== true) {
    addError(fileName, 'publicSafe must be true');
  }

  if (!Number.isInteger(scenario.maxTokens) || scenario.maxTokens < 1 || scenario.maxTokens > 128000) {
    addError(fileName, 'maxTokens must be an integer from 1 through 128000');
  }

  if (typeof scenario.temperature !== 'number' || Number.isNaN(scenario.temperature) || scenario.temperature < 0 || scenario.temperature > 2) {
    addError(fileName, 'temperature must be a number from 0 through 2');
  }

  if (scenario.tags !== undefined) {
    if (!Array.isArray(scenario.tags)) {
      addError(fileName, 'tags must be an array when present');
    } else {
      const tags = new Set();
      for (const tag of scenario.tags) {
        if (typeof tag !== 'string' || !scenarioIdPattern.test(tag)) {
          addError(fileName, `tag ${JSON.stringify(tag)} must be lowercase kebab-case`);
        }
        if (tags.has(tag)) {
          addError(fileName, `duplicate tag ${tag}`);
        }
        tags.add(tag);
      }
    }
  }

  validateMetadata(fileName, scenario.metadata, scenario.id);
  validateFakeProvider(fileName, scenario.fakeProvider);
  validateExpectedTerminal(fileName, scenario.expectedTerminal);
  validateEvidence(fileName, scenario.evidence);
  validateUi(fileName, scenario.ui);
}

function validateMetadata(fileName, metadata, scenarioId) {
  if (metadata === undefined) {
    return;
  }

  if (!isObject(metadata)) {
    addError(fileName, 'metadata must be an object when present');
    return;
  }

  const entries = Object.entries(metadata);
  if (entries.length > 32) {
    addError(fileName, 'metadata cannot contain more than 32 entries');
  }

  for (const [key, value] of entries) {
    if (!metadataKeyPattern.test(key)) {
      addError(fileName, `metadata key ${key} contains unsupported characters`);
    }
    if (!isScalar(value)) {
      addError(fileName, `metadata value ${key} must be a scalar string, number, or boolean`);
    }

    const normalizedKey = key.toLowerCase().replace(/[^a-z0-9]/g, '');
    const isNegativeFixture = scenarioId === 'unsupported-provider-metadata';
    const isRestricted = restrictedMetadataFragments.some((fragment) => normalizedKey.includes(fragment));
    if (isRestricted && !isNegativeFixture) {
      addError(fileName, `metadata key ${key} is restricted for public demo fixtures`);
    }
  }
}

function validateFakeProvider(fileName, fakeProvider) {
  if (fakeProvider === undefined) {
    return;
  }

  if (!isObject(fakeProvider)) {
    addError(fileName, 'fakeProvider must be an object when present');
    return;
  }

  for (const key of Object.keys(fakeProvider)) {
    if (!allowedFakeProviderKeys.has(key)) {
      addError(fileName, `fakeProvider key ${key} is outside the allowlist`);
    }
  }

  if (typeof fakeProvider.behavior !== 'string' || !allowedFakeProviderBehaviors.has(fakeProvider.behavior)) {
    addError(fileName, 'fakeProvider.behavior must be one of the documented allowlist values');
  }

  if (fakeProvider.tokenChunks !== undefined) {
    if (!Array.isArray(fakeProvider.tokenChunks) || fakeProvider.tokenChunks.length > 20) {
      addError(fileName, 'fakeProvider.tokenChunks must be an array with at most 20 entries');
    } else {
      for (const chunk of fakeProvider.tokenChunks) {
        if (typeof chunk !== 'string' || chunk.trim() === '' || chunk.length > 500) {
          addError(fileName, 'fakeProvider.tokenChunks entries must be non-empty strings up to 500 characters');
        }
      }
    }
  }

  if (fakeProvider.delayFirstTokenMs !== undefined) {
    if (!Number.isInteger(fakeProvider.delayFirstTokenMs) || fakeProvider.delayFirstTokenMs < 0 || fakeProvider.delayFirstTokenMs > 30000) {
      addError(fileName, 'fakeProvider.delayFirstTokenMs must be an integer from 0 through 30000');
    }
  }

  if (fakeProvider.terminalErrorCode !== undefined) {
    if (typeof fakeProvider.terminalErrorCode !== 'string' || !errorCodePattern.test(fakeProvider.terminalErrorCode)) {
      addError(fileName, 'fakeProvider.terminalErrorCode must be uppercase snake case');
    }
  }
}

function validateExpectedTerminal(fileName, expectedTerminal) {
  if (!isObject(expectedTerminal)) {
    addError(fileName, 'expectedTerminal must be an object');
    return;
  }

  if (!['final', 'error'].includes(expectedTerminal.type)) {
    addError(fileName, 'expectedTerminal.type must be final or error');
  }

  requireNestedString(fileName, expectedTerminal, 'expectedTerminal.headline', 'headline', 160);

  if (expectedTerminal.type === 'final' && expectedTerminal.errorCode !== undefined) {
    addError(fileName, 'expectedTerminal.errorCode must not exist for final scenarios');
  }

  if (expectedTerminal.type === 'error') {
    if (typeof expectedTerminal.errorCode !== 'string' || !errorCodePattern.test(expectedTerminal.errorCode)) {
      addError(fileName, 'expectedTerminal.errorCode is required for error scenarios and must be uppercase snake case');
    }
  }
}

function validateEvidence(fileName, evidence) {
  if (!isObject(evidence)) {
    addError(fileName, 'evidence must be an object');
    return;
  }

  requireNestedString(fileName, evidence, 'evidence.claim', 'claim', 240);

  if (!Array.isArray(evidence.highlights) || evidence.highlights.length === 0 || evidence.highlights.length > 6) {
    addError(fileName, 'evidence.highlights must contain 1 through 6 entries');
    return;
  }

  for (const highlight of evidence.highlights) {
    if (typeof highlight !== 'string' || highlight.trim() === '' || highlight.length > 180) {
      addError(fileName, 'evidence.highlights entries must be non-empty strings up to 180 characters');
    }
  }
}

function validateUi(fileName, ui) {
  if (!isObject(ui)) {
    addError(fileName, 'ui must be an object');
    return;
  }

  requireNestedString(fileName, ui, 'ui.cardTitle', 'cardTitle', 80);
  requireNestedString(fileName, ui, 'ui.cardSummary', 'cardSummary', 220);
  requireNestedString(fileName, ui, 'ui.resultHeadline', 'resultHeadline', 160);
}

function requireNestedString(fileName, object, label, key, maxLength) {
  const value = object[key];
  if (typeof value !== 'string' || value.trim() === '') {
    addError(fileName, `${label} must be a non-empty string`);
    return;
  }
  if (value.length > maxLength) {
    addError(fileName, `${label} must not exceed ${maxLength} characters`);
  }
}

const schema = readJson(schemaPath, schemaPath);
if (!schema) {
  process.exit(1);
}

if (!fs.existsSync(examplesDir)) {
  addError(examplesDir, 'examples directory does not exist');
} else {
  const files = fs.readdirSync(examplesDir)
    .filter((file) => file.endsWith('.json'))
    .sort();

  if (files.length === 0) {
    addError(examplesDir, 'no demo scenario examples found');
  }

  const seenIds = new Set();
  for (const file of files) {
    const scenario = readJson(path.join(examplesDir, file), file);
    if (scenario) {
      validateScenario(file, scenario, seenIds);
    }
  }
}

if (errors.length > 0) {
  console.error('Demo scenario validation failed:');
  for (const error of errors) {
    console.error(`- ${error}`);
  }
  process.exit(1);
}

console.log('Demo scenario validation passed.');
