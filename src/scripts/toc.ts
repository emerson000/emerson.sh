// Highlights the TOC entry for the section being read.
const links = [...document.querySelectorAll<HTMLAnchorElement>(".toc a[data-toc]")];
if (links.length && "IntersectionObserver" in window) {
  const heads = links
    .map((a) => document.getElementById(a.dataset.toc!))
    .filter((h): h is HTMLElement => !!h);
  const obs = new IntersectionObserver(
    (entries) => {
      for (const en of entries) {
        if (!en.isIntersecting) continue;
        for (const a of links) {
          const on = a.dataset.toc === en.target.id;
          a.classList.toggle("active", on);
          if (on) a.setAttribute("aria-current", "location");
          else a.removeAttribute("aria-current");
        }
      }
    },
    { rootMargin: "0px 0px -70% 0px" },
  );
  heads.forEach((h) => obs.observe(h));
}
