#!/usr/bin/env python3
"""Controlli del sito prima del push. Solo libreria standard di Python.

1. Segnaposto "[[" in qualsiasi file del sito (.html, .css, .js, .md, .txt, .xml, .json).
2. HTML valido: tag non chiusi o chiusi nell'ordine sbagliato, id duplicati.
3. Parole vietate nelle home (index.html, en/index.html, it/index.html), lette da
   parole-vietate.txt; valgono per entrambe le lingue.

Uscita 0 = tutto ok, 1 = push bloccato.
"""
import re
import sys
from html.parser import HTMLParser
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
HOOKS = ROOT / ".githooks"
SITE_EXT = {".html", ".htm", ".css", ".js", ".md", ".txt", ".xml", ".json", ".svg"}
SKIP_DIRS = {".git", ".githooks", "node_modules"}
SKIP_FILES = {"CLAUDE.md"}  # regole interne: citano "[[" e le parole vietate
HOMES = ["index.html", "en/index.html", "it/index.html"]

VOID = {"area", "base", "br", "col", "embed", "hr", "img", "input", "link", "meta",
        "source", "track", "wbr"}
# Elementi con chiusura implicita ammessa dall'HTML5
OPTIONAL_END = {"p", "li", "dt", "dd", "tr", "td", "th", "thead", "tbody", "tfoot",
                "option", "optgroup", "colgroup", "caption", "rt", "rp"}


def site_files():
    for p in ROOT.rglob("*"):
        rel = p.relative_to(ROOT)
        if any(part in SKIP_DIRS for part in rel.parts) or p.name in SKIP_FILES:
            continue
        if p.is_file() and p.suffix.lower() in SITE_EXT:
            yield p


class Checker(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.stack = []
        self.errors = []
        self.ids = {}

    def _pos(self):
        return self.getpos()[0]

    def handle_starttag(self, tag, attrs):
        for k, v in attrs:
            if k == "id" and v:
                if v in self.ids:
                    self.errors.append(f"riga {self._pos()}: id duplicato '{v}' (già a riga {self.ids[v]})")
                else:
                    self.ids[v] = self._pos()
        if tag not in VOID:
            self.stack.append((tag, self._pos()))

    def handle_startendtag(self, tag, attrs):
        # <tag/>: autochiuso (svg ecc.), non entra nello stack
        for k, v in attrs:
            if k == "id" and v:
                if v in self.ids:
                    self.errors.append(f"riga {self._pos()}: id duplicato '{v}' (già a riga {self.ids[v]})")
                else:
                    self.ids[v] = self._pos()

    def handle_endtag(self, tag):
        if tag in VOID:
            return
        if not any(t == tag for t, _ in self.stack):
            self.errors.append(f"riga {self._pos()}: </{tag}> senza apertura")
            return
        while self.stack:
            t, line = self.stack.pop()
            if t == tag:
                return
            if t not in OPTIONAL_END:
                self.errors.append(f"riga {self._pos()}: </{tag}> chiude prima <{t}> aperto a riga {line}")

    def finish(self):
        self.close()
        for t, line in self.stack:
            if t not in OPTIONAL_END and t not in {"html", "body", "head"}:
                self.errors.append(f"<{t}> aperto a riga {line} non viene mai chiuso")


def load_banned():
    words = []
    f = HOOKS / "parole-vietate.txt"
    for raw in f.read_text(encoding="utf-8").splitlines():
        line = raw.strip()
        if line and not line.startswith("#"):
            words.append(line)
    return words


def visible_text(html):
    # Testo visibile + attributi letti dall'utente (alt, title, aria-label, content dei meta)
    html = re.sub(r"<!--.*?-->", " ", html, flags=re.S)
    html = re.sub(r"<(script|style)\b.*?</\1>", " ", html, flags=re.S | re.I)
    attrs = " ".join(re.findall(r'\b(?:alt|title|aria-label|content|placeholder)="([^"]*)"', html))
    text = re.sub(r"<[^>]+>", " ", html)
    return text + " " + attrs


def main():
    problems = []

    for p in site_files():
        rel = p.relative_to(ROOT)
        for n, line in enumerate(p.read_text(encoding="utf-8", errors="replace").splitlines(), 1):
            if "[[" in line:
                problems.append(f"[segnaposto] {rel}:{n}: {line.strip()[:120]}")

    for p in ROOT.rglob("*.htm*"):
        rel = p.relative_to(ROOT)
        if any(part in SKIP_DIRS for part in rel.parts):
            continue
        c = Checker()
        c.feed(p.read_text(encoding="utf-8", errors="replace"))
        c.finish()
        problems += [f"[html] {rel}: {e}" for e in c.errors]

    banned = load_banned()
    for home in HOMES:
        p = ROOT / home
        if not p.exists():
            continue
        text = visible_text(p.read_text(encoding="utf-8", errors="replace"))
        for w in banned:
            # Sigle tutte maiuscole: maiuscole/minuscole contano; le altre no
            flags = 0 if w.isupper() else re.I
            # Confine di parola senza escludere il trattino: "MEV-protected" contiene MEV
            hits = re.findall(r"(?<!\w)" + re.escape(w) + r"(?!\w)", text, flags)
            if hits:
                problems.append(f"[parola vietata] {home}: '{w}' ({len(hits)} volte)")

    if problems:
        print("Push bloccato. Problemi trovati:\n")
        print("\n".join(problems))
        print(f"\nTotale: {len(problems)}")
        return 1
    print("Controlli del sito: ok.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
