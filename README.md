# Mpichi Dataset — Congolese (DRC) recipes

Open **bilingual (French / English)** dataset of Congolese recipes curated for [Mpichi](https://mpichi.likeur.xyz).

Built for:

- culinary & cultural **research**
- NLP / information extraction
- **local LLM fine-tuning** (instruction pairs included)

| | |
| --- | --- |
| Site | https://mpichi.likeur.xyz |
| Source content | https://github.com/Likeur/mpichi |
| Hugging Face | https://huggingface.co/datasets/likeur17/mpichi-dataset |
| Data license | [CC BY 4.0](LICENSE-DATA) |
| Code / scripts | [MIT](LICENSE) |
| Changelog | [CHANGELOG.md](CHANGELOG.md) |

## What’s included

```
data/
  recipes.jsonl          # one recipe per line (canonical)
  recipes.json           # same data as a JSON array
  meta.json              # counts, version, licenses
  splits/
    train.jsonl
    valid.jsonl          # ~10% holdout, stratified by category
  instruction/
    pairs.jsonl          # prompt / completion for SFT
    pairs.json
  eval/
    qa.jsonl             # Lot 4 Q/A eval (aliases, régions, ingredients…)
examples/
  rag_demo.py            # TF-IDF retrieval demo + baseline metrics
schema/
  recipe.schema.json
enrichment/
  aliases.json           # curated linguistic aliases (ln, sw, kg, lua, …)
  README.md              # alias schema + export merge rules
scripts/
  export-from-mpichi.mjs
  validate.mjs
```

Image **binaries are not shipped**. Records keep `image_url` + credits; respect third-party licenses (often Wikimedia).

## Regions & structured ingredients (Lot 3)

Each recipe carries:

- `region` — legacy editorial string
- `region_id` + `region_label.{fr,en}` — canonical taxonomy (shared with the Mpichi site)
- `ingredients_structured` — parallel to `ingredients`, with `raw` always and `amount` / `unit` / `name` when the line parses (≥80 % structured coverage)

See `data/meta.json` for `region_counts` and parse coverage after export.

## Alias coverage (Lot 2)

Curated names in `enrichment/aliases.json` aim for **≥70 %** of recipe slugs (v1.2.0+: **100 %** of site slugs). Export merges curated rows first, then tag/title fallbacks (`lang: und`). See [enrichment/README.md](enrichment/README.md).

Approximate **alias token** counts by `lang` (one name can appear on several dishes):

| lang | Code | Approx. names |
| --- | --- | --- |
| French glosses | `fr` | ~100 |
| Lingala | `ln` | ~70 |
| English | `en` | ~40 |
| Swahili | `sw` | ~30 |
| Kikongo | `kg` | few |
| Tshiluba | `lua` | few |
| Portuguese | `pt` | rare |

Coverage grows with PRs; wrong “local” inventions are worse than a missing alias.

## Quickstart ML

### 1. Load from Hugging Face

```python
from datasets import load_dataset

ds = load_dataset(
    "likeur17/mpichi-dataset",
    data_files="data/recipes.jsonl",
    split="train",
)
print(len(ds), ds[0]["names"]["fr"], ds[0]["region_id"])
```

### 2. SFT instruction pairs

```python
from datasets import load_dataset

pairs = load_dataset(
    "likeur17/mpichi-dataset",
    data_files="data/instruction/pairs.jsonl",
    split="train",
)
# tasks include recipe_full, alias_to_dish, region_dishes, structured_ingredients, …
print(pairs[0]["task"], pairs[0]["prompt"][:120])
```

### 3. RAG / retrieval

```bash
python3 examples/rag_demo.py --query "accompagnement pour moambe" --k 5
python3 examples/rag_demo.py --eval   # Hit@1 / Hit@3 / MRR on data/eval/qa.jsonl
```

See [examples/README.md](examples/README.md) and [examples/BASELINE.md](examples/BASELINE.md).

Dataset page: [likeur17/mpichi-dataset](https://huggingface.co/datasets/likeur17/mpichi-dataset).  
See [dataset_card.md](dataset_card.md) for the full card.

## Quick start (local JSONL)

```python
import json

recipes = []
with open("data/recipes.jsonl", encoding="utf-8") as f:
    for line in f:
        recipes.append(json.loads(line))

print(len(recipes), recipes[0]["names"]["fr"])
```

## Regenerate from the Mpichi site

This folder lives next to (or inside) the [mpichi](https://github.com/Likeur/mpichi) repo. Default `--mpichi-root` is the parent directory.

```bash
cd mpichi-dataset
npm install
npm run export
npm run validate
```

Custom path:

```bash
node scripts/export-from-mpichi.mjs --mpichi-root /path/to/mpichi
```

## Schema highlights

Each recipe record includes:

- `names.fr` / `names.en` + `names.aliases[]` (local / regional names)
- bilingual `description`, `ingredients`, `steps`, optional `body`
- `region`, `region_id`, `region_label`, `country: "CD"`, `geo_tags`
- `ingredients` + `ingredients_structured` (parsed amount/unit/name + raw)
- `prep_time` / `cook_time` (human) + `prep_time_iso` / `cook_time_iso` (ISO-8601)
- `variants`, `related_recipes`, `sources`
- `urls.fr` / `urls.en` pointing to Mpichi
- `license: "CC-BY-4.0"`, `attribution`

Full JSON Schema: [schema/recipe.schema.json](schema/recipe.schema.json).

## Preprint (Lot 5)

English technical note with **EN + FR abstracts**: [paper/mpichi-dataset-preprint.md](paper/mpichi-dataset-preprint.md).  
Zenodo DOI checklist: [paper/ZENODO.md](paper/ZENODO.md). Croissant: [metadata/croissant.json](metadata/croissant.json).

## Citation

```bibtex
@misc{simba_mpichi_dataset_2026,
  author       = {Simba Wa Nkulu, Jack},
  title        = {Mpichi Dataset: An Open Bilingual Resource of Congolese (DRC) Recipes},
  year         = {2026},
  howpublished = {\url{https://huggingface.co/datasets/likeur17/mpichi-dataset}},
  note         = {CC BY 4.0. GitHub: https://github.com/Likeur/mpichi-dataset. Preprint: paper/mpichi-dataset-preprint.md},
  email        = {jacksimba28@gmail.com}
}
```

Also see [CITATION.cff](CITATION.cff) and [DATASHEET.md](DATASHEET.md).

## Attribution (required for the data)

> Mpichi Dataset — Congolese recipes (DRC), by Jack Simba Wa Nkulu (Likeur).  
> https://github.com/Likeur/mpichi-dataset · https://mpichi.likeur.xyz  
> License: CC BY 4.0 · Contact: jacksimba28@gmail.com

## Ethics & limitations

- Recipes document **living practices**; quantities are starting points, not laboratory standards.
- Regional names and aliases are curated best-effort (Lot 2); still incomplete for rare dialect forms — contributions welcome.
- Do not present generated variants as verified tradition without human review.
- Not medical or nutritional advice.

## Contributing

See **[CONTRIBUTING.md](./CONTRIBUTING.md)** for the full guide and the
**[Code of Conduct](./CODE_OF_CONDUCT.md)**.

In short:

1. Prefer improving source files in the Mpichi site (`src/content/recettes`, `src/i18n/recipes-en.ts`).
2. Add curated aliases in `enrichment/aliases.json`.
3. Re-run `npm run export && npm run validate`.
4. Open a PR on this dataset repo and/or the site repo.
