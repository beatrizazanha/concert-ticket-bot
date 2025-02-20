const {
    getBrowser,
    getRecentPostPathWithLogin,
    getLastPostPath,
    saveLastPostPath,
    recentNotEqualLast,
    composeTwitterUrl,
    sendSlackMessage } = require('./utils.js');

module.exports = {
    handler: async () => {
        try {
            const browser = await getBrowser()
            console.log("Browser launched");

            const recentPostPath = await getRecentPostPathWithLogin(browser)
            console.log("Recent post: ", recentPostPath)

            // get last post path
            const lastPostPath = await getLastPostPath()
            console.log("Last post: ", lastPostPath)

            // compare recent post with last
            // if different, send slack message
            if (recentNotEqualLast(recentPostPath, lastPostPath)) {
                const twitterURL = composeTwitterUrl(recentPostPath)
                console.log(twitterURL)

                // TODO: implement Telegram integration
                // await sendSlackMessage(twitterURL)

                // save recent post path
                await saveLastPostPath(recentPostPath)
            } else {
                console.log("Recent post is the same as last post")
            }
        } catch (error) {
            console.log(error)
            throw error
        }
    },
};