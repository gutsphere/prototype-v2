import { refreshIcons } from "./mount.js";

function chrome(title, body, ctx) {
  return `<div class="gsp-secondary">
    <header class="gsp-secondary-header">
      <button type="button" data-gsp-open="${ctx.state.secondaryReturn || "today"}" aria-label="Back">
        <i data-lucide="chevron-left"></i>
      </button>
      <h1>${title}</h1>
      <span></span>
    </header>
    <main class="gsp-secondary-main">${body}</main>
  </div>`;
}

export function mount(root, ctx) {
  const p = ctx.data.persona;
  root.innerHTML = chrome(
    "Profile",
    `<article class="gsp-card">
      <div class="gsp-profile-head">
        <div class="gsp-avatar-lg">${p.initials}</div>
        <div>
          <h2>${p.fullName}</h2>
          <p>${p.profileDesc}</p>
        </div>
      </div>
      <div class="gsp-tags">
        <span class="gsp-tag">${p.stage}</span>
        <span class="gsp-tag">${p.visitNote}</span>
        <span class="gsp-tag">${p.focus}</span>
      </div>
    </article>
    <p class="gsp-kicker" style="margin-top:20px">Workspace</p>
    <button class="gsp-row" type="button"><strong>Care context</strong><span>Constipation · diagnosis investigation</span></button>
    <button class="gsp-row" type="button"><strong>Reminders</strong><span>Plan actions and visit prep</span></button>
    <button class="gsp-row" type="button"><strong>Privacy</strong><span>Demo only · no account state</span></button>`,
    ctx
  );
  refreshIcons();
}
