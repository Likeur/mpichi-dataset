---
title: "Mpichi Dataset: An Open Bilingual Resource of Congolese (DRC) Recipes for Cultural NLP and Local LLM Adaptation"
author: "Jack Simba Wa Nkulu"
email: jacksimba28@gmail.com
affiliation: "Independent researcher / Mpichi (likeur.xyz)"
date: 2026-10-25
version: "1.5.0-preprint"
license: "CC BY 4.0"
lang: en
---

# Mpichi Dataset: An Open Bilingual Resource of Congolese (DRC) Recipes for Cultural NLP and Local LLM Adaptation

**Jack Simba Wa Nkulu**  
Independent researcher · Mpichi / Likeur  
[https://likeur.xyz](https://likeur.xyz) · [https://mpichi.likeur.xyz](https://mpichi.likeur.xyz)  
`jacksimba28@gmail.com`

**Preprint** · Dataset version **v1.4.0** (companion release **v1.5.0** adds this note + distribution metadata)  
**Data license:** CC BY 4.0 · **Code:** MIT  
**Hugging Face:** [likeur17/mpichi-dataset](https://huggingface.co/datasets/likeur17/mpichi-dataset)  
**GitHub:** [Likeur/mpichi-dataset](https://github.com/Likeur/mpichi-dataset)

---

## Abstract (English)

We present **Mpichi Dataset**, an open bilingual (French / English) collection of curated recipes from the Democratic Republic of the Congo (DRC). The resource is designed for culinary and cultural research, information extraction, retrieval-augmented generation (RAG), and supervised fine-tuning of local language models. Beyond parallel recipe text, the dataset includes (i) curated multilingual dish-name aliases (e.g. Lingala, Swahili, Kikongo, Tshiluba), (ii) normalized geographic region identifiers with bilingual labels, (iii) best-effort structured ingredient parses (amount / unit / name) with full raw-string fallback, (iv) generated instruction-tuning pairs, and (v) a French question–answer evaluation split with a documented lexical retrieval baseline. As of v1.4.0 the release contains **110** recipes, **1 017** instruction pairs, and **95** eval items. We document schema, licenses, limitations, and intended uses. This preprint accompanies the public Hugging Face and GitHub releases; a DOI deposit (Zenodo) is prepared for stable citation.

## Résumé (Français)

Nous présentons **Mpichi Dataset**, une collection ouverte bilingue (français / anglais) de recettes documentées de la République démocratique du Congo (RDC). La ressource vise la recherche culinaire et culturelle, l’extraction d’information, la génération augmentée par retrieval (RAG) et le fine-tuning supervisé de modèles de langue locaux. Au-delà du texte parallèle, le jeu de données inclut (i) des alias de plats multilingues (lingala, swahili, kikongo, tshiluba, etc.), (ii) des identifiants de région normalisés avec libellés bilingues, (iii) un parse best-effort des ingrédients (quantité / unité / nom) avec conservation de la chaîne brute, (iv) des paires d’instruction pour le fine-tuning, et (v) un split d’évaluation question–réponse en français avec une baseline de retrieval lexical documentée. En v1.4.0 : **110** recettes, **1 017** paires d’instruction, **95** items d’eval. Nous décrivons le schéma, les licences, les limites et les usages prévus. Ce preprint accompagne les dépôts publics Hugging Face et GitHub ; un dépôt DOI (Zenodo) est préparé pour la citation stable.

---

## 1. Introduction

Large language models and open datasets remain unevenly distributed across languages, cultures, and everyday knowledge domains. Culinary practice is a dense carrier of regional identity, household transmission, and multilingual naming—especially in the DRC, where French coexists with national and regional languages (Lingala, Swahili, Kikongo, Tshiluba, and others).

Existing food corpora are often Western-centric, monolingual, or scrape-derived with weak provenance. **Mpichi** ([mpichi.likeur.xyz](https://mpichi.likeur.xyz)) is an editorial web project that documents Congolese recipes with bilingual pages, regional context, and image credits. **Mpichi Dataset** exports that curated content into machine-readable JSON/JSONL for research and local AI adaptation, under an explicit open license (**CC BY 4.0** for textual data).

**Contributions.**

1. An open **bilingual DRC recipe** dataset with stable slugs, provenance fields, and site URLs.  
2. **Linguistic enrichment**: curated aliases with language codes and optional region hints.  
3. **Machine-oriented structure**: canonical `region_id` / `region_label`, and `ingredients_structured` (≥80% lines with amount+unit when parseable).  
4. **ML starter pack**: instruction pairs, eval Q/A, and a runnable TF-IDF retrieval demo with reported Hit@k / MRR.  
5. Distribution artifacts: datasheet, Hugging Face card, CITATION.cff, Croissant metadata, and Zenodo-ready packaging.

This note is a **resource preprint**, not a leaderboard paper. Model results are limited to a simple lexical baseline.

---

## 2. Related work and positioning

Open recipe datasets and food NLP resources typically emphasize high-resource culinary cultures or large noisy web scrapes. African culinary resources that are (a) **editorially curated**, (b) **bilingual**, (c) **license-clear**, and (d) packaged with **aliases + region taxonomy + eval** remain rare.

Mpichi Dataset does **not** claim ethnographic completeness or clinical nutrition validity. It positions itself as a **living, citable resource** tied to a public editorial site, with versioned exports suitable for RAG and SFT experiments focused on Congolese kitchen knowledge.

---

## 3. Data collection and licensing

### 3.1 Source

Recipes originate from Markdown content on the Mpichi site (`src/content/recettes/*.md`) with English overrides (`src/i18n/recipes-en.ts`). An export script merges front matter, narrative body, and curated `enrichment/aliases.json`.

Editorial notes document **transmitted household practices**; quantities are starting points, not laboratory standards.

### 3.2 Licenses

| Asset | License |
| --- | --- |
| Recipe text & structured fields | **CC BY 4.0** (`LICENSE-DATA`) |
| Export / validate / example scripts | **MIT** |
| Third-party images | **Not redistributed**; records keep URLs + credits — users must respect upstream licenses (often Wikimedia) |

### 3.3 Ethics

- No private personal data beyond public photo credits.  
- Cultural practices vary by household and region; generated model outputs must not be presented as verified tradition without human review.  
- Not medical or nutritional advice.

---

## 4. Dataset design

### 4.1 Scale (v1.4.0)

| Resource | Count |
| --- | ---: |
| Recipes | 110 |
| Train / valid recipe split | 101 / 9 |
| Instruction pairs | 1 017 |
| Eval Q/A items | 95 |

**Category mix:** plat 69 · accompagnement 25 · dessert 9 · boisson 7.

### 4.2 Core recipe fields

Each recipe record includes bilingual `names`, `description`, `ingredients`, `steps`; optional `body` and `variants`; timing (human + ISO-8601); `category` / `difficulty` / `servings`; `sources`; Mpichi `urls`; and `license` / `attribution`.

**Legacy geography.** Free-text `region` (editorial) is retained for compatibility.

**Normalized geography (Lot 3).** `region_id` (shared taxonomy) + bilingual `region_label` + `region_legacy`.

**Structured ingredients (Lot 3).** Parallel `ingredients_structured` with always-present `raw` and optional `amount`, `amount_max`, `unit`, `name`, `parse_status` ∈ {`structured`, `raw_only`}. French primary-line structured coverage: **80.3%** (627 / 781).

### 4.3 Alias enrichment (Lot 2)

Curated aliases cover **100%** of current slugs. Approximate token counts by `lang` in `enrichment/aliases.json`: fr ~101, ln ~74, en ~40, sw ~31, kg ~3, lua ~2, pt ~1. Export merges curated rows first, then tag/title fallbacks (`lang: und`).

### 4.4 Instruction tasks (Lot 4)

Generated prompt/completion pairs include: `recipe_full`, `list_ingredients`, `region_context`, `aliases`, **`alias_to_dish`**, **`region_dishes`**, **`structured_ingredients`**, plus aggregate region lists.

### 4.5 Evaluation split (Lot 4)

`data/eval/qa.jsonl` contains French items across: alias→dish, region-of-dish, region dishes, ingredients, structured amounts, pairing, and category. Items are **semi-generated from the export** and retained as a fixed eval set (not regenerated on every export). Gold `recipe_ids` support retrieval metrics.

---

## 5. Regional coverage

Normalized `region_id` counts (v1.4.0):

| region_id | n | region_id | n |
| --- | ---: | --- | ---: |
| kinshasa | 25 | nationwide | 17 |
| kinshasa_west | 9 | grand_kasai | 9 |
| kinshasa_basin | 9 | kivu | 8 |
| grand_katanga | 7 | haut_katanga_tanganyika | 6 |
| bassin_congo | 4 | bandundu / ouest / kinshasa_kongo | 3 each |
| cuvette / kinshasa_cuvette | 3 / 2 | kongo_central / kisangani | 1 each |

Kinshasa-linked ids remain frequent (capital editorial density), but Lots 1–3 deliberately expanded Est/Kivu, Kasaï, and Katanga coverage relative to earlier Kinshasa-heavy snapshots.

---

## 6. Baseline retrieval experiment

We provide `examples/rag_demo.py`: a dependency-free **TF-IDF** index over recipe documents (titles, aliases, region, tags, description, ingredients). Optional `sentence-transformers` backend is supported but not required.

**Protocol.** For each eval item with gold `recipe_ids`, rank recipes by cosine similarity of TF-IDF vectors; report Hit@1, Hit@3, and MRR if any gold slug appears in the top-k.

**Results (v1.4.0, TF-IDF, n=95):**

| Metric | Score |
| --- | ---: |
| Hit@1 | 0.821 |
| Hit@3 | 0.937 |
| MRR | 0.883 |

These figures are a **lexical sanity check**, not a competitive NLP leaderboard. They demonstrate that the packaged fields are already usable for simple Congolese-recipe retrieval (e.g. query *« accompagnement pour moambe »* surfaces moambe dishes and `riz-moambe`).

---

## 7. Intended uses and non-uses

**Suitable for:** recipe QA; bilingual generation; alias / region grounding; RAG prototypes; SFT of small local models with attribution; teaching open cultural data practices.

**Unsuitable for:** medical/nutrition claims; asserting exhaustive coverage of Congolese cuisine; redistributing third-party images without checking licenses; replacing human cultural expertise.

---

## 8. Limitations

1. **Scale.** Hundreds of dishes exist in DRC practice; 110 curated records are a start.  
2. **Editorial bias.** Despite regional waves, Kinshasa-linked ids still dominate.  
3. **Eval quality.** Q/A items are semi-generated; not multi-annotator gold.  
4. **Parsing.** Ingredient structuring is heuristic; raw strings remain authoritative.  
5. **Aliases.** Prefer missing names over invented “local” forms; coverage will grow via PRs.  
6. **Single maintainer.** Community review is welcome; institutional ethnography is out of scope for this version.

---

## 9. Availability and citation

- **Site:** https://mpichi.likeur.xyz  
- **Dataset GitHub:** https://github.com/Likeur/mpichi-dataset  
- **Hugging Face:** https://huggingface.co/datasets/likeur17/mpichi-dataset  
- **Companion site repo:** https://github.com/Likeur/mpichi  
- **Datasheet:** `DATASHEET.md` · **Card:** `dataset_card.md` · **Croissant:** `metadata/croissant.json`  
- **Zenodo:** see `paper/ZENODO.md` (DOI to be minted from the GitHub release / Zenodo deposit)

Please cite the dataset (and this preprint when applicable) as in `CITATION.cff`.

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

---

## 10. Acknowledgments

Thanks to everyone transmitting Congolese kitchen knowledge across households and regions. Corrections and alias contributions are welcome via GitHub issues and pull requests.

---

## References (selected)

- Gebru, T., et al. (2021). Datasheets for Datasets. *Communications of the ACM*.  
- Hugging Face Datasets documentation. https://huggingface.co/docs/datasets  
- Mpichi editorial site. https://mpichi.likeur.xyz  
- Dataset repository. https://github.com/Likeur/mpichi-dataset  

*(Expand with venue-specific bibliography when submitting to a workshop.)*
