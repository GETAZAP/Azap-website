# Hero background video — generation brief

Four short shots of the same man doing four of the jobs we actually list, cut
together into a ~12 second loop. For Google Flow (Veo).

Read the two sections before the prompts. They are what decides whether this
works, and neither is about the wording of the prompt.

---

## 1. This is four generations, not one

Veo produces clips of roughly 8 seconds. **You cannot prompt a four-shot montage
in one go and get usable results** — it will either ignore the structure or give
you four bad seconds each. Generate the four shots separately, then stitch them.
Commands for that are at the bottom.

Budget for 4 shots × 3–5 takes each. Most takes will be discards.

## 2. Character consistency is the hard part

Four separate generations will give you four different-looking men unless you
force it. Three things, in order of effect:

**Use a reference image.** If Flow offers "Ingredients", frames-to-video, or any
character-reference input, feed it `public/images/hero.jpg` (the man already on
the site) for every one of the four shots. This is by far the strongest lever.

**Paste the identical character block into every prompt.** Word for word, no
variations, no synonyms. It is in the next section.

**Frame most shots below the face.** Hands, forearms, torso, over-the-shoulder.
A face that appears for half a second at a time, or not at all, cannot look
inconsistent. This is the trick that makes the whole thing achievable — and it
suits the brief anyway, because the point is the work, not the man.

Aim for the face to be clearly visible in **one** shot only.

---

## The character block

Paste this into all four prompts, unchanged:

```
The same man in every shot: a Nigerian man in his early thirties, medium-dark
skin, short black hair, neat full beard, wearing a plain dark navy polo shirt
with the sleeves sitting mid-bicep, dark charcoal work trousers, and a simple
dark wristwatch on his left wrist. Calm, focused, unhurried, competent.
```

---

## Shot 1 — washing up (3 seconds)

```
[CHARACTER BLOCK]

Handheld phone footage, filmed by someone standing beside him. He is washing
dishes at a kitchen sink in an ordinary Nigerian home. Framed from chest height
down: we see his forearms, his hands, the running water, plates and a sponge,
suds. He rinses a plate and sets it on the rack beside the sink. Steady
unhurried movement. Daylight from a window to the left, ordinary kitchen tiles
behind, a washing-up bottle and a couple of pots on the counter.

Style: casual UGC, phone camera, natural daylight, no colour grade, slightly
imperfect framing, mild handheld drift. Realistic and unstaged, like a clip
someone actually filmed. Landscape 16:9. No dialogue, no text anywhere.
```

## Shot 2 — fixing a pipe (3 seconds)

```
[CHARACTER BLOCK]

Handheld phone footage. He is crouched under a kitchen sink fixing a pipe. Close
on his hands and forearms turning an adjustable wrench on a plastic waste pipe
joint, tightening it with real effort. A small torch or daylight lights the
cabinet interior. A bucket and a cloth on the floor beside him. He tests the
joint with his fingers.

Framed low, from just outside the cabinet, so we see his hands, the wrench, the
pipe, and part of his navy polo sleeve. His face is not in frame.

Style: casual UGC, phone camera, available light, no colour grade, slight
handheld movement. Realistic and unstaged. Landscape 16:9. No dialogue, no text
anywhere.
```

## Shot 3 — servicing a generator (3 seconds)

*This is the shot to show his face in, so the montage has a person in it.*

```
[CHARACTER BLOCK]

Handheld phone footage. He is crouched beside a small petrol generator in a
paved back yard of a Nigerian home, servicing it. He wipes a part with a rag,
then reaches in with a spanner. Mid shot: we see him from the knees up, three
quarters on, his face visible and concentrating as he works. Green plants and a
rendered wall behind him, bright overcast daylight.

Style: casual UGC, phone camera, natural daylight, no colour grade, slight
handheld movement. Realistic and unstaged. Landscape 16:9. No dialogue, no text
anywhere.
```

## Shot 4 — mopping the floor (3 seconds)

```
[CHARACTER BLOCK]

Handheld phone footage. He is mopping a tiled floor in a bright Nigerian living
room. Framed from behind and to the side at waist height: we see the mop head
moving across the tiles in smooth strokes, wet floor catching the light, his
legs and one arm in frame, a bucket nearby. He works steadily across the frame
from left to right.

Style: casual UGC, phone camera, bright natural daylight through a window, no
colour grade, slight handheld movement. Realistic and unstaged. Landscape 16:9.
No dialogue, no text anywhere.
```

