# Introduction
This is a basic interactive web app to demonstrate how different clients can connect to the same server. It features a big red button saying "Click me!" and above it says "Number: 0". Each time anyone in the server clicks the button, the value X in the "Number: X" increases by 1. This is not automatically updated in real time to all users in the server though, only updated the next time that user clicks the "Click me!" button. Code provided by ChatGPT: https://chat.openai.com/share/147cb03b-f2c6-4c40-85dd-6e58ca62b0b9
# Instructions
* Clone with the "Open with GitHub Desktop" (that's what I used) or any other clone option suitable for you.
* Open the project folder. I use Visual Studio Code IDE with the following extensions installed: Python, [Code Runner](https://youtu.be/n0hBK3_QT9A). Install Flask by going to Command Prompt and type `pip install Flask`.
* Run `server.py`. The output will display something like this:
```
[Running] python -u "d:\University\02 - CS494 - Internetworking Protocols\CS494-Lab-1\server.py"
 * Serving Flask app 'server'
 * Debug mode: on
WARNING: This is a development server. Do not use it in a production deployment. Use a production WSGI server instead.
 * Running on all addresses (0.0.0.0)
 * Running on http://XXX.X.X.X:5000
 * Running on http://XXX.X.X.X:5000
 * Running on http://XXX.XXX.X.X:5000
Press CTRL+C to quit
 * Restarting with stat
 * Debugger is active!
 * Debugger PIN: XXX-XXX-XXX
```
* All devices connected to the same Wi-Fi (local network) as the local host (the one that runs the code) is displayed. Only one of them is the correct server to test, though. Go to Command Prompt and type `ipconfig`, find the [IPv4 Address](https://youtu.be/_whymdfq-R4?list=PLzMcBGfZo4-kR7Rh-7JCVDN8lm3Utumvq&t=837). It looks like this:
```
Wireless LAN adapter Wi-Fi:

   Connection-specific DNS Suffix  . : itotolink.net
   IPv4 Address. . . . . . . . . . . : XXX.XXX.X.X
   Subnet Mask . . . . . . . . . . . : XXX.XXX.XXX.X
   Default Gateway . . . . . . . . . : XXX.XXX.X.X
```
* In the "output" above, choose the address that matches your IPv4 address in the `ipconfig`. Then you can play the game. You can also use any other device (PC or smartphones) in the same local network to access the exact same website and play. For example, if both devices have their number displays start at 0, and the first user hits "Click me!" 6 times, the next time the second user hits "Click me!", the number display jumps to 7.
* I'd recommend learning [HTML](https://www.youtube.com/watch?v=kUMe1FH4CHE) and [JavaScript](https://www.youtube.com/watch?v=PkZNo7MFNFg), if you haven't already.
