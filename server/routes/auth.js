const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

router.post('/register', async (req, res) => {
    const { name, email, password, role } = req.body;
    try {
        let user = await User.findOne({ email });
        if (user) return res.status(400).json({ msg: 'User already exists' });
        
        // Strictly allow only 'user' role via registration
        const registrationRole = 'user';
        
        user = new User({ name, email, password, role: registrationRole });
        await user.save();
        const payload = { user: { id: user.id, role: user.role, name: user.name } };
        jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: 360000 }, (err, token) => {
            if (err) throw err;
            res.json({ token });
        });
    } catch (err) {
        res.status(500).send('Server error');
    }
});

router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        let user = await User.findOne({ email });
        if (!user) return res.status(400).json({ msg: 'Invalid Credentials' });
        
        if (user.status === 'disabled') {
            return res.status(403).json({ msg: 'Account disabled. Please contact admin.' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ msg: 'Invalid Credentials' });
        const payload = { user: { id: user.id, role: user.role, name: user.name } };
        jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: 360000 }, (err, token) => {
            if (err) throw err;
            res.json({ token });
        });
    } catch (err) {
        res.status(500).send('Server error');
    }
});

// @route    GET api/auth/users
// @desc     Get all users
// @access   Private/Admin
router.get('/users', [require('../middleware/authMiddleware'), require('../middleware/adminMiddleware')], async (req, res) => {
    try {
        const users = await User.find().select('-password').sort({ date: -1 });
        res.json(users);
    } catch (err) {
        res.status(500).send('Server error');
    }
});

// @route    PUT api/auth/users/:id/status
// @desc     Update user status (active/disabled)
// @access   Private/Admin
router.put('/users/:id/status', [require('../middleware/authMiddleware'), require('../middleware/adminMiddleware')], async (req, res) => {
    try {
        let user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ msg: 'User not found' });
        
        user.status = req.body.status;
        await user.save();
        res.json(user);
    } catch (err) {
        res.status(500).send('Server error');
    }
});

// @route    DELETE api/auth/users/:id
// @desc     Delete a user
// @access   Private/Admin
router.delete('/users/:id', [require('../middleware/authMiddleware'), require('../middleware/adminMiddleware')], async (req, res) => {
    try {
        await User.findByIdAndDelete(req.params.id);
        res.json({ msg: 'User deleted' });
    } catch (err) {
        res.status(500).send('Server error');
    }
});

// @route    GET api/auth/recipients
// @desc     Get all users (name/id only) for messaging
// @access   Private
router.get('/recipients', require('../middleware/authMiddleware'), async (req, res) => {
    try {
        const users = await User.find().select('name _id').sort({ name: 1 });
        res.json(users);
    } catch (err) {
        res.status(500).send('Server error');
    }
});

// @route    PUT api/auth/users/:id
// @desc     Update user details
// @access   Private/Admin
router.put('/users/:id', [require('../middleware/authMiddleware'), require('../middleware/adminMiddleware')], async (req, res) => {
    try {
        const { name, email, role } = req.body;
        let user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ msg: 'User not found' });
        
        if (name) user.name = name;
        if (email) user.email = email;
        if (role) user.role = role;
        
        await user.save();
        res.json(user);
    } catch (err) {
        res.status(500).send('Server error');
    }
});

module.exports = router;
