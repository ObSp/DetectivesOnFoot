const path = require("path")

const app = require("express")()
const server = require("http").createServer(app)
const io = require("socket.io")(server, { cors: { origin: "*" } })
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

app.get("/join/:id", (req, res) => {
  res.send("Joining game with id: " + req.params.id)
})

app.get("/ingame/:id", (req, res) => {
  res.render("inGame")
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

app.listen(5000, () => {
  console.log("Server is running on port 5000.")
})

io.on('connection', (socket) => {
  console.log('a user connected');
})