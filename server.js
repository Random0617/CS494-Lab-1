const express = require("express");
const http = require("http");
const socketIo = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const PLAYER_LIMIT = 10;
const GAME_START_TIME_LIMIT = 5;
const QUESTION_LOADING_TIME_LIMIT = 5;
const RESULT_TIME_LIMIT = 7;
const WINNER_TIME_LIMIT = 15;

let connectedUsers = 0;
let registeredPlayers = 0;
let player_list = [];
let state = "registration";

io.on("connection", (socket) => {
  socket.has_registered = false;
  socket.username = "";
  socket.join("unregistered");
  if (state != "registration") {
    socket.emit("clear screen");
    socket.emit("not allowed to play");
  }
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
      socket.leave("unregistered");
      socket.join("registered");
      socket.join(socket.username);
      console.log("Username submitted: " + socket.username);
      updatePlayerCountAndListGlobally(io);
      socket.emit("register successful", registeredPlayers);
    } else if (!notExistingUsername(msg)) {
      socket.emit("username already exists", {});
    } else {
      socket.emit("not allowed username", {});
    }
  });

  socket.on("start game", () => {
    state = "waiting before 1st question";
    let game_loading_current_countdown = GAME_START_TIME_LIMIT;
    /*
    countdownInterval = setInterval(() => {
      countdownValue--;
      io.emit('countdown', countdownValue); // Emit countdown value to all clients
      if (countdownValue <= 0) {
        clearInterval(countdownInterval);
      }
    }, 1000);
    */
    io.emit("clear screen");
    for (let i = 0; i < player_list.length; i++) {
      io.to(player_list[i]).emit(
        "display player name bottom left",
        player_list[i]
      );
    }
    io.to("unregistered").emit("not allowed to play");
    io.to("registered").emit("allowed to play", game_loading_current_countdown);
    game_loading_countdown_interval = setInterval(() => {
      game_loading_current_countdown--;
      io.to("registered").emit(
        "allowed to play",
        game_loading_current_countdown
      );
      if (game_loading_current_countdown <= 0) {
        clearInterval(game_loading_countdown_interval);
        state = "waiting for next question";
        question_loading(io);
      }
    }, 1000);
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
  io.to("registered").emit("start game button trigger", {
    server_registeredPlayers: registeredPlayers,
  });
}

function question_loading(io) {
  // Main game: question loop
  let question_loading_current_countdown = QUESTION_LOADING_TIME_LIMIT;
  io.to("registered").emit(
    "question loading",
    question_loading_current_countdown
  );
  question_loading_countdown_interval = setInterval(() => {
    question_loading_current_countdown--;
    io.to("registered").emit(
      "question loading",
      question_loading_current_countdown
    );
    if (question_loading_current_countdown <= 0) {
      clearInterval(question_loading_countdown_interval);
      state = "question";
      question_answering(io);
    }
  }, 1000);
}

function question_answering(io) {
  let expr = new Expression(0, 0, "+");
  expr.random();
  let question_answering_countdown = expr.time_limit();
  io.to("registered").emit("question answering", {
    question_answering_countdown: question_answering_countdown,
    expression: expr.string(),
  });
  question_answering_countdown_interval = setInterval(() => {
    question_answering_countdown--;
    io.to("registered").emit("question answering", {
      question_answering_countdown: question_answering_countdown,
      expression: expr.string(),
    });
    if (question_answering_countdown <= 0) {
      clearInterval(question_answering_countdown_interval);
      state = "question result";
    }
  }, 1000);
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
  string() {
    let str = "";
    if (this.num1 >= 0) {
      str += this.num1;
    } else {
      str = str + "(" + this.num1 + ")";
    }
    str = str + " " + this.operator + " ";
    if (this.num2 >= 0) {
      str += this.num2;
    } else {
      str = str + "(" + this.num2 + ")";
    }
    return str;
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
