// Shared by the picker and preference validation. Themes change only the background.
export const THEMES = [
  {
    "id": "alpine",
    "name": "Alpine",
    "category": "Nature"
  },
  {
    "id": "forest",
    "name": "Forest",
    "category": "Nature"
  },
  {
    "id": "stars",
    "name": "Stars",
    "category": "Space"
  },
  {
    "id": "dunes",
    "name": "Dunes",
    "category": "Nature"
  },
  {
    "id": "paper",
    "name": "Paper",
    "category": "Abstract"
  },
  {
    "id": "outer-space",
    "name": "Outer space",
    "category": "Space"
  },
  {
    "id": "nebula",
    "name": "Nebula",
    "category": "Space"
  },
  {
    "id": "earthrise",
    "name": "Earthrise",
    "category": "Space"
  },
  {
    "id": "saturn",
    "name": "Saturn",
    "category": "Space"
  },
  {
    "id": "lunar-surface",
    "name": "Lunar quiet",
    "category": "Space"
  },
  {
    "id": "orbital-window",
    "name": "Orbital window",
    "category": "Space"
  },
  {
    "id": "comet",
    "name": "Comet trail",
    "category": "Space"
  },
  {
    "id": "beach",
    "name": "Beach",
    "category": "Nature"
  },
  {
    "id": "mount-fuji",
    "name": "Mount Fuji",
    "category": "Nature"
  },
  {
    "id": "waterfall",
    "name": "Waterfall",
    "category": "Nature"
  },
  {
    "id": "redwoods",
    "name": "Redwood grove",
    "category": "Nature"
  },
  {
    "id": "autumn-lake",
    "name": "Autumn lake",
    "category": "Nature"
  },
  {
    "id": "bamboo",
    "name": "Bamboo light",
    "category": "Nature"
  },
  {
    "id": "snowfield",
    "name": "Snowfield",
    "category": "Nature"
  },
  {
    "id": "lavender",
    "name": "Lavender dusk",
    "category": "Nature"
  },
  {
    "id": "iceland",
    "name": "Black sand",
    "category": "Nature"
  },
  {
    "id": "underwater",
    "name": "Underwater",
    "category": "Nature"
  },
  {
    "id": "cloudscape",
    "name": "Above the clouds",
    "category": "Nature"
  },
  {
    "id": "tropical-rain",
    "name": "Tropical rain",
    "category": "Nature"
  },
  {
    "id": "fireplace",
    "name": "Fireplace",
    "category": "Interiors"
  },
  {
    "id": "window-desk",
    "name": "Window-side study",
    "category": "Interiors"
  },
  {
    "id": "library",
    "name": "Quiet library",
    "category": "Interiors"
  },
  {
    "id": "rainy-cafe",
    "name": "Rainy café",
    "category": "Interiors"
  },
  {
    "id": "greenhouse",
    "name": "Glasshouse",
    "category": "Interiors"
  },
  {
    "id": "japanese-room",
    "name": "Tatami morning",
    "category": "Interiors"
  },
  {
    "id": "record-room",
    "name": "Vinyl evening",
    "category": "Interiors"
  },
  {
    "id": "artist-studio",
    "name": "Artist’s studio",
    "category": "Interiors"
  },
  {
    "id": "night-train",
    "name": "Night train",
    "category": "Interiors"
  },
  {
    "id": "bookshop",
    "name": "Bookshop afternoon",
    "category": "Interiors"
  },
  {
    "id": "lofi-girl",
    "name": "Lofi girl",
    "category": "Illustrated"
  },
  {
    "id": "lofi-rooftop",
    "name": "Lofi rooftop",
    "category": "Illustrated"
  },
  {
    "id": "cozy-cat",
    "name": "Cat nap",
    "category": "Illustrated"
  },
  {
    "id": "anime-seaside",
    "name": "Seaside afternoon",
    "category": "Illustrated"
  },
  {
    "id": "floating-islands",
    "name": "Floating islands",
    "category": "Illustrated"
  },
  {
    "id": "moon-garden",
    "name": "Moon garden",
    "category": "Illustrated"
  },
  {
    "id": "storybook-cottage",
    "name": "Storybook cottage",
    "category": "Illustrated"
  },
  {
    "id": "pixel-arcade",
    "name": "Pixel after hours",
    "category": "Illustrated"
  },
  {
    "id": "venice",
    "name": "Venice dawn",
    "category": "Places"
  },
  {
    "id": "kyoto-rain",
    "name": "Kyoto rain",
    "category": "Places"
  },
  {
    "id": "tokyo-night",
    "name": "Tokyo after dark",
    "category": "Places"
  },
  {
    "id": "santorini",
    "name": "Aegean light",
    "category": "Places"
  },
  {
    "id": "paris-morning",
    "name": "Paris morning",
    "category": "Places"
  },
  {
    "id": "silk",
    "name": "Silk",
    "category": "Abstract"
  },
  {
    "id": "ink-wash",
    "name": "Ink wash",
    "category": "Abstract"
  },
  {
    "id": "prism",
    "name": "Prism light",
    "category": "Abstract"
  }
];
export const THEME_IDS = THEMES.map(theme => theme.id);
export const CATEGORIES = ['Nature', 'Space', 'Interiors', 'Illustrated', 'Places', 'Abstract'];
export const themeImage = id => id === 'paper' ? '/assets/paper.svg' : `/assets/${id}-photo.webp`;
export const themeThumbnail = id => id === 'paper' ? '/assets/paper.svg' : `/assets/${id}-thumb.webp`;
