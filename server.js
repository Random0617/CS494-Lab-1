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
const WINNING_SCORE = 25;

class Player {
  constructor(username) {
    this.username = username;
    // Overall data
    this.displaying_index_overall = 1;
    this.consecutive_wrongs = 0;
    this.eliminated = false;
    this.total_score = 0;
    // Last question data
    this.displaying_index_question = 1;
    this.last_question_answer = 0;
    this.last_question_time_taken = 0;
    this.last_question_score = 0;
  }
  check_eliminate() {
    if (this.consecutive_wrongs >= 3) {
      this.total_score = 0;
      this.eliminated = true;
      this.last_question_score = 0;
    }
  }
}
class All_Players_Data {
  constructor() {
    this.players = [];
  }
  index_of(player_name) {
    let searching_index = 0;
    while (this.players[searching_index].username != player_name) {
      searching_index++;
    }
    return searching_index;
  }
  total_number_of_players() {
    return this.players.length;
  }
  highest_score() {
    let result = 0;
    for (let i = 0; i < this.players.length; i++) {
      if (this.players[i].total_score > result) {
        result = this.players[i].total_score;
      }
    }
    return result;
  }
  number_of_ongoing_players() {
    let count = 0;
    for (let i = 0; i < this.players.length; i++) {
      if (!this.players[i].eliminated) {
        count++;
      }
    }
    return count;
  }
  sort_by_overall() {
    this.players.sort(compare_overall_leaderboard);
    this.players[0].displaying_index_overall = 1;
    for (let i = 1; i < this.players.length; i++) {
      if (this.players[i].total_score == this.players[i - 1].total_score) {
        this.players[i].displaying_index_overall =
          this.players[i - 1].displaying_index_overall;
      } else {
        this.players[i].displaying_index_overall = i + 1;
      }
    }
  }
  overall_leaderboard_text() {
    let placeholder_text = "Rank - Username - Consecutive wrongs - Score";
    for (let i = 0; i < this.players.length; i++) {
      placeholder_text =
        placeholder_text +
        "\n#" +
        this.players[i].displaying_index_overall +
        " - " +
        this.players[i].username +
        " - " +
        this.players[i].consecutive_wrongs +
        " - " +
        this.players[i].total_score;
    }
    return placeholder_text;
  }
  mini_leaderboard_text() {
    let placeholder_text = "";
    for (let i = 0; i < this.players.length; i++) {
      placeholder_text =
        placeholder_text +
        "#" +
        this.players[i].displaying_index_overall +
        " - " +
        this.players[i].username +
        " - " +
        this.players[i].total_score;
      if (this.players[i].consecutive_wrongs > 0) {
        placeholder_text += " - ";
        for (let k = 0; k < this.players[i].consecutive_wrongs; k++) {
          placeholder_text += "X";
        }
      }
      placeholder_text += "\n";
    }
    return placeholder_text;
  }
  sort_by_question() {
    this.players.sort(compare_question_leaderboard);
    this.players[0].displaying_index_question = 1;
    for (let i = 1; i < this.players.length; i++) {
      if (
        this.players[i].last_question_time_taken ==
          this.players[i - 1].last_question_time_taken &&
        this.players[i].last_question_score ==
          this.players[i - 1].last_question_score
      ) {
        this.players[i].displaying_index_question =
          this.players[i - 1].displaying_index_question;
      } else {
        this.players[i].displaying_index_question = i + 1;
      }
    }
  }
  question_leaderboard_text() {
    let placeholder_question_leaderboard =
      "Rank - Username - Time taken - Points earned";
    for (let i = 0; i < this.number_of_ongoing_players(); i++) {
      placeholder_question_leaderboard =
        placeholder_question_leaderboard +
        "\n#" +
        this.players[i].displaying_index_question +
        " - " +
        this.players[i].username +
        " - " +
        this.players[i].last_question_time_taken +
        "s - " +
        this.players[i].last_question_score;
    }
    return placeholder_question_leaderboard;
  }
  reset_question_stats() {
    for (let i = 0; i < this.players.length; i++) {
      this.players[i].last_question_answer = 0;
      this.players[i].last_question_score = 0;
      this.players[i].last_question_time_taken = 0;
    }
  }
}

let connectedUsers = 0;
let registeredPlayers = 0;
let player_list = [];
let all_players_data = new All_Players_Data();
let question_answering_time_elapsed = 0;

let state = "registration";

// Player performance data structure

