# How to run the game

- Clone this repository with the "Open with GitHub Desktop" or any other clone option suitable for you.
- Open the project folder. I use Visual Studio Code IDE with [Code Runner](https://youtu.be/n0hBK3_QT9A) installed to make things easier.
- Install [Node.js](https://nodejs.org/en). To check if you have installed Node.js successfully, go to Command Prompt and type `node`. This should be shown:
  
```
Welcome to Node.js v20.12.0.
Type ".help" for more information.
```

- The folder `node_modules` and the files `packages.json` and `packages-lock.json` already has all the libraries you need. However, if for some reason it does not run correctly on your computer (maybe because it's outdated), do the following (no need to do these if it runs normally):
  - Delete the folder `node_modules` and the files `packages.json` and `packages-lock.json`.
  - Open Command Prompt in the root directory (must be the correct location, this contains the folder `public` and the file `server.js`).
  - In the Command Prompt, install Express.js and Socket.IO using the following command: `npm install express socket.io`. Express.js is used to create the HTTP server and serve static files (like HTML, CSS, and JavaScript), while Socket.IO is used for real-time communication between the server and clients.
- If using Visual Studio Code with Code Runner extension, run `server.js` in the project. If not, open Command Prompt in the root directory and type `node server.js`. This should be displayed:

```
Server is running on port 3000
```

- Find your IP address. Go to Command Prompt and type `ipconfig`, find the [IPv4 Address](https://youtu.be/_whymdfq-R4?list=PLzMcBGfZo4-kR7Rh-7JCVDN8lm3Utumvq&t=837). It looks like this:

```
Wireless LAN adapter Wi-Fi:
   Connection-specific DNS Suffix  . : itotolink.net
   IPv4 Address. . . . . . . . . . . : XXX.XXX.X.X
   Subnet Mask . . . . . . . . . . . : XXX.XXX.XXX.X
   Default Gateway . . . . . . . . . : XXX.XXX.X.X
```

- Although the design of the web app is in `index.html`, if you go there, the game will not work. Instead, you have to go to the website of the following form (using any web browser, works on both PC and smartphones in the same local network): `XXX.XXX.X.X:3000`, with `XXX.XXX.X.X` being your IP address.
- The host must keep their device and server running during the duration of the game. Other players may access the game with their own PC or smartphone, but they are only allowed to join the game if no one has not started the game yet.

# Game rules - project requirements
- Each player has to enter a username to register. Their username must be 1-10 characters and consists of only the following characters: `[A-Za-z0-9_]`. Player usernames must be unique. Clicks on the "Submit" button to register, if successful, you will see the message "Registration completed successfully". Maximum number of players allowed to register is 10.
- If there are at least 2 players, any registered player may click the "Start Game" button to start the game.
- After a few seconds, an expression question is displayed on screen and players must enter the correct answer and submit it as fast as possible. Press "Enter" button or an equivalent button on mobile devices to lock in your answer.
- Players answer incorrectly or fail to answer lose 1 point and get 1 strike. Players answer correctly, but not in the fastest time, receive 1 point and have their strikes cleared. Players answer correctly in the fastest time have their strikes cleared and receive 1 point, plus 1 point per incorrect answer.
- Players who answer three consecutive questions incorrectly are out of the game, but they can still spectate and see the questions.
- The game ends when:
  + All players are eliminated (no one wins)
  + All but one player are eliminated (last player standing wins)
  + First player to reach 25 points wins (if multiple players reach the goal in the same turn, only the highest scorer wins; if multiple players have the same highest score, they all win)
- We were unable to program requirement #5 (server starts another set) in time. To restart the game, players must ask the host to restart the server.
