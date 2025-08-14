const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Setup storage folder for uploaded images
const uploadFolder = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadFolder)) {
  fs.mkdirSync(uploadFolder);
}

// Multer setup
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadFolder);
  },
  filename: function (req, file, cb) {
    // Unique filename
    cb(null, Date.now() + '-' + file.originalname);
  }
});
const upload = multer({ storage: storage });

// Serve static files (HTML, CSS, JS, uploaded images)
app.use(express.static(__dirname));
app.use('/uploads', express.static(uploadFolder));

// In-memory image storage (just filenames for now)
let imageHistory = [];

// Endpoint to upload an image via POST
app.post('/upload', upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).send('No image uploaded.');
  }
  const imageUrl = '/uploads/' + req.file.filename;
  imageHistory.push(imageUrl);

  // Broadcast new image to all clients
  io.emit('new image', imageUrl);

  res.json({ success: true, url: imageUrl });
});

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

// Socket.IO
io.on('connection', (socket) => {
  console.log('a user connected');

  // Send previous images to new user
  socket.emit('gallery history', imageHistory);

  socket.on('disconnect', () => {
    console.log('user disconnected');
  });
});

const PORT = process.env.PORT || 3000;
http.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
