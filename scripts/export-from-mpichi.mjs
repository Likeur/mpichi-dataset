#!/usr/bin/env node
/**
 * Export Mpichi site content → open dataset JSON / JSONL / splits / instruction pairs.
 *
 * Usage:
 *   node scripts/export-from-mpichi.mjs
 *   node scripts/export-from-mpichi.mjs --mpichi-root /path/to/mpichi
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { createRequire } from 'node:module';
import { spawnSync } from 'node:child_process';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATASET_ROOT = path.resolve(__dirname, '..');
const require = createRequire(import.meta.url);

function parseArgs(argv) {
  const out = { mpichiRoot: path.resolve(DATASET_ROOT, '..') };
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === '--mpichi-root' && argv[i + 1]) {
      out.mpichiRoot = path.resolve(argv[++i]);
    }
  }
  return out;
}

function toIsoDuration(value) {
  if (!value) return undefined;
  const normalized = String(value)
    .toLowerCase()
    .replace(/hours?|heures?/g, 'h')
    .replace(/minutes?|mins?/g, 'min')
    .replace(/\s+/g, ' ')
    .trim();

  let hours = 0;
  let minutes = 0;
  const hourMatch = normalized.match(/(\d+)\s*h/);
  const minMatch = normalized.match(/(\d+)\s*min/);
  if (hourMatch) hours = Number(hourMatch[1]);
  if (minMatch) minutes = Number(minMatch[1]);
  if (!hourMatch && !minMatch) {
    const bare = normalized.match(/^(\d+)$/);
    if (bare) minutes = Number(bare[1]);
  }
  if (!hours && !minutes) return undefined;
  if (hours && minutes) return `PT${hours}H${minutes}M`;
  if (hours) return `PT${hours}H`;
  return `PT${minutes}M`;
}

function loadGrayMatter() {
  try {
    return require('gray-matter');
  } catch {
    console.error('Missing dependency gray-matter. Run: npm install (inside mpichi-dataset)');
    process.exit(1);
  }
}

function loadEnTranslations(mpichiRoot) {
  const enPath = path.join(mpichiRoot, 'src/i18n/recipes-en.ts');
  if (!fs.existsSync(enPath)) {
    console.warn('EN translations not found:', enPath);
    return {};
  }

  const loader = `
import { recipeTranslationsEn } from ${JSON.stringify(pathToFileURL(enPath).href)};
process.stdout.write(JSON.stringify(recipeTranslationsEn));
`;
  const tmp = path.join(DATASET_ROOT, '.tmp-load-en.mts');
  fs.writeFileSync(tmp, loader, 'utf8');

  const tsxCli = path.join(DATASET_ROOT, 'node_modules/tsx/dist/cli.mjs');
  const tsxEsm = path.join(DATASET_ROOT, 'node_modules/tsx/dist/esm/index.mjs');
  let result = spawnSync(process.execPath, ['--import', tsxEsm, tmp], {
    encoding: 'utf8',
    maxBuffer: 32 * 1024 * 1024,
    env: { ...process.env, TSX_TSCONFIG_PATH: '0' },
  });

  if (result.status !== 0) {
    result = spawnSync(process.execPath, [tsxCli, tmp], {
      encoding: 'utf8',
      maxBuffer: 32 * 1024 * 1024,
    });
  }

  try {
    fs.unlinkSync(tmp);
  } catch {
    /* ignore */
  }

  if (result.status !== 0) {
    console.error(result.stderr || result.stdout);
    throw new Error('Failed to load recipes-en.ts via tsx');
  }
  return JSON.parse(result.stdout);
}

function geoTagsFromRegion(region) {
  if (!region) return [];
  return region
    .split(/[,&/]| et /i)
    .map((s) => s.trim())
    .filter(Boolean);
}

function aliasesFromTags(tags = [], title = '') {
  const fromTitle = [];
  const paren = title.match(/\(([^)]+)\)/);
  if (paren) {
    fromTitle.push({ name: paren[1].trim(), lang: 'und', note: 'From French title parentheses' });
  }
  const skip = new Set([
    'traditionnel',
    'végétal',
    'vegetables',
    'feuilles',
    'poisson',
    'viande',
    'huile de palme',
    'arachide',
    'tomate',
  ]);
  const fromTags = tags
    .filter((t) => t && !skip.has(t.toLowerCase()))
    .slice(0, 8)
    .map((name) => ({ name, lang: 'und', note: 'Derived from editorial tags' }));
  return [...fromTitle, ...fromTags];
}

