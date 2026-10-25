# Retrieval baseline — Mpichi Dataset v1.4.0

Measured with `python3 examples/rag_demo.py --eval` on `data/eval/qa.jsonl`
(gold = any `recipe_ids` intersection with top-k).

| Backend | n | Hit@1 | Hit@3 | MRR | Date |
| --- | ---: | ---: | ---: | ---: | --- |
| TF-IDF (stdlib, default) | 95 | 0.821 | 0.937 | 0.883 | 2026-10-25 |

Demo query `accompagnement pour moambe` (TF-IDF top-5):

1. `poisson-moambe` — Poisson à la moambe  
2. `moambe-poulet` — Poulet à la moambe  
3. `riz-moambe` — Riz à la moambe *(accompagnement)*  
4. `manioc-grille` — Manioc grillé  
5. `lituma` — Lituma  

These scores are a **simple lexical baseline**, not a published leaderboard.
Re-run after changing recipes or the eval file.
