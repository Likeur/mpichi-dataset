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
- **Hugging Face:** https://huggingface.co/datasets/likeur17/mpichi-dataset
- **Paper:** N/A
- **Point of Contact:** Jack Simba Wa Nkulu · jacksimba28@gmail.com · https://likeur.xyz

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
- Alias hints may include Lingala (`ln`), Swahili (`sw`), Kikongo (`kg`), Tshiluba (`lua`), French/English glosses, optional `region_hint`. Curated file covers **all** current site slugs (Lot 2); export merge rules in `enrichment/README.md`.

## Dataset Structure

### Data Fields

See `schema/recipe.schema.json`. Core fields:

| Field | Type | Description |
| --- | --- | --- |
| `id` / `slug` | string | Stable id |
| `names` | object | `fr`, `en`, `aliases[]` |
| `description` | object | Bilingual summary |
| `ingredients` / `steps` | object | Bilingual string lists |
| `ingredients_structured` | object | Parsed lines: `raw` + optional `amount`/`unit`/`name` |
| `region` | string | Legacy free-text region |
| `region_id` / `region_label` | string / object | Canonical id + FR/EN labels |
| `geo_tags` | list | Geography tokens in DRC |
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
| eval Q/A | `data/eval/qa.jsonl` |

### Example usage (Lot 4)

```bash
python3 examples/rag_demo.py --query "accompagnement pour moambe" --eval
```

See `examples/BASELINE.md` for documented TF-IDF Hit@k / MRR.

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

**DOI:** [10.5281/zenodo.23651495](https://doi.org/10.5281/zenodo.23651495)

```bibtex
@dataset{simba_mpichi_dataset_2026,
  author       = {Simba Wa Nkulu, Jack},
  title        = {Mpichi Dataset: An Open Bilingual Resource of Congolese (DRC) Recipes},
  year         = {2026},
  publisher    = {Zenodo},
  version      = {v1.5.1},
  doi          = {10.5281/zenodo.23651495},
  url          = {https://doi.org/10.5281/zenodo.23651495}
}
```

Preprint (EN body, EN+FR abstracts): `paper/mpichi-dataset-preprint.md`.

### Contributions

Author / maintainer: **Jack Simba Wa Nkulu** (`jacksimba28@gmail.com`).  
Thanks to everyone transmitting Congolese kitchen knowledge. PRs welcome on aliases and corrections.
