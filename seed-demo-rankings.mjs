import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand, ScanCommand } from "@aws-sdk/lib-dynamodb";

const client = new DynamoDBClient({ region: "us-east-1" });
const db = DynamoDBDocumentClient.from(client);

const RANKINGS_TABLE = "mra-demo-Rankings";
const MOVIES_TABLE = "mra-demo-Movies";

const CHARACTERS = ['luke', 'han', 'leia', 'anakin', 'jabba']

const TIER_ORDER = ['loved', 'liked', 'fine', 'badfun', 'disliked', 'hated', 'unseen']

// Each character has a personality that affects their rankings
const PERSONALITIES = {
  luke: { loved: 0.35, liked: 0.30, fine: 0.15, badfun: 0.05, disliked: 0.05, hated: 0.05, unseen: 0.05 },
  han:  { loved: 0.20, liked: 0.25, fine: 0.20, badfun: 0.10, disliked: 0.10, hated: 0.05, unseen: 0.10 },
  leia: { loved: 0.25, liked: 0.30, fine: 0.20, badfun: 0.05, disliked: 0.10, hated: 0.05, unseen: 0.05 },
  anakin:{ loved: 0.10, liked: 0.15, fine: 0.15, badfun: 0.15, disliked: 0.20, hated: 0.20, unseen: 0.05 },
  jabba:{ loved: 0.15, liked: 0.20, fine: 0.20, badfun: 0.20, disliked: 0.10, hated: 0.10, unseen: 0.05 },
}

function assignTiers(movieIDs, personality) {
  const shuffled = [...movieIDs].sort(() => Math.random() - 0.5)
  const counts = {}
  let remaining = movieIDs.length

  TIER_ORDER.forEach((tier, i) => {
    if (i === TIER_ORDER.length - 1) {
      counts[tier] = remaining
    } else {
      counts[tier] = Math.round(personality[tier] * movieIDs.length)
      remaining -= counts[tier]
    }
  })

  const rankings = {}
  let idx = 0
  TIER_ORDER.forEach(tier => {
    const count = counts[tier] || 0
    for (let r = 0; r < count; r++) {
      if (idx < shuffled.length) {
        rankings[shuffled[idx]] = { tier, rank: r + 1 }
        idx++
      }
    }
  })

  return rankings
}

console.log('Fetching demo movies...')
const moviesResult = await db.send(new ScanCommand({ TableName: MOVIES_TABLE }))
const movieIDs = moviesResult.Items.map(m => m.movieID)

console.log(`Seeding rankings for ${CHARACTERS.length} characters across ${movieIDs.length} movies...`)

for (const character of CHARACTERS) {
  const rankings = assignTiers(movieIDs, PERSONALITIES[character])
  await db.send(new PutCommand({
    TableName: RANKINGS_TABLE,
    Item: {
      userID: character,
      rankings,
      updatedAt: new Date().toISOString(),
    },
  }))
  console.log(`✓ Seeded ${character}`)
}

console.log('Done!')