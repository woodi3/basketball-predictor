const dayjs = require('dayjs');
/**
 * TODO 
 * Create a class (function notation) for a Game
 * Game should have
 * - Teams involved
 * - Date of game
 * - method to get address of the game
 */

function Game ([home, away], date) {
   this.home = home;
   this.away = away;
   this.date = dayjs(date);
}

Game.prototype.getAddress = function () {
   return `TODO implement <Game.getAddress> method`;
}

module.exports = Game;