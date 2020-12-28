const Discord = require('discord.js');
const schedule = require('node-schedule');
const Game = require('./game');
const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const dayjs = require('dayjs');
puppeteer.use(StealthPlugin());

// const MONITOR_JOB = '*/1 * * * *'; // every 5 minutes

/**
 * Bot Class
 * @param {Discord.Client} discord 
 */
function Bot (discord) {
    this.discord = discord;
    this.scheduler = schedule;
    this.browser = null;
}

Bot.prototype.start = function () {
    this.sendMessage(`<Bot.start>`);
    this._run();
    // this.scheduler.scheduleJob(MONITOR_JOB, this._run.bind(this));
    this.sendMessage(`Job scheduled`);
    this.sendMessage(`</Bot.start>`);
}

Bot.prototype._run = async function () {
    this.sendMessage(`<Bot._run>`);
    try {
        if (!this.browser) {
            this.sendMessage(`No browser instance, creating a new one.`);
            this.browser = await puppeteer.launch({
                headless: false,
                ignoreHTTPSErrors: true,
                defaultViewport: {
                    width: 1200,
                    height: 800
                }
            });
            // this.browser = await b.createIncognitoBrowserContext();
        }

        // add methods for runners
        // ex: have a method to get current games for the day
        // take those current games and use previous data to predict
        const games = await this._getGames();
        for (let i = 0; i < games.length; i++) {
            const game = games[i];
            this.sendMessage(`Predicting ${game.home.name} vs. ${game.away.name}!`);
            const prediction = await this._predict(game);
            // TODO
            // send prediction to discord
        }

    } catch (runErr) {
        this.sendMessage(`Bot error'd, below is the error\n==========================\n`);
        this.sendMessage(runErr.toString());
    } finally {
        this.sendMessage(`</Bot._run>`);
        this.browser.close();
    }   
}
/**
 * @returns {Promise<Game[]>}
 */
Bot.prototype._getGames = async function () {
    this.sendMessage(`<Bot._getGames>`);
    this.sendMessage('Implement method!');
    const nbaGames = await this._getNbaGames();
    const collegeGames = await this._getCollegeGames();
    // create scraper method to get college games
    this.sendMessage(`</Bot._getGames>`);
    return [...nbaGames, ...collegeGames];
}
/**
 * @returns {Promise<Game[]>}
 */
Bot.prototype._getCollegeGames = async function () {
    this.sendMessage(`<Bot._getCollegeGames>`);
    
    this.sendMessage(`</Bot._getCollegeGames>`);
    return [];
}
/**
 * @returns {Promise<Game[]>}
 */
Bot.prototype._getNbaGames = async function () {
    this.sendMessage(`<Bot._getNbaGames>`);
    const url = `https://www.basketball-reference.com/`;
    const page = await this._createPage(url);
    await page.waitForTimeout(5000);
    
    const homePageLinks = await page.$$(`#teams > p > small > a`);
    let scheduleLink = null;
    for (let i = 0; i < homePageLinks.length; i++) {
        const linkHandle = homePageLinks[i];
        const text = await getProperty(linkHandle, 'textContent');
        if (text.toLowerCase() == 'schedule') {
            scheduleLink = linkHandle;
            break;
        }
    }
    if (!scheduleLink) {
        return [];
    }
    await scheduleLink.click();

    await page.waitForTimeout(5000);

    let today = dayjs().format('DD/MM/YYYY');
    let rowHandles = await page.$$(`table.stats_table tr:not(.thead)`);
    let validHandles = [];
    for (let i = 0; i < rowHandles.length; i++) {
        const handle = rowHandles[i];
        const dateHandle = await handle.$(`th[data-stat="date_game"] > a`);
        if (dateHandle) {
            const dateText = await getProperty(dateHandle, 'textContent');
            const date = dayjs(dateText).format('DD/MM/YYYY');
            if (date == today) {
                validHandles.push(handle);
            }
        }
    }

    const games = [];
    for (let i = 0; i < validHandles.length; i++) {
        const handle = validHandles[i];
        const timeHandle = await handle.$(`td[data-stat="game_start_time"]`);
        const awayHandle = await handle.$(`td[data-stat="visitor_team_name"] > a`);
        const homeHandle = await handle.$(`td[data-stat="home_team_name"] > a`);

        const time = await getProperty(timeHandle, 'textContent');
        const awayName = await getProperty(awayHandle, 'textContent');
        const awayLink = await getProperty(awayHandle, 'href');
        const homeName = await getProperty(homeHandle, 'textContent');
        const homeLink = await getProperty(homeHandle, 'href');
        const away = {
            name: awayName,
            link: awayLink
        };
        const home = {
            name: homeName,
            link: homeLink
        };
        games.push({
            time,
            home,
            away
        });
    }
    this.sendMessage(`Found ${games.length} nba games!`);
    this.sendMessage(`</Bot._getNbaGames>`);
    return games.map(g => new Game(g, true));
}
/**
 * Predicts the winner of a game
 * @param {Game} game 
 */
