import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand } from "@aws-sdk/lib-dynamodb";
import { readFileSync } from "fs";

const client = new DynamoDBClient({ region: "us-east-1" });
const db = DynamoDBDocumentClient.from(client);

const TABLE_NAME = "mra-Movies";

const fileData = readFileSync("movies.txt", "utf-8");
const movies = fileData
  .split("\n")
  .map(line => line.trim())
  .filter(line => line.length > 0);

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