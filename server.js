const express = require("express");
const http = require("http");
const socketIo = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

let connectedUsers = 0;
let registeredPlayers = 0;
let player_list = [];

io.on("connection", (socket) => {
  connectedUsers++;
  io.emit("userCount", connectedUsers);
  io.emit("update player list", {
    list: player_list,
    length: player_list.length,
  });

  socket.on("disconnect", () => {
    connectedUsers--;
    io.emit("userCount", connectedUsers);
  });

  socket.on("check username", (msg) => {
    player_list.push(msg);
    console.log("Username submitted: " + msg);
    io.emit("update player list", {
      list: player_list,
      length: player_list.length,
    });
  });
});

/*
function checkUsername() {
    var username = document.getElementById("usernameInput").value;
    var regex = /^[a-zA-Z0-9_]{1,10}$/;
    if (regex.test(username)) {
        document.getElementById("resultMessage").innerHTML = "Registration completed";
    } else {
        document.getElementById("resultMessage").innerHTML = "Choose another username";
    }
}
*/
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});

server.listen(3000, () => {
  console.log("Server is running on port 3000");
});
