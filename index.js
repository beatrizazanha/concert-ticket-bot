const puppeteer = require('puppeteer')
const { WebClient } = require('@slack/web-api');


function composeTwitterUrl(path) {
    return `https://twitter.com/${path}`;
}

async function getRecentPostPath() {
    const browser = await puppeteer.launch({ headless: 'new' });
    const page = await browser.newPage();

    await page.goto('https://twitter.com/pokedolar', { waitUntil: 'networkidle2' });

    // await page.waitForTimeout(2000);

    const article = await page.waitForSelector('article');
    const innerHTML = await article.$eval('div', el => el.innerHTML);
    await browser.close();

    const path = innerHTML.match(/href="\/(PokeDolar\/status\/[0-9]+)"/)

    if (path) {
        console.log(path[1]);
        return path[1];
    }

};

async function sendSlackMessage(message) {
    const token = process.env.SLACK_TOKEN;
    const web = new WebClient(token);
    try {
        // Use the `chat.postMessage` method to send a message from this app
        await web.chat.postMessage({
            channel: '@HenriqueFuschini',
            text: message,
        });
    } catch (error) {
        console.log(error);
    }
}

getRecentPostPath()
    .then((res) => composeTwitterUrl(res))
    .then((res) => sendSlackMessage(res))
    .then(() => console.log('Message sent!'))
    .catch(error => console.error(error));