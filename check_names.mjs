// check_names.mjs -- what each export target actually calls its file.
//
// run:  node check_names.mjs
//
// WHY THIS EXISTS
// ---------------
// The renderer finds the end file by NAME, beside the start file. That makes
// the filename a contract rather than a label: if the two halves of a pair end
// up with different names, the end file is silently not found, every cue falls
// back to an estimated end, and the render exits 0 with a video whose lyrics
// linger. The longest hold this has to hide is 22s.
//
// A filename is the one piece of this program that is read by Windows, not by
// us, and Windows is unforgiving in ways that are all silent:
//
//   "NUL"        a device name -- the file cannot be created
//   "Song.\nX"   control characters are illegal in a path
//   "Song "       trailing dots and spaces are dropped
//   200 chars    the OS truncates the end, cutting the suffix off one half
//
// So the naming is asserted here against the real code. safe() and file() are
// EVALUATED OUT OF index.html rather than reimplemented below, because a test
// that checks a copy of the function proves nothing about the function that
// ships: the copy would still pass after safe() was changed.

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const here = path.dirname(fileURLToPath(import.meta.url));
const src = readFileSync(path.join(here, "index.html"), "utf8");

let bad = 0;
const fail = (m) => {
  console.error("  FAIL " + m);
  bad++;
};
const pass = (m) => console.log("  ok   " + m);

function sliceBetween(startRe, endRe, what) {
  const s = src.search(startRe);
  if (s < 0) throw new Error("could not find the start of " + what);
  const from = src.indexOf("\n", s);
  const e = src.slice(from).search(endRe);
  if (e < 0) throw new Error("could not find the end of " + what);
  return src.slice(from, from + e);
}

