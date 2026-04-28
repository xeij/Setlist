# Setlist

Going to a concert tonight and want to know what to expect? Setlist scrapes recent tour data from setlist.fm and predicts what an artist will probably play — ranked by how often each song shows up and where it tends to fall in the show (opener, mid-set, closer, encore).

Search for an artist, pick their current tour leg, and get a predicted setlist in a few seconds.

## Why

Most setlist apps just show you what an artist played at a specific past show. This one looks across their whole recent tour and tells you what they're *likely* to play — which songs are almost guaranteed, which are rare, and roughly what order to expect them in.

## Tech stack

- React + Tailwind on the frontend, hosted on AWS Amplify
- FastAPI backend running on AWS Lambda (via Mangum) behind API Gateway
- setlist.fm API for concert history
- DynamoDB to cache results for 24 hours so repeat lookups are fast
- AWS SAM for infrastructure
