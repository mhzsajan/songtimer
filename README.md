# 🎵 Song Timer

**Tap lyric timings while a song plays, then export one `.lrc` that drives both
Ableton Live and your video.**

Built by [Sajan Maharjan](https://github.com/mhzsajan) · Technical Director,
Deepak Bajracharya & The Rhythm Band.

**➡ [Open Song Timer](https://mhzsajan.github.io/songtimer/)**

No install, no server, no upload. It is one HTML page that runs entirely in your
browser, so your audio never leaves your device.

---

## What it's for

Timing lyrics is the slow, fiddly part of preparing a song for a show — and
the timings you produce are usually needed in two places at once:

```
                 song + lyrics
                      │
                 Song Timer          ← you time it here, once
                      │
                   song.lrc
                 ┌────┴─────┐
                 │          │
    ableset.com/tools/   the Remotion renderer
       lyrics-lrc              │
                 │          │
                 ▼          ▼
     .als → Ableton +    transparent lyric
     AbleSet (lyric       overlay → Videosync2
     track, one MIDI      video layer
     clip per line)
```

One set of timings, two consumers. Ableton and the video can never disagree,
because there is only one set of numbers.

## Usage

1. **Load a song** — any audio your browser can play
2. **Load or type lyrics** — one sung line per line; `[SECTION]` headers are ignored
3. **Play and tap** — `Enter` (or the TAP button) stamps the current line with
   the song position and advances
4. **Adjust** — nudge any stamp, or click a timestamp to type an exact time
5. **Preview** — karaoke-style check of the timing against the music
6. **Export `.lrc`**

## Getting accurate timings

The three ways to fix a stamp, in order of usefulness:

| | |
|---|---|
| **Click the timestamp** | Type the exact time. Best when you know where it should be. Accepts `1:23.45` or plain seconds (`83.45`). |
| **`,` and `.`** | Nudge ∓0.1s. Hold `Shift` for ∓0.5s. Good for small drift. |
| **Reload a `.lrc`** | `Load .lrc` restores a previously exported file *with* its stamps, so refining a song doesn't mean re-timing it. |

**Your timings survive edits.** Fix a spelling, insert a line, delete a line —
each stamp stays with its own text. A stamp is never duplicated onto another
line.

**Your work is saved automatically.** The session is mirrored to `localStorage`,
so an accidental refresh can't cost you forty tapped lines. It comes back on
your next visit.

## Keyboard reference

| Key | Action |
|---|---|
| `Space` | Play / pause |
| `Enter` | Stamp selected line & advance |
| `↑` / `↓` | Select previous / next line |
| `←` / `→` | Seek −3s / +3s |
| `,` / `.` | Nudge stamp −0.1s / +0.1s |
| `Shift` + `,` / `.` | Nudge −0.5s / +0.5s |
| `Backspace` | Clear selected stamp |
| `P` | Toggle preview (karaoke) mode |
| `E` | Export `.lrc` |
| `Esc` | Exit preview mode |

Click any row to select it.

## Output format

Standard `.lrc`, with the song title carried across as `[ti:]`:

```lrc
[ti:Ritu]
[00:38.57]फर्केर आउने छैन,
[00:40.86]म कुनै ऋतु होइन..
```

Any `.lrc`-compatible player reads it — including
[alsmuse](https://github.com/provos/alsmuse) and AbleSet's own lyrics view.

> **Non-Latin scripts:** timestamps are plain ASCII, so Devanagari, Tamil and
> similar text pass through untouched. Save the exported file as UTF-8 — some
> older editors default to a local codepage and will mangle it.

## Tips

- **Stamp on the downbeat, not the word start.** AbleSet and karaoke players
  show the line from its timestamp, so the first syllable is what the audience
  reads.
- **Leave a little air.** Timestamps are absolute; a line that starts too early
  reads as early.
- **Don't chase perfection.** ±0.1s is below what a room notices.
- **Stamp all the repeats.** One line sung three times is one line — export
  produces one timestamp, and you'd need three to catch each repeat.

## Related

- **[AbleSet](https://ableset.app)** — setlist and lyrics view for Ableton Live.
  Drop your `.lrc` on
  [ableset.com/tools/lyrics-lrc](https://ableset.com/tools/lyrics-lrc) to get a
  Live set with one MIDI clip per line.
- **[alsmuse](https://github.com/provos/alsmuse)** — A/V script generation from
  Ableton Live sets.
- **Remotion lyric-overlay renderer** — turns the same `.lrc` into a
  ProRes 4444 video with a real alpha channel, for layering over a
  Videosync2 camera feed.
- **Videosync2** — the timeline this workflow is built around.

## Privacy

Nothing is uploaded. There is no account, no telemetry and no network request
at all — not even a font. Once the page has loaded, it works offline.

## License

MIT — see [LICENSE](LICENSE).
