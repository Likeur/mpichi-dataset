#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const jsonlPath = path.join(root, 'data/recipes.jsonl');

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
];

const lines = fs.readFileSync(jsonlPath, 'utf8').trim().split('\n');
let errors = 0;

for (const [i, line] of lines.entries()) {
  let row;
  try {
    row = JSON.parse(line);
  } catch {
    console.error(`Line ${i + 1}: invalid JSON`);
    errors++;
    continue;
  }
  for (const key of required) {
    if (row[key] === undefined || row[key] === null) {
      console.error(`Line ${i + 1} (${row.slug || '?'}): missing ${key}`);
      errors++;
    }
  }
  if (row.country !== 'CD') {
    console.error(`Line ${i + 1}: country must be CD`);
    errors++;
  }
  if (row.license !== 'CC-BY-4.0') {
    console.error(`Line ${i + 1}: license must be CC-BY-4.0`);
    errors++;
  }
  if (!row.names?.fr) {
    console.error(`Line ${i + 1}: names.fr required`);
    errors++;
  }
  if (!Array.isArray(row.ingredients?.fr) || row.ingredients.fr.length === 0) {
    console.error(`Line ${i + 1}: ingredients.fr empty`);
    errors++;
  }
}

if (errors) {
  console.error(`Validation failed with ${errors} error(s).`);
  process.exit(1);
}

console.log(`OK — ${lines.length} recipes validated.`);
