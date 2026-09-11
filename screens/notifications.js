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

function rows(items) {
  return items
    .map(
      (item) => `<button class="gsp-row" type="button" data-gsp-open="${item.route}">
        <strong>${item.title}</strong>
        <span>${item.sub}</span>
        <small>${item.time}</small>
      </button>`
    )
    .join("");
}

export function mount(root, ctx) {
  const notes = ctx.data.notifications;
  root.innerHTML = chrome(
    "Notifications",
    `<p class="gsp-kicker">Action needed</p>${rows(notes.action)}
     <p class="gsp-kicker" style="margin-top:18px">Updates</p>${rows(notes.updates)}
     <p class="gsp-kicker" style="margin-top:18px">Inbox</p>${rows(notes.inbox)}`,
    ctx
  );
  refreshIcons();
}
