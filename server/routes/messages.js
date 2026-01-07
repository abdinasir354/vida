const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const Message = require('../models/Message');
const Conversation = require('../models/Conversation');
const User = require('../models/User');

// @route    GET api/messages/conversations
// @desc     Get all conversations for current user (Admin sees all)
// @access   Private
router.get('/conversations', auth, async (req, res) => {
    try {
        let userId = req.user.id;
        let query = { participants: userId };
        
        if (req.user.role === 'admin') {
            query = {}; // Admin sees all
        }
        
        const conversations = await Conversation.find(query)
            .populate('participants', 'name email role')
            .populate('lastMessage')
            .sort({ updatedAt: -1 });
            
        res.json(conversations);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route    POST api/messages/conversation
// @desc     Get or create conversation between two users
// @access   Private
router.post('/conversation', auth, async (req, res) => {
    const { participantId } = req.body;
    try {
        let conversation = await Conversation.findOne({
            participants: { $all: [req.user.id, participantId] }
        });
        
        if (!conversation) {
            conversation = new Conversation({
                participants: [req.user.id, participantId]
            });
            await conversation.save();
        }
        
        res.json(conversation);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route    GET api/messages/admin-id
// @desc     Get the ID of the first admin account
// @access   Private
router.get('/admin-id', auth, async (req, res) => {
    try {
        const admin = await User.findOne({ role: 'admin' }).select('_id');
        if (!admin) return res.status(404).json({ msg: 'Admin not found' });
        res.json(admin);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route    GET api/messages/:conversationId
// @desc     Get all messages for a conversation
// @access   Private
router.get('/:conversationId', auth, async (req, res) => {
    try {
        const conversation = await Conversation.findById(req.params.conversationId);
        if (!conversation) return res.status(404).json({ msg: 'Conversation not found' });
        
        // Check access: must be participant or admin
        if (req.user.role !== 'admin' && !conversation.participants.includes(req.user.id)) {
            return res.status(401).json({ msg: 'Access denied' });
        }
        
        const messages = await Message.find({ conversationId: req.params.conversationId })
            .populate('replyTo')
            .sort({ createdAt: 1 });
            
        res.json(messages);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
