import { mountFragment, refreshIcons } from "./mount.js";

export async function mount(root) {
  await mountFragment(root, "journey");
  enhanceJourney(root);
  refreshIcons();
}

function enhanceJourney(root) {
  const cards = [...root.querySelectorAll(".gjx-insight-card")];
  const addAction = (card, label, icon, route, options = {}) => {
    const host = card?.querySelector(".gjx-proof-inner");
    if (!host || host.querySelector(".gsp-inline-action")) return;
    const button = document.createElement("button");
    button.className = "gsp-inline-action";
    button.type = "button";
    button.dataset.gspOpen = route;
    if (options.careTarget) button.dataset.gspCareTarget = options.careTarget;
    if (options.prompt) button.dataset.gspPrompt = options.prompt;
    button.innerHTML = `<i data-lucide="${icon}" aria-hidden="true"></i><span>${label}</span>`;
    host.append(button);
  };

  addAction(cards[3], "Open current care", "pill", "care", { careTarget: "careplan" });
  addAction(cards[4], "Open visit history", "calendar-check", "care", { careTarget: "visit" });
  addAction(cards[5], "Open tests and records", "test-tube-diagonal", "care", { careTarget: "visit" });
  addAction(cards[6], "Prepare for discussion", "clipboard-list", "visit");
  addAction(cards[7], "Ask GI Copilot about this", "message-circle", "chat", {
    prompt:
      "My records show soft stool with continued straining and incomplete emptying. What can we learn, and what remains uncertain?"
  });
  addAction(cards[8], "Open visit preparation", "calendar-heart", "visit");

  const currentChapter = root.querySelector(".gjx-chapter-shell[open]");
  const currentBody = currentChapter?.querySelector(".gjx-chapter-body > div");
  if (currentBody && !currentBody.querySelector(".gsp-inline-actions")) {
    const actions = document.createElement("div");
    actions.className = "gsp-inline-actions";
    actions.innerHTML =
      '<button class="gsp-inline-action is-primary" type="button" data-gsp-open="plan"><i data-lucide="map" aria-hidden="true"></i><span>Open current Plan</span></button><button class="gsp-inline-action" type="button" data-gsp-open="chat" data-gsp-prompt="Why is straining continuing even when stool is soft?"><i data-lucide="message-circle" aria-hidden="true"></i><span>Ask GI Copilot</span></button>';
    currentBody.append(actions);
  }

  const bindCarouselDots = (carousel, dots, itemSelector) => {
    if (!carousel || !dots) return;
    const items = [...carousel.querySelectorAll(itemSelector)];
    const marks = [...dots.children];
    if (!items.length || !marks.length) return;
    let queued = false;
    const update = () => {
      queued = false;
      const left = carousel.getBoundingClientRect().left;
      const nearest = items.reduce(
        (best, item, index) => {
          const distance = Math.abs(item.getBoundingClientRect().left - left);
          return distance < best.distance ? { index, distance } : best;
        },
        { index: 0, distance: Infinity }
      );
      marks.forEach((mark, index) => mark.classList.toggle("is-active", index === nearest.index));
      dots.setAttribute("aria-label", `Card ${nearest.index + 1} of ${items.length}`);
    };
    carousel.addEventListener(
      "scroll",
      () => {
        if (queued) return;
        queued = true;
        requestAnimationFrame(update);
      },
      { passive: true }
    );
    update();
  };

  bindCarouselDots(
    root.querySelector(".gjx-learning-carousel"),
    root.querySelector('[data-dots="learning"]'),
    ".gjx-insight-card"
  );
  root.querySelectorAll(".gjx-chapter").forEach((chapter) => {
    bindCarouselDots(chapter.querySelector(".gjx-beat-carousel"), chapter.querySelector(".gjx-beat-dots"), ".gjx-beat");
  });

  const insightDetails = [...root.querySelectorAll(".gjx-insight-card")];
  const chapterDetails = [...root.querySelectorAll(".gjx-chapter-shell")];
  [...insightDetails, ...chapterDetails].forEach((details) => {
    details.addEventListener("toggle", () => {
      if (!details.open) return;
      const group = details.classList.contains("gjx-insight-card") ? insightDetails : chapterDetails;
      group.forEach((peer) => {
        if (peer !== details) peer.open = false;
      });
    });
  });
}
