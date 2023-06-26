const puppeteer = require("puppeteer-core");
const chromium = require("@sparticuz/chromium");
const { WebClient } = require('@slack/web-api');

module.exports = {
    handler: async () => {
        try {
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

            if (path) {
                console.log(path[1]);

                const twitterURL = composeTwitterUrl(path[1])
                console.log(twitterURL);

                await sendSlackMessage(twitterURL)
            } else {
                throw new Error("path not found on page")
            }
        } catch (error) {
            console.log(error)
            throw error
        }
    },
};

function composeTwitterUrl(path) {
    return `https://twitter.com/${path}`;
}

async function sendSlackMessage(message) {
    const token = process.env.SLACK_TOKEN;
    const web = new WebClient(token);
    try {
        // Use the `chat.postMessage` method to send a message from this app
        await web.chat.postMessage({
            channel: '#poke-dolar-reloaded',
            text: message,
        });
    } catch (error) {
        console.log(error);
    }
}