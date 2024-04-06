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
  updatePlayerCountAndListGlobally(io);

  socket.on("disconnect", () => {
    connectedUsers--;
    if (socket.username != "") {
      const indexRemove = player_list.indexOf(socket.username);
      player_list.splice(indexRemove, 1);
      registeredPlayers = player_list.length;
    }
    updatePlayerCountAndListGlobally(io);
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
      updatePlayerCountAndListGlobally(io);
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

function updatePlayerCountAndListGlobally(io) {
  io.emit("userCount", {
    connectedUsers: connectedUsers,
    registeredPlayers: registeredPlayers,
  });
  io.emit("update player list", {
    list: player_list,
    length: player_list.length,
  });
}

function getRandomInteger(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  let randomNum;

  do {
    randomNum = Math.floor(Math.random() * (max - min + 1)) + min;
  } while (randomNum === 0);

  return randomNum;
}
function truncate(number) {
  if (number >= 0) {
    return Math.floor(number);
  } else {
    return Math.ceil(number);
  }
}

class Expression {
  constructor(num1, num2, operator) {
    this.num1 = num1;
    this.num2 = num2;
    this.operator = operator;
  }

  result() {
    switch (this.operator) {
      case "+":
        return this.num1 + this.num2;
      case "-":
        return this.num1 - this.num2;
      case "*":
        return this.num1 * this.num2;
      case "/":
        return truncate(this.num1 / this.num2);
      case "%":
        return this.num1 % this.num2;
      default:
        return "Invalid operator";
    }
  }

  time_limit() {
    switch (this.operator) {
      case "+":
      case "-":
        return 15;
      case "*":
      case "/":
      case "%":
        return 60;
      default:
        return 0;
    }
  }

  random() {
    const operators = ["+", "-", "*", "/", "%"];
    const randomOperator =
      operators[Math.floor(Math.random() * operators.length)];
    let randomNum1 = 0;
    let randomNum2 = 0;
    if (["+", "-"].includes(randomOperator)) {
      randomNum1 = getRandomInteger(-10000, 10000);
      randomNum2 = getRandomInteger(-10000, 10000);
    } else if (randomOperator == "*") {
      randomNum1 = getRandomInteger(-1000, 1000);
      randomNum2 = getRandomInteger(-1000, 1000);
    } else {
      randomNum1 = getRandomInteger(-1000000, 1000000);
      randomNum2 = getRandomInteger(-1000, 1000);
    }

    this.num1 = randomNum1;
    this.num2 = randomNum2;
    this.operator = randomOperator;
  }
}
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});

server.listen(3000, () => {
  console.log("Server is running on port 3000");
});
