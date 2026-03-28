import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand, ScanCommand } from "@aws-sdk/lib-dynamodb";

const client = new DynamoDBClient({ region: "us-east-1" });
const db = DynamoDBDocumentClient.from(client);

const RANKINGS_TABLE = "mra-demo-Rankings";
const MOVIES_TABLE = "mra-demo-Movies";

const CHARACTERS = ['roy', 'leon', 'rachael', 'deckard', 'pris'];
const TIER_ORDER = ['loved', 'liked', 'fine', 'badfun', 'disliked', 'hated', 'unseen'];

// Quality tiers based on real critical/cultural consensus
// "classic" = universally acclaimed, "good" = well-liked, "mixed" = divisive,
// "guilty" = bad but fun/campy, "bad" = widely considered poor
const MOVIE_QUALITY = {
  "The Godfather":            "classic",
  "Pulp Fiction":             "classic",
  "Schindler's List":         "classic",
  "Goodfellas":               "classic",
  "The Silence of the Lambs": "classic",
  "Forrest Gump":             "classic",
  "The Matrix":               "classic",
  "The Dark Knight":          "classic",
  "Back to the Future":       "classic",
  "Jurassic Park":            "classic",
  "Inception":                "good",
  "Interstellar":             "good",
  "Parasite":                 "good",
  "Die Hard":                 "good",
  "Gladiator":                "good",
  "The Lion King":            "good",
  "Titanic":                  "good",
  "The Revenant":             "good",
  "Home Alone":               "good",
  "La La Land":               "mixed",
  "Joker":                    "mixed",
  "Avatar":                   "mixed",
  "Bohemian Rhapsody":        "mixed",
  "Ready Player One":         "mixed",
  "Mamma Mia":                "mixed",
  "Transformers":             "guilty",
  "Sharknado":                "guilty",
  "The Room":                 "guilty",
  "Cats":                     "bad",
  "Batman and Robin":         "bad",
};

// Each character has a distinct taste profile that shifts how quality maps to tiers
// Roy:      passionate cinephile — loves the greats, harsh on bad movies
// Leon:     easygoing — likes most things, rarely hates anything
// Rachael:  thoughtful mainstream — appreciates quality, skips a few
// Deckard:  contrarian grump — harder to impress, finds more things mediocre
// Pris:     loves campy/fun stuff, more generous to "bad" movies

// Weighted tier distributions per quality level, per character
// Format: [loved, liked, fine, badfun, disliked, hated, unseen]
const TASTE_PROFILES = {
  roy: {
    classic: [0.60, 0.25, 0.10, 0.00, 0.00, 0.00, 0.05],
    good:    [0.25, 0.40, 0.20, 0.05, 0.05, 0.00, 0.05],
    mixed:   [0.05, 0.20, 0.35, 0.15, 0.15, 0.05, 0.05],
    guilty:  [0.00, 0.05, 0.10, 0.40, 0.20, 0.20, 0.05],
    bad:     [0.00, 0.00, 0.05, 0.15, 0.25, 0.50, 0.05],
  },
  leon: {
    classic: [0.45, 0.35, 0.10, 0.00, 0.00, 0.00, 0.10],
    good:    [0.25, 0.35, 0.25, 0.05, 0.00, 0.00, 0.10],
    mixed:   [0.10, 0.25, 0.35, 0.10, 0.10, 0.00, 0.10],
    guilty:  [0.05, 0.10, 0.25, 0.30, 0.15, 0.05, 0.10],
    bad:     [0.00, 0.05, 0.15, 0.25, 0.25, 0.20, 0.10],
  },
  rachael: {
    classic: [0.55, 0.30, 0.10, 0.00, 0.00, 0.00, 0.05],
    good:    [0.30, 0.35, 0.20, 0.05, 0.05, 0.00, 0.05],
    mixed:   [0.10, 0.20, 0.30, 0.15, 0.15, 0.05, 0.05],
    guilty:  [0.00, 0.05, 0.15, 0.35, 0.25, 0.15, 0.05],
    bad:     [0.00, 0.00, 0.05, 0.20, 0.30, 0.40, 0.05],
  },
  deckard: {
    classic: [0.30, 0.35, 0.20, 0.05, 0.05, 0.00, 0.05],
    good:    [0.10, 0.25, 0.30, 0.10, 0.15, 0.05, 0.05],
    mixed:   [0.05, 0.10, 0.25, 0.15, 0.25, 0.15, 0.05],
    guilty:  [0.00, 0.05, 0.10, 0.25, 0.25, 0.30, 0.05],
    bad:     [0.00, 0.00, 0.00, 0.10, 0.25, 0.60, 0.05],
  },
  pris: {
    classic: [0.40, 0.30, 0.15, 0.05, 0.05, 0.00, 0.05],
    good:    [0.20, 0.30, 0.25, 0.10, 0.05, 0.05, 0.05],
    mixed:   [0.15, 0.20, 0.25, 0.20, 0.10, 0.05, 0.05],
    guilty:  [0.10, 0.15, 0.15, 0.40, 0.10, 0.05, 0.05],
    bad:     [0.05, 0.05, 0.10, 0.35, 0.20, 0.20, 0.05],
  },
};

// Pick a tier based on weighted probabilities
function pickTier(weights) {
  const r = Math.random();
  let cumulative = 0;
  for (let i = 0; i < TIER_ORDER.length; i++) {
    cumulative += weights[i];
    if (r <= cumulative) return TIER_ORDER[i];
  }
  return TIER_ORDER[TIER_ORDER.length - 1];
}

function generateRankings(movieItems, character) {
  const profile = TASTE_PROFILES[character];

  // Assign each movie a tier based on its quality + character taste
  const tierBuckets = {};
  TIER_ORDER.forEach(t => { tierBuckets[t] = []; });

  for (const movie of movieItems) {
    const quality = MOVIE_QUALITY[movie.title] || "mixed";
    const weights = profile[quality];
    const tier = pickTier(weights);
    tierBuckets[tier].push(movie.movieID);
  }

  // Shuffle within each tier for rank variety, then assign ranks
  const rankings = {};
  TIER_ORDER.forEach(tier => {
    const ids = tierBuckets[tier].sort(() => Math.random() - 0.5);
    ids.forEach((id, i) => {
      rankings[id] = { tier, rank: i + 1 };
    });
  });

  return rankings;
}

// --- Main ---
console.log('Fetching demo movies...');
const moviesResult = await db.send(new ScanCommand({ TableName: MOVIES_TABLE }));
const movies = moviesResult.Items;
console.log(`Found ${movies.length} movies`);

// Log any movies not in our quality map
const unmapped = movies.filter(m => !MOVIE_QUALITY[m.title]);
if (unmapped.length > 0) {
  console.warn('⚠ Movies not in quality map (will default to "mixed"):');
  unmapped.forEach(m => console.warn(`  - "${m.title}"`));
}

console.log(`\nSeeding rankings for ${CHARACTERS.length} characters...`);
for (const character of CHARACTERS) {
  const rankings = generateRankings(movies, character);

  // Log distribution for verification
  const dist = {};
  TIER_ORDER.forEach(t => { dist[t] = 0; });
  Object.values(rankings).forEach(r => { dist[r.tier]++; });
  console.log(`  ${character}: ${TIER_ORDER.map(t => `${t}=${dist[t]}`).join(', ')}`);

  await db.send(new PutCommand({
    TableName: RANKINGS_TABLE,
    Item: {
      userID: character,
      rankings,
      updatedAt: new Date().toISOString(),
    },
  }));
  console.log(`  ✓ Seeded ${character}`);
}

console.log('\nDone!');
