// Drives every [data-scrolly] on the page. The active step is the last one
// whose top has crossed a line in the viewport (the middle on wide screens,
// lower down on narrow screens, where the graphic is pinned above the cards).
// The step's state, progress and label are copied onto the root; graphics
// respond with CSS. A "scrolly:step" event is also dispatched on the root for
// graphics that need script.

export interface ScrollyStepDetail {
  index: number;
  state: string;
  progress: number;
  label: string;
}

const NARROW = "(max-width: 860px)";

function setup(root: HTMLElement) {
  if (root.dataset.scrollyReady) return;
  const steps = [...root.querySelectorAll<HTMLElement>(".scrolly-step")];
  if (!steps.length || !("IntersectionObserver" in window)) return;
  root.dataset.scrollyReady = "1";
  root.classList.add("is-live");

  const texts = [...root.querySelectorAll<HTMLElement>('[data-scrolly-text="label"]')];
  const narrow = window.matchMedia(NARROW);
  let active = -1;
  let observer: IntersectionObserver | undefined;

  const linePct = () => (narrow.matches ? 56 : 50);

  function activate(i: number) {
    if (i === active) return;
    active = i;
    const s = steps[i];
    const detail: ScrollyStepDetail = {
      index: i,
      state: s.dataset.state ?? "",
      progress: Number(s.dataset.progress ?? 0),
      label: s.dataset.label ?? "",
    };
    root.dataset.state = detail.state;
    root.style.setProperty("--scrolly-progress", String(detail.progress));
    steps.forEach((el, j) => el.toggleAttribute("data-active", j === i));
    for (const t of texts) t.textContent = detail.label;
    root.dispatchEvent(new CustomEvent<ScrollyStepDetail>("scrolly:step", { detail }));
  }

  function update() {
    const line = (window.innerHeight * linePct()) / 100;
    let idx = 0;
    steps.forEach((el, i) => {
      if (el.getBoundingClientRect().top < line) idx = i;
    });
    activate(idx);
  }

  function observe() {
    observer?.disconnect();
    const pct = linePct();
    // A 1%-tall band at the line. Any step entering or leaving it triggers a
    // recount, which also copes with fast scrolling and jumps (Home, End, links).
    observer = new IntersectionObserver(update, {
      rootMargin: `-${pct}% 0px -${99 - pct}% 0px`,
      threshold: 0,
    });
    steps.forEach((el) => observer!.observe(el));
    update();
  }

  // Also recount as the whole block scrolls in or out, so a jump straight past
  // it (End key, an in-page link) still leaves the right step active.
  const outer = new IntersectionObserver(update, { threshold: [0, 0.25, 0.5, 0.75, 1] });
  outer.observe(root);

  narrow.addEventListener("change", observe);
  window.addEventListener("resize", update, { passive: true });
  observe();
}

export function initScrolly() {
  document.querySelectorAll<HTMLElement>("[data-scrolly]").forEach(setup);
}
