# Contributing to Mpichi Dataset

Thank you for helping grow this open bilingual dataset of Congolese (DRC)
recipes — curated for research and local LLM fine-tuning, companion to
[Mpichi](https://mpichi.likeur.xyz).

By participating, you agree to follow the [Code of Conduct](./CODE_OF_CONDUCT.md).

## Ways to contribute

| Path | Best for |
| --- | --- |
| Improve recipes on the [Mpichi site](https://github.com/Likeur/mpichi) | New dishes, translations, corrections |
| [Propose a recipe](https://mpichi.likeur.xyz/proposer) on the site | Family knowledge without Git |
| PR here — `enrichment/aliases.json` | Linguistic / regional name aliases |
| PR here — scripts / schema | Export pipeline, validation, JSON Schema |
| Issue | Data bugs, missing fields, citation questions |

Canonical recipe **source of truth** lives in the site repo
(`src/content/recettes/*.md` + `src/i18n/recipes-en.ts`). This dataset is
**exported** from that content — prefer fixing upstream when the text itself
is wrong.

## Setup

```bash
git clone https://github.com/Likeur/mpichi-dataset.git
cd mpichi-dataset
npm install
```

To regenerate from a local Mpichi checkout (default: parent directory):

```bash
npm run export
npm run validate
```

Custom site root:

```bash
node scripts/export-from-mpichi.mjs --mpichi-root /path/to/mpichi
```

## Adding or fixing recipe data

1. Change the Markdown / EN overlay in [Likeur/mpichi](https://github.com/Likeur/mpichi)
   (see that repo’s [CONTRIBUTING.md](https://github.com/Likeur/mpichi/blob/main/CONTRIBUTING.md)).
2. From this folder, run `npm run export && npm run validate`.
3. Open a PR here with the regenerated `data/` files (and a short note on what
   changed), **and/or** a PR on the site repo.

Do **not** hand-edit `data/recipes.jsonl` for content changes that belong in
the site — those edits will be overwritten on the next export.

## Curating aliases

Regional and linguistic names belong in [`enrichment/aliases.json`](enrichment/aliases.json):

- Prefer attested spellings (Lingala, Swahili, Tshiluba, Kikongo, etc.).
- Document uncertainty in the PR description when a form is disputed.
- Keep keys aligned with recipe slugs used in the export.

## Scripts & schema

- [`scripts/export-from-mpichi.mjs`](scripts/export-from-mpichi.mjs) — build JSONL / splits / instruction pairs
- [`scripts/validate.mjs`](scripts/validate.mjs) — structural checks
- [`schema/recipe.schema.json`](schema/recipe.schema.json) — record shape

PRs that change the schema should update `DATASHEET.md` / `dataset_card.md`
when fields or intended use change.

## Pull request process

1. Fork → descriptive branch (`fix/alias-pondu`, `chore/export-wave-4`, …)
2. `npm run validate` (and `npm run export` if data changed)
3. PR against `main` with:
   - what changed and why
   - whether the site repo also needs a linked PR
   - any license / attribution notes for new sources
4. Keep commits focused; do not commit `node_modules`

## Licenses & attribution

| Asset | License |
| --- | --- |
| Dataset records (`data/`) | [CC BY 4.0](./LICENSE-DATA) |
| Scripts / tooling | [MIT](./LICENSE) |
| Photos (URLs only) | Third-party — respect credits on each Mpichi recipe page |

Required attribution for the data is documented in the [README](./README.md#attribution-required-for-the-data).

By submitting a contribution, you agree it may be released under these
licenses, and that editorial text may be lightly edited to match Mpichi’s tone.

## Ethics reminders

- Recipes document **living practices**; quantities are starting points.
- Do not ship generated variants as verified tradition without human review.
- This is not medical or nutritional advice.
- See [DATASHEET.md](./DATASHEET.md) and [Ethics & limitations](./README.md#ethics--limitations).

## Contact

- Dataset: [github.com/Likeur/mpichi-dataset](https://github.com/Likeur/mpichi-dataset)
- Site: [mpichi.likeur.xyz](https://mpichi.likeur.xyz) · [Likeur/mpichi](https://github.com/Likeur/mpichi)
- Conduct / moderation: [jacksimba28@gmail.com](mailto:jacksimba28@gmail.com)
