# Movie Ranking App

A full-stack serverless web app for a 6-person movie club to rank and compare 120+ films via a drag-and-drop interface.

## Stack
React · Vite · AWS Lambda · DynamoDB · Cognito · API Gateway · S3 · CloudFront · Route 53 · ACM · GitHub Actions

## Architecture
- **Frontend:** React SPA hosted on S3, delivered via CloudFront CDN
- **Auth:** Cognito User Pool (admin-provisioned accounts, no self-signup)
- **API:** HTTP API Gateway with Cognito JWT authorization
- **Backend:** Node.js Lambda functions
- **Database:** DynamoDB (on-demand billing)
- **CI/CD:** GitHub Actions — builds and deploys both environments on push to main

## Environments
| | URL | Purpose |
|---|---|---|
| Production | xxxxxxxxxxxx.nicholasmadson.dev | Private — friends only |
| Demo | mra-demo.nicholasmadson.dev | Public — portfolio |

## Local setup
_Coming soon_