/**
 * Merge curated enrichment aliases first, then tag/title-derived fallbacks.
 * Curated entries may include lang, note, region_hint, script.
 * Derived entries use lang "und" and are skipped when the name already exists.
 */
function mergeAliases(enriched = [], derived = []) {
  const seen = new Set();
  const out = [];
  for (const a of [...enriched, ...derived]) {
    const key = (a.name || '').toLowerCase().normalize('NFC');
    if (!a.name || seen.has(key)) continue;
    seen.add(key);
    const row = { name: a.name };
    if (a.lang) row.lang = a.lang;
    if (a.note) row.note = a.note;
    if (a.region_hint) row.region_hint = a.region_hint;
    if (a.script) row.script = a.script;
    out.push(row);
  }
  return out;
}

function mapVariant(frV, enV) {
  return {
    id: frV.id,
    title: { fr: frV.title, ...(enV?.title ? { en: enV.title } : {}) },
    ...(frV.description || enV?.description
      ? {
          description: {
            ...(frV.description ? { fr: frV.description } : {}),
            ...(enV?.description ? { en: enV.description } : {}),
          },
        }
      : {}),
    ingredients: {
      fr: frV.ingredients || [],
      ...(enV?.ingredients ? { en: enV.ingredients } : {}),
    },
    steps: {
      fr: frV.steps || [],
      ...(enV?.steps ? { en: enV.steps } : {}),
    },
  };
}

function buildSources(data) {
  const sources = [
    {
      type: 'editorial',
      label: 'Mpichi editorial documentation (transmitted practices + available sources)',
      url: 'https://mpichi.likeur.xyz/',
    },
    {
      type: 'transmission',
      label: 'Household transmission notes — quantities are starting points',
    },
  ];
  if (data.video?.youtube) {
    sources.push({
      type: 'video',
      label: data.video.title || data.video.credit || 'Video tutorial',
      url: data.video.youtube,
    });
  }
  if (data.imageCreditUrl) {
    sources.push({
      type: 'url',
      label: `Photo credit: ${data.imageCredit || 'see URL'}`,
      url: data.imageCreditUrl,
    });
  }
  return sources;
}

function buildRecord(slug, data, bodyFr, en, aliasMap, version, updatedAt) {
  const enVarById = Object.fromEntries((en?.variants || []).map((v) => [v.id, v]));
  const enrichedAliases = aliasMap[slug] || [];
  const derived = aliasesFromTags(data.tags, data.title);

  return {
    id: slug,
    slug,
    names: {
      fr: data.title,
      ...(en?.title ? { en: en.title } : {}),
      aliases: mergeAliases(enrichedAliases, derived),
    },
    ...(data.seoTitle || en?.seoTitle
      ? {
          seo_title: {
            ...(data.seoTitle ? { fr: data.seoTitle } : {}),
            ...(en?.seoTitle ? { en: en.seoTitle } : {}),
          },
        }
      : {}),
    description: {
      fr: data.description,
      ...(en?.description ? { en: en.description } : {}),
    },
    ...(bodyFr || en?.body
      ? {
          body: {
            ...(bodyFr ? { fr: bodyFr } : {}),
            ...(en?.body ? { en: en.body } : {}),
          },
        }
      : {}),
    region: data.region || undefined,
    country: 'CD',
    geo_tags: geoTagsFromRegion(data.region),
    category: data.category,
    difficulty: data.difficulty,
    prep_time: data.prepTime,
    cook_time: data.cookTime,
    prep_time_iso: toIsoDuration(data.prepTime),
    cook_time_iso: toIsoDuration(data.cookTime),
    servings: data.servings,
    tags: data.tags || [],
    ingredients: {
      fr: data.ingredients || [],
      ...(en?.ingredients ? { en: en.ingredients } : {}),
    },
    steps: {
      fr: data.steps || [],
      ...(en?.steps ? { en: en.steps } : {}),
    },
    variants: (data.variants || []).map((v) => mapVariant(v, enVarById[v.id])),
    related_recipes: data.relatedRecipes || [],
    sources: buildSources(data),
    image_url: data.image,
    image_alt: {
      fr: data.imageAlt,
      ...(en?.imageAlt ? { en: en.imageAlt } : {}),
    },
    image_credit: data.imageCredit,
    image_credit_url: data.imageCreditUrl,
    image_license_note:
      'Image binaries are not redistributed. Follow the credit URL and third-party license.',
    ...(data.video
      ? {
          video: {
            youtube: data.video.youtube,
            title: data.video.title,
            credit: data.video.credit,
            credit_url: data.video.creditUrl,
          },
        }
      : {}),
    urls: {
      fr: `https://mpichi.likeur.xyz/recettes/${slug}/`,
      en: `https://mpichi.likeur.xyz/en/recettes/${slug}/`,
    },
    featured: Boolean(data.featured),
    license: 'CC-BY-4.0',
    attribution: 'Mpichi / Likeur — https://mpichi.likeur.xyz',
    version,
    updated_at: updatedAt,
  };
}