// ---- pull the real code out of the page -----------------------------------
//
// The region is sliced, not pattern-matched piece by piece: a regex that has
// to survive reformatting is a regex that will one day silently match nothing
// and let a broken build pass.
//
// It runs from the export banner to download(). That is the whole of
// EXPORTS + safe() + file(), and it stops BEFORE endsText() and obsPage() --
// which are the two formatters that would otherwise be shadowed by the stubs
// below, and which are not what is under test. It also stops before the
// button-building code at the bottom of the script, which touches the DOM at
// load time and would throw inside new Function().
const block = sliceBetween(
  /\/\/ -+ export -+/,
  /^ {2}function download\(/m,
  "the export section"
);

if (!/const safe\s*=/.test(block)) {
  console.error("  FAIL no safe() in the extracted block; the test is not testing the page");
  process.exit(1);
}

// The export table's builders call endsText() and obsPage(). Both are pure
// formatters over the same ctx, and only the NAMES are under test, so stubs
// are enough -- and stubs are safe here precisely because file() is the code
// path being exercised, not the bodies.
const factory = new Function(
  "ctx",
  `
  const endsText = () => "ENDS";
  const obsPage = () => "<html></html>";
  ${block}
  return { EXPORTS, safe, file };
  `
);
const { EXPORTS, safe } = factory({});

const namesFor = (title, endedCount = 2, stampedCount = 2) => {
  const ctx = {
    title,
    band: "Band",
    stamped: Array.from({ length: stampedCount }, (_, i) => ({
      time: i,
      end: i < endedCount ? i + 1 : null,
      text: "line " + i,
    })),
    ended: Array.from({ length: endedCount }, (_, i) => ({
      time: i,
      end: i + 1,
      text: "line " + i,
    })),
    lrc: "LRC BODY",
  };
  const out = {};
  for (const spec of EXPORTS) {
    out[spec.id] = spec.build(ctx).map((f) => f.name);
  }
  return out;
};

console.log("");

// ---- 1. the three targets, named for themselves ---------------------------
{
  const n = namesFor("Ritu");
  const want = {
    ableset: ["Ritu_ableset.lrc"],
    remotion: ["Ritu.remotion_start.lrc", "Ritu.remotion_end.lrc"],
    obs: ["Ritu.obs.html"],
  };
  for (const [id, expected] of Object.entries(want)) {
    const got = n[id];
    if (JSON.stringify(got) === JSON.stringify(expected)) {
      pass(`${id} writes ${got.join(" + ")}`);
    } else {
      fail(`${id} wrote ${JSON.stringify(got)}, expected ${JSON.stringify(expected)}`);
    }
  }
  // The whole reason for the rename: two different files must not share a name.
  const all = Object.values(n).flat();
  if (new Set(all).size === all.length) {
    pass("no two exported files share a name");
  } else {
    fail("two exported files share a name, so they cannot be told apart in a folder");
  }
}

// ---- 2. the pair must pair -------------------------------------------------
//
// This is the assertion that matters. Strip the suffix off each half and the
// stems must be identical, for every title the user could type.
{
  const titles = [
    "Ritu",
    "  Ritu  ",                          // trimmed
    "Ritu — Nabin K Bhattarai",          // em dash from a search result
    "Allare / Phool",                    // slash is illegal in a path
    'He said "hi"',                      // quotes are illegal
    "C:\\Songs\\Ritu",                   // backslashes and a colon
    "A very long title ".repeat(20),     // length cap
    "NUL",                               // a Windows device
    "con",                               // ...in any case
    "Restart",                           // ends in "start", the renderer's
    "",                                  // unset title box
    "   ",                               // whitespace only
    "Song.",                             // trailing dot
    "Multi\nline\ttitle",                // control characters
  ];
  let paired = true;
  for (const t of titles) {
    const n = namesFor(t);
    const stem = (f) => f.replace(/(_ableset\.lrc|\.remotion_start\.lrc|\.remotion_end\.lrc|\.obs\.html)$/, "");
    const a = stem(n.ableset[0]);
    const b = stem(n.remotion[0]);
    const c = stem(n.remotion[1]);
    const d = stem(n.obs[0]);
    if (!(a === b && b === c && c === d)) {
      fail(`title ${JSON.stringify(t)} produced unmatched stems: ${[a, b, c, d].join(" / ")}`);
      paired = false;
      break;
    }
    for (const name of [a, b, c, d]) {
      if (/[\\/:*?"<>|]/.test(name)) {
        fail(`title ${JSON.stringify(t)} left an illegal character in ${JSON.stringify(name)}`);
        paired = false;
        break;
      }
      // Control characters are illegal in a Windows path but are not among the
      // punctuation anyone thinks to strip, so they need their own assertion.
      // A pasted title is the likely source.
      if (/[\u0000-\u001f\u007f]/.test(name)) {
        fail(`title ${JSON.stringify(t)} left a control character in ${JSON.stringify(name)}`);
        paired = false;
        break;
      }
      if (/[. ]$/.test(name)) {
        fail(`title ${JSON.stringify(t)} ends in a dot or space, which Windows drops: ${JSON.stringify(name)}`);
        paired = false;
        break;
      }
      if (name !== "lyrics" && /^(con|prn|aux|nul|com[1-9]|lpt[1-9])$/i.test(name)) {
        fail(`title ${JSON.stringify(t)} produced the reserved device name ${JSON.stringify(name)}`);
        paired = false;
        break;
      }
    }
  }
  if (paired) pass(`all ${titles.length} title shapes produce a matching, legal stem`);
}

// ---- 3. the cap has to leave room for the suffix --------------------------
{
  const long = safe("x".repeat(400));
  if (long.length <= 120) {
    pass(`a 400-character title is capped at ${long.length}`);
  } else {
    fail(`a 400-character title came out at ${long.length} characters`);
  }
  const name = long + ".remotion_end.lrc";
  if (name.length < 255) {
    pass(`the longest resulting name is ${name.length} characters, under the 255 limit`);
  } else {
    fail(`the longest resulting name is ${name.length} characters, at or over the 255 limit`);
  }
}

// ---- 4. no ends tapped: one file, not an empty second one -----------------
{
  const n = namesFor("Ritu", 0, 3);
  if (n.remotion.length === 1 && n.remotion[0].endsWith(".remotion_start.lrc")) {
    pass("with no ends tapped only the start file is written");
  } else {
    fail(`with no ends tapped the Remotion export wrote ${JSON.stringify(n.remotion)}`);
  }
  // And a partially tapped song must still write both halves, so the render
  // finds them and the report can say which lines are missing.
  const p = namesFor("Ritu", 2, 5);
  if (p.remotion.length === 2) {
    pass("with some ends tapped both halves are written");
  } else {
    fail(`with some ends tapped the Remotion export wrote ${JSON.stringify(p.remotion)}`);
  }
}

// ---- 5. the title is MANDATORY, not merely used ----------------------------
//
// safe() still falls back to "lyrics" so a filename can never be empty. That
// fallback is now a backstop rather than a path: nothing in the UI may reach
// it. Asserted on the source because runExport is DOM-bound and cannot be
// extracted the way safe() and the builders are -- and because what is being
// asserted is exactly the kind of thing that later gets deleted as redundant
// once the buttons are already disabled.
{
  const runExport = src.slice(src.indexOf("function runExport"));
  const body = runExport.slice(0, runExport.indexOf("\n  }"));

  if (/if \(!hasTitle\(\)\)/.test(body)) {
    pass("runExport refuses to export without a title");
  } else {
    fail("runExport has no title guard");
  }
  // The guard has to come BEFORE the files are built, or it is a message
  // rather than a block.
  const guard = body.indexOf("!hasTitle()");
  const build = body.search(/const files = spec\.build/);
  if (guard > 0 && (build < 0 || guard < build)) {
    pass("the guard runs before any file is written");
  } else {
    fail("the title guard runs after the files are built, so it does not block");
  }
  if (/b\.disabled = !hasAny \|\| !hasTitle\(\)/.test(src)) {
    pass("the export buttons are disabled without a title");
  } else {
    fail("the export buttons are not disabled without a title");
  }
  // A disabled button cannot be clicked to ask why it is disabled, so the
  // reason has to already be on screen.
  if (/id="titleHint"/.test(src) && /\("titleHint"\)\.hidden/.test(src)) {
    pass("a missing title is explained on screen, not only on click");
  } else {
    fail("nothing tells the user why the export buttons are disabled");
  }
  // A requirement that appears only once it is broken has already been broken.
  if (/<em class="req"[^>]*>required<\/em>/.test(src)) {
    pass("the field is marked required before anything is wrong");
  } else {
    fail("the title field is not marked as required");
  }
  // hasTitle() must be a real trim, or a title of spaces passes it and the
  // filename collapses straight back to "lyrics".
  const helper = src.slice(src.indexOf("const titleValue"), src.indexOf("const titleValue") + 200);
  if (/value\.trim\(\)/.test(helper) && /hasTitle[\s\S]*?\.length > 0/.test(helper)) {
    pass("a title of only spaces does not count as a title");
  } else {
    fail("hasTitle() does not trim, so a title of spaces passes the check");
  }
}

console.log("");
if (bad) {
  console.log("  " + bad + " problem(s).");
  process.exit(1);
}
console.log("  every export is named after the song title box, and every pair matches.");