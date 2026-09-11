import { refreshIcons } from "./mount.js";

function chrome(title, body, ctx) {
  return `<div class="gsp-secondary">
    <header class="gsp-secondary-header">
      <button type="button" data-gsp-open="${ctx.state.secondaryReturn || "journey"}" aria-label="Back">
        <i data-lucide="chevron-left"></i>
      </button>
      <h1>${title}</h1>
      <span></span>
    </header>
    <main class="gsp-secondary-main">${body}</main>
  </div>`;
}

export function mount(root, ctx) {
  const pattern = ctx.data.patterns["evacuation-vs-hard-stool"];
  const factors = pattern.factors
    .map(([label, copy]) => `<div class="gsp-pair"><span>${label}</span><strong style="text-align:right;max-width:70%;font-weight:500">${copy}</strong></div>`)
    .join("");
  const clarify = pattern.clarify.map((item) => `<p class="gsp-question">${item}</p>`).join("");
  root.innerHTML = chrome(
    "Insight",
    `<article class="gsp-card">
      <p class="gsp-kicker">${pattern.chipLabel}</p>
      <h2 style="margin:0 0 8px;font-size:var(--gs-type-hero-size);line-height:var(--gs-type-hero-line)">${pattern.title}</h2>
      <p>${pattern.subtitle}</p>
      <div class="gsp-confidence" aria-label="${pattern.confidence}% confidence"><i style="width:${pattern.confidence}%"></i></div>
      <p>${pattern.summary}</p>
    </article>
    <article class="gsp-card">
      <h3 style="margin:0 0 10px">What fits</h3>
      <div class="gsp-pairs">${factors}</div>
    </article>
    <article class="gsp-card">
      <h3 style="margin:0 0 10px">Next</h3>
      ${clarify}
    </article>
    <div class="gsp-inline-actions">
      <button class="gsp-inline-action is-primary" type="button" data-gsp-open="track">Record more evidence</button>
      <button class="gsp-inline-action" type="button" data-gsp-open="chat" data-gsp-prompt="My records show soft stool with continued straining. What remains uncertain?">Ask GI Copilot</button>
    </div>`,
    ctx
  );
  refreshIcons();
}
