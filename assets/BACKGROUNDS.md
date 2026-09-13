# rubato backgrounds

The four photographic-style backgrounds were generated with the built-in image generation tool. They are original AI-generated scenery, not photographs of documented locations. Native outputs are 1672 × 941 pixels; the app serves high-quality WebP encodings without upscaling, plus small thumbnails so opening settings does not fetch every full background. Paper remains an SVG.

## Final project assets

- `assets/alpine-photo.webp` and `assets/alpine-thumb.webp`
- `assets/forest-photo.webp` and `assets/forest-thumb.webp`
- `assets/dunes-photo.webp` and `assets/dunes-thumb.webp`
- `assets/stars-photo.webp` and `assets/stars-thumb.webp`

To encode replacement PNGs, run `node scripts/prepare-backgrounds.mjs <source-directory>`. Input names match the `*-photo.png` convention. Original generated PNGs are retained in the image tool's generated-images folder.

## Final prompts

### alpine

Use case: photorealistic-natural. Asset type: full-screen landscape background for a minimalist timer website, rubato. Generate a single detailed photographic landscape, 3840x2160 landscape if supported, no UI or typography. A still alpine lake at early morning, weathered dramatic peaks in the upper third and distant pine forests around the shore, soft silvery morning mist, realistic tiny rock details, restrained sage green and warm grey colors, extraordinarily fine natural textures, tranquil and immersive fine-art landscape photography. Wide composition with open softly lit water and diffuse pale mist through the central region where dark timer digits will be overlaid; keep central 40% low contrast and naturally light, NOT a blank white rectangle. Natural lake reflections, atmospheric distance, authentic realistic exposure, subtle overcast dawn light. Detail in peaks and pine forests toward upper and side edges. No people, buildings, boats, text, logos, borders, graphic shapes, vector art, oversaturated colors, artificial tilt shift or heavy vignette. This is only the scenery, not an app screenshot.

### forest

Use case: photorealistic-natural. Asset type: full-screen background for the minimalist timer website rubato. Create a single extraordinarily detailed fine-art landscape photograph of a lush temperate rainforest in soft morning fog. Wide landscape 16:9 composition at highest available resolution. Ancient cedar and fir trunks framing the outer thirds, delicate detailed ferns and moss in the lower corners, layered tiny branches and pine needles, a quiet opening through trees in the center leading into pale luminous silver-green mist. Central 40% softly lit, naturally pale and low contrast to support dark timer text, detailed environment at edges, no distinct central subject. Muted sage, olive, soft grey, beautiful diffuse daylight, true photographic realism with rich organic detail and atmospheric depth. No text, UI, borders, logos, people, paths paved with stones, buildings, illustrations or vector art. This is an immersive landscape photograph only.

### dunes

Use case: photorealistic-natural. Asset type: full-screen scenic background for the minimalist timer website rubato. Single exquisitely detailed landscape photograph of remote desert sand dunes at quiet dawn. Wide 16:9 landscape at highest available resolution. Sweeping sculptural dune crests, fine wind-carved ripples in foreground, delicate individual sand textures, pale ochre and warm champagne sands with long muted terracotta shadows toward lower edges. Several distant dune layers fading into atmospheric haze. Soft pale peach morning sky, natural restrained colors, fine-art medium format photography, exceptional realistic detail, serene. Central 40% is softly illuminated pale sand and haze, relatively low contrast for dark timer text overlay. No people, tracks, camels, buildings, dramatic oversaturation, graphics, border, text, logos or UI. Pure photographic scenery.

### stars

Use case: photorealistic-natural. Asset type: full-screen scenery for the minimalist timer website rubato. Create a single high-detail natural landscape photograph during the final moments of blue hour before dawn: a still mountain lake beneath a wide star-studded sky, extremely fine realistic stars, faint subtle Milky Way near the upper edge, distant rugged mountain silhouettes along the LOWER third, pale silver lavender atmospheric haze across the middle horizon, a soft crescent moon in upper right, realistic cool slate and periwinkle colors. Wide 16:9 landscape at highest available resolution. The central 40% must remain naturally luminous soft grey-blue haze with relatively few bright stars, so dark overlaid timer digits remain legible. Deepest navy only at upper and lower edges. Authentic understated astrophotography, distant rock detail and tiny reflected stars, tranquil, subtle fine grain. No text, logos, UI, people, artificial nebula swirls, graphic illustration, frames or borders.
