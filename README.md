# Introduction
This is a basic interactive web app to demonstrate how different clients can connect to the same server. It features a big red button saying "Click me!" and above it says "Number: 0". Each time anyone in the server clicks the button, the value X in the "Number: X" increases by 1.

This is the improved version of the [first version](https://github.com/Random0617/CS494-Lab-1/commit/696da9c09ec5fa58dea5ce989c95d6374053459a) of this app, now the number displayed is updated immediately for all other users when any user clicks "Hit me!".

Unfortunately, I can only achieve this result using JavaScript for server-side and HTML for client-side. Code provided by [ChatGPT](https://chat.openai.com/share/abefeeb5-8ab3-4c00-b232-aa4c3e4e080c). Python is not used and the installation process is different.

I'd highly recommend learning [HTML](https://www.youtube.com/watch?v=kUMe1FH4CHE) and [JavaScript](https://www.youtube.com/watch?v=PkZNo7MFNFg), if you haven't already.
# Instructions
* Clone with the "Open with GitHub Desktop" (that's what I used) or any other clone option suitable for you.
* Open the project folder. I use Visual Studio Code IDE with [Code Runner](https://youtu.be/n0hBK3_QT9A) installed to make things easier.
* Install [Node.js](https://nodejs.org/en). To check if you have installed Node.js successfully, go to Command Prompt and type `node`. This should be shown:
```
Welcome to Node.js v20.12.0.
Type ".help" for more information.
```
* The folder `node_modules` and the files `packages.json` and `packages-lock.json` already has all the libraries you need. However, if for some reason it does not run correctly on your computer (maybe because it's outdated), do the following (no need to do these if it runs normally):
    + Delete the folder `node_modules` and the files `packages.json` and `packages-lock.json`.
    + Open Command Prompt in the root directory (must be the correct location, this contains the folder `public` and the file `server.js`).
    + In the Command Prompt, install Express.js and Socket.IO using the following command: `npm install express socket.io`. Express.js is used to create the HTTP server and serve static files (like HTML, CSS, and JavaScript), while Socket.IO is used for real-time communication between the server and clients.
* If using Visual Studio Code with Code Runner extension, run `server.js` in the project. If not, open Command Prompt in the root directory and type `node server.js`. This should be displayed:
```
Server is running on port 3000
```
* Find your IP address. Go to Command Prompt and type `ipconfig`, find the [IPv4 Address](https://youtu.be/_whymdfq-R4?list=PLzMcBGfZo4-kR7Rh-7JCVDN8lm3Utumvq&t=837). It looks like this:
```
Wireless LAN adapter Wi-Fi:
   Connection-specific DNS Suffix  . : itotolink.net
   IPv4 Address. . . . . . . . . . . : XXX.XXX.X.X
   Subnet Mask . . . . . . . . . . . : XXX.XXX.XXX.X
   Default Gateway . . . . . . . . . : XXX.XXX.X.X
```
* Although the design of the web app is in `index.html`, if you go there, the game will not work. Instead, you have to go to the website of the following form (using any web browser, works on both PC and smartphones in the same local network): `XXX.XXX.X.X:3000`, with `XXX.XXX.X.X` being your IP address.
* You can now play the improved version of the game with the number being able to update in real time.
