const { get } = require('lodash');
const puppeteer = require('puppeteer');
require('dotenv').config()
const {
    getLastPostPath,
    saveLastPostPath,
    recentNotEqualLast,
    composeTwitterUrl,
    sendSlackMessage } = require('./utils.js');

async function getRecentPostPathWithLogin() {
    const browser = await puppeteer.launch({
        headless: false
    });

    // Open twitter
    const page = await browser.newPage();
    await page.goto('https://twitter.com/pokedolar', { waitUntil: 'networkidle2', timeout: 0 });
    await page.emulateMediaType('screen');

    // Type username
    const usernameInput = await page.waitForSelector('input[autocomplete="username"]');
    await usernameInput.type(process.env.TWITTER_USERNAME);

    // Click next
    const nextBtn = await page.waitForSelector('#layers > div > div > div > div > div > div > div.css-1dbjc4n.r-1awozwy.r-18u37iz.r-1pi2tsx.r-1777fci.r-1xcajam.r-ipm5af.r-g6jmlv > div.css-1dbjc4n.r-1867qdf.r-1wbh5a2.r-kwpbio.r-rsyp9y.r-1pjcn9w.r-1279nm1.r-htvplk.r-1udh08x > div > div > div.css-1dbjc4n.r-kemksi.r-6koalj.r-16y2uox.r-1wbh5a2 > div.css-1dbjc4n.r-16y2uox.r-1wbh5a2.r-1jgb5lz.r-1ye8kvj.r-13qz1uu > div > div > div > div:nth-child(6)');
    console.log("nextBtn", await nextBtn.$eval('div', el => el.innerHTML))
    await nextBtn.click();

    // // Type password
    await page.waitForNetworkIdle();
    const pwdInput = await page.waitForSelector('input[autocomplete="current-password"]');
    await pwdInput.type(process.env.TWITTER_PWD);

    // // Click login
    const loginBtn = await page.waitForXPath('//*[@id="layers"]/div/div/div/div/div/div/div[2]/div[2]/div/div/div[2]/div[2]/div[2]/div/div[1]/div/div/div')
    await loginBtn.click();

    // Get HTML of recent post
    // await page.waitForNetworkIdle();
    // const article = await page.waitForSelector('article');
    // const innerHTML = await article.$eval('div', el => el.innerHTML);
    // await browser.close();

    // Extract post path from HTML
    const path = innerHTML.match(/href="\/(PokeDolar\/status\/[0-9]+)"/)
    console.log("Recent post", path)

    if (path) {
        return path[1];
    }

    throw new Error("path not found on page")
}

(async () => {
    try {
        const recentPostPath = await getRecentPostPathWithLogin()
        console.log("Recent post: ", recentPostPath)

        // get last post path
        // const lastPostPath = await getLastPostPath()
        const lastPostPath = 'lastPostPath'
        console.log("Last post: ", lastPostPath)

        // compare recent post with last
        // if different, send slack message
        // if (recentNotEqualLast(recentPostPath, lastPostPath)) {
        //     const twitterURL = composeTwitterUrl(recentPostPath)
        //     console.log(twitterURL)

        //     await sendSlackMessage(twitterURL)

        //     // save recent post path
        //     saveLastPostPath(recentPostPath)
        // } else {
        //     console.log("Recent post is the same as last post")
        // }
    } catch (error) {
        console.log(error)
    }
}
)();

