const { get } = require('lodash');
const puppeteer = require('puppeteer');
require('dotenv').config()
const { getRecentPostPathWithLogin } = require('./utils.js');

async function getBrowserLocal() {
    return await puppeteer.launch({
        headless: false
    });
}

// Prototype
(async () => {
    try {
        const browser = await getBrowserLocal()
        console.log("Browser launched");

        const recentPostPath = await getRecentPostPathWithLogin(browser)
        console.log("Recent post: ", recentPostPath)

    } catch (error) {
        console.log(error)
    }
}
)();