function compare_overall_leaderboard(a, b) {
  // Descending order
  if (a.total_score != b.total_score) {
    return b.total_score - a.total_score;
  }
  // Ascending order
  return a.consecutive_wrongs - b.consecutive_wrongs;
}
function compare_question_leaderboard(a, b) {
  if (a.eliminated != b.eliminated) {
    return a.eliminated - b.eliminated;
  }
  if (a.last_question_score != b.last_question_score) {
    return b.last_question_score - a.last_question_score;
  }
  return a.last_question_time_taken - b.last_question_time_taken;
}
/* // Copy this to a different file and uncomment this block to test it
let player1 = new Player("player1");
player1.total_score = 12;
player1.consecutive_wrongs = 2;
player1.check_eliminate();
player1.last_question_time_taken = 2.1;
player1.last_question_score = -1;
let player2 = new Player("player2");
player2.total_score = 10;
player2.consecutive_wrongs = 1;
player2.check_eliminate();
player2.last_question_time_taken = 3;
player2.last_question_score = 3;
let player3 = new Player("player3");
player3.total_score = 10;
player3.consecutive_wrongs = 3;
player3.check_eliminate();
let player4 = new Player("player4");
player4.total_score = 10;
player4.consecutive_wrongs = 0;
player4.last_question_time_taken = 4.5;
player4.last_question_score = 1;
player4.check_eliminate();

let all_players_data = new All_Players_Data();
all_players_data.players.push(player1);
all_players_data.players.push(player2);
all_players_data.players.push(player3);
all_players_data.players.push(player4);
console.log(all_players_data.total_number_of_players());
console.log(all_players_data.number_of_ongoing_players());

all_players_data.sort_by_overall();
console.log(all_players_data.overall_leaderboard_text());
console.log(all_players_data.mini_leaderboard_text());

all_players_data.sort_by_question();
console.log(all_players_data.question_leaderboard_text());
*/

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
      let new_player = new Player(player_list[i]);
      all_players_data.players.push(new_player);
    }
    //console.log(all_players_data.mini_leaderboard_text());
    io.to("unregistered").emit("not allowed to play");
    io.to("registered").emit("set leaderboard text", player_list);
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
        question_loading(io, socket);
      }
    }, 1000);
  });

  socket.on("submit answer", (player_name, answer) => {
    if (state == "question") {
      let player_index = all_players_data.index_of(player_name);
      if (!all_players_data.players[player_index].eliminated) {
        let time_elapsed = question_answering_time_elapsed.toFixed(1);
        console.log("Submitted name: ", player_name);
        console.log("Submitted index: ", player_index);
        console.log("Time taken: ", time_elapsed);
        all_players_data.players[player_index].last_question_answer = answer;
        all_players_data.players[player_index].last_question_time_taken =
          time_elapsed;
        io.to(player_name).emit("make answer read only");
      }
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
  io.to("registered").emit("start game button trigger", {
    server_registeredPlayers: registeredPlayers,
  });
}

function question_loading(io, socket) {
  // Main game: question loop
  let question_loading_current_countdown = QUESTION_LOADING_TIME_LIMIT;
  io.to("registered").emit(
    "question loading",
    question_loading_current_countdown
  );
  all_players_data.reset_question_stats();
  question_loading_countdown_interval = setInterval(() => {
    question_loading_current_countdown--;
    io.to("registered").emit(
      "question loading",
      question_loading_current_countdown
    );
    if (question_loading_current_countdown <= 0) {
      clearInterval(question_loading_countdown_interval);
      state = "question";
      question_answering(io, socket);
    }
  }, 1000);
}

function question_answering(io, socket) {
  let expr = new Expression(0, 0, "+");
  expr.random();
  question_answering_time_elapsed = 0;
  let question_answering_countdown = expr.time_limit();
  console.log(expr.result()); // Testing
  //io.to("registered").emit("make answer editable");
  for (let i = 0; i < all_players_data.players.length; i++) {
    if (all_players_data.players[i].eliminated) {
      io.to(all_players_data.players[i].username).emit(
        "disable answer due to being eliminated"
      );
    } else {
      io.to(all_players_data.players[i].username).emit(
        "enable answer for players still standing"
      );
    }
  }
  io.to("registered").emit("question answering", {
    question_answering_countdown: question_answering_countdown,
    expression: expr.string(),
  });
  question_answering_time_countup = setInterval(() => {
    question_answering_time_elapsed += 0.1;
    //console.log(question_answering_time_elapsed);
  }, 100);
  question_answering_countdown_interval = setInterval(() => {
    question_answering_countdown--;
    io.to("registered").emit("question answering", {
      question_answering_countdown: question_answering_countdown,
      expression: expr.string(),
    });
    if (question_answering_countdown <= 0) {
      clearInterval(question_answering_countdown_interval);
      clearInterval(question_answering_time_countup);
      state = "question result";
      question_result(io, expr.result());
    }
  }, 1000);
}

function question_result(io, result) {
  console.log("Reached question result phase");
  question_answering_time_elapsed = 0;
  let wrong_answerers = 0;
  for (let i = 0; i < all_players_data.players.length; i++) {
    if (!all_players_data.players[i].eliminated) {
      if (all_players_data.players[i].last_question_answer == result) {
        all_players_data.players[i].last_question_score = 1;
      } else {
        wrong_answerers++;
        all_players_data.players[i].last_question_score = -1;
      }
    }
  }
  all_players_data.sort_by_question();
  if (all_players_data.players[0].last_question_answer == result) {
    all_players_data.players[0].last_question_score = 1 + wrong_answerers;
  }
  for (let i = 0; i < all_players_data.players.length; i++) {
    if (!all_players_data.players[i].eliminated) {
      all_players_data.players[i].total_score = Math.max(
        all_players_data.players[i].total_score +
          all_players_data.players[i].last_question_score,
        0
      );
      if (all_players_data.players[i].last_question_score > 0) {
        all_players_data.players[i].consecutive_wrongs = 0;
      } else {
        all_players_data.players[i].consecutive_wrongs++;
      }
    }
  }
  let question_result_countdown = RESULT_TIME_LIMIT;
  io.to("registered").emit("question result", {
    question_result_countdown: question_result_countdown,
    question_leaderboard: all_players_data.question_leaderboard_text(),
    correct_answer: result,
  });
  question_result_countdown_interval = setInterval(() => {
    question_result_countdown--;
    io.to("registered").emit("question result", {
      question_result_countdown: question_result_countdown,
      question_leaderboard: all_players_data.question_leaderboard_text(),
      correct_answer: result,
    });
    if (question_result_countdown <= 0) {
      clearInterval(question_result_countdown_interval);
      state = "overall result";
      overall_result(io);
    }
  }, 1000);
}

function overall_result(io) {
  let overall_result_countdown = RESULT_TIME_LIMIT;
  all_players_data.sort_by_overall();
  for (let i = 0; i < all_players_data.players.length; i++) {
    all_players_data.players[i].check_eliminate();
  }
  io.to("registered").emit("overall result", {
    overall_result_countdown: overall_result_countdown,
    overall_leaderboard: all_players_data.overall_leaderboard_text(),
    mini_leaderboard: all_players_data.mini_leaderboard_text(),
  });
  overall_result_countdown_interval = setInterval(() => {
    overall_result_countdown--;
    io.to("registered").emit("overall result", {
      overall_result_countdown: overall_result_countdown,
      overall_leaderboard: all_players_data.overall_leaderboard_text(),
      mini_leaderboard: all_players_data.mini_leaderboard_text(),
    });
    if (overall_result_countdown <= 0) {
      clearInterval(overall_result_countdown_interval);
      if (all_players_data.number_of_ongoing_players() < 2) {
        state = "winner announcement";
        winner_announcement(io, all_players_data.number_of_ongoing_players());
      } else if (all_players_data.highest_score() >= WINNING_SCORE) {
        state = "winner announcement";
        winner_announcement(io, all_players_data.number_of_ongoing_players());
      } else {
        state = "waiting for next question";
        question_loading(io);
      }
    }
  }, 1000);
}

function winner_announcement(io, players_left) {
  if (players_left == 0) {
    io.to("registered").emit("no one wins");
  } else if (players_left == 1) {
    let last_survivor = "";
    let cnt = 0;
    while (all_players_data.players[cnt].eliminated) {
      cnt++;
    }
    last_survivor = all_players_data.players[cnt].username;
    io.to("registered").emit("last player standing", last_survivor);
  } else {
    // If there are at least 2 players remaining, it means the game ends by a player reaching the finish line
    all_players_data.sort_by_overall();
    let number_of_winners = 0;
    for (let i = 0; i < all_players_data.players.length; i++) {
      if (
        all_players_data.players[i].total_score ==
        all_players_data.highest_score()
      ) {
        number_of_winners++;
      }
    }
    let winners_string = "";
    let winners_counted = 0;
    for (let i = 0; i < all_players_data.players.length; i++) {
      if (
        all_players_data.players[i].total_score ==
        all_players_data.highest_score()
      ) {
        winners_counted++;
        winners_string += all_players_data.players[i].username;
        if (winners_counted < number_of_winners) {
          winners_string += ", ";
        }
      }
    }
    io.to("registered").emit("finisher", winners_string);
  }
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
        return 30;
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
    randomNum1 = getRandomInteger(-10000, 10000);
    randomNum2 = getRandomInteger(-10000, 10000);

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
