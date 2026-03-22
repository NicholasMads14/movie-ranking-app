import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand } from "@aws-sdk/lib-dynamodb";

const client = new DynamoDBClient({ region: "us-east-1" });
const db = DynamoDBDocumentClient.from(client);

const USERS = ['malena', 'astraea', 'alex', 'brandon', 'bowling']
const TIERS = ['loved', 'liked', 'fine', 'disliked', 'unseen']
const MOVIE_IDS = Array.from({ length: 134 }, (_, i) => `movie_${String(i + 1).padStart(3, '0')}`)

function randomize() {
  const shuffled = [...MOVIE_IDS].sort(() => Math.random() - 0.5)
  const tierCounts = { loved: 0, liked: 0, fine: 0, disliked: 0, unseen: 0 }
  const rankings = {}

  shuffled.forEach((movieID, i) => {
    let tier
    if (i < 30) tier = 'loved'
    else if (i < 60) tier = 'liked'
    else if (i < 90) tier = 'fine'
    else if (i < 105) tier = 'disliked'
    else tier = 'unseen'

    tierCounts[tier]++
    rankings[movieID] = { tier, rank: tierCounts[tier] }
  })

  return rankings
}

for (const userID of USERS) {
  const rankings = randomize()
  await db.send(new PutCommand({
    TableName: 'mra-Rankings',
    Item: {
      userID,
      rankings,
      updatedAt: new Date().toISOString(),
    },
  }))
  console.log(`✓ Seeded ${userID}`)
}

console.log('Done!')