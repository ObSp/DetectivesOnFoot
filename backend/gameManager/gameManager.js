class Game {
    constructor(host) {
        this.players = [];
        this.started = false;
        this.host = host;
        this.id = Math.floor(Math.random() * 10000);
        this.playerCache = []
        this.timeLeft = 10*60;
        this.locateTimeNumber = 10;
        this.ogTimeLeft = this.timeLeft
    }

    start() {
        this.started = true;
        for (const plr of this.players) {
            plr.role = "Criminal"
            plr.socket.emit("game_started", plr.role)
        }

        
        this.players.forEach(plr => {
            const func = (long, lat) => {
                console.log("pos received")
                console.log(long, lat)

                const obj = {
                    player: plr.name,
                    role: plr.role,
                    long: long,
                    lat: lat
                }

                if (plr.role == "Detective") {
                    this.foreachDetective(plr => {
                        plr.socket.emit
                    })
                }
                this.emitToAllPlayers("update_player_position", )
            }
            plr.socket.on("position_sent", func)
            plr.onSocketUpdate = () => {
                console.log("socket update")
                plr.socket.on("position_sent", func)
            }
        })

        
        setTimeout(()=> {
            this.gameLoop()
            
        }, 10000)
    }

    gameLoop() {
        this.timeLeft -= 1
        if (this.timeLeft <= 0) {
            this.timeLeft = this.ogTimeLeft
            
            this.foreachCriminal(plr => {
                plr.socket.emit("send_position")
            })
        }

        if (this.timeLeft % 10 == 0) {
            this.foreachDetective(plr => {
                plr.socket.emit("send_position")
            })
        }

        this.emitToAllPlayers("time_update", this.timeLeft)

        setTimeout(()=>{
            this.gameLoop()
        }, 1000)
    }

    addPlayer(player) {
        this.players.push(player);

        if (this.playerCache.indexOf(player) == -1) {
            this.playerCache.push(player)
        }
    }

    removePlayer(player) {
        this.players.splice(this.players.indexOf(player), 1);
    }

    getSerializedPlayers() {
        return this.players.map(player => {
            return player.getSerialized()
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

    foreachCriminal(cb) {
        for (const plr of this.players) {
            if (plr.role == "Criminal") {
                cb(plr)
            }
        }
    }

    foreachDetective(cb) {
        for (const plr of this.players) {
            if (plr.role == "Detective") {
                cb(plr)
            }
        }
    } 

    getSerializedGame() {
        return {
            started: this.started,
            players: this.getSerializedPlayers(),
            id: this.id,
        }
    }

    getPlayerFromCacheByName(name) {
        return this.playerCache.find(player => player.name == name);
    }
}

class Player {
    constructor(name, socket, game) {
        this.name = name;
        this.socket = socket;
        this.socketId = socket.id;
        this.role = null;
        this.game = game;
        this.onSocketUpdate = null;
    }

    updateSocket(socket) {
        this.socket = socket;
        this.socketId = socket.id;
        if (this.onSocketUpdate) {
            this.onSocketUpdate()
        }
    }

    getSerialized() {
        return {
            name: this.name,
            socketId: this.socketId,
            isHost: this.name == this.game.host,
            role: this.role
        }
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