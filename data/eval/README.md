# Eval split — Mpichi Q&A (Lot 4)

File: [`qa.jsonl`](qa.jsonl) — one JSON object per line.

Semi-generated from the exported recipes, then kept as a **fixed** eval set
(do not overwrite casually when regenerating the main export).

## Fields

| Field | Description |
| --- | --- |
| `id` | Stable eval id |
| `task` | `alias_to_dish`, `region_of_dish`, `region_dishes`, `list_ingredients`, `structured_ingredient`, `pairing`, `category` |
| `lang` | Usually `fr` |
| `question` | User-style question |
| `answer` | Reference answer (not the only valid phrasing) |
| `recipe_ids` | Gold recipe slug(s) for retrieval / grounding |
| `notes` | Provenance / review note |

## Usage

```python
import json
rows = [json.loads(l) for l in open("data/eval/qa.jsonl", encoding="utf-8")]
print(len(rows), rows[0]["task"])
```

Retrieval baseline: `python3 examples/rag_demo.py --eval`.
