#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const jsonlPath = path.join(root, 'data/recipes.jsonl');
const metaPath = path.join(root, 'data/meta.json');

if (!fs.existsSync(jsonlPath)) {
  console.error('Missing data/recipes.jsonl — run npm run export first.');
  process.exit(1);
}

const required = [
  'id',
  'slug',
  'names',
  'country',
  'category',
  'difficulty',
  'servings',
  'description',
  'ingredients',
  'steps',
  'license',
  'attribution',
  'version',
  'region_id',
  'region_label',
  'ingredients_structured',
];

const lines = fs.readFileSync(jsonlPath, 'utf8').trim().split('\n');
let errors = 0;
let structuredLines = 0;
let totalIngredientLines = 0;

function fail(msg) {
  console.error(msg);
  errors++;
}

for (const [i, line] of lines.entries()) {
  let row;
  try {
    row = JSON.parse(line);
  } catch {
    fail(`Line ${i + 1}: invalid JSON`);
    continue;
  }
  for (const key of required) {
    if (row[key] === undefined || row[key] === null) {
      fail(`Line ${i + 1} (${row.slug || '?'}): missing ${key}`);
    }
  }
  if (row.country !== 'CD') {
    fail(`Line ${i + 1}: country must be CD`);
  }
  if (row.license !== 'CC-BY-4.0') {
    fail(`Line ${i + 1}: license must be CC-BY-4.0`);
  }
  if (!row.names?.fr) {
    fail(`Line ${i + 1}: names.fr required`);
  }
  if (!Array.isArray(row.ingredients?.fr) || row.ingredients.fr.length === 0) {
    fail(`Line ${i + 1}: ingredients.fr empty`);
  }
  if (!row.region_label?.fr || !row.region_label?.en) {
    fail(`Line ${i + 1} (${row.slug}): region_label.fr/en required`);
  }
  const structuredFr = row.ingredients_structured?.fr;
  if (!Array.isArray(structuredFr)) {
    fail(`Line ${i + 1} (${row.slug}): ingredients_structured.fr required`);
  } else if (structuredFr.length !== (row.ingredients?.fr?.length || 0)) {
    fail(
      `Line ${i + 1} (${row.slug}): ingredients_structured.fr length mismatch (${structuredFr.length} vs ${row.ingredients.fr.length})`,
    );
  } else {
    for (const [j, item] of structuredFr.entries()) {
      if (!item?.raw) {
        fail(`Line ${i + 1} (${row.slug}): ingredients_structured.fr[${j}] missing raw`);
      } else {
        totalIngredientLines++;
        if (item.parse_status === 'structured' && item.amount != null && item.unit) {
          structuredLines++;
        }
      }
    }
  }
}

if (fs.existsSync(metaPath)) {
  const meta = JSON.parse(fs.readFileSync(metaPath, 'utf8'));
  const pkg = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));
  if (meta.version !== pkg.version) {
    fail(`meta.json version ${meta.version} != package.json ${pkg.version}`);
  }
  if (meta.recipe_count !== lines.length) {
    fail(`meta.recipe_count ${meta.recipe_count} != jsonl lines ${lines.length}`);
  }
}

const ratio = totalIngredientLines ? structuredLines / totalIngredientLines : 0;
if (ratio < 0.8) {
  fail(
    `ingredients_structured coverage ${(ratio * 100).toFixed(1)}% < 80% (${structuredLines}/${totalIngredientLines})`,
  );
}

// Lot 4 — eval Q/A split
const evalPath = path.join(root, 'data/eval/qa.jsonl');
let evalCount = 0;
if (!fs.existsSync(evalPath)) {
  fail('Missing data/eval/qa.jsonl (Lot 4 eval split)');
} else {
  const evalLines = fs.readFileSync(evalPath, 'utf8').trim().split('\n').filter(Boolean);
  evalCount = evalLines.length;
  if (evalCount < 50) {
    fail(`eval qa.jsonl has ${evalCount} rows; need ≥50`);
  }
  for (const [i, line] of evalLines.entries()) {
    let row;
    try {
      row = JSON.parse(line);
    } catch {
      fail(`eval line ${i + 1}: invalid JSON`);
      continue;
    }
    for (const key of ['id', 'task', 'question', 'answer']) {
      if (!row[key]) fail(`eval line ${i + 1}: missing ${key}`);
    }
  }
}

if (errors) {
  console.error(`Validation failed with ${errors} error(s).`);
  process.exit(1);
}

console.log(
  `OK — ${lines.length} recipes validated; ingredients_structured ${(ratio * 100).toFixed(1)}% (${structuredLines}/${totalIngredientLines}); eval_qa=${evalCount}.`,
);