function hashSlug(slug) {
  let h = 0;
  for (let i = 0; i < slug.length; i++) h = (h * 31 + slug.charCodeAt(i)) >>> 0;
  return h;
}

function splitTrainValid(records, validRatio = 0.1) {
  const byCat = new Map();
  for (const r of records) {
    const list = byCat.get(r.category) || [];
    list.push(r);
    byCat.set(r.category, list);
  }
  const train = [];
  const valid = [];
  for (const list of byCat.values()) {
    const sorted = [...list].sort((a, b) => a.slug.localeCompare(b.slug));
    for (const r of sorted) {
      const bucket = hashSlug(r.slug) % 100 < validRatio * 100 ? valid : train;
      // Keep at least one train item per tiny category
      bucket.push(r);
    }
  }
  // Rebalance if valid emptied a category entirely into valid when n=1
  if (valid.length === 0 && train.length > 1) {
    valid.push(train.pop());
  }
  return { train, valid };
}

function instructionPairs(records) {
  const pairs = [];

  for (const r of records) {
    const nameFr = r.names.fr;
    const nameEn = r.names.en || nameFr;
    const ingredientsFr = (r.ingredients.fr || []).map((i) => `- ${i}`).join('\n');
    const stepsFr = (r.steps.fr || []).map((s, i) => `${i + 1}. ${s}`).join('\n');
    const ingredientsEn = (r.ingredients.en || r.ingredients.fr || []).map((i) => `- ${i}`).join('\n');
    const stepsEn = (r.steps.en || r.steps.fr || []).map((s, i) => `${i + 1}. ${s}`).join('\n');

    pairs.push({
      id: `${r.slug}-recipe-fr`,
      lang: 'fr',
      task: 'recipe_full',
      prompt: `Donne la recette complète du plat congolais « ${nameFr} » (République démocratique du Congo).`,
      completion: `# ${nameFr}\n\n${r.description.fr}\n\nRégion : ${r.region || 'RDC'}\nPortions : ${r.servings}\nPréparation : ${r.prep_time}\nCuisson : ${r.cook_time}\n\n## Ingrédients\n${ingredientsFr}\n\n## Préparation\n${stepsFr}\n\nSource : ${r.urls.fr}`,
      recipe_id: r.slug,
    });

    pairs.push({
      id: `${r.slug}-recipe-en`,
      lang: 'en',
      task: 'recipe_full',
      prompt: `Give the full recipe for the Congolese dish "${nameEn}" (Democratic Republic of the Congo).`,
      completion: `# ${nameEn}\n\n${r.description.en || r.description.fr}\n\nRegion: ${r.region || 'DRC'}\nServings: ${r.servings}\nPrep: ${r.prep_time}\nCook: ${r.cook_time}\n\n## Ingredients\n${ingredientsEn}\n\n## Steps\n${stepsEn}\n\nSource: ${r.urls.en}`,
      recipe_id: r.slug,
    });

    pairs.push({
      id: `${r.slug}-ingredients-fr`,
      lang: 'fr',
      task: 'list_ingredients',
      prompt: `Quels sont les ingrédients pour préparer ${nameFr} ?`,
      completion: ingredientsFr,
      recipe_id: r.slug,
    });

    if (r.region) {
      pairs.push({
        id: `${r.slug}-region-fr`,
        lang: 'fr',
        task: 'region_context',
        prompt: `D'où vient le plat ${nameFr} en RDC ?`,
        completion: `${nameFr} est associé à la région / zone : ${r.region}. Fiche Mpichi : ${r.urls.fr}`,
        recipe_id: r.slug,
      });
    }

    if (r.names.aliases?.length) {
      const aliasList = r.names.aliases.map((a) => a.name).join(', ');
      pairs.push({
        id: `${r.slug}-aliases-fr`,
        lang: 'fr',
        task: 'aliases',
        prompt: `Quels autres noms connaît-on pour ${nameFr} ?`,
        completion: `${nameFr} peut aussi être appelé : ${aliasList}.`,
        recipe_id: r.slug,
      });
    }
  }

  // Region aggregate questions
  const byRegion = new Map();
  for (const r of records) {
    if (!r.region) continue;
    const list = byRegion.get(r.region) || [];
    list.push(r.names.fr);
    byRegion.set(r.region, list);
  }
  let i = 0;
  for (const [region, names] of byRegion) {
    if (names.length < 2) continue;
    pairs.push({
      id: `region-list-${i++}`,
      lang: 'fr',
      task: 'region_list',
      prompt: `Quels plats congolais du dataset Mpichi sont liés à « ${region} » ?`,
      completion: names.map((n) => `- ${n}`).join('\n'),
      recipe_id: null,
    });
  }

  return pairs;
}

