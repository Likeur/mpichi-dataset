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
| Data license | [CC BY 4.0](LICENSE-DATA) |
| Code / scripts | [MIT](LICENSE) |

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
schema/
  recipe.schema.json
enrichment/
  aliases.json           # curated linguistic aliases (ln, sw, …)
scripts/
  export-from-mpichi.mjs
  validate.mjs
```

Image **binaries are not shipped**. Records keep `image_url` + credits; respect third-party licenses (often Wikimedia).

## Quick start (Python)

```python
import json

recipes = []
with open("data/recipes.jsonl", encoding="utf-8") as f:
    for line in f:
        recipes.append(json.loads(line))

print(len(recipes), recipes[0]["names"]["fr"])
```

Instruction fine-tuning:

```python
import json

with open("data/instruction/pairs.jsonl", encoding="utf-8") as f:
    pairs = [json.loads(line) for line in f]

print(pairs[0]["prompt"])
print(pairs[0]["completion"][:200])
```

Hugging Face (after you publish the dataset):

```python
from datasets import load_dataset

ds = load_dataset("Likeur/mpichi-dataset", data_files="data/recipes.jsonl", split="train")
```

See [dataset_card.md](dataset_card.md) for the full card.

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
- `region`, `country: "CD"`, `geo_tags`
- `prep_time` / `cook_time` (human) + `prep_time_iso` / `cook_time_iso` (ISO-8601)
- `variants`, `related_recipes`, `sources`
- `urls.fr` / `urls.en` pointing to Mpichi
- `license: "CC-BY-4.0"`, `attribution`

Full JSON Schema: [schema/recipe.schema.json](schema/recipe.schema.json).

## Citation

```bibtex
@misc{mpichi_dataset_2026,
  author       = {Likeur},
  title        = {Mpichi Dataset — Congolese (DRC) recipes},
  year         = {2026},
  howpublished = {\url{https://github.com/Likeur/mpichi-dataset}},
  note         = {CC BY 4.0. Companion site: https://mpichi.likeur.xyz}
}
```

Also see [CITATION.cff](CITATION.cff) and [DATASHEET.md](DATASHEET.md).

## Attribution (required for the data)

> Mpichi Dataset — Congolese recipes (DRC), by Likeur.  
> https://github.com/Likeur/mpichi-dataset · https://mpichi.likeur.xyz  
> License: CC BY 4.0

## Ethics & limitations

- Recipes document **living practices**; quantities are starting points, not laboratory standards.
- Regional names and aliases are incomplete; contributions welcome.
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
