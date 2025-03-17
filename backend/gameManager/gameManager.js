class Game {
    constructor() {
        this.players = [];
        this.gameState = "waiting";
    }

    addPlayer(player) {
        this.players.push(player);
    }

    startGame() {
        this.gameState = "started";
    }

    endGame() {
        this.gameState = "ended";
    }
}