# Linguistic enrichment

## `aliases.json`

Curated alternate names for Mpichi recipe slugs (Lingala, Swahili, Kikongo, Tshiluba, French, English, …).

Each entry under a slug is an object:

| Field | Required | Description |
| --- | --- | --- |
| `name` | yes | Alternate name as people say or search it |
| `lang` | recommended | ISO 639-1/3 hint: `ln`, `sw`, `kg`, `lua`, `fr`, `en`, … |
| `note` | no | Disambiguation (cousin dish, diaspora spelling, …) |
| `region_hint` | no | Where this name is most used |
| `script` | no | Script hint (`Latn`, …) |

## How export merges aliases

`scripts/export-from-mpichi.mjs` builds `names.aliases` as:

1. **Curated** rows from this file (preferred; keep `lang` / `note` / `region_hint` / `script`)
2. **Derived** fallbacks from the French title parentheses and editorial tags (`lang: "und"`)

Duplicate names (case-insensitive) are dropped; curated wins.

Do **not** invent lookalike names for unrelated dishes. Prefer a short French/English gloss over a wrong “local” token.
