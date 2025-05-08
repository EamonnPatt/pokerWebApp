import { Game } from 'holdem-poker';
//initialize with 2 players, each having 100 unit money, and initial bet is 10 unit
var game = new Game([100, 100], 10);
//a demo gameplay is shown bellow
console.log('round 1 - no cards dealt (ante up)');
console.log('Players', game.getState().players.map(function (m) {
    return m.hand;
}));
console.log('Table', game.getState().communityCards);
game.startRound();
game.bet(0); //for player 1
game.raise(1, 20); //for player 2
game.call(0);
game.endRound();
console.log('round 2 - 3 cards dealt (flop)');
console.log('Table', game.getState().communityCards);
game.startRound();
game.check(0); //for player 1
game.check(1); //for player 2
game.endRound();
console.log('round 3 - 4 cards dealt(turn)');
console.log('Table', game.getState().communityCards);
game.startRound();
game.raise(0, 50); //for player 1
game.call(1); //for player 2
game.endRound();
console.log('round 4 - 5 cards dealt (river)');
console.log('Table', game.getState().communityCards);
game.startRound();
game.call(0); //for player 1
game.call(1); //for player 2
game.endRound();
console.log('end game');
var result = game.checkResult();
if (result.type == 'win') {
    console.log('Player' + (result.index ?? +1) + ' won with ' + result.name);
}
else {
    console.log('Draw');
}
