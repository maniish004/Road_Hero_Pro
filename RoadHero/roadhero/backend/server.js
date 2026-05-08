const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const connectDB = require('./config/db');

// Load env vars
dotenv.config();

// Connect to database
connectDB();

const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http, {
    cors: {
        origin: "*", // In production, specify your frontend URL
        methods: ["GET", "POST"]
    }
});

// Middleware
app.use(express.json());
app.use(cors());

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/mechanics', require('./routes/mechanicRoutes'));
app.use('/api/requests', require('./routes/requestRoutes'));
app.use('/api/chats', require('./routes/chatRoutes'));

// Serve Static Assets in production
if (process.env.NODE_ENV === 'production') {
    // Set static folder
    app.use(express.static(path.join(__dirname, '../frontend/dist')));

    app.get('*', (req, res) => {
        res.sendFile(path.resolve(__dirname, '../frontend', 'dist', 'index.html'));
    });
}

// Socket.io logic
io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    socket.on('join_room', (requestId) => {
        socket.join(requestId);
        console.log(`User ${socket.id} joined room: ${requestId}`);
    });

    socket.on('send_message', (data) => {
        // data: { requestId, senderId, senderRole, message }
        io.to(data.requestId).emit('receive_message', data);
    });

    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
    });
});

const PORT = process.env.PORT || 5000;

http.listen(PORT, () => console.log(`Server running on port ${PORT}`));
