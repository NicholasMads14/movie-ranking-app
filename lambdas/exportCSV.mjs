import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, ScanCommand, GetCommand } from "@aws-sdk/lib-dynamodb";

const client = new DynamoDBClient({});
const db = DynamoDBDocumentClient.from(client);

export const handler = async (event) => {
  try {
    const userID = event.queryStringParameters?.userID;

    if (!userID) {
      return {
        statusCode: 400,
        headers: { "Access-Control-Allow-Origin": "*" },
        body: JSON.stringify({ error: "Missing userID" }),
      };
    }

    const [moviesResult, rankingsResult] = await Promise.all([
      db.send(new ScanCommand({ TableName: process.env.MOVIES_TABLE })),
      db.send(new GetCommand({
        TableName: process.env.RANKINGS_TABLE,
        Key: { userID },
      })),
    ]);

    const movies = {};
    moviesResult.Items.forEach(m => { movies[m.movieID] = m.title; });

    const rankings = rankingsResult.Item?.rankings || {};

    const rows = Object.entries(rankings)
      .map(([movieID, data]) => ({
        title: movies[movieID] || movieID,
        tier: data.tier,
        rank: data.rank,
      }))
      .sort((a, b) => {
        const tierOrder = { loved: 1, liked: 2, fine: 3, disliked: 4, unseen: 5, unranked: 6 };
        if (tierOrder[a.tier] !== tierOrder[b.tier]) return tierOrder[a.tier] - tierOrder[b.tier];
        return a.rank - b.rank;
      });

    const csv = [
      "Title,Tier,Rank",
      ...rows.map(r => `"${r.title}",${r.tier},${r.rank}`)
    ].join("\n");

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="${userID}-rankings.csv"`,
        "Access-Control-Allow-Origin": "*",
      },
      body: csv,
    };
  } catch (err) {
    console.error(err);
    return {
      statusCode: 500,
      headers: { "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify({ error: "Failed to export CSV" }),
    };
  }
};