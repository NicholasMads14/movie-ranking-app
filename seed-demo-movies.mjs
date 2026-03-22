import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand, ScanCommand, DeleteCommand } from "@aws-sdk/lib-dynamodb";

const client = new DynamoDBClient({ region: "us-east-1" });
const db = DynamoDBDocumentClient.from(client);

const TABLE_NAME = "mra-demo-Movies";

const movies = [
  "Titanic",
  "The Dark Knight",
  "Cats",
  "Jurassic Park",
  "Parasite",
  "Batman and Robin",
  "Inception",
  "The Lion King",
  "The Room",
  "Goodfellas",
  "Avatar",
  "Back to the Future",
  "Joker",
  "Transformers",
  "The Godfather",
  "Mamma Mia",
  "Die Hard",
  "Interstellar",
  "Sharknado",
  "Forrest Gump",
  "La La Land",
  "Home Alone",
  "Schindler's List",
  "Ready Player One",
  "The Revenant",
  "Pulp Fiction",
  "Gladiator",
  "Bohemian Rhapsody",
  "The Silence of the Lambs",
  "The Matrix",
]

const shuffled = [...movies].sort(() => Math.random() - 0.5)

console.log(`Clearing existing demo movies...`)
const existing = await db.send(new ScanCommand({ TableName: TABLE_NAME }))
for (const item of existing.Items) {
  await db.send(new DeleteCommand({ TableName: TABLE_NAME, Key: { movieID: item.movieID } }))
}

console.log(`Seeding ${shuffled.length} movies into ${TABLE_NAME}...`)
for (let i = 0; i < shuffled.length; i++) {
  const movieID = `movie_${String(i + 1).padStart(3, '0')}`
  await db.send(new PutCommand({
    TableName: TABLE_NAME,
    Item: { movieID, title: shuffled[i] },
  }))
  console.log(`✓ ${movieID} — ${shuffled[i]}`)
}

console.log('Done!')