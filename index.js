require("dotenv").config();

const initBot = require('./lib/bot');

initBot()
    .then(bot => {
        console.log('Bot Initialized');
        bot.start();
    })
    .catch(err => {
        console.log(`Bot initialization error`);
        console.log(err);
        process.exit();
    });