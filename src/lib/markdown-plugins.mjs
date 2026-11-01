// Sätteri hast plugins for emerson.sh.
//
// Astro 7 renders Markdown with Sätteri, which does not run remark or rehype
// plugins. It has its own plugin API instead (`hastPlugins` on the `satteri()`
// processor). These two plugins run at build time, on both .md and .mdx files:
//
// - callouts: GitHub alerts (`> [!NOTE]`, `> [!TIP]`, `> [!IMPORTANT]`,
//   `> [!WARNING]`, `> [!CAUTION]`) become <aside class="callout"> blocks.
//   Text after the marker on the same line (inline markup included) becomes a bold title.
// - checklists: GFM task lists become an interactive checklist. Each item's
//   first line is the setting; anything after the first line break (or in
//   later paragraphs of the item) is the reason, shown in a muted line below.
//   src/scripts/checklists.ts makes them persistent in the browser.
//
// And one mdast plugin:
//
// - layoutFrontmatter: in MDX, a front matter `layout` key is treated as a
//   path to a layout component to import. Ours is a plain value
//   (`standard` | `feature`) that the route reads from the collection entry,
//   so the plugin drops it from the compiled module's frontmatter export.
//   The collection schema still sees it, because the glob loader parses the
//   front matter on its own.

const ALERT = /^\[!(NOTE|TIP|IMPORTANT|WARNING|CAUTION)\][ \t]*/i;
const LABELS = { note: "Note", tip: "Tip", important: "Important", warning: "Warning", caution: "Caution" };

const el = (tagName, properties = {}, children = []) => ({ type: "element", tagName, properties, children });
const text = (value) => ({ type: "text", value });
const isEl = (n, tag) => n && n.type === "element" && (!tag || n.tagName === tag);
const isBlank = (n) => n.type === "text" && !n.value.trim();
const classes = (n) => {
  const c = n.properties?.className;
  return Array.isArray(c) ? c : typeof c === "string" ? c.split(/\s+/) : [];
};

function plainText(n) {
  if (n.type === "text") return n.value;
  return (n.children || []).map(plainText).join("");
}

export function slugify(s) {
  return s.toLowerCase().normalize("NFKD").replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 60) || "item";
}

export const calloutsPlugin = {
  name: "emerson-callouts",
  element: {
    filter: ["blockquote"],
    visit(node) {
      const kids = node.children || [];
      const firstIdx = kids.findIndex((k) => !isBlank(k));
      const first = kids[firstIdx];
      if (!isEl(first, "p") || !first.children?.length) return;
      const lead = first.children[0];
      if (lead.type !== "text") return;
      const m = lead.value.match(ALERT);
      if (!m) return;
      const kind = m[1].toLowerCase();
      // Everything up to the first line break is the title (inline markup kept);
      // the rest of the paragraph starts the body.
      const rest = [text(lead.value.slice(m[0].length)), ...first.children.slice(1)];
      const { setting: titleNodes, why: restInline } = splitInline(rest);
      if (restInline[0]?.type === "text") restInline[0] = text(restInline[0].value.replace(/^\s+/, ""));
      const titleText = titleNodes.filter((n) => !(n.type === "text" && !n.value.trim()));
      const body = [];
      if (restInline.some((n) => !(n.type === "text" && !n.value.trim()))) body.push(el("p", {}, restInline));
      body.push(...kids.slice(firstIdx + 1).filter((k) => !isBlank(k)));
      const warn = kind === "warning" || kind === "caution";
      const head = [el("span", { className: ["callout-label"] }, [text(LABELS[kind])])];
      if (titleText.length) head.push(el("strong", { className: ["callout-title"] }, titleNodes));
      return el("aside", { className: ["callout", `callout-${kind}`, ...(warn ? ["warn"] : [])], role: "note", ariaLabel: LABELS[kind] }, [
        el("p", { className: ["callout-head"] }, head),
        ...body,
      ]);
    },
  },
};

// Split an item's inline content at the first line break: setting | reason.
function splitInline(nodes) {
  const setting = [];
  const why = [];
  let into = setting;
  for (const n of nodes) {
    if (into === setting && n.type === "text" && n.value.includes("\n")) {
      const i = n.value.indexOf("\n");
      const a = n.value.slice(0, i).replace(/\s+$/, "");
      const b = n.value.slice(i + 1).replace(/^\s+/, "");
      if (a) setting.push(text(a));
      into = why;
      if (b) why.push(text(b));
      continue;
    }
    if (into === setting && isEl(n, "br")) { into = why; continue; }
    into.push(n);
  }
  return { setting, why };
}