---

## Settings and negative prompt

- **Aspect ratio: 16:9.** Not vertical. UGC instinct is portrait; the hero is
  landscape and a vertical clip will be cropped to a sliver.
- **Resolution:** highest available.
- **Duration:** shortest that gives you clean movement. You are trimming to ~3s.
- **Audio:** irrelevant, it gets stripped.

Negative prompt, or append to each:

```
text, letters, words, signage, watermarks, logos, brand names, subtitles,
captions, distorted hands, extra fingers, mangled fingers, warped faces,
changing clothing, changing skin tone, vertical video, fast camera movement,
whip pans, zoom bursts, violent shake, jump cuts within the shot, scene changes,
multiple people, crowds, dark underexposed footage
```

**Watch the hands.** These are all hand-centred shots, which is exactly where AI
video still fails. Generate extra takes of shots 1, 2 and 4 and reject any with
finger artefacts — on a hero at full width, they are very visible.

---

## The one thing that changes on the page

A montage with a cut every three seconds is **busier behind text** than a single
slow shot. Two consequences:

1. **Keep the dark overlay.** It is currently about 60% and I would not lighten
   it further with this footage. The video will still read clearly.
2. **The cuts sit behind the headline.** That is fine and quite deliberate — the
   movement draws the eye, the text stays put. But if it feels restless once it
   is in, the fix is fewer, longer shots rather than a lighter wash. Tell me and
   I will drop it to three shots at four seconds.

---

## After you have the four clips

Send them to me and I will assemble it, or run this yourself if you have ffmpeg.

**Trim each to its best 3 seconds**, then concatenate:

```bash
# trim each take to 3s, normalising size and frame rate so they concatenate cleanly
for i in 1 2 3 4; do
  ffmpeg -i "raw$i.mp4" -t 3 -an \
    -vf "scale=1920:1080:force_original_aspect_ratio=increase,crop=1920:1080,fps=24" \
    -c:v libx264 -crf 18 -pix_fmt yuv420p "clip$i.mp4"
done

printf "file 'clip1.mp4'\nfile 'clip2.mp4'\nfile 'clip3.mp4'\nfile 'clip4.mp4'\n" > list.txt
ffmpeg -f concat -safe 0 -i list.txt -c copy joined.mp4
```

**Then compress hard.** Target is **under 2MB for the MP4** — it is decoration on
a page people open on mobile data.

```bash
ffmpeg -i joined.mp4 -an -c:v libx264 -preset veryslow -crf 30 \
  -profile:v high -pix_fmt yuv420p -movflags +faststart public/video/hero.mp4

ffmpeg -i joined.mp4 -an -c:v libvpx-vp9 -crf 40 -b:v 0 -row-mt 1 \
  public/video/hero.webm
```

Raise `-crf` if it is still too big. The dark overlay hides a lot of compression
damage, so you can push further than you would for footage shown on its own.

**Looping is easy with a montage** — a hard cut from shot 4 back to shot 1 reads
as just another cut. No crossfade needed. This is a genuine advantage over the
single-shot version.

**Update the poster frame** so the still matches the video's first frame:

```bash
ffmpeg -i public/video/hero.mp4 -vframes 1 -q:v 3 public/images/hero.jpg
```

**Then just drop the files in.** `public/video/hero.mp4` and
`public/video/hero.webm`. The site picks them up on its own — the hero does a
`HEAD` request on load and only mounts the video if the file is really there.
No code change needed.

---

## If character consistency defeats you

It might. Four matching generations of the same man is genuinely hard, and it is
the most likely reason this doesn't come together.

The fallback costs nothing and may honestly be better: **drop the person
entirely and shoot four pairs of hands.** Hands washing up, hands on a wrench,
hands on a generator, a mop on tiles. No face, no wardrobe, nothing to stay
consistent — and the montage still says exactly what you wanted it to say, which
is *these are the jobs we do*. Same four prompts, minus the character block, with
"his" replaced by "a person's".
