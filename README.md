# 🎵 Song Timer

Tap lyric timings while a song plays, adjust them, and export standard `.lrc`
synced lyrics — usable in AbleSet, alsmuse, and any LRC-compatible player.

**➡ [Open Song Timer](https://mhzsajan.github.io/songtimer/)**

No install, no server, no upload: it is a single HTML page that runs entirely
in your browser. Your audio never leaves your device.

## Usage

1. **Load a song** (mp3/wav/ogg/… your browser can play)
2. **Load or type lyrics** — one sung line per line; `[SECTION]` headers are ignored
3. **Play and tap** — each tap stamps the current line with the song position
4. **Adjust** — nudge any stamp if you were slightly off
5. **Preview** — karaoke-style check of your timing against the music
6. **Export `.lrc`**

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

Click any row to reselect it. Timestamps in the list can be clicked to clear
that stamp.

## Output format

```lrc
[ti:Song title]
[00:38.57]फर्केर आउने छैन,
[00:40.86]म कुनै ऋतु होइन..
```

## Related

- [AbleSet](https://ableset.app) — setlist and lyrics view for Ableton Live
- [alsmuse](https://github.com/provos/alsmuse) — A/V script generation from Ableton Live Sets

## License

MIT
