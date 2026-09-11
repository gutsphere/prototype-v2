import { refreshIcons } from "./mount.js";

function chrome(title, body, ctx) {
  return `<div class="gsp-secondary">
    <header class="gsp-secondary-header">
      <button type="button" data-gsp-open="${ctx.state.secondaryReturn || "care"}" aria-label="Back">
        <i data-lucide="chevron-left"></i>
      </button>
      <h1>${title}</h1>
      <span></span>
    </header>
    <main class="gsp-secondary-main">${body}</main>
  </div>`;
}

export function mount(root, ctx) {
  const visit = ctx.data.visitPrep;
  if (!ctx.state.visitChecks) {
    ctx.state.visitChecks = visit.checklist.map((item) => item.done);
  }
  const checks = visit.checklist
    .map((item, index) => {
      const on = ctx.state.visitChecks[index];
      return `<button class="gsp-check" type="button" data-check="${index}">
        <span class="gsp-box${on ? " is-on" : ""}">${on ? "✓" : ""}</span>
        <span>${item.label}</span>
      </button>`;
    })
    .join("");
  const questions = visit.questions.map((q) => `<p class="gsp-question">${q}</p>`).join("");
  root.innerHTML = chrome(
    "Visit prep",
    `<article class="gsp-card">
      <p class="gsp-kicker">${visit.stepsDone} of ${visit.stepsTotal} steps complete</p>
      <h2 style="margin:0 0 6px;font-size:var(--gs-type-hero-size);line-height:var(--gs-type-hero-line)">${visit.title}</h2>
      <p>${visit.subtitle}</p>
    </article>
    <article class="gsp-card">
      <h3 style="margin:0 0 8px">Checklist</h3>
      ${checks}
    </article>
    <article class="gsp-card">
      <h3 style="margin:0 0 8px">Main concern</h3>
      <p class="gsp-question">${visit.mainConcern}</p>
    </article>
    <article class="gsp-card">
      <h3 style="margin:0 0 8px">Questions to ask</h3>
      ${questions}
    </article>
    <article class="gsp-card">
      <h3 style="margin:0 0 8px">Doctor summary</h3>
      <p>${visit.summaryNote}</p>
    </article>`,
    ctx
  );
  root.querySelectorAll("[data-check]").forEach((button) => {
    button.addEventListener("click", () => {
      const index = Number(button.dataset.check);
      ctx.state.visitChecks[index] = !ctx.state.visitChecks[index];
      mount(root, ctx);
    });
  });
  refreshIcons();
}
