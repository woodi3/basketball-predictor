const dayjs = require('dayjs');
const Team = require('./team');

function Game ({home, away, time}, isNBA) {
   this.home = new Team(home);
   this.away = new Team(away);
   this.date = dayjs(`${dayjs().format('MM-DD-YYYY')} ${time}`);
   this.isNBA = isNBA;
}

Game.prototype.getAddress = function () {
   return `TODO implement <Game.getAddress> method`;
}
Game.prototype.getPreviousMatchups = async function (page) {

}

module.exports = Game;