import { mountFragment } from "./mount.js";

export function mount(root) {
  return mountFragment(root, "track");
}
