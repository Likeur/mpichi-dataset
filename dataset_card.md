---
pretty_name: Mpichi Congolese Recipes
language:
  - fr
  - en
license: cc-by-4.0
task_categories:
  - text-generation
  - question-answering
  - other
tags:
  - congo
  - drc
  - recipes
  - cuisine
  - africa
  - bilingual
  - instruction-tuning
size_categories:
  - n<1K
source_datasets: []
---

# Dataset Card for Mpichi Congolese Recipes

## Dataset Description

Bilingual open dataset of recipes from the **Democratic Republic of the Congo**, curated for [Mpichi](https://mpichi.likeur.xyz).

- **Repository:** https://github.com/Likeur/mpichi-dataset
- **Paper:** N/A
- **Point of Contact:** https://likeur.xyz

### Dataset Summary

Each row is a structured recipe (ingredients, steps, region, difficulty, aliases, sources) in French and, when available, English. An instruction-tuning split provides prompt/completion pairs for local LLM fine-tuning.

### Supported Tasks

- Recipe generation / completion
- Ingredient listing
- Regional culinary QA
- Instruction supervised fine-tuning (SFT)

### Languages

- French (`fr`) — primary editorial language
- English (`en`) — translations
- Alias hints may include Lingala (`ln`), Swahili (`sw`), etc.

## Dataset Structure

### Data Fields

See `schema/recipe.schema.json`. Core fields:

| Field | Type | Description |
| --- | --- | --- |
| `id` / `slug` | string | Stable id |
| `names` | object | `fr`, `en`, `aliases[]` |
| `description` | object | Bilingual summary |
| `ingredients` / `steps` | object | Bilingual string lists |
| `region` / `geo_tags` | string / list | Geography in DRC |
| `prep_time_iso` / `cook_time_iso` | string | ISO-8601 durations |
| `sources` | list | Provenance |
| `urls` | object | Canonical Mpichi pages |
| `license` | string | Always `CC-BY-4.0` |

Instruction pairs (`data/instruction/pairs.jsonl`):

| Field | Description |
| --- | --- |
| `prompt` | User-style instruction |
| `completion` | Target answer |
| `lang` | `fr` or `en` |
| `task` | e.g. `recipe_full`, `list_ingredients` |
| `recipe_id` | Source slug (nullable for aggregates) |

### Data Splits

| Split | File |
| --- | --- |
| all | `data/recipes.jsonl` |
| train | `data/splits/train.jsonl` |
| validation | `data/splits/valid.jsonl` |
| instruction | `data/instruction/pairs.jsonl` |

## Dataset Creation

Exported from the Mpichi Astro content collection (`src/content/recettes/*.md`) and English map (`src/i18n/recipes-en.ts`) via `scripts/export-from-mpichi.mjs`.

## Considerations for Using the Data

- Cultural practices vary by household; treat quantities as guidance.
- Image URLs are third-party; do not assume CC BY on pixels.
- Always attribute **Mpichi / Likeur** when redistributing or training.

## Additional Information

### Licensing Information

- **Data:** CC BY 4.0
- **Code:** MIT

### Citation Information

```bibtex
@misc{mpichi_dataset_2026,
  author       = {Likeur},
  title        = {Mpichi Dataset — Congolese (DRC) recipes},
  year         = {2026},
  howpublished = {\url{https://github.com/Likeur/mpichi-dataset}},
  note         = {CC BY 4.0}
}
```

### Contributions

Thanks to everyone transmitting Congolese kitchen knowledge. PRs welcome on aliases and corrections.
