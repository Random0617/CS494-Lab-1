const express = require("express");
const http = require("http");
const socketIo = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const PLAYER_LIMIT = 10;

let connectedUsers = 0;
let registeredPlayers = 0;
let player_list = [];

io.on("connection", (socket) => {
  socket.has_registered = false;
  socket.username = "";

  connectedUsers++;
  io.emit("userCount", {
    connectedUsers: connectedUsers,
    registeredPlayers: registeredPlayers,
  });
  io.emit("update player list", {
    list: player_list,
    length: player_list.length,
  });

  socket.on("disconnect", () => {
    connectedUsers--;
    if (socket.username != "") {
      const indexRemove = player_list.indexOf(socket.username);
      player_list.splice(indexRemove, 1);
      registeredPlayers = player_list.length;
      io.emit("update player list", {
        list: player_list,
        length: player_list.length,
      });
    }
    io.emit("userCount", {
      connectedUsers: connectedUsers,
      registeredPlayers: registeredPlayers,
    });
  });

  socket.on("check username", (msg) => {
    if (registeredPlayers >= PLAYER_LIMIT) {
      socket.emit("maximum players", PLAYER_LIMIT);
    } else if (allowedUsername(msg) && notExistingUsername(msg)) {
      player_list.push(msg);
      socket.username = msg;
      registeredPlayers = player_list.length;
      socket.has_registered = true;
      console.log("Username submitted: " + socket.username);
      io.emit("update player list", {
        list: player_list,
        length: player_list.length,
      });
      socket.emit("register successful", registeredPlayers);
    } else if (!notExistingUsername(msg)) {
      socket.emit("username already exists", {});
    } else {
      socket.emit("not allowed username", {});
    }
  });
});

function allowedUsername(username) {
  var regex = /^[a-zA-Z0-9_]{1,10}$/;
  return regex.test(username);
}

function notExistingUsername(username) {
  if (player_list.includes(username)) {
    return false;
  } else {
    return true;
  }
}

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});

server.listen(3000, () => {
  console.log("Server is running on port 3000");
});
