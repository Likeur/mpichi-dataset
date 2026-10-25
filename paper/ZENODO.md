# Zenodo DOI — Mpichi Dataset (Lot 5)

Preprint + dataset packaging is ready. **Minting the DOI requires your Zenodo account** (one-time).

## Recommended path (GitHub → Zenodo)

1. Create / login: https://zenodo.org (use the ORCID or GitHub login tied to `jacksimba28@gmail.com` if possible).
2. Enable **GitHub** under Zenodo → GitHub, and flip on **`Likeur/mpichi-dataset`**.
3. On the next GitHub **Release** (e.g. `v1.5.0`), Zenodo creates a deposit + DOI automatically.
4. Copy the DOI into:
   - `CITATION.cff` → `identifiers` / `doi`
   - `paper/mpichi-dataset-preprint.md` header
   - Hugging Face dataset card
5. Prefer the **Concept DOI** (all versions) for long-term citation, and the **Version DOI** for v1.5.0 specifically.

## Manual upload (fallback)

Upload a ZIP of the tagged tree (exclude `node_modules/`, `.venv-hf/`):

- `data/**`, `schema/**`, `enrichment/**`, `examples/**`, `paper/**`, `metadata/**`
- `LICENSE`, `LICENSE-DATA`, `CITATION.cff`, `README.md`, `DATASHEET.md`, `dataset_card.md`

Metadata hints are in [`.zenodo.json`](../.zenodo.json).

## After DOI exists

Tell the agent (or open an issue) with the DOI string — we will patch citation files and re-sync Hugging Face.
