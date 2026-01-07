const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const auth = require('../middleware/authMiddleware');
const Image = require('../models/Image');
const User = require('../models/User');

// Multer Storage Configuration
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ 
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: function (req, file, cb) {
        const filetypes = /jpeg|jpg|png|webp/;
        const mimetype = filetypes.test(file.mimetype);
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
        if (mimetype && extname) {
            return cb(null, true);
        }
        cb(new Error("Error: File upload only supports the following filetypes - " + filetypes));
    }
});

// @route    POST api/images/upload
// @desc     Upload an image from device
// @access   Private
router.post('/upload', [auth, upload.single('image')], async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ msg: 'Please upload a file' });
        }

        const newImage = new Image({
            owner: req.user.id,
            targetUser: req.body.targetUser || null,
            imageUrl: `/uploads/${req.file.filename}`,
            caption: req.body.caption,
            sourceType: 'device',
            visibility: req.body.visibility || 'private'
        });

        const image = await newImage.save();
        res.json(image);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route    POST api/images/url
// @desc     Add image via URL
// @access   Private
router.post('/url', auth, async (req, res) => {
    const { imageUrl, caption, targetUser, visibility } = req.body;
    try {
        const newImage = new Image({
            owner: req.user.id,
            targetUser: targetUser || null,
            imageUrl,
            caption,
            sourceType: 'url',
            visibility: visibility || 'private'
        });
        const image = await newImage.save();
        res.json(image);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route    GET api/images
// @desc     Get visible images
// @access   Private
router.get('/', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        let query = {};

        if (user.role !== 'admin') {
            query = {
                $or: [
                    { owner: req.user.id },
                    { targetUser: req.user.id },
                    { visibility: 'public' }
                ]
            };
        }

        const images = await Image.find(query)
            .populate('owner', ['name'])
            .populate('targetUser', ['name'])
            .sort({ createdAt: -1 });
            
        res.json(images);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route    GET api/images/all
// @desc     Admin gets all images
// @access   Private/Admin
router.get('/all', [auth, require('../middleware/adminMiddleware')], async (req, res) => {
    try {
        const images = await Image.find()
            .populate('owner', ['name'])
            .populate('targetUser', ['name'])
            .sort({ createdAt: -1 });
        res.json(images);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route    DELETE api/images/:id
// @desc     Delete an image
// @access   Private/Admin
router.delete('/:id', [auth, require('../middleware/adminMiddleware')], async (req, res) => {
    try {
        const image = await Image.findById(req.params.id);
        if (!image) return res.status(404).json({ msg: 'Image not found' });
        await image.deleteOne();
        res.json({ msg: 'Image removed' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
