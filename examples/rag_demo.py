#!/usr/bin/env python3
"""
Lightweight RAG / retrieval demo over Mpichi recipes.jsonl.

Default backend: character/word TF-IDF (stdlib + pure Python) — no GPU, no extra deps.
Optional: pip install sentence-transformers  →  --backend st

Examples:
  python examples/rag_demo.py
  python examples/rag_demo.py --query "accompagnement pour moambe" --k 5
  python examples/rag_demo.py --eval --backend tfidf
"""
from __future__ import annotations

import argparse
import json
import math
import re
import sys
from collections import Counter
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DEFAULT_RECIPES = ROOT / "data" / "recipes.jsonl"
DEFAULT_EVAL = ROOT / "data" / "eval" / "qa.jsonl"

TOKEN_RE = re.compile(r"[a-z0-9àâäéèêëïîôùûüçœæ]+", re.I)


def tokenize(text: str) -> list[str]:
    return TOKEN_RE.findall((text or "").casefold())


def load_recipes(path: Path) -> list[dict]:
    rows = []
    with path.open(encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if line:
                rows.append(json.loads(line))
    return rows


def recipe_document(r: dict) -> str:
    aliases = ", ".join(a["name"] for a in (r.get("names") or {}).get("aliases") or [])
    tags = ", ".join(r.get("tags") or [])
    region = r.get("region") or ""
    region_label = (r.get("region_label") or {}).get("fr") or ""
    ingredients = " ; ".join((r.get("ingredients") or {}).get("fr") or [])
    desc = (r.get("description") or {}).get("fr") or ""
    cat = r.get("category") or ""
    return "\n".join(
        [
            (r.get("names") or {}).get("fr") or "",
            (r.get("names") or {}).get("en") or "",
            aliases,
            region,
            region_label,
            cat,
            tags,
            desc,
            ingredients,
        ]
    )


class TfidfIndex:
    def __init__(self, docs: list[str]):
        self.docs = docs
        self.doc_tokens = [tokenize(d) for d in docs]
        df: Counter[str] = Counter()
        for toks in self.doc_tokens:
            df.update(set(toks))
        self.n = len(docs)
        self.idf = {t: math.log((1 + self.n) / (1 + c)) + 1.0 for t, c in df.items()}
        self.vecs = [self._tfidf(toks) for toks in self.doc_tokens]

    def _tfidf(self, toks: list[str]) -> dict[str, float]:
        tf = Counter(toks)
        if not tf:
            return {}
        max_tf = max(tf.values())
        vec = {t: (c / max_tf) * self.idf.get(t, 0.0) for t, c in tf.items()}
        norm = math.sqrt(sum(v * v for v in vec.values())) or 1.0
        return {t: v / norm for t, v in vec.items()}

    def query(self, text: str, k: int = 5) -> list[tuple[int, float]]:
        q = self._tfidf(tokenize(text))
        scores = []
        for i, dvec in enumerate(self.vecs):
            score = sum(q.get(t, 0.0) * w for t, w in dvec.items())
            scores.append((i, score))
        scores.sort(key=lambda x: x[1], reverse=True)
        return scores[:k]


class StIndex:
    """Optional sentence-transformers backend."""

    def __init__(self, docs: list[str], model_name: str = "sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2"):
        try:
            from sentence_transformers import SentenceTransformer  # type: ignore
            import numpy as np  # type: ignore
        except ImportError as e:
            raise SystemExit(
                "sentence-transformers not installed. "
                "pip install sentence-transformers  OR use --backend tfidf"
            ) from e
        self.np = np
        self.model = SentenceTransformer(model_name)
        self.emb = self.model.encode(docs, normalize_embeddings=True, show_progress_bar=False)

    def query(self, text: str, k: int = 5) -> list[tuple[int, float]]:
        q = self.model.encode([text], normalize_embeddings=True, show_progress_bar=False)[0]
        sims = self.emb @ q
        idx = self.np.argsort(-sims)[:k]
        return [(int(i), float(sims[i])) for i in idx]


def build_index(docs: list[str], backend: str):
    if backend == "st":
        return StIndex(docs)
    return TfidfIndex(docs)


def run_query(recipes: list[dict], index, query: str, k: int) -> None:
    print(f"\nQuery: {query!r}\nBackend top-{k}:")
    for rank, (i, score) in enumerate(index.query(query, k=k), 1):
        r = recipes[i]
        print(
            f"  {rank}. [{score:.3f}] {r['slug']:28}  {r['names']['fr']}  "
            f"({r['category']}, {r.get('region_id', '?')})"
        )


def load_eval(path: Path) -> list[dict]:
    rows = []
    with path.open(encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if line:
                rows.append(json.loads(line))
    return rows


def eval_retrieval(recipes: list[dict], index, eval_rows: list[dict], k: int = 3) -> dict:
    slug_to_i = {r["slug"]: i for i, r in enumerate(recipes)}
    # Only items with a single primary recipe target (or pairing with gold set)
    usable = [e for e in eval_rows if e.get("recipe_ids")]
    hits1 = hits3 = 0
    mrr = 0.0
    n = 0
    for e in usable:
        gold = {s for s in e["recipe_ids"] if s in slug_to_i}
        if not gold:
            continue
        n += 1
        ranked = index.query(e["question"], k=max(k, 5))
        ranked_slugs = [recipes[i]["slug"] for i, _ in ranked]
        # Hit if any gold in top-k
        if any(s in gold for s in ranked_slugs[:1]):
            hits1 += 1
        if any(s in gold for s in ranked_slugs[:3]):
            hits3 += 1
        rr = 0.0
        for rank, s in enumerate(ranked_slugs, 1):
            if s in gold:
                rr = 1.0 / rank
                break
        mrr += rr
    return {
        "n": n,
        "hit_at_1": hits1 / n if n else 0.0,
        "hit_at_3": hits3 / n if n else 0.0,
        "mrr": mrr / n if n else 0.0,
    }


def main(argv: list[str] | None = None) -> int:
    p = argparse.ArgumentParser(description="Mpichi recipes retrieval demo")
    p.add_argument("--recipes", type=Path, default=DEFAULT_RECIPES)
    p.add_argument("--eval-file", type=Path, default=DEFAULT_EVAL)
    p.add_argument("--query", default="accompagnement pour moambe")
    p.add_argument("--k", type=int, default=5)
    p.add_argument("--backend", choices=("tfidf", "st"), default="tfidf")
    p.add_argument("--eval", action="store_true", help="Run retrieval baseline on data/eval/qa.jsonl")
    args = p.parse_args(argv)

    if not args.recipes.exists():
        print(f"Missing {args.recipes} — run npm run export first.", file=sys.stderr)
        return 1

    recipes = load_recipes(args.recipes)
    docs = [recipe_document(r) for r in recipes]
    index = build_index(docs, args.backend)

    run_query(recipes, index, args.query, args.k)

    if args.eval:
        if not args.eval_file.exists():
            print(f"Missing eval file {args.eval_file}", file=sys.stderr)
            return 1
        metrics = eval_retrieval(recipes, index, load_eval(args.eval_file))
        print("\nBaseline retrieval on eval set (gold recipe_ids ∩ top-k):")
        print(f"  n={metrics['n']}")
        print(f"  Hit@1={metrics['hit_at_1']:.3f}")
        print(f"  Hit@3={metrics['hit_at_3']:.3f}")
        print(f"  MRR={metrics['mrr']:.3f}")
        print(f"  backend={args.backend}")

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
