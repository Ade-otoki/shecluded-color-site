// Turn Vite's dist/ into one self-contained page for the Artifact host:
// no <html>/<head>/<body> (the host adds the skeleton), CSS and JS inlined.
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const dist = new URL("../dist/", import.meta.url).pathname;
const html = readFileSync(join(dist, "index.html"), "utf8");
const css = [...html.matchAll(/<link rel="stylesheet"[^>]*href="\.\/([^"]+)"/g)].map((m) => readFileSync(join(dist, m[1]), "utf8")).join("\n");
const js = [...html.matchAll(/<script type="module"[^>]*src="\.\/([^"]+)"/g)].map((m) => readFileSync(join(dist, m[1]), "utf8")).join("\n");
if (!css || !js) throw new Error("Could not find built CSS or JS in dist/index.html");

const page = `<title>Shecluded Color Accessibility</title>
<style>${css.replace(/<\/style/gi, "<\\/style")}</style>
<div id="root"></div>
<script type="module">${js.replace(/<\/script/gi, "<\\/script")}</script>
`;
writeFileSync(join(dist, "artifact.html"), page);
console.log(`artifact.html ${(page.length / 1024).toFixed(0)} KB`);
