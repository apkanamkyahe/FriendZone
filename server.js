const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);

app.use(express.static(__dirname));

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

// In-memory storage for images
let galleryHistory = [];

io.on('connection', (socket) => {
  console.log('a user connected');

  // Send previous images to new user
  socket.emit('gallery history', galleryHistory);

  // Receive new image from user
  socket.on('new image', (imgSrc) => {
    galleryHistory.push(imgSrc);

    // Limit to last 100 images
    if (galleryHistory.length > 100) galleryHistory.shift();

    // Broadcast new image to all users
    io.emit('new image', imgSrc);
  });

  socket.on('disconnect', () => {
    console.log('user disconnected');
  });
});

const PORT = process.env.PORT || 3000;
http.listen(PORT, () => {
  console.log('listening on *:' + PORT);
});
