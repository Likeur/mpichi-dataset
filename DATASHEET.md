# Dataset Datasheet — Mpichi Congolese Recipes

Following the spirit of *Datasheets for Datasets* (Gebru et al.).

## Motivation

**For what purpose was the dataset created?**  
To openly document Congolese (DRC) culinary heritage in a machine-readable, bilingual form usable by researchers and developers training or evaluating local language models.

**Who created it?**  
Likeur ([likeur.xyz](https://likeur.xyz)), as part of the [Mpichi](https://mpichi.likeur.xyz) editorial project.

**Funding**  
Independent / community project (no dedicated grant at v1.0.0).

## Composition

**What do the instances represent?**  
Each instance is one dish/recipe with bilingual text (French primary, English when available), timing, region, tags, optional variants, and provenance fields.

**How many instances?**  
See `data/meta.json` after export (dozens of curated recipes; grows with the site).

**What data does each instance consist of?**  
Structured JSON fields described in `schema/recipe.schema.json`. No audio/video binaries; optional YouTube links and third-party image URLs only.

**Is any information missing?**  
Partial: structured ingredient quantities (`ingredients_structured` with `raw` always and `amount`/`unit`/`name` when parseable — ≥80 % structured as of v1.3.0). Still incomplete for all DRC ethnolinguistic names and verified historical sources beyond editorial notes.

**Are there recommended data splits?**  
`data/splits/train.jsonl` and `valid.jsonl` (~90/10 by deterministic hash, grouped by category).  
Lot 4 also ships `data/eval/qa.jsonl` (~95 French Q/A for retrieval / grounding eval) and enriched instruction tasks (`alias_to_dish`, `region_dishes`, `structured_ingredients`).

**Does the dataset contain confidential data?**  
No personal data of living private individuals beyond public photo credits.

## Collection process

**How was data acquired?**  
Editorial documentation of transmitted culinary practices, cross-checked with available public sources, published as Markdown on Mpichi then exported.

**Who was involved?**  
Editor (Likeur). Community corrections are welcome.

**Over what timeframe?**  
Ongoing since the Mpichi site launch (2026+).

## Preprocessing

Markdown front matter + body and English overrides (`recipes-en.ts`) are merged. ISO-8601 durations are derived from human time strings. Free-text `region` is mapped to `region_id` + bilingual `region_label` via the shared taxonomy (`src/lib/taxonomy/regions.json`). Ingredient lines are copied as strings and also parsed into `ingredients_structured` (best-effort). Aliases are merged from `enrichment/aliases.json` (**curated first**: `name`, `lang`, optional `note` / `region_hint` / `script`) then editorial tag/title fallbacks (`lang: und`). See `enrichment/README.md`. Instruction pairs are **generated** from recipe fields (not human chat logs).

## Uses

**Suitable for**  
Recipe QA, bilingual generation, retrieval, cultural NLP benchmarks, continued pretraining / SFT of local models with attribution.

**Unsuitable for**  
Medical/nutrition claims; claiming exhaustive coverage of Congolese cuisine; redistributing third-party images without checking their licenses.

## Distribution

**Where?**  
https://github.com/Likeur/mpichi-dataset (intended). Companion site: https://mpichi.likeur.xyz

**License**  
Textual data: CC BY 4.0 (`LICENSE-DATA`). Scripts: MIT (`LICENSE`).

## Maintenance

**Who will maintain it?**  
Likeur / Mpichi maintainers.

**How can errors be reported?**  
GitHub issues on the dataset or site repository; contact via likeur.xyz.
