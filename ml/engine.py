#!/usr/bin/env python3
"""
BeFamous Growth Engine — ML-lite pattern miner.
Reads JSON stdin: { "posts": [ { "hook", "content_text", "viral_score" }, ... ] }
Writes JSON stdout: { "winning_patterns": { ... } }
"""
from __future__ import annotations

import json
import re
import sys
from collections import Counter
from typing import Any

STOP = {
    "the", "a", "an", "and", "or", "to", "of", "in", "on", "for", "is", "it",
    "this", "that", "with", "your", "you", "i", "my", "we", "our", "are",
    "was", "be", "as", "at", "by", "from",
}

PATTERN_LABELS = {
    "question_hooks": "Questions that spark curiosity",
    "numbered_list_hooks": "Numbered hooks (3 ways, 5 mistakes…)",
    "pov_or_watch_hooks": "POV / watch-this openers",
    "contrarian_truth_hooks": "Contrarian / hidden truth angles",
    "pattern_interrupt_hooks": "Stop / don’t / never interrupts",
    "direct_you_hooks": "Direct 'you' addressing",
}


def tokenize(text: str) -> list[str]:
    text = re.sub(r"[^a-z0-9#@\s]", " ", text.lower())
    return [w for w in text.split() if len(w) > 2 and w not in STOP]


def detect_hook_patterns(hooks: list[str]) -> list[str]:
    found: set[str] = set()
    for h in hooks:
        h = h.strip()
        if not h:
            continue
        if "?" in h:
            found.add("question_hooks")
        if re.match(r"^\d|#\d|\d\s*(reasons|ways|mistakes|signs)", h, re.I):
            found.add("numbered_list_hooks")
        if re.match(r"^(pov|watch this|this is)", h, re.I):
            found.add("pov_or_watch_hooks")
        if re.search(r"(secret|nobody tells you|truth)", h, re.I):
            found.add("contrarian_truth_hooks")
        if re.search(r"(stop|don't|never|quit)", h, re.I):
            found.add("pattern_interrupt_hooks")
        if re.match(r"^(you|your)", h, re.I):
            found.add("direct_you_hooks")
    return [PATTERN_LABELS[k] for k in found if k in PATTERN_LABELS]


def infer_content_types(posts: list[dict[str, Any]]) -> list[str]:
    types: set[str] = set()
    for p in posts:
        t = p.get("content_text") or ""
        words = len(t.split())
        if words < 80:
            types.add("ultra_short_script")
        elif words < 200:
            types.add("short_script")
        else:
            types.add("longer_story")
        if re.search(r"hook:|scene:|cta:", t, re.I):
            types.add("structured_script_format")
        if re.search(r"#\w+", t):
            types.add("hashtag_heavy_caption")
    return list(types)


def analyze(posts: list[dict[str, Any]]) -> dict[str, Any]:
    if not posts:
        return {
            "common_hook_patterns": [],
            "top_keywords": [],
            "content_types": [],
            "sample_hooks": [],
            "summary": "No scored posts yet. Generate content, add metrics, and run scoring.",
        }

    hooks = [str(p.get("hook") or "") for p in posts if (p.get("hook") or "").strip()]
    common_hook_patterns = detect_hook_patterns(hooks)

    freq: Counter[str] = Counter()
    for p in posts:
        blob = f'{p.get("hook") or ""} {p.get("content_text") or ""}'
        for w in tokenize(blob):
            freq[w] += 1

    top_keywords = [{"word": w, "c": n} for w, n in freq.most_common(15)]
    top_keywords = [{"word": x["word"], "count": x["c"]} for x in top_keywords]

    content_types = infer_content_types(posts)
    sample_hooks = hooks[:8]

    top3 = "; ".join(common_hook_patterns[:3]) or "—"
    summary = (
        f"Analyzed {len(posts)} top-performing posts. Dominant structures: {top3}. "
        "Lean into pattern interrupts and tight hooks under ~12 words."
    )

    return {
        "common_hook_patterns": common_hook_patterns,
        "top_keywords": top_keywords,
        "content_types": content_types,
        "sample_hooks": sample_hooks,
        "summary": summary,
    }


def main() -> None:
    data = json.load(sys.stdin)
    posts = data.get("posts") or []
    out = {"winning_patterns": analyze(posts)}
    json.dump(out, sys.stdout)


if __name__ == "__main__":
    main()
