import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand, ScanCommand, DeleteCommand } from "@aws-sdk/lib-dynamodb";

const client = new DynamoDBClient({});
const db = DynamoDBDocumentClient.from(client);

export const handler = async (event) => {
  const method = event.requestContext?.http?.method

  if (method === 'DELETE') {
    try {
      const { movieID, userID } = JSON.parse(event.body)

      if (userID !== 'nick') {
        return {
          statusCode: 403,
          headers: { "Access-Control-Allow-Origin": "*" },
          body: JSON.stringify({ error: "Unauthorized" }),
        }
      }

      await db.send(new DeleteCommand({
        TableName: process.env.MOVIES_TABLE,
        Key: { movieID },
      }))

      const allRankings = await db.send(new ScanCommand({
        TableName: process.env.RANKINGS_TABLE,
      }))

      for (const user of allRankings.Items) {
        if (user.rankings && user.rankings[movieID]) {
          const updatedRankings = { ...user.rankings }
          delete updatedRankings[movieID]
          await db.send(new PutCommand({
            TableName: process.env.RANKINGS_TABLE,
            Item: {
              userID: user.userID,
              rankings: updatedRankings,
              updatedAt: new Date().toISOString(),
            },
          }))
        }
      }

      return {
        statusCode: 200,
        headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
        body: JSON.stringify({ success: true }),
      }
    } catch (err) {
      console.error(err)
      return {
        statusCode: 500,
        headers: { "Access-Control-Allow-Origin": "*" },
        body: JSON.stringify({ error: "Failed to delete movie" }),
      }
    }
  }

  if (method === 'POST') {
    try {
      const { title, userID } = JSON.parse(event.body)

      if (userID !== 'nick') {
        return {
          statusCode: 403,
          headers: { "Access-Control-Allow-Origin": "*" },
          body: JSON.stringify({ error: "Unauthorized" }),
        }
      }

      if (!title) {
        return {
          statusCode: 400,
          headers: { "Access-Control-Allow-Origin": "*" },
          body: JSON.stringify({ error: "Missing title" }),
        }
      }

      const existing = await db.send(new ScanCommand({
        TableName: process.env.MOVIES_TABLE,
      }))

      const nextNum = existing.Items.length + 1
      const movieID = `movie_${String(nextNum).padStart(3, "0")}`

      await db.send(new PutCommand({
        TableName: process.env.MOVIES_TABLE,
        Item: { movieID, title },
      }))

      return {
        statusCode: 200,
        headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
        body: JSON.stringify({ success: true, movieID, title }),
      }
    } catch (err) {
      console.error(err)
      return {
        statusCode: 500,
        headers: { "Access-Control-Allow-Origin": "*" },
        body: JSON.stringify({ error: "Failed to add movie" }),
      }
    }
  }

  return {
    statusCode: 405,
    headers: { "Access-Control-Allow-Origin": "*" },
    body: JSON.stringify({ error: "Method not allowed" }),
  }
}