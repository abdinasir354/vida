const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const admin = require('../middleware/adminMiddleware');
const Event = require('../models/Event');
const Notification = require('../models/Notification');

// @route    POST api/events
// @desc     User submits an event (anniversary/birthday)
// @access   Private
router.post('/', auth, async (req, res) => {
    const { type, targetDate, category } = req.body;
    try {
        const newEvent = new Event({
            user: req.user.id,
            type,
            targetDate,
            category
        });
        const event = await newEvent.save();
        res.json(event);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route    GET api/events/me
// @desc     Get my events
// @access   Private
router.get('/me', auth, async (req, res) => {
    try {
        const events = await Event.find({ user: req.user.id }).sort({ targetDate: 1 });
        res.json(events);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route    GET api/events/all
// @desc     Admin gets all events
// @access   Private/Admin
router.get('/all', [auth, admin], async (req, res) => {
    try {
        const events = await Event.find().populate('user', ['name', 'email']).sort({ targetDate: 1 });
        res.json(events);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route    PUT api/events/:id/approve
// @desc     Admin approves an event and sets the message
// @access   Private/Admin
router.put('/:id/approve', [auth, admin], async (req, res) => {
    const { adminMessage } = req.body;
    try {
        let event = await Event.findById(req.params.id);
        if (!event) return res.status(404).json({ msg: 'Event not found' });

        event.adminMessage = adminMessage;
        event.status = 'approved';
        await event.save();

        // Create notification for user
        const notification = new Notification({
            user: event.user,
            type: event.type === 'anniversary' ? 'anniversary' : 'birthday',
            content: `Admin approved your ${event.type}! Check back on the special day ❤️`,
            link: '/'
        });
        await notification.save();

        res.json(event);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route    GET api/events/check-today
// @desc     Check if user has an approved event today
// @access   Private
router.get('/check-today', auth, async (req, res) => {
    try {
        const today = new Date();
        const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);

        const event = await Event.findOne({
            user: req.user.id,
            status: 'approved',
            targetDate: {
                $gte: startOfDay,
                $lt: endOfDay
            }
        });

        res.json(event);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
