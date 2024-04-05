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
  socket.has_registered = false;
  socket.username = "";

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
    if (checkUsername(msg)) {
      player_list.push(msg);
      socket.username = msg;
      socket.has_registered = true;
      console.log("Username submitted: " + socket.username);
      io.emit("update player list", {
        list: player_list,
        length: player_list.length,
      });
      socket.emit("disable username input", {});
    }
  });
});

function checkUsername(username) {
  if (player_list.includes(username)) {
    return false;
  }
  var regex = /^[a-zA-Z0-9_]{1,10}$/;
  return regex.test(username);
}

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});

server.listen(3000, () => {
  console.log("Server is running on port 3000");
});