function writeJsonl(filePath, rows) {
  const body = rows.map((r) => JSON.stringify(r)).join('\n') + (rows.length ? '\n' : '');
  fs.writeFileSync(filePath, body, 'utf8');
}

function main() {
  const { mpichiRoot } = parseArgs(process.argv.slice(2));
  const matter = loadGrayMatter();
  const recettesDir = path.join(mpichiRoot, 'src/content/recettes');
  if (!fs.existsSync(recettesDir)) {
    console.error('Recettes directory not found:', recettesDir);
    process.exit(1);
  }

  const pkg = JSON.parse(fs.readFileSync(path.join(DATASET_ROOT, 'package.json'), 'utf8'));
  const version = pkg.version || '1.0.0';
  const updatedAt = new Date().toISOString().slice(0, 10);
  const aliasMap = JSON.parse(
    fs.readFileSync(path.join(DATASET_ROOT, 'enrichment/aliases.json'), 'utf8'),
  );
  const enMap = loadEnTranslations(mpichiRoot);

  const files = fs.readdirSync(recettesDir).filter((f) => f.endsWith('.md')).sort();
  const records = [];

  for (const file of files) {
    const slug = file.replace(/\.md$/, '');
    const raw = fs.readFileSync(path.join(recettesDir, file), 'utf8');
    const { data, content } = matter(raw);
    const bodyFr = content.replace(/\r\n/g, '\n').trim();
    records.push(buildRecord(slug, data, bodyFr, enMap[slug], aliasMap, version, updatedAt));
  }

  records.sort((a, b) => a.slug.localeCompare(b.slug));

  const dataDir = path.join(DATASET_ROOT, 'data');
  const splitsDir = path.join(dataDir, 'splits');
  const instructionDir = path.join(dataDir, 'instruction');
  fs.mkdirSync(splitsDir, { recursive: true });
  fs.mkdirSync(instructionDir, { recursive: true });

  fs.writeFileSync(path.join(dataDir, 'recipes.json'), JSON.stringify(records, null, 2) + '\n', 'utf8');
  writeJsonl(path.join(dataDir, 'recipes.jsonl'), records);

  const { train, valid } = splitTrainValid(records);
  writeJsonl(path.join(splitsDir, 'train.jsonl'), train);
  writeJsonl(path.join(splitsDir, 'valid.jsonl'), valid);

  const pairs = instructionPairs(records);
  writeJsonl(path.join(instructionDir, 'pairs.jsonl'), pairs);
  fs.writeFileSync(
    path.join(instructionDir, 'pairs.json'),
    JSON.stringify(pairs, null, 2) + '\n',
    'utf8',
  );

  const meta = {
    name: 'mpichi-dataset',
    version,
    updated_at: updatedAt,
    recipe_count: records.length,
    instruction_pair_count: pairs.length,
    splits: { train: train.length, valid: valid.length },
    source_site: 'https://mpichi.likeur.xyz',
    source_repo: 'https://github.com/Likeur/mpichi',
    data_license: 'CC-BY-4.0',
    code_license: 'MIT',
    languages: ['fr', 'en'],
    country: 'CD',
  };
  // fix typo
  meta.recipe_count = records.length;
  fs.writeFileSync(path.join(dataDir, 'meta.json'), JSON.stringify(meta, null, 2) + '\n', 'utf8');

  console.log(`Exported ${records.length} recipes → data/`);
  console.log(`  train=${train.length} valid=${valid.length} instruction_pairs=${pairs.length}`);
}

main();
