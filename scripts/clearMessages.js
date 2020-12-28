require("dotenv").config();

const initBot = require('../lib/bot');

initBot()
    .then(bot => {
        console.log('Bot Initialized');
        bot.__clear()
            .then(() => {
                console.log(`Finished!`);
                process.exit();
            })
            .catch((err) => {
                console.log(`Error'd deleting messages!`);
                console.log(err);
                process.exit();
            });
    })
    .catch(err => {
        console.log(`Bot initialization error`);
        console.log(err);
        process.exit();
    });