# Changelog

All notable changes to the **Mpichi Dataset** are documented here.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project aims to follow [Semantic Versioning](https://semver.org/).

Version bumps are reflected in `package.json`, `data/meta.json`, and (when tagged)
GitHub releases / Hugging Face revisions.

## [Unreleased]

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

[Unreleased]: https://github.com/Likeur/mpichi-dataset/compare/v1.2.0...HEAD
[1.2.0]: https://github.com/Likeur/mpichi-dataset/compare/v1.1.0...v1.2.0
[1.1.0]: https://github.com/Likeur/mpichi-dataset/compare/v1.0.1...v1.1.0
[1.0.1]: https://github.com/Likeur/mpichi-dataset/compare/v1.0.0...v1.0.1
[1.0.0]: https://github.com/Likeur/mpichi-dataset/releases/tag/v1.0.0
