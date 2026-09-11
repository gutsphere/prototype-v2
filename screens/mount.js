const mounted = new WeakSet();

export async function mountFragment(root, name) {
  if (mounted.has(root)) return;
  const html = await fetch(new URL(`./${name}.html`, import.meta.url)).then((response) => {
    if (!response.ok) throw new Error(`Missing ${name}.html`);
    return response.text();
  });
  const script = await fetch(new URL(`./${name}.script.js`, import.meta.url)).then((response) => {
    if (!response.ok) throw new Error(`Missing ${name}.script.js`);
    return response.text();
  });
  root.innerHTML = html;
  const tag = document.createElement("script");
  tag.textContent = `${script}\n//# sourceURL=screens/${name}.script.js`;
  root.appendChild(tag);
  mounted.add(root);
  if (globalThis.lucide) {
    globalThis.lucide.createIcons({
      attrs: { "stroke-width": 1.5, "aria-hidden": "true" }
    });
  }
}

export function refreshIcons() {
  if (globalThis.lucide) {
    globalThis.lucide.createIcons({
      attrs: { "stroke-width": 1.5, "aria-hidden": "true" }
    });
  }
}
