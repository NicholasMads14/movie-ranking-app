# Movie Ranking App

A full-stack serverless web app for our 6-person movie club to rank and compare 130+ films across 7 tiers with drag-and-drop reordering — optimized for mobile.

## Stack

Lambda · DynamoDB · Cognito · API Gateway · S3 · CloudFront · Route 53 · ACM · React · Tailwind CSS · Vite · GitHub Actions

## Architecture

- **Frontend:** React SPA hosted on S3, distributed via CloudFront CDN with ACM SSL
- **Auth:** Cognito User Pool — admin-provisioned accounts, no self-signup, JWT-authorized API routes
- **API:** HTTP API Gateway with Cognito JWT authorizer on protected routes
- **Backend:** Node.js 22 Lambda functions (getMovies, getRankings, saveRanking, addMovie)
- **Database:** DynamoDB with on-demand billing — separate tables per environment
- **DNS:** Route 53 with custom subdomains for both environments
- **CI/CD:** GitHub Actions — builds and deploys both production and demo on push to main

## UX approach

- **Tier-first ranking:** Users sort movies into 7 tiers (Loved it · Liked it · It's fine · Bad, but fun · Didn't like it · Hated it · Haven't seen it), then fine-tune order within each tier
- **Mobile:** One movie at a time with large tap targets during tiering. Single-column searchable list during fine-tuning
- **Desktop:** Same tier flow plus 7-column drag-and-drop reordering via dnd-kit
- **View others:** Comparison grid showing every member's tier and absolute rank for each movie, sortable by any member
- **Admin:** Add/remove movies (restricted to admin user only)

## Data model

Each user's rankings are stored as a single DynamoDB item — one read and one write per save regardless of collection size.

```json
{
  "userID": "nick",
  "rankings": {
    "movie_001": { "tier": "loved", "rank": 1 },
    "movie_002": { "tier": "liked", "rank": 3 }
  },
  "updatedAt": "2026-03-28T..."
}
```

## Environments

Two isolated deployments from one codebase, controlled by environment variables at build time.

| | URL | Purpose |
|---|---|---|
| Production | XXXXXXX.nicholasmadson.dev | Private — friends only |
| Demo | mra-demo.nicholasmadson.dev | Public — portfolio demo with guest login |
