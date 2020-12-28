const Discord = require('discord.js');
const schedule = require('node-schedule');
const Game = require('./game');
const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());

const MONITOR_JOB = '*/1 * * * *'; // every 5 minutes

/**
 * Bot Class
 * @param {Discord.Client} discord 
 */
function Bot (discord) {
    this.discord = discord;
    this.scheduler = schedule;
    this.browser = null;
    this.pages = [];
}

Bot.prototype.start = function () {
    this.sendMessage(`<Bot.start>`);
    this.scheduler.scheduleJob(MONITOR_JOB, this._run.bind(this));
    this.sendMessage(`Job scheduled`);
    this.sendMessage(`</Bot.start>`);
}

Bot.prototype._run = async function () {
    this.sendMessage(`<Bot._run>`);
    try {
        if (!this.browser) {
            this.sendMessage(`No browser instance, creating a new one.`);
            this.browser = await puppeteer.launch({
                product: 'chrome',
                headless: true,
                ignoreHTTPSErrors: true
            });
        }
        this.pages = await this.browser.pages();

        this.sendMessage(`Current page count: ${this.pages.length}`);

        // add methods for runners
        // ex: have a method to get current games for the day
        // take those current games and use previous data to predict
        const games = await this._getGames();
        for (let i = 0; i < games.length; i++) {
            const game = games[i];
            this.sendMessage(`Predicting ${game.home} vs. ${game.away}!`);
            const prediction = await this._predict(game);
            // TODO
            // send prediction to discord
        }

    } catch (runErr) {
        this.sendMessage(`Bot error'd, below is the error\n==========================\n`);
        this.sendMessage(runErr.toString());
    } finally {
        this.sendMessage(`</Bot._run>`);
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
    this.sendMessage('Implement method!');
    this.sendMessage(`</Bot._getCollegeGames>`);
    return [];
}
/**
 * @returns {Promise<Game[]>}
 */
Bot.prototype._getNbaGames = async function () {
    this.sendMessage(`<Bot._getNbaGames>`);
    this.sendMessage('Implement method!');
    this.sendMessage(`</Bot._getNbaGames>`);
    return [];
}
/**
 * Predicts the winner of a game
 * @param {Game} game 
 */
Bot.prototype._predict = async function (game) {
    this.sendMessage(`<Bot._predict>`);
    this.sendMessage('Implement method!');
    this.sendMessage(`</Bot._predict>`);
    // TODO
    // create prediction object and return that
}
Bot.prototype._handleLoadErr = function (url) {
    this.sendMessage(`Experienced an error loading url: ${url}\nContinuing anyways, watch out for other errors.`);
}
Bot.prototype._createPage = async function (url) {
    this.sendMessage(`<Bot._createPage>`);
    let page = this._getPage(url);
    if (!page) {
        this.sendMessage(`Page not found at url: ${url}\nCreating new page.`);
        page = await this.browser.newPage();
    }
    await page.goto(url).catch(() => this._handleLoadErr(url));
    this.sendMessage(`</Bot._createPage>`);
    return page;
}
Bot.prototype._getPage = function (url) {
    return this.pages.find(page => {
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