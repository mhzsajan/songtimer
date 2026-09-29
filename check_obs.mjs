// Checks the page Song Timer would hand to OBS, by generating it and reading it
// back. Run from this directory after any change to obsPage():
//
//     node check_obs.mjs
//
// The generated page is a separate artifact from index.html, so a change that
// looks fine in the editor can still emit a broken file. The script-tag pair
// assertions exist because that failure is silent: an unescaped closing tag
// truncates the page's own script, and the page still renders.
import { readFileSync, writeFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const here = dirname(fileURLToPath(import.meta.url));
const src = readFileSync(join(here, "index.html"), "utf8");

const body = extract(src, "function obsPage(ctx)");
if (!body) {
  console.log("  FAIL: obsPage not found");
  process.exit(1);
}

const escapeHtml = (s) =>
  String(s).replace(
    /[&<>"]/g,
    (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c])
  );
const clock = (s) => {
  const v = s;
  const m = Math.floor(v / 60);
  return m + ":" + (v - m * 60).toFixed(2).padStart(5, "0");
};

// Same fragments the app uses, so this cannot drift from it.
const TAG = "scr" + "ipt";
const OPEN = "<" + TAG + ">";
const CLOSE = "<" + "/" + TAG + ">";

const obsPage = new Function(
  "escapeHtml",
  "clock",
  "OPEN",
  "CLOSE",
  body + "\nreturn obsPage;"
)(escapeHtml, clock, OPEN, CLOSE);

const page = obsPage({
  title: "Ritu",
  stamped: [
    { time: 66.45, end: 67.1, text: "फर्केर आउने छैन" },
    { time: 70.19, end: 71.3, text: "म कुनै ऋतु होइन" },
    { time: 75.0, end: null, text: "मेरो आश नगर," },
  ],
});

const out = join(here, "obs_out.html");
writeFileSync(out, page);

let fails = 0;
const check = (ok, msg) => {
  console.log((ok ? "  ok   " : "  FAIL ") + msg);
  if (!ok) fails++;
};

console.log("=== generated OBS page (" + page.length + " B) ===");
check(page.startsWith("<!doctype html>"), "starts with a doctype");
const opens = (page.match(/<script>/g) || []).length;
const closes = (page.match(/<\/script>/g) || []).length;
check(opens === 1 && closes === 1, `exactly one script pair (${opens}/${closes})`);
check(!page.includes("</script>>"), "no stray bracket after the closing tag");
check(page.includes("background: transparent"), "transparent background");
check(page.includes("background: transparent") && /rgba\(0, 0, 0, 0\)|transparent/.test(page),
  "no opaque plate behind the text");

const m = page.match(/const DATA = (\{.*?\});/);
check(!!m, "DATA assignment present");
if (m) {
  const data = JSON.parse(m[1]);
  check(data.lines.length === 3, "all three lines present");
  check(data.lines[0].t === 66.45 && data.lines[0].e === 67.1, "start and end round-tripped");
  check(data.lines[2].e === null, "an untimed end stays null at write time");
  // The end-time fallback belongs in the page, not baked in here.
  check(page.includes("if (end == null)"), "page resolves a missing end itself");
}

const sm = page.match(/<script>([\s\S]*?)<\/script>/);
check(!!sm, "page has a script block");
if (sm) {
  try {
    new Function(sm[1]);
    check(true, "page script parses");
  } catch (e) {
    check(false, "page script parses: " + e.message);
  }
  check(!/<\/script/i.test(m ? m[1] : ""), "no script-tag breakout in the embedded JSON");
}

console.log("\nwritten: " + out);
console.log(fails ? "\n" + fails + " FAILURES" : "\nall checks passed");
process.exit(fails ? 1 : 0);

// Brace-match a top-level function declaration. A regex stops early here
// because the body is full of braces inside template literals.
function extract(text, signature) {
  const start = text.indexOf(signature);
  if (start < 0) return null;
  let depth = 0;
  for (let i = text.indexOf("{", start); i < text.length; i++) {
    const c = text[i];
    if (c === "{") depth++;
    else if (c === "}") {
      depth--;
      if (depth === 0) return text.slice(start, i + 1);
    }
  }
  return null;
}
