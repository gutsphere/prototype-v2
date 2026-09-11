from __future__ import annotations

import re
import subprocess
from pathlib import Path


DOCUMENT = Path(__file__).resolve().parent
INDEX = DOCUMENT / "index.html"
TOKENS = DOCUMENT / "shared" / "tokens.css"
CHROME = DOCUMENT / "shared" / "chrome.css"
SHELL = DOCUMENT / "shared" / "shell.js"


class StructureParser:
    def __init__(self) -> None:
        self.ids: set[str] = set()
        self.duplicate_ids: set[str] = set()
        self.external_sources: list[str] = []

    def feed(self, html: str) -> None:
        for match in re.finditer(r'\bid=["\']([^"\']+)["\']', html, re.I):
            element_id = match.group(1)
            if element_id in self.ids:
                self.duplicate_ids.add(element_id)
            self.ids.add(element_id)
        for match in re.finditer(r'\bsrc=["\']([^"\']+)["\']', html, re.I):
            self.external_sources.append(match.group(1))


def require(condition: bool, message: str) -> None:
    if not condition:
        raise AssertionError(message)


def gather_document() -> str:
    parts = [
        INDEX.read_text(encoding="utf-8"),
        TOKENS.read_text(encoding="utf-8"),
        CHROME.read_text(encoding="utf-8"),
    ]
    for css in sorted((DOCUMENT / "screens").glob("*.css")):
        parts.append(css.read_text(encoding="utf-8"))
    for html_part in sorted((DOCUMENT / "screens").glob("*.html")):
        parts.append(html_part.read_text(encoding="utf-8"))
    for js in [
        SHELL,
        *sorted((DOCUMENT / "screens").glob("*.js")),
        DOCUMENT / "conditions" / "constipation.js",
    ]:
        if js.exists():
            parts.append(js.read_text(encoding="utf-8"))
    return "\n".join(parts)


def main() -> None:
    html = INDEX.read_text(encoding="utf-8")
    document = gather_document()
    parser = StructureParser()
    parser.feed(html)

    require(html.lower().startswith("<!doctype html>"), "Missing HTML5 doctype")
    require("<title>Gutsphere Demo v2</title>" in html, "Incorrect title")
    require("<iframe" not in html.lower(), "Standalone output still contains an iframe")
    require(not parser.duplicate_ids, f"Duplicate element IDs: {sorted(parser.duplicate_ids)}")

    canonical_tokens = {
        "--gs-color-canvas": "#f6f3ed",
        "--gs-color-surface": "#ffffff",
        "--gs-color-text": "#11120f",
        "--gs-color-text-muted": "#555950",
        "--gs-color-border": "#dedfd9",
        "--gs-color-brand-fill": "#ef5350",
        "--gs-color-brand-text": "#b9363b",
        "--gs-color-brand-soft": "#fde9e7",
        "--gs-color-support": "#2f6b55",
        "--gs-color-info": "#3f627a",
        "--gs-color-care": "#8d642f",
        "--gs-color-journey": "#695886",
        "--gs-color-critical": "#a43e36",
    }
    for token, value in canonical_tokens.items():
        require(f"{token}: {value};" in document, f"Canonical token mismatch: {token}")

    theme_aliases = (
        "gpg-canvas", "gpg-surface", "gpg-soft", "gpg-ink", "gpg-muted", "gpg-line", "gpg-coral",
        "gpm-canvas", "gpm-surface", "gpm-soft", "gpm-ink", "gpm-muted", "gpm-line", "gpm-coral",
        "gtc-bg", "gtc-panel", "gtc-soft", "gtc-ink", "gtc-muted", "gtc-line", "gtc-coral",
        "gts-bg", "gts-panel", "gts-soft", "gts-ink", "gts-muted", "gts-line", "gts-coral",
        "gjx-bg", "gjx-panel", "gjx-soft", "gjx-ink", "gjx-muted", "gjx-line", "gjx-coral",
        "gcs-bg", "gcs-panel", "gcs-soft", "gcs-ink", "gcs-muted", "gcs-line", "gcs-coral",
        "gcf-bg", "gcf-surface", "gcf-ink", "gcf-muted", "gcf-line", "gcf-coral",
    )
    for alias in theme_aliases:
        definitions = re.findall(rf"--{re.escape(alias)}\s*:\s*([^;]+);", document, re.I)
        require(definitions, f"Compatibility alias missing: {alias}")
        require(
            all("var(--gs-" in value for value in definitions),
            f"Independent theme value remains for {alias}",
        )

    forbidden_fragments = (
        "font-size:10px",
        "font-size: 10px",
        "font-size:11px",
        "font-size: 11px",
        "color-scheme:light dark",
        "color-scheme: light dark",
        "#fbf7f2",
        "#fffdfa",
        "#29231f",
        "#776d65",
        "#e7ddd4",
        "#0d0e0c",
        "#10110f",
        "#eeece6",
        "#ebe9e3",
        "#ddded8",
        "#dcddd7",
        "#464a43",
        "#6b4a21",
        "#a33030",
        "#cfe0d6",
        "#d8d8d2",
    )
    lower_document = document.lower()
    for fragment in forbidden_fragments:
        require(fragment not in lower_document, f"Legacy style remains: {fragment}")

    require(
        all(source.startswith(("https://", "data:", "blob:", "./")) for source in parser.external_sources),
        "A source depends on an unresolved local asset",
    )

    required_routes = {
        "plan-generation", "plan", "today", "track", "journey", "care", "chat",
        "profile", "notifications", "entry", "visit", "insight",
    }
    for route in required_routes:
        require(
            re.search(rf'data-gsp-route=["\']{re.escape(route)}["\']', document)
            or re.search(rf'["\']{re.escape(route)}["\']', SHELL.read_text(encoding="utf-8")),
            f"Route control missing: {route}",
        )

    today_html = (DOCUMENT / "screens" / "today.html").read_text(encoding="utf-8")
    require(
        today_html.count('class="gtc-plan-entry"') == 1 and "data-gsp-open-plan" in today_html,
        "Today must contain one persistent Plan entry button",
    )
    require(
        'aria-label="Open your current six-week Plan"' in today_html,
        "Today Plan entry needs an explicit accessible label",
    )
    require(
        'data-gsp-open-plan' in document,
        "Today Plan entry is not connected to the shared router",
    )
    require(
        'closest("[data-gsp-open-plan]")' in document or "closest('[data-gsp-open-plan]')" in document
        or 'closest("[data-gsp-open-plan]")' in SHELL.read_text(encoding="utf-8")
        or "closest('[data-gsp-open-plan]')" in SHELL.read_text(encoding="utf-8"),
        "Today Plan entry is not connected to the shared router",
    )
    require("9:41" not in document, "Fake status clock remains")

    for js_path in [SHELL, *sorted((DOCUMENT / "screens").glob("*.js")), DOCUMENT / "conditions" / "constipation.js"]:
        if not js_path.exists():
            continue
        result = subprocess.run(["node", "--check", str(js_path)], capture_output=True, text=True, check=False)
        require(result.returncode == 0, f"{js_path.name} failed syntax check: {result.stderr.strip()}")

    print("PASS: Demo v2 tokens, routes, aliases, and no legacy palettes")


if __name__ == "__main__":
    main()
