# Changelog

All notable changes to the **Mpichi Dataset** are documented here.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project aims to follow [Semantic Versioning](https://semver.org/).

Version bumps are reflected in `package.json`, `data/meta.json`, and (when tagged)
GitHub releases / Hugging Face revisions.

## [Unreleased]

### Added

- Editorial wave G (+6 recipes): `soso-na-madesu`, `loso-na-soso`, `pondu-ngulu`, `queue-boeuf-sauce`, `makemba-na-soso`, `beignets-haricot` + curated aliases
- Editorial wave L (+4 recipes): `soso-grille-entier`, `rognons-saute`, `langue-boeuf-sauce`, `plantain-grille-arachide` + curated aliases
- Editorial wave K (+5 recipes): `jus-gingembre-ananas`, `the-citronnelle`, `bouillie-manioc`, `gateau-banane`, `galettes-mais` + curated aliases
- Companion site Lingala locale (`/ln`): UI strings, recipe/guide overlays, region labels; curated `ln` aliases for every recipe slug in `enrichment/aliases.json`
- `data/meta.json` `site_locales` (`fr`, `en`, `ln`) documenting the trilingual site surface (recipe bodies remain FR/EN until a dedicated LN export)

### Changed

- SEO / Search Console P0: titles & intros for `bukari-katanga`, `makoso`, `capitaine-braise`, `tangawisi`, `porc-braise`, `sauce-pili-pili`; EN meta for `pondu` (rice and pondu); aliases for GSC queries (`bukari fufu`, `makoso en français`, `jus tangawisi`, `ngulu braisé`, `igname bouilli`, …)
- Language hygiene: FR titles without Lingala grammar (`ya` / `na`); EN titles in English; Lingala names kept as aliases + short allusions in FR/EN descriptions (kotumba, loso na…, ngulu ya sauce, mbisi na kwanga, …)

## [1.6.0] — 2026-11-02

### Added

- Editorial waves A–F (+33 recipes vs v1.5.1): phares, street Kinshasa, féculents, régions sous-couvertes, boissons & desserts, renfort polish (`crevettes-grillees`, `cotes-porc`, `mikila-arachide`, `chou-kinshasa`, …)
- Site companion guide `/guides/fufu/` (not part of the recipe JSON export)
- Alias coverage expanded for waves A–F

### Changed

- Related-recipe links rebalanced on flagship cards (pondu, moambe, fufu, pork/shrimp/mikila clusters)

## [1.5.1] — 2026-10-26

### Added

- Zenodo DOI `10.5281/zenodo.23651495` wired into `CITATION.cff`, preprint, README, and dataset card

## [1.5.0] — 2026-10-25

### Added

- Lot 5 distribution: English preprint with bilingual EN/FR abstracts (`paper/mpichi-dataset-preprint.md`)
- Author metadata: Jack Simba Wa Nkulu (`jacksimba28@gmail.com`) in `CITATION.cff` and Zenodo/Croissant packaging
- `.zenodo.json` + `paper/ZENODO.md` checklist for DOI minting
- `metadata/croissant.json` (MLCommons Croissant sketch)

## [1.4.0] — 2026-10-25

### Added

- Lot 4 ML examples: `examples/rag_demo.py` (TF-IDF retrieval + optional sentence-transformers)
- Eval split `data/eval/qa.jsonl` (~95 Q/A: aliases, régions, ingredients, pairing, category)
- SFT tasks `alias_to_dish`, `region_dishes`, `structured_ingredients` in instruction pairs
- README Quickstart ML + `examples/BASELINE.md` retrieval metrics
- Validate gate: eval file present with ≥50 rows

## [1.3.0] — 2026-10-25

### Added

- Lot 3 region normalization: `region_id`, bilingual `region_label`, `region_legacy` (shared catalog `src/lib/taxonomy/regions.json` on the Mpichi site)
- Lot 3 structured ingredients: `ingredients_structured` (`raw` always; `amount` / `unit` / `name` when parseable) on recipes and variants
- Export meta: `region_counts`, `ingredients_structured` coverage stats
- Validate gates: required Lot 3 fields + ≥80 % structured ingredient coverage

### Changed

- JSON Schema additive fields for regions and structured ingredients (v1.3.0)

## [1.2.0] — 2026-10-25

### Added

- Lot 2 linguistic enrichment: curated `enrichment/aliases.json` for **100 %** of recipe slugs (ln / sw / kg / lua / fr / en…)
- Optional alias fields `region_hint`, `script` in JSON Schema
- `enrichment/README.md` documenting export merge (curated → tag fallbacks)
- README language-coverage table

## [1.1.0] — 2026-10-25

### Added

- Lot 1 editorial wave: **111** bilingual recipes (was 92) — Est/Kivu, Kasaï, Katanga coverage
- Bidia variant on `bukari-katanga`; new regional plates (bugali, maharage, makosso, brochettes Lubumbashi, etc.)

## [1.0.1] — 2026-10-25

### Added

- GitHub Actions CI (`npm run validate` on push/PR to `main`)
- `CHANGELOG.md`
- Published on Hugging Face: [`likeur17/mpichi-dataset`](https://huggingface.co/datasets/likeur17/mpichi-dataset)

## [1.0.0] — 2026-10-23

### Added

- Initial open release: 92 bilingual recipes, train/valid splits, 473 instruction pairs
- JSON Schema, datasheet, dataset card, CC BY 4.0 data + MIT scripts
- Curated alias enrichment seed (`enrichment/aliases.json`)
- Export + validate scripts from the Mpichi site content

[Unreleased]: https://github.com/Likeur/mpichi-dataset/compare/v1.6.0...HEAD
[1.6.0]: https://github.com/Likeur/mpichi-dataset/compare/v1.5.1...v1.6.0
[1.5.1]: https://github.com/Likeur/mpichi-dataset/compare/v1.5.0...v1.5.1
[1.5.0]: https://github.com/Likeur/mpichi-dataset/compare/v1.4.0...v1.5.0
[1.4.0]: https://github.com/Likeur/mpichi-dataset/compare/v1.3.0...v1.4.0
[1.3.0]: https://github.com/Likeur/mpichi-dataset/compare/v1.2.0...v1.3.0
[1.2.0]: https://github.com/Likeur/mpichi-dataset/compare/v1.1.0...v1.2.0
[1.1.0]: https://github.com/Likeur/mpichi-dataset/compare/v1.0.1...v1.1.0
[1.0.1]: https://github.com/Likeur/mpichi-dataset/compare/v1.0.0...v1.0.1
[1.0.0]: https://github.com/Likeur/mpichi-dataset/releases/tag/v1.0.0
