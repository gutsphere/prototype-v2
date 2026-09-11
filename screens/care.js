import { mountFragment } from "./mount.js";

export async function mount(root) {
  await mountFragment(root, "care");
  const visitCard = root.querySelector('[data-view="home"] .gcs-priority .gcs-primary');
  if (visitCard && !root.querySelector("[data-gsp-open='visit']")) {
    const link = document.createElement("button");
    link.className = "gcs-text-action";
    link.type = "button";
    link.dataset.gspOpen = "visit";
    link.innerHTML = 'Open full visit prep<i data-lucide="chevron-right" aria-hidden="true"></i>';
    visitCard.closest(".gcs-priority")?.append(link);
  }
}
