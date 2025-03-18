const path = require("path")
const cookie = require("cookie")
const url = require("url")

const app = require("express")()
const server = require("http").createServer(app)
const io = require("socket.io")(server,  {cors: {
  origin: "https://example.com",
  methods: ["GET", "POST"]
}})
const gameManager = require("./gameManager/gameManager")

app.set("view engine", "ejs")
app.set('views', path.join(__dirname.replace("backend", ""), 'frontend/pages/'));

app.get("/", (req, res) => {
  res.render("index")
})

app.get("/join", (req, res) => {
  res.render("joinGame")
})

app.get("/host", (req, res) => {
  res.render("hostGame")
})

app.get("/create", (req, res) => {
  const game = gameManager.createGame(req.query.name)
  res.redirect("/game?id=" + game.id + "&name=" + req.query.name)
})

app.get("/game", (req, res) => {
  const game = gameManager.getGameFromId(Number(req.query.id))
  if (game && game.getPlayerFromName(req.query.name)) {
    return res.redirect("/game?id=" + req.query.id + "&name=" + req.query.name + " (1)")
  }
  res.render("game", {playerName: req.query.name})
})

app.get("/get-game/:id", (req, res) => {
  const game = gameManager.getGameFromId(req.params.id)

  if (game) {
    res.json(game)
  } else {
    res.status(404).json({error: "Game not found."})
  }
})

const staticHandler = function(req, res, next) {
    if (req.url.includes("frontend")) {
        res.sendFile(__dirname.replace("backend", "") + req.url);
    } else {
        
    }
}

const handler404 = function(req, res) {
    res.status(404).render("404")
}

app.use(staticHandler)
app.use(handler404)

server.listen(5000, () => {
  console.log("Server is running on port 5000.")
})

console.log(gameManager.createGame().id)

io.on('connection', (socket) => {
  const origUrl = (socket.request.headers.referer)
  const params = new URLSearchParams(new URL(origUrl).search)
  let playerName = params.get("name")
  const gameId = params.get("id")
  
  const requestedGame = gameManager.getGameFromId(Number(gameId))

  if (!requestedGame) {
    return socket.emit("invalid_game_id")
  }

  const player = new gameManager.Player(playerName, socket)
  requestedGame.addPlayer(player)
  
  if (requestedGame.host === playerName) {
    //requestedGame.host = player
  }

  socket.emit("game_joined", requestedGame.id)

  requestedGame.emitToAllPlayers("player_update", requestedGame.getSerializedPlayers())

  socket.on("disconnect", () => {
    requestedGame.removePlayer(player)
    requestedGame.emitToAllPlayers("player_update", requestedGame.getSerializedPlayers())
  })
})