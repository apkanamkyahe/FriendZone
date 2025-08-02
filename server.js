const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);

app.use(express.static(__dirname)); // serve files in this folder

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

// In-memory storage for chat messages
let messageHistory = [];

io.on('connection', (socket) => {
  console.log('a user connected');

  // Send previous messages to new user
  socket.emit('chat history', messageHistory);

  socket.on('chat message', (msg) => {
    messageHistory.push(msg);

    // Limit history to last 100 messages (optional)
    if (messageHistory.length > 100) {
      messageHistory.shift();
    }

    io.emit('chat message', msg); // broadcast to all
  });

  socket.on('disconnect', () => {
    console.log('user disconnected');
  });
});

const PORT = process.env.PORT || 3000;
http.listen(PORT, () => {
  console.log('listening on *:' + PORT);
});
