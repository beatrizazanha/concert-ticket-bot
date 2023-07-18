const puppeteer = require("puppeteer-core");
const chromium = require("@sparticuz/chromium");
const { WebClient } = require('@slack/web-api');
const { S3 } = require("@aws-sdk/client-s3");

const s3Client = new S3({ region: 'us-east-1' });

async function getRecentPostPath() {
    const browser = await puppeteer.launch({
        args: chromium.args,
        defaultViewport: chromium.defaultViewport,
        executablePath: await chromium.executablePath(),
        headless: chromium.headless,
        ignoreHTTPSErrors: true,
    });

    const page = await browser.newPage();

    await page.goto('https://twitter.com/pokedolar', { waitUntil: 'networkidle2', timeout: 0 });

    const article = await page.waitForSelector('article');
    const innerHTML = await article.$eval('div', el => el.innerHTML);
    await browser.close();

    const path = innerHTML.match(/href="\/(PokeDolar\/status\/[0-9]+)"/)
    console.log("Recent post", path)

    if (path) {
        return path[1];
    }

    throw new Error("path not found on page")
}

async function getRecentPostPathWithLogin() {
    const browser = await puppeteer.launch({
        args: chromium.args,
        defaultViewport: chromium.defaultViewport,
        executablePath: await chromium.executablePath(),
        headless: false,
        ignoreHTTPSErrors: true,
    });

    console.log("Browser launched");

    // Open twitter
    const page = await browser.newPage();
    await page.goto('https://twitter.com/pokedolar', { waitUntil: 'networkidle2', timeout: 0 });

    console.log("Twitter opened");

    // Type username
    const usernameInput = await page.waitForSelector('input[autocomplete="username"]');
    await usernameInput.type(process.env.TWITTER_USERNAME);

    console.log("Username typed");

    // Click next
    const nextBtn = await page.waitForXPath('//*[@id="layers"]/div/div/div/div/div/div/div[2]/div[2]/div/div/div[2]/div[2]/div/div/div/div[6]')
    await nextBtn.click();

    console.log("Next clicked");

    // Type password
    const pwdInput = await page.waitForSelector('input[autocomplete="current-password"]');
    await pwdInput.type(process.env.TWITTER_PWD);

    console.log("Password typed");

    // Click login
    const loginBtn = await page.waitForXPath('//*[@id="layers"]/div/div/div/div/div/div/div[2]/div[2]/div/div/div[2]/div[2]/div[2]/div/div[1]/div/div/div')
    await loginBtn.click();

    console.log("Login clicked");

    // Get HTML of recent post
    const article = await page.waitForSelector('article');
    const innerHTML = await article.$eval('div', el => el.innerHTML);
    await browser.close();

    // Extract post path from HTML
    const path = innerHTML.match(/href="\/(PokeDolar\/status\/[0-9]+)"/)
    console.log("Recent post", path)

    if (path) {
        return path[1];
    }

    throw new Error("path not found on page")
}

async function getLastPostPath() {

    const object = await s3Client.getObject({
        Bucket: 'fuscassets',
        Key: 'pokebot/pokedolarLastPost.txt'
    })

    const body = await object.Body.transformToString();
    return body
}

function recentNotEqualLast(recent, last) {
    return recent !== last
}

async function saveLastPostPath(path) {
    const object = await s3Client.putObject({
        Bucket: 'fuscassets',
        Key: 'pokebot/pokedolarLastPost.txt',
        Body: path
    })

    console.log("Saved last post path: ", path)
    console.log("S3 response: ", object)
}

function composeTwitterUrl(path) {
    return `https://twitter.com/${path}`;
}

async function sendSlackMessage(message) {
    const token = process.env.SLACK_TOKEN;
    const web = new WebClient(token);
    try {
        // Use the `chat.postMessage` method to send a message from this app
        await web.chat.postMessage({
            channel: '#poke-dolar',
            text: message,
        });
    } catch (error) {
        console.log(error);
        throw error
    }
}

module.exports = {
    getRecentPostPath,
    getRecentPostPathWithLogin,
    getLastPostPath,
    saveLastPostPath,
    recentNotEqualLast,
    composeTwitterUrl,
    sendSlackMessage
}
