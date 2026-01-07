const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const auth = require('../middleware/authMiddleware');

// Multer Storage Configuration for Chat
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/chat/');
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'chat-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ 
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// @route    POST api/chat/upload
// @desc     Upload image or audio for chat
// @access   Private
router.post('/upload', [auth, upload.single('file')], async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ msg: 'Please upload a file' });
        }

        const fileUrl = `/uploads/chat/${req.file.filename}`;
        res.json({ url: fileUrl });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
