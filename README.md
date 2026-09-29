# 🎵 Song Timer

**Time a song's lyrics once. Use them everywhere — a lyric video, an Ableton
Live set, and an overlay for streaming.**

Built by [Sajan Maharjan](https://github.com/mhzsajan) · Technical Director,
Deepak Bajracharya & The Rhythm Band.

**➡ [Open Song Timer](https://mhzsajan.github.io/songtimer/)** — one web page,
no install, no upload. Your audio never leaves your device.

---

## The idea

Preparing a song means typing the same timing three times: once for the lyric
video, once for the Ableton set, once for the stream overlay. Each one drifts
from the others, and you find out during a soundcheck.

Song Timer removes the repetition. You time the song **once**, and every tool
reads the same numbers:

```
        song.mp3  +  lyrics
               |
          Song Timer            ← you time it here, once
               |
   Song.remotion_start.lrc  +  Song.remotion_end.lrc
         │                            │
         ▼                            ▼
   ┌──────────┐      ┌──────────────┐      ┌──────────┐
   │  AbleSet │      │  Remotion AI │      │    OBS   │
   │ (Ableton)│      │ (the video)  │      │ (overlay)│
   └──────────┘      └──────────────┘      └──────────┘
   Song_ableset.lrc   a lyric video .mp4    Song.obs.html
                        + the end times
```

Every file is named for the target it is for, so all of them can sit in one
folder without being confused for each other. The AbleSet and Remotion `.lrc`
files carry the same starts but are used by different programs, and the ends
live in a second file so AbleSet never sees a timestamp it would turn into a
duplicate clip.

## How to use it

**1 — Load and write.** Choose a song, then paste the lyrics or search for
them (see [Looking lyrics up](#looking-lyrics-up)).

**2 — Pass 1: the starts.** Press `Space` to play, then `Enter` each time a
line *begins*. The tool walks the lyrics for you.

**3 — Pass 2: the ends.** Press `T`, then `Enter` each time a line *finishes*.

This second pass is what most people skip, and it matters. Without it the video
has to guess when a line ended, and guesses linger: a line sung before a long
instrumental can sit on screen for 20 seconds or more. Pass 2 takes as long as
pass 1 and removes the problem entirely.

**4 — Export.** One button per destination; see [Exporting](#exporting).

## Exporting

The buttons are named for where the files go, because what each one needs is
genuinely different.

| Button | Writes | For |
|---|---|---|
| **For AbleSet** | `Song_ableset.lrc` | Ableton Live. One MIDI clip per line. |
| **For Remotion AI** | `Song.remotion_start.lrc` + `Song.remotion_end.lrc` | The lyric video. |
| **For OBS** | `Song.obs.html` | A transparent overlay for streaming. |

`E` is a shortcut for **For Remotion AI**.

**Why every file is named for its target.** The three exports used to collide:
AbleSet and Remotion both wrote a file called `Song.lrc`, with the same starts
but read by different programs. In a folder listing there was no way to tell
them apart, and the wrong one dragged into Ableton fails in a way that looks
like a timing problem rather than a wrong file. Each name now says what it is
for. The renderer finds the end file by that name beside the start file, so
both halves still travel together.

**Why the ends are in a second file.** AbleSet turns every `[timestamp]` into a
MIDI clip, so a second timestamp would show the same lyric twice in Ableton —
and it would be indistinguishable from the LRC convention where several
timestamps mean the same line repeated. So the start file stays exactly as it
is, and the ends travel beside it in `Song.remotion_end.lrc`.

**For OBS** writes a single self-contained page. Add a **Browser Source** in OBS,
point *Local file* at it, and size it to your canvas — its background is
transparent by default, so it sits straight over the camera. Press `Space` to
start it, `←`/`→` to nudge, `R` to reset.

## Keeping the timing honest

**Your work is saved as you go.** The session is mirrored to `localStorage`, so
an accidental refresh cannot cost you forty tapped lines. It is offered back on
your next visit.

**Your timings survive edits.** Fix a spelling, add a line you missed, delete a
one — each stamp stays with its own text. You can retype the lyrics without
timing the song again.

**Three ways to fix a stamp**, in order of usefulness:

| | |
|---|---|
| **Click the timestamp** | Type the exact time. Accepts `1:23.45` or plain seconds. |
| **`,` and `.`** | Nudge ∓0.1s. Hold `Shift` for ∓0.5s. |
| **Load `.lrc`** | Restores a previously exported file *with* its stamps, so refining a song never means re-timing it. |

**Shifting a whole song.** If every line is early or late — a count-in, a bar
of silence before the first vocal — use **Apply to all**, or **Align first line
to playhead**. `Ctrl+Z` undoes it, so a mistimed shift costs nothing.

## Keyboard reference

| Key | Action |
|---|---|
| `Space` | Play / pause |
| `Enter` | Stamp the current line, advance |
| `T` | Switch between pass 1 and pass 2 |
| `↑` / `↓` | Select previous / next line |
| `←` / `→` | Seek −3s / +3s |
| `,` / `.` | Nudge −0.1s / +0.1s |
| `Shift` + `,` / `.` | Nudge −0.5s / +0.5s |
| `Backspace` | Clear the stamp, rewind to it |
| `P` | Preview (karaoke) mode |
| `E` | Export for Remotion AI |
| `J` | Jump the playhead to the selected line |
| `M` | Mute |
| `Ctrl+Z` / `Ctrl+Shift+Z` | Undo / redo |
| `/` | Focus the lyric search box |
| `Esc` | Exit preview mode |

Click any row to select it. `Backspace` clears the stamp **and** rewinds the
playhead to it, so a mistap is recovered with `Backspace` → `Space` → tap.

Playback speed (`0.5×`–`1.25×`) is a listening aid for dense lines. It does
**not** change what you stamp: the playhead still reports true song position.

## Looking lyrics up

Search [LRCLIB](https://lrclib.net), a free open lyrics database, as you would
a search engine — *"artist + song title"*.

A result marked **timed** arrives with the timing already on it, so you play it
through, nudge what is off, and export. **Words only** still saves you the
retyping.

Results are **never applied automatically** — you pick. LRCLIB matches on text
similarity, so *"the rhythm band"* also returns an unrelated band with a
similar name, and silently accepting one would be worse than no lookup at all.

Coverage is strongest for well-known Nepali artists and thinner for older or
obscure songs. If a song's lyrics only exist in a rehearsal-room document, type
them.

## Output format

Standard `.lrc`, carrying the title and band as metadata:

```lrc
[ti:Ritu]
[ar:Deepak Bajracharya & The Rhythm Band]
[00:38.57]फर्केर आउने छैन,
[00:40.86]म कुनै ऋतु होइन..
```

A line sung several times is **one entry with several timestamps**, which is the
LRC convention and what both AbleSet and the video renderer expect:

```lrc
[00:22.50][00:42.50][01:02.50]chorus line
```

In the editor a repeat is still its own row so you can stamp each occurrence
separately; they merge on export and split apart again if you `Load .lrc` the
result. Any `.lrc` player reads the file, including
[alsmuse](https://github.com/provos/alsmuse).

The ends file is one line per timed lyric, `start | end | text`:

```
1:06.45 | 1:07.10 | फर्केर आउने छैन
```

> **Non-Latin scripts:** timestamps are plain ASCII, so Devanagari, Tamil and
> similar text pass through untouched. Save as UTF-8 — some older editors
> default to a local codepage and will mangle it.

## Tips

- **Stamp on the downbeat, not the word start.** Everything downstream shows the
  line from its timestamp, so the first syllable is what the audience reads.
- **Leave a little air.** Timestamps are absolute, so a line that starts too
  early reads as early.
- **Don't chase perfection.** ±0.1s is below what a room notices.
- **Stamp every repeat.** A chorus sung three times needs three timestamps to be
  caught each time.

## Related

- **[lyric-video-remotion](https://github.com/mhzsajan/lyric-video-remotion)** —
  turns the exported files into the lyric video. Reads
  `Song.remotion_start.lrc` *and* `Song.remotion_end.lrc`, so the on-screen
  timing is the one you tapped.
- **[AbleSet](https://ableset.app)** — setlist and lyrics view for Ableton
  Live. Drop the `.lrc` on
  [ableset.com/tools/lyrics-lrc](https://ableset.com/tools/lyrics-lrc).
- **[alsmuse](https://github.com/provos/alsmuse)** — A/V script generation from
  Ableton Live sets.

## Privacy

Nothing is uploaded. No account, no telemetry, no network request at all — not
even a font. Once the page has loaded it works offline.

## License

MIT — see [LICENSE](LICENSE).
