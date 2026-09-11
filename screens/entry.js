import { refreshIcons } from "./mount.js";

function chrome(title, body, ctx) {
  return `<div class="gsp-secondary">
    <header class="gsp-secondary-header">
      <button type="button" data-gsp-open="${ctx.state.secondaryReturn || "track"}" aria-label="Back">
        <i data-lucide="chevron-left"></i>
      </button>
      <h1>${title}</h1>
      <span></span>
    </header>
    <main class="gsp-secondary-main">${body}</main>
  </div>`;
}

export function mount(root, ctx) {
  const id = ctx.state.currentEntryId || "bm-0810";
  const entry = ctx.data.entries[id] || ctx.data.entries["bm-0810"];
  const pairs = entry.pairs
    .map(([label, value]) => `<div class="gsp-pair"><span>${label}</span><strong>${value}</strong></div>`)
    .join("");
  const prompt = `Help me understand this log: ${entry.title}. ${entry.subtitle}. ${entry.detail}`;
  root.innerHTML = chrome(
    "Entry",
    `<article class="gsp-card">
      <p class="gsp-kicker">${entry.meta}</p>
      <h2 style="margin:0 0 8px;font-size:var(--gs-type-hero-size);line-height:var(--gs-type-hero-line)">${entry.title}</h2>
      <p>${entry.subtitle}</p>
      <div class="gsp-pairs" style="margin-top:14px">${pairs}</div>
    </article>
    <button class="gsp-inline-action is-primary" type="button" data-gsp-open="chat" data-gsp-prompt="${prompt.replaceAll('"', "&quot;")}" style="margin-top:16px;width:100%">
      Ask Gutsphere about this
    </button>`,
    ctx
  );
  refreshIcons();
}
