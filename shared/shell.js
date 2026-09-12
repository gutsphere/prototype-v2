import { mount as mountPlanGeneration } from "../screens/plan-generation.js";
import { mount as mountPlan } from "../screens/plan.js";
import { mount as mountToday } from "../screens/today.js";
import { mount as mountTrack } from "../screens/track.js";
import { mount as mountJourney } from "../screens/journey.js";
import { mount as mountCare } from "../screens/care.js";
import { mount as mountChat } from "../screens/chat.js";
import { mount as mountProfile } from "../screens/profile.js";
import { mount as mountNotifications } from "../screens/notifications.js";
import { mount as mountEntry } from "../screens/entry.js";
import { mount as mountVisit } from "../screens/visit.js";
import { mount as mountInsight } from "../screens/insight.js";

const PRIMARY = ["plan-generation", "plan", "today", "track", "journey", "care", "chat"];
const SECONDARY = ["profile", "notifications", "entry", "visit", "insight"];
const ROUTES = [...PRIMARY, ...SECONDARY];
const BOTTOM = new Map([
  ["today", "today"],
  ["track", "track"],
  ["journey", "journey"],
  ["care", "care"],
  ["chat", "chat"]
]);
const LABELS = {
  "plan-generation": "Plan generation",
  plan: "Your Plan",
  today: "Today",
  track: "Track",
  journey: "Journey",
  care: "Care",
  chat: "Chat",
  profile: "Profile",
  notifications: "Notifications",
  entry: "Entry",
  visit: "Visit prep",
  insight: "Pattern"
};

const mounters = {
  "plan-generation": mountPlanGeneration,
  plan: mountPlan,
  today: mountToday,
  track: mountTrack,
  journey: mountJourney,
  care: mountCare,
  chat: mountChat,
  profile: mountProfile,
  notifications: mountNotifications,
  entry: mountEntry,
  visit: mountVisit,
  insight: mountInsight
};

const state = {
  planStarted: false,
  planReturn: { route: "plan-generation" },
  secondaryReturn: "today",
  currentEntryId: "bm-0810",
  todayCompletions: {},
  visitChecks: null,
  data: null
};

const CHROMELESS = new Set(["plan-generation", "plan"]);

let app;
let currentRoute = "plan-generation";
let pendingTrackSchedule = null;
let sharedBackAction = null;

function refreshIcons() {
  if (globalThis.lucide) {
    globalThis.lucide.createIcons({
      attrs: {
        "stroke-width": 1.5,
        "aria-hidden": "true"
      }
    });
  }
}

