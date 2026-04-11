# Seek & Find — Development Notes

## Current State (April 2026)

All 5 scene files have been rewritten to use the **hotspot + background-crop thumbnail** system.
No new image files are needed — both the clickable hotspots and the instruction thumbnails
use zoomed/cropped portions of the existing background image.

### How it works
- `items[]` array defines each findable thing: `{ key, label, top, left, size }`
  - `top` / `left` = percentage position within the scene container
  - `size` = diameter of the invisible click target in pixels
- Invisible `<div class="item-hotspot">` elements are placed at each item's coordinates
- The instruction strip at the bottom shows 3 cropped thumbnails from the scene image
  (zoomed in to the item's position using `background-position` math)
- On correct click: hotspot fades out, thumbnail gets a green outline + greyscale
- On wrong area click: screen shakes

---

## ⚠️ REMAPPING NEEDED — Coordinates Are Estimates

**The item coordinates in ALL 5 scenes are currently rough guesses** carried over from
where the old emoji overlays were placed. The items in the background illustrations
won't line up exactly with these numbers.

### Every scene needs a coordinate pass:
1. Open the scene in a browser with `?pos` at the end of the URL, e.g.:
   `seekandfind/park.html?pos`
2. Current hotspots are shown with **orange outlines** in debug mode
3. Click anywhere on the scene image — the top-right HUD logs the coordinates
4. Click the center of each item in the background art to find its real position
5. Update the `items[]` array in the scene's HTML file with the corrected values
6. Sync to iOS (see sync command below)

Also check that each item label actually exists visibly in the background illustration.
Remove or rename any items that don't appear in the art.

---

## Items Lists (current — all need position verification)

### beach.html — 16 items
```
sun, palmtree, umbrella, book, dove (Bird), surfer, sailboat, icecream,
ball, turtle, snorkel, coin, crab, fish, octopus, starfish
```

### camping.html — 16 items
```
tent, bear, canoe, backpack, campfire, owl, moon, mountain,
cabin, raccoon, mushroom, firefly, flower, sled, pinetree, star
```
Note: "sled" may not appear in the camping illustration — verify and replace if missing.

### castle.html — 15 items
```
castle, dragon, sword, shield, crown, wizard, horse, turkey (Turkey Leg),
scroll, fire, diamond, arrow (Bow & Arrow), key, compass, coin (Gold Coin)
```

### park.html — 26 items
```
squirrel, butterfly, soccer (Soccer Ball), balloon, runner,
hotdog (Hot Dog), icecream (Ice Cream), drink, duck, briefcase,
blossom, hibiscus, tree (Big Tree), sunflower, daisy, tulip, rose,
bird, dog, cat, rabbit, bee, ladybug, apple, cookie, juicebox (Juice Box)
```
User note: include the red balloon, the slide, and specific flowers.
**Slide is NOT in the current items list — add it once position is found.**

### space.html — 15 items
```
rocket, ufo (UFO), astronaut, planet (Planet), galaxy,
shootingstar (Shooting Star), comet, newmoon (New Moon), fullmoon (Full Moon),
star, telescope, alien, satellite, antenna, spacerock (Space Rock)
```

---

## Crop Thumbnail Math

Thumbnails are 70×70px divs using `background-size: 600% 600%` on the full scene image.
The background-position formula (computed in JS):
```js
bgX = -(left% / 100 * 420) + 35   // 420 = 70 * 6,  35 = half of 70
bgY = -(top%  / 100 * 420) + 35
```
Once positions are corrected, thumbnails will automatically show the right part of the image.

---

## iOS Sync Command

After editing any scene file, sync to iOS with:
```powershell
$src = "c:\Users\ianla\Documents\Apps\OTG PlayShift\seekandfind"
$ios = "c:\Users\ianla\Documents\Apps\OTG PlayShift\iOS_App\OTGPlayShift\OTGPlayShift\www\seekandfind"
foreach ($f in @("beach.html","camping.html","castle.html","park.html","space.html")) {
    Copy-Item "$src\$f" "$ios\$f" -Force
}
```

---

## File Structure

```
seekandfind/
  index.html          — scene selection menu (done, no emojis)
  beach.html          — hotspot system ✓  coordinates need mapping
  camping.html        — hotspot system ✓  coordinates need mapping
  castle.html         — hotspot system ✓  coordinates need mapping
  park.html           — hotspot system ✓  coordinates need mapping
  space.html          — hotspot system ✓  coordinates need mapping
  images/
    beach.png
    camping.png
    castle.png
    park.png
    space.png
```
