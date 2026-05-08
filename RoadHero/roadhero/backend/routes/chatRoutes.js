const express = require('express');
const router = express.Router();
const Chat = require('../models/Chat');

// @desc    Get messages for a request
// @route   GET /api/chats/:requestId
router.get('/:requestId', async (req, res) => {
    try {
        const chats = await Chat.find({ requestId: req.params.requestId }).sort({ timestamp: 1 });
        res.status(200).json({ success: true, data: chats });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Server Error' });
    }
});

// @desc    Send a message
// @route   POST /api/chats
router.post('/', async (req, res) => {
    try {
        const { requestId, senderId, senderRole, message } = req.body;
        const chat = await Chat.create({
            requestId,
            senderId,
            senderRole,
            message
        });
        res.status(201).json({ success: true, data: chat });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Server Error' });
    }
});

module.exports = router;