function parseHash() {
  const raw = (location.hash || "").replace(/^#\/?/, "");
  const [path] = raw.split("?");
  return ROUTES.includes(path) ? path : "plan-generation";
}

function setHash(name, push) {
  const next = `#/${name}`;
  if (location.hash === next) return;
  if (push) history.pushState(null, "", next);
  else history.replaceState(null, "", next);
}

function visibleCareView() {
  const care = document.getElementById("gutsphere-care-screen");
  return care?.querySelector("[data-view]:not([hidden])")?.dataset.view || "home";
}

function activateCare(target = "home") {
  const care = document.getElementById("gutsphere-care-screen");
  if (!care) return;
  if (target === "home") {
    const back = care.querySelector("[data-back]");
    let attempts = 0;
    while (care.querySelector('[data-view="home"]')?.hidden && back && attempts < 3) {
      back.click();
      attempts += 1;
    }
    return;
  }
  const trigger = care.querySelector(`[data-view-target="${target}"]`);
  if (trigger) trigger.click();
}

function chromeMarkup() {
  const initials = state.data?.persona?.initials || "BM";
  const tabs = [
    ["today", "sun", "Today"],
    ["track", "activity", "Track"],
    ["journey", "route", "Journey"],
    ["care", "heart-pulse", "Care"],
    ["chat", "message-circle", "Chat"]
  ];
  return `
    <header class="gsp-app-header" id="gsp-header" hidden>
      <div class="gsp-app-header-row">
        <div class="gsp-app-header-side">
          <button type="button" class="gsp-avatar" id="gsp-avatar" aria-label="Open profile" data-gsp-open="profile">${initials}</button>
          <button type="button" class="gsp-back" id="gsp-back" aria-label="Back" hidden>
            <i data-lucide="arrow-left"></i>
          </button>
        </div>
        <div class="gsp-app-header-titles">
          <h1 id="gsp-header-title">Today</h1>
          <p id="gsp-header-subtitle" hidden></p>
        </div>
        <div class="gsp-app-header-side gsp-app-header-side-end">
          <button type="button" class="gsp-bell" id="gsp-bell" aria-label="Notifications" data-gsp-open="notifications">
            <i data-lucide="bell"></i>
          </button>
        </div>
      </div>
    </header>
    <div class="gsp-stage" id="gsp-stage">
      ${ROUTES.map((route) => `<div class="gsp-route" data-gsp-route="${route}" hidden></div>`).join("")}
    </div>
    <nav class="gsp-app-nav" id="gsp-bottom-nav" aria-label="Main navigation" hidden>
      ${tabs
        .map(
          ([id, icon, label]) =>
            `<button type="button" data-gsp-tab="${id}"><i data-lucide="${icon}"></i><span>${label}</span></button>`
        )
        .join("")}
    </nav>
  `;
}

function markNav(name) {
  const nav = document.getElementById("gsp-bottom-nav");
  if (!nav) return;
  nav.querySelectorAll("[data-gsp-tab]").forEach((button) => {
    const active = button.dataset.gspTab === name;
    button.classList.toggle("is-active", active);
    if (active) button.setAttribute("aria-current", "page");
    else button.removeAttribute("aria-current");
  });
}

function syncChrome(name = currentRoute) {
  const header = document.getElementById("gsp-header");
  const nav = document.getElementById("gsp-bottom-nav");
  const avatar = document.getElementById("gsp-avatar");
  const back = document.getElementById("gsp-back");
  const title = document.getElementById("gsp-header-title");
  const subtitle = document.getElementById("gsp-header-subtitle");
  if (!header || !nav) return;

  const chromeless = CHROMELESS.has(name);
  app.dataset.chrome = chromeless ? "none" : "app";
  header.hidden = chromeless;
  nav.hidden = chromeless;
  sharedBackAction = null;

  if (chromeless) {
    markNav(name);
    return;
  }

  let mode = "avatar";
  let titleText = LABELS[name] || name;
  let subtitleText = "";

  if (SECONDARY.includes(name)) {
    mode = "back";
    sharedBackAction = () => showRoute(state.secondaryReturn || "today", { push: true });
  } else if (name === "chat") {
    const leading = document.getElementById("gcf-leading");
    const chatTitle = document.getElementById("gcf-title");
    const chatSub = document.getElementById("gcf-subtitle");
    titleText = chatTitle?.textContent?.trim() || "Chat";
    subtitleText = chatSub?.textContent?.trim() || "Your GI Copilot";
    if (leading?.getAttribute("aria-label") === "Back") {
      mode = "back";
      sharedBackAction = () => {
        if (typeof leading.onclick === "function") leading.onclick();
      };
    }
  } else if (name === "care") {
    const careBack = document.querySelector("#gutsphere-care-screen [data-back]");
    const careTitle = document.querySelector("#gutsphere-care-screen [data-header-title]");
    const careSub = document.querySelector("#gutsphere-care-screen [data-header-subtitle]");
    if (careBack && !careBack.hidden) {
      mode = "back";
      titleText = careTitle?.textContent?.trim() || "Care";
      subtitleText = careSub?.textContent?.trim() || "";
      sharedBackAction = () => careBack.click();
    }
  }

  if (avatar) {
    avatar.textContent = state.data?.persona?.initials || "BM";
    avatar.hidden = mode !== "avatar";
  }
  if (back) back.hidden = mode !== "back";
  if (title) title.textContent = titleText;
  if (subtitle) {
    subtitle.textContent = subtitleText;
    subtitle.hidden = !subtitleText;
  }
  markNav(name);
}

function showRoute(name, options = {}) {
  if (!ROUTES.includes(name)) return;
  const next = app.querySelector(`[data-gsp-route="${name}"]`);
  if (!next) return;
  app.querySelectorAll(".gsp-route").forEach((node) => {
    node.hidden = node !== next;
    node.classList.remove("is-entering");
  });
  next.hidden = false;
  void next.offsetWidth;
  next.classList.add("is-entering");
  currentRoute = name;
  app.dataset.route = name;
  const status = document.getElementById("gsp-route-status");
  if (status) status.textContent = `${LABELS[name] || name} screen`;
  if (name === "care") activateCare(options.careTarget || (options.fromNav ? "home" : visibleCareView()));
  if (name === "chat" && options.prompt) {
    const input = document.getElementById("gcf-input");
    if (input) {
      input.value = options.prompt;
      input.dispatchEvent(new Event("input", { bubbles: true }));
      setTimeout(() => input.focus(), 60);
    }
  }
  if (name === "entry" && options.entryId) state.currentEntryId = options.entryId;
  if (SECONDARY.includes(name) && typeof mounters[name] === "function") {
    mounters[name](next, { data: state.data, requestRoute, state });
  }
  syncChrome(name);
  setHash(name, Boolean(options.push));
  refreshIcons();
}

function openPlan(origin = currentRoute) {
  state.planReturn =
    origin === "care" ? { route: "care", careTarget: visibleCareView() } : { route: origin };
  showRoute("plan", { push: true });
}

function returnFromPlan() {
  showRoute(state.planReturn.route || "today", {
    careTarget: state.planReturn.careTarget,
    push: true
  });
}

function requestRoute(name, options = {}) {
  app.dispatchEvent(
    new CustomEvent("gsp:route-request", {
      bubbles: true,
      detail: { screen: name, ...options }
    })
  );
}

function onClick(event) {
  const sharedBack = event.target.closest("#gsp-back");
  if (sharedBack) {
    event.preventDefault();
    event.stopImmediatePropagation();
    if (typeof sharedBackAction === "function") sharedBackAction();
    return;
  }

  const tab = event.target.closest("[data-gsp-tab]");
  if (tab) {
    const destination = tab.dataset.gspTab;
    if (BOTTOM.has(destination)) {
      event.preventDefault();
      event.stopImmediatePropagation();
      showRoute(destination, { fromNav: true, push: true });
      return;
    }
  }

  const planEntry = event.target.closest("[data-gsp-open-plan]");
  if (planEntry) {
    event.preventDefault();
    event.stopImmediatePropagation();
    openPlan(currentRoute === "plan" ? "today" : currentRoute);
    return;
  }

  const open = event.target.closest("[data-gsp-open]");
  if (open) {
    event.preventDefault();
    event.stopImmediatePropagation();
    const destination = open.dataset.gspOpen;
    if (destination === "plan") {
      openPlan(currentRoute);
      return;
    }
    if (SECONDARY.includes(destination)) state.secondaryReturn = currentRoute;
    if (destination === "entry" && open.dataset.entryId) state.currentEntryId = open.dataset.entryId;
    showRoute(destination, {
      careTarget: open.dataset.gspCareTarget,
      prompt: open.dataset.gspPrompt,
      entryId: open.dataset.entryId,
      push: true
    });
    return;
  }

  const profile = event.target.closest('[aria-label="Open profile"]');
  if (profile && !event.target.closest("[data-gsp-open]")) {
    event.preventDefault();
    event.stopImmediatePropagation();
    state.secondaryReturn = currentRoute;
    showRoute("profile", { push: true });
    return;
  }

  const bell = event.target.closest('[aria-label="Notifications"]');
  if (bell) {
    event.preventDefault();
    event.stopImmediatePropagation();
    state.secondaryReturn = currentRoute;
    showRoute("notifications", { push: true });
    return;
  }

  const button = event.target.closest("button");
  if (!button) {
    const entry = event.target.closest("[data-entry-id]");
    if (entry && !event.target.closest("[data-edit], .gts-edit")) {
      event.preventDefault();
      event.stopImmediatePropagation();
      state.secondaryReturn = currentRoute;
      state.currentEntryId = entry.dataset.entryId;
      showRoute("entry", { entryId: entry.dataset.entryId, push: true });
    }
    return;
  }

  const destinationAttr = button.dataset.destination;
  if (destinationAttr) {
    const destination = BOTTOM.get(destinationAttr.toLowerCase());
    if (destination) {
      event.preventDefault();
      event.stopImmediatePropagation();
      showRoute(destination, { fromNav: true, push: true });
      return;
    }
  }

  const nav = button.closest('nav[aria-label="Main navigation"]');
  if (nav) {
    const label = button.textContent.trim().toLowerCase();
    const destination = BOTTOM.get(label);
    if (destination) {
      event.preventDefault();
      event.stopImmediatePropagation();
      showRoute(destination, { fromNav: true, push: true });
      return;
    }
  }

  if (button.classList.contains("gpg-ready-button")) {
    event.preventDefault();
    event.stopImmediatePropagation();
    openPlan("plan-generation");
    return;
  }
  if (button.classList.contains("gpg-close-button")) {
    event.preventDefault();
    event.stopImmediatePropagation();
    showRoute("today", { push: true });
    return;
  }
  if (button.matches('.gpm-header .gpm-icon-button[aria-label="Back"]')) {
    event.preventDefault();
    event.stopImmediatePropagation();
    returnFromPlan();
    return;
  }
  if (button.hasAttribute("data-confirm-start")) {
    state.planStarted = true;
    setTimeout(() => showRoute("today", { push: true }), 240);
    return;
  }
  if (button.closest("#gutsphere-track-screen") && button.textContent.includes("View Plan")) {
    event.preventDefault();
    event.stopImmediatePropagation();
    openPlan("track");
    return;
  }
  if (button.hasAttribute("data-confirm-schedule")) {
    const track = button.closest("#gutsphere-track-screen");
    pendingTrackSchedule = {
      name: track?.querySelector(".gts-step-meta")?.textContent.trim() || "Evidence",
      period: track?.querySelector("[data-time][aria-pressed='true']")?.dataset.time || "Morning"
    };
    return;
  }
  if (pendingTrackSchedule && button.hasAttribute("data-close-sheet")) {
    const track = button.closest("#gutsphere-track-screen");
    if (track?.querySelector(".gts-success h3")?.textContent.trim() === "Added to Today") {
      const item = pendingTrackSchedule;
      pendingTrackSchedule = null;
      setTimeout(() => {
        if (globalThis.GutsphereToday?.addItem) globalThis.GutsphereToday.addItem(item.period, item.name);
        showRoute("today", { push: true });
      }, 40);
    }
    return;
  }

  if (button.closest("#gutsphere-care-screen") && button.dataset.toast) {
    const message = button.dataset.toast;
    if (/Plan review|Plan opens|View in Plan/i.test(`${message} ${button.textContent}`)) {
      event.preventDefault();
      event.stopImmediatePropagation();
      openPlan("care");
      return;
    }
    if (/result can be added from Track|evidence opens in Track/i.test(message)) {
      event.preventDefault();
      event.stopImmediatePropagation();
      showRoute("track", { push: true });
      return;
    }
    if (/Completed care opens in Journey/i.test(message)) {
      event.preventDefault();
      event.stopImmediatePropagation();
      showRoute("journey", { push: true });
    }
  }
}

function applyEmbedMode() {
  const search = new URLSearchParams(location.search);
  const hash = location.hash;
  const hashQuery =
    hash.indexOf("?") >= 0 ? new URLSearchParams(hash.slice(hash.indexOf("?") + 1)) : null;
  let framed = false;
  try {
    framed = window.self !== window.top;
  } catch {
    framed = true;
  }
  if (search.get("embed") === "1" || (hashQuery && hashQuery.get("embed") === "1") || framed) {
    document.documentElement.dataset.embed = "1";
  }
}

export function boot(data) {
  applyEmbedMode();
  state.data = data;
  app = document.getElementById("app");
  app.innerHTML = chromeMarkup();

  const mounts = [
    ["plan-generation", mountPlanGeneration],
    ["plan", mountPlan],
    ["today", mountToday],
    ["track", mountTrack],
    ["journey", mountJourney],
    ["care", mountCare],
    ["chat", mountChat]
  ];

  Promise.all(
    mounts.map(([route, mount]) => {
      const root = app.querySelector(`[data-gsp-route="${route}"]`);
      return mount(root, { data, requestRoute, state });
    })
  )
    .then(() => {
      app.addEventListener("click", onClick, true);
      app.addEventListener("gsp:chrome-change", () => syncChrome(currentRoute));
      app.addEventListener("gsp:route-request", (event) => {
        const destination = event.detail?.screen;
        if (!destination) return;
        if (destination === "plan") {
          openPlan(event.detail.origin || currentRoute);
          return;
        }
        if (SECONDARY.includes(destination)) state.secondaryReturn = currentRoute;
        showRoute(destination, { ...event.detail, push: true });
      });
      const onLocation = () => {
        const name = parseHash();
        if (name !== currentRoute) showRoute(name);
      };
      window.addEventListener("hashchange", onLocation);
      window.addEventListener("popstate", onLocation);
      const initial = parseHash();
      showRoute(initial);
      if (!location.hash) setHash(initial, false);
      refreshIcons();
    })
    .catch((error) => {
      console.error("Demo v2 failed to boot", error);
      app.innerHTML = `<div class="gsp-placeholder"><h1>Demo failed to load</h1><p>${error.message}</p></div>`;
    });
}
