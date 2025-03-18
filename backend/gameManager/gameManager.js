class Game {
    constructor(host) {
        this.players = [];
        this.started = false;
        this.host = host;
        this.id = Math.floor(Math.random() * 10000);
    }

    start() {
        this.started = true;
    }

    addPlayer(player) {
        this.players.push(player);
    }

    removePlayer(player) {
        this.players.splice(this.players.indexOf(player), 1);
    }

    getSerializedPlayers() {
        return this.players.map(player => {
            return {
                name: player.name,
                socketId: player.socketId,
                isHost: player.name === this.host
            }
        });
    }

    getPlayerFromName(name) {
        return this.players.find(player => player.name == name);
    }

    getPlayerFromSocketId(socketId) {
        return this.players.find(player => player.socketId === socketId);
    }

    emitToAllPlayers(event, ...data) {
        this.players.forEach(player => player.socket.emit(event, ...data));
    }
}

class Player {
    constructor(name, socket) {
        this.name = name;
        this.socket = socket;
        this.socketId = socket.id;
    }

    updateSocketId(socketId) {
        this.socketId = socketId;
    }   
}

let games = []

function createGame(host) {
    let game = new Game(host);
    games.push(game);
    return game;
}

function getGameFromId(id) {
    return games.find(game => game.id == id);
}

function getGameFromHost(host) {
    return games.find(game => game.host === host);
}

function getGameFromPlayer(player) {
    return games.find(game => game.players.includes(player));
}

function getGameFromSocketId(socketId) {
    return games.find(game => game.players.find(player => player.socketId === socketId));
}

module.exports = {
    Game,
    Player,
    createGame,
    getGameFromId,
    getGameFromHost,
    getGameFromPlayer,
    getGameFromSocketId
}