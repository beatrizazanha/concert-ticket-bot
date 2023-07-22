# pokedolar-slack-bot
A bot that extracts the dollar quotation from the [pokedolar](https://twitter.com/pokedolar) twitter profile and post it to a slack channel

## How it works
When deployed to AWS Lambda, the bot runs following the cron schedule `cron(15,45 11-20 * * ? *)`. Each run consists of the following steps:

1. The bot extracts the most recent tweet URL path from the [pokedolar](https://twitter.com/pokedolar) twitter profile using a [headless chrome browser](https://github.com/Sparticuz/chromium) controlled by [puppeteer](https://pptr.dev/)
    - The bot uses a twitter account to extract the tweets. This is necessary because the twitter API doesn't allow to extract tweets from a profile without authentication
    - Example of a post's URL path: `/PokeDolar/status/1681372020842299415`
    - Note: The chrome binary that comes with puppeteer doesn't work in AWS Lambda, so we need to use a custom one. See [this](https://github.com/Sparticuz/chromium)
2. The bot compares the URL path of the recent post with the path of the last post sent to slack.
    - The file containing the last post's path is stored in a S3 bucket with name defined in the `BUCKET_NAME` environment variable and the path is defined in the `BUCKET_KEY` environment variable
3. If they are the same, it means that there is no new post and the bot doesn't need to do anything
3. If they are different, there is a new post and the bot sends a message to the Slack channel defined by the env var `SLACK_CHANNEL`
    - The message contains the full URL of the post obtained by concatenating base URL `https://twitter.com` with the post's URL path `https://twitter.com/PokeDolar/status/1681372020842299415`
    - The message is sent using the `@slack/web-api` package
    - With just the URL, Slack automatically generates a preview of the post containing its content and image

## Pre-requisites

1. Install node.js, if you haven't already
1. Install and configure the [AWS CLI](https://docs.aws.amazon.com/cli/latest/userguide/cli-chap-install.html)
2. Install and configure the [Serverless Framework](https://www.serverless.com/framework/docs/getting-started/) with the [AWS provider](https://www.serverless.com/framework/docs/providers/aws/guide/credentials/)


## Setup
1. Install dependencies with `npm install`
2. Create a `envvars.json` and a `.env` file with the following variables:
    - `LAMBDA_ROLE_ARN`: The ARN of the role with the necessary permissions to run the lambda
    - `TWITTER_USERNAME`: The twitter username of the account used to extract the tweets
    - `TWITTER_PWD`: The twitter password of the account to extract the tweets
    - `SLACK_TOKEN`: The slack token of the bot. Follow [these steps](https://api.slack.com/start/quickstart) to create a Slack app and get the token
    - `SLACK_CHANNEL`: The slack channel to send the messages
    - `BUCKET_NAME`: The name of the S3 bucket to store the last post's path
    - `BUCKET_KEY`: The path of the file in the S3 bucket to store the last post's path

## Running locally

The local version is in the index.js file with a prototype function that can be used to test the bot locally. In the current implementation, the prototype function will open twitter, log-in with the credentials provided, extract the most recent post's URL path and print it to the console.

To run it locally, run the command `node index.js` in the root folder.

## Running in AWS Lambda

1. Deploy the lambda by running `serverless deploy` in the root folder
2. The lambda will run following the cron schedule `cron(15,45 11-20 * * ? *)`. To change it, edit the `serverless.yml` file