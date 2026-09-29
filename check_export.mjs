// check_export.mjs -- assert the export ids and the status-line branches agree.
//
// run:  node check_export.mjs
//
// WHY THIS EXISTS
// ---------------
// The Remotion export's "you have no end times" warning tested
// `spec.id === "video"`, but every EXPORTS entry is ableset / remotion / obs.
// The branch could never run, so the warning the build function's own comment
// promises never appeared.
//
// Nothing failed when it was wrong. The button worked, the files were
// correct, and the only consequence was silence at exactly the moment the
// user needed to hear it: an .lrc exported with no second pass looked
// identical to a finished one, and the renderer silently guessed every line
// end from the next line's start.
//
// A string compared against a string is the cheapest possible thing to get
// wrong and the most expensive to notice, because renaming an export id is a
// one-word edit that leaves no other trace. So this asserts the ids and the
// branches against each other, and it will fail if either is renamed alone.

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const here = path.dirname(fileURLToPath(import.meta.url));
const src = readFileSync(path.join(here, "index.html"), "utf8");

// The ids actually declared on EXPORTS entries. Matched inside the EXPORTS
// table only, and tolerantly: `id: "x",` appears once per entry, and the
// leading whitespace/indentation is not something to assert on.
const table = src.slice(src.indexOf("const EXPORTS = ["));
const declared = [...table.matchAll(/\bid:\s*"([^"]+)"/g)].map((m) => m[1]);

// Every id a branch in runExport() tests against.
const tested = [
  ...src.matchAll(/spec\.id\s*===\s*"([^"]+)"/g),
].map((m) => m[1]);

let bad = 0;
const fail = (m) => {
  console.error("  FAIL " + m);
  bad++;
};

if (!declared.length) {
  fail("no EXPORTS ids could be parsed from index.html");
}
if (!tested.length) {
  fail("no spec.id comparisons could be parsed from index.html");
}

console.log("\n  EXPORTS ids : " + declared.join(", "));
console.log("  tested ids  : " + [...new Set(tested)].join(", "));

for (const t of new Set(tested)) {
  if (!declared.includes(t)) {
    fail(`status line branches on spec.id === "${t}", which no EXPORTS entry declares`);
  }
}

// The specific regression, named so it cannot be reintroduced quietly.
if (/spec\.id\s*===\s*"video"/.test(src)) {
  fail('the "video" id is back; the Remotion export is "remotion"');
}

// The Remotion export must warn about missing end times in BOTH directions.
if (!/spec\.id\s*===\s*"remotion"\s*&&\s*!\s*ctx\.ended\.length/.test(src)) {
  fail("no warning when zero end times are recorded");
}
if (!/ctx\.ended\.length\s*<\s*stamped\.length/.test(src)) {
  fail("no warning when end times are only partially recorded");
}

console.log("");
if (bad) {
  console.log("  " + bad + " problem(s).");
  process.exit(1);
}
console.log("  export ids and status-line branches agree.");
