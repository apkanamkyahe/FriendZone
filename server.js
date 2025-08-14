const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure uploads folder exists
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);

// Configure multer for image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});
const upload = multer({ storage });

// Serve static files
app.use(express.static(__dirname));
app.use('/uploads', express.static(uploadDir));

// Serve index.html
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

// Handle image uploads
app.post('/upload', upload.single('image'), (req, res) => {
  if (!req.file) return res.json({ success: false });

  const url = `/uploads/${req.file.filename}`;
  images.push(url);

  io.emit('new image', url); // broadcast to all clients
  res.json({ success: true, url });
});

// Store image URLs in memory
let images = [];

// Socket.IO connection
io.on('connection', socket => {
  // Send gallery history
  socket.emit('gallery history', images);
  console.log('a user connected');
});

// Start server
const PORT = process.env.PORT || 3000;
http.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
