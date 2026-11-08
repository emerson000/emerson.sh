// Build-time share images (1200x630 PNG) with Satori and resvg.
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import satori from "satori";
import { Resvg } from "@resvg/resvg-js";
import { logoSvg } from "./logo";

const require = createRequire(import.meta.url);
const font = (pkg: string, file: string) => readFileSync(require.resolve(`${pkg}/files/${file}`));

let fonts: { name: string; data: Buffer; weight: 400 | 600; style: "normal" }[] | undefined;
function loadFonts() {
  fonts ??= [
    { name: "Source Serif 4", data: font("@fontsource/source-serif-4", "source-serif-4-latin-600-normal.woff"), weight: 600, style: "normal" },
    { name: "IBM Plex Mono", data: font("@fontsource/ibm-plex-mono", "ibm-plex-mono-latin-400-normal.woff"), weight: 400, style: "normal" },
  ];
  return fonts;
}

// The "Full stop" wordmark, ink letters and signal dot.
const wordmark = `data:image/svg+xml;base64,${Buffer.from(logoSvg()).toString("base64")}`;
// 30px from ascender to baseline.
const WM_H = 30 * 142 / 140, WM_W = WM_H * 1031 / 142;

type Node = { type: string; props: Record<string, unknown> };
const h = (type: string, style: Record<string, unknown>, children?: unknown): Node => ({ type, props: { style, children } });

export async function ogImage({ title, kicker }: { title: string; kicker: string }): Promise<Uint8Array> {
  const size = title.length > 70 ? 56 : title.length > 40 ? 64 : 76;
  const tree = h(
    "div",
    { width: 1200, height: 630, boxSizing: "border-box", display: "flex", flexDirection: "column", justifyContent: "space-between", background: "#FFFFFF", padding: "72px 80px", borderTop: "12px solid #D42A35" },
    [
      h("div", { display: "flex", fontFamily: "IBM Plex Mono", fontSize: 26, letterSpacing: 2, color: "#D42A35", textTransform: "uppercase" }, kicker),
      h("div", { display: "flex", fontFamily: "Source Serif 4", fontWeight: 600, fontSize: size, lineHeight: 1.12, color: "#141414", letterSpacing: -1 }, title),
      h("div", { display: "flex", justifyContent: "space-between", alignItems: "flex-end", borderTop: "2px solid #141414", paddingTop: 28 }, [
        h("div", { display: "flex", fontFamily: "Source Serif 4", fontWeight: 600, fontSize: 34, color: "#141414" }, "Emerson Stewart"),
        { type: "img", props: { src: wordmark, width: WM_W, height: WM_H, style: { display: "flex", marginBottom: 6 } } },
      ]),
    ],
  );
  const svg = await satori(tree as never, { width: 1200, height: 630, fonts: loadFonts() });
  return new Resvg(svg, { fitTo: { mode: "width", value: 1200 } }).render().asPng();
}
