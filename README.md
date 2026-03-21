# Movie Ranking App

A full-stack serverless web app for a 6-person movie club to rank and compare 120+ films with a tier-based ranking system optimized for mobile.

## Stack
React · Tailwind CSS · Vite · AWS Lambda · DynamoDB · Cognito · API Gateway · S3 · CloudFront · Route 53 · ACM · GitHub Actions

## Architecture
- **Frontend:** React SPA hosted on S3, delivered via CloudFront CDN
- **Auth:** Cognito User Pool (admin-provisioned accounts, no self-signup)
- **API:** HTTP API Gateway with Cognito JWT authorization
- **Backend:** Node.js Lambda functions
- **Database:** DynamoDB (on-demand billing)
- **CI/CD:** GitHub Actions — builds and deploys both environments on push to main

## UX approach
- **Tier-first ranking:** Users sort movies into broad buckets first (Loved it / Liked it / It's fine / Didn't like it / Haven't seen it), then fine-tune order within each tier
- **Mobile:** One movie at a time with big tap targets during tiering. Single-column searchable list with up/down controls during fine-tuning
- **Desktop:** Same tier flow plus drag-and-drop reordering within tiers
- **View others:** Tier grid showing all members' tiers for each movie at a glance

## Data model
Each user's ranking is stored as a single DynamoDB Map item — one read and one write per save regardless of collection size.
```json
{
  "userId": "nick",
  "rankings": {
    "movie_001": { "tier": "loved", "rank": 1 },
    "movie_002": { "tier": "liked", "rank": 3 }
  }
}
```

## Environments
| | URL | Purpose |
|---|---|---|
| Production | xxxxxxxxxx.nicholasmadson.dev | Private — friends only |
| Demo | mra-demo.nicholasmadson.dev | Public — portfolio |

## Local setup
_Coming soon_