Bot.prototype._predict = async function (game) {
    // TODO
    // look up previous match ups between each team
    // player stats for each team going back a certain time

    // TODO
    // create prediction object and return that

    if (game.isNBA) {
        // handle prediction for nba
    } else {
        // handle prediction for college
    }
}
Bot.prototype._handleLoadErr = function (url) {
    this.sendMessage(`Experienced an error loading url: ${url}\nContinuing anyways, watch out for other errors.`);
}
/**
 * 
 * @param {string} url
 * @returns {puppeteer.Page}
 */
Bot.prototype._createPage = async function (url) {
    this.sendMessage(`<Bot._createPage>`);
    let page = await this._getPage(url);
    if (!page) {
        this.sendMessage(`Page not found at url: ${url}\nCreating new page.`);
        page = await this.browser.newPage();
    }
    await page.goto(url, { waitUntil: 'networkidle0' }).catch(() => this._handleLoadErr(url));
    this.sendMessage(`</Bot._createPage>`);
    return page;
}
Bot.prototype._getPage = async function (url) {
    const pages = await this.browser.pages();
    return pages.find(page => {
        const u = page.url();
        return u.indexOf(url) > -1;
    });
}
/**
 * Sends a message to discord channel
 * @param {string} message 
 * @param {boolean} doSend
 * @param {string} channelName 
 */
Bot.prototype.sendMessage = async function (message, doSend, channelName = 'basketball-predictions') {
    if (!this.discord) {
        throw new Error('Does not look like the client has been initialized.');
    }
    console.log(message);
    if (doSend) {
        try {
            const channelCache = this.discord.channels.cache;
            const channel = channelCache.find(channel => channel.name == channelName && channel.type == 'text');
            if (channel) {
                await channel.send(message);
            }
        } catch (err) {
            throw err;
        }
    }
}
Bot.prototype.__clear = async function () {
    if (!this.discord) {
        throw new Error('Does not look like the client has been initialized.');
    }
    try {
        const channelCache = this.discord.channels.cache;
        const channel = channelCache.find(channel => channel.name == 'trading' && channel.type == 'text');
        if (channel) {
            const messages = await channel.messages.fetch();
            const deleteMessagesCollection = await channel.bulkDelete(messages, true);
            console.log(`Deleted ${deleteMessagesCollection.array().length.toString()} messages`);
        }
    } catch (err) {
        throw err;
    }
}

async function getProperty(element, property) {
    return await (await element.getProperty(property)).jsonValue();
}

/**
 * Initialize discord client
 * @returns {Promise<Bot>}
 */
function init() {
    return new Promise(async (resolve, reject) => {
        const client = new Discord.Client();
        const b = new Bot(client);

        try {
            // login to discord
            await client.login(process.env.DISCORD_BOT_TOKEN);
            resolve(b);
        } catch (err) {
            reject(err);
        }
    });
}

module.exports = init;