function convertItem(li, used) {
  const kids = (li.children || []).filter((k) => !isBlank(k));
  let checked = false;
  let rest = kids;
  let inline = [];
  const blocks = [];
  // Tight items hold the input and inline content directly; loose items wrap them in <p>.
  const start = isEl(kids[0], "p") ? kids[0].children : kids;
  const iIdx = start.findIndex((k) => isEl(k, "input"));
  if (iIdx === -1) return null;
  checked = start[iIdx].properties?.checked === true || start[iIdx].properties?.checked === "";
  if (isEl(kids[0], "p")) {
    inline = start.slice(iIdx + 1);
    rest = kids.slice(1);
  } else {
    // Inline content runs until the first block element (nested list, p).
    let j = iIdx + 1;
    while (j < kids.length && !(isEl(kids[j]) && ["ul", "ol", "p", "pre", "blockquote", "table", "div"].includes(kids[j].tagName))) j++;
    inline = kids.slice(iIdx + 1, j);
    rest = kids.slice(j);
  }
  if (inline[0]?.type === "text") inline[0] = text(inline[0].value.replace(/^\s+/, ""));
  const { setting, why } = splitInline(inline);
  const nested = [];
  const whyBlocks = [];
  for (const b of rest) {
    if ((isEl(b, "ul") || isEl(b, "ol")) && classes(b).includes("contains-task-list")) nested.push(convertList(b, used, true));
    else if (isEl(b, "p")) whyBlocks.push(...(whyBlocks.length || why.length ? [text(" ")] : []), ...b.children);
    else blocks.push(b);
  }
  const reason = [...why, ...whyBlocks];
  let id = slugify(plainText(el("span", {}, setting)));
  let n = 2;
  const base = id;
  while (used.has(id)) id = `${base}-${n++}`;
  used.add(id);
  const label = el("label", { className: ["check"] }, [
    el("input", { type: "checkbox", dataId: id, ...(checked ? { checked: true, dataDefault: "checked" } : {}) }),
    el("span", { className: ["check-text"] }, [
      el("span", { className: ["setting"] }, setting),
      ...(reason.length ? [el("span", { className: ["why"] }, reason)] : []),
    ]),
  ]);
  return el("li", { className: ["check-item"] }, [label, ...blocks, ...nested]);
}

// A plain item inside a task list keeps its content, but task lists nested in it are converted too.
function convertPlainItem(li, used) {
  const children = (li.children || []).map((c) =>
    (isEl(c, "ul") || isEl(c, "ol")) && classes(c).includes("contains-task-list") ? convertList(c, used, true) : c,
  );
  return el("li", { ...li.properties, className: [...classes(li), "plain-item"] }, children);
}

function convertList(list, used, nested = false) {
  const items = (list.children || []).filter((k) => isEl(k, "li"));
  const out = items.map((li) => (classes(li).includes("task-list-item") ? convertItem(li, used) : null) ?? convertPlainItem(li, used));
  return el(list.tagName, { className: ["check-list", ...(nested ? ["check-list-nested"] : [])] }, out);
}

export const checklistsPlugin = {
  name: "emerson-checklists",
  element: {
    filter: ["ul", "ol"],
    visit(node, ctx) {
      if (!classes(node).includes("contains-task-list")) return;
      // A task list nested in another task list is handled by the outer one.
      let p = ctx.parent(node);
      while (p && p.type === "element") {
        if ((p.tagName === "ul" || p.tagName === "ol") && classes(p).includes("contains-task-list")) return;
        p = ctx.parent(p);
      }
      const used = new Set();
      const list = convertList(node, used);
      return el("div", { className: ["checklist"], dataChecklist: "" }, [
        el("div", { className: ["checklist-head"], hidden: true }, [
          el("span", { className: ["meta"], dataProgress: "", ariaLive: "polite" }, []),
          el("button", { type: "button", dataReset: "", disabled: true }, [text("Reset")]),
        ]),
        list,
      ]);
    },
  },
};

export const layoutFrontmatterPlugin = {
  name: "emerson-layout-frontmatter",
  before(_root, ctx) {
    const fm = ctx.data?.astro?.frontmatter;
    if (fm && typeof fm.layout === "string" && ["standard", "feature"].includes(fm.layout)) delete fm.layout;
  },
};
