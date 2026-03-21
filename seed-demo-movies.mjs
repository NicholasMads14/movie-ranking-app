import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand } from "@aws-sdk/lib-dynamodb";

const client = new DynamoDBClient({ region: "us-east-1" });
const db = DynamoDBDocumentClient.from(client);

const TABLE_NAME = "mra-demo-Movies";

const movies = [
  "2001: A Space Odyssey",
  "Alien",
  "Aliens",
  "Blade Runner",
  "The Terminator",
  "Terminator 2: Judgment Day",
  "The Matrix",
  "Interstellar",
  "Arrival",
  "Ex Machina",
  "Dune",
  "Total Recall",
  "The Thing",
  "Predator",
  "RoboCop",
];

console.log(`Seeding ${movies.length} movies into ${TABLE_NAME}...`);

for (let i = 0; i < movies.length; i++) {
  const title = movies[i];
  const movieID = `movie_${String(i + 1).padStart(3, "0")}`;

  await db.send(new PutCommand({
    TableName: TABLE_NAME,
    Item: { movieID, title }
  }));

  console.log(`✓ ${movieID} — ${title}`);
}

console.log(`Done! ${movies.length} movies seeded.`);