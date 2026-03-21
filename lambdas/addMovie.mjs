import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand, ScanCommand } from "@aws-sdk/lib-dynamodb";

const client = new DynamoDBClient({});
const db = DynamoDBDocumentClient.from(client);

export const handler = async (event) => {
  try {
    const { title, userID } = JSON.parse(event.body);

    if (userID !== "nick") {
      return {
        statusCode: 403,
        headers: { "Access-Control-Allow-Origin": "*" },
        body: JSON.stringify({ error: "Unauthorized" }),
      };
    }

    if (!title) {
      return {
        statusCode: 400,
        headers: { "Access-Control-Allow-Origin": "*" },
        body: JSON.stringify({ error: "Missing title" }),
      };
    }

    const existing = await db.send(new ScanCommand({
      TableName: process.env.MOVIES_TABLE,
    }));

    const nextNum = existing.Items.length + 1;
    const movieID = `movie_${String(nextNum).padStart(3, "0")}`;

    await db.send(new PutCommand({
      TableName: process.env.MOVIES_TABLE,
      Item: { movieID, title },
    }));

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify({ success: true, movieID, title }),
    };
  } catch (err) {
    console.error(err);
    return {
      statusCode: 500,
      headers: { "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify({ error: "Failed to add movie" }),
    };
  }
};