# Zenodo DOI — Mpichi Dataset

**DOI (version):** [10.5281/zenodo.23651495](https://doi.org/10.5281/zenodo.23651495)

Already wired into `CITATION.cff`, README, dataset card, and the preprint.

## Concept vs version DOI

Zenodo also exposes a **Concept DOI** (all versions) on the record page. Prefer:

- **Version DOI** (`…/zenodo.23651495`) when citing this specific release  
- **Concept DOI** when citing the dataset “in general” across future versions  

If you mint a new GitHub Release later, Zenodo creates a new version DOI under the same concept.

## Metadata source

GitHub → Zenodo uses `.zenodo.json` + `CITATION.cff` from the tagged tree.
