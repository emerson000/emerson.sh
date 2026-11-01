// Makes the checklists that src/lib/markdown-plugins.mjs builds from GFM task
// lists interactive. State is saved in localStorage, one key per list:
//   es-check:<page path>:<nearest heading id above the list>[:n]
// and holds the ids of the ticked items (slugs of each item's setting text),
// so reordering items or adding a list elsewhere doesn't lose progress.
const lists = [...document.querySelectorAll<HTMLElement>("[data-checklist]")];
const seen = new Map<string, number>();

function nearestHeadingId(el: HTMLElement): string {
  const heads = [...document.querySelectorAll<HTMLElement>(".prose h2[id], .prose h3[id], .prose h4[id]")];
  let id = "top";
  for (const h of heads) {
    if (h.compareDocumentPosition(el) & Node.DOCUMENT_POSITION_FOLLOWING) id = h.id;
    else break;
  }
  return id;
}

for (const list of lists) {
  const base = `es-check:${location.pathname}:${nearestHeadingId(list)}`;
  const n = seen.get(base) ?? 0;
  seen.set(base, n + 1);
  const key = n ? `${base}:${n + 1}` : base;
  const boxes = [...list.querySelectorAll<HTMLInputElement>("input[type=checkbox][data-id]")];
  const head = list.querySelector<HTMLElement>(".checklist-head");
  const prog = list.querySelector<HTMLElement>("[data-progress]");
  const reset = list.querySelector<HTMLButtonElement>("[data-reset]");
  if (!boxes.length || !head || !prog || !reset) continue;

  let saved: string[] | null = null;
  try {
    const raw = localStorage.getItem(key);
    saved = raw ? JSON.parse(raw) : null;
  } catch {}
  boxes.forEach((b) => {
    b.checked = saved ? saved.includes(b.dataset.id!) : b.dataset.default === "checked";
  });

  const sync = (save: boolean) => {
    const done = boxes.filter((b) => b.checked);
    prog.textContent = done.length === boxes.length ? `All ${boxes.length} done` : `${done.length} of ${boxes.length} done`;
    reset.disabled = done.length === 0;
    if (!save) return;
    try {
      localStorage.setItem(key, JSON.stringify(done.map((b) => b.dataset.id)));
    } catch {}
  };
  list.addEventListener("change", () => sync(true));
  reset.addEventListener("click", () => {
    boxes.forEach((b) => (b.checked = false));
    sync(true);
    boxes[0].focus();
  });
  head.hidden = false;
  sync(false);
}
