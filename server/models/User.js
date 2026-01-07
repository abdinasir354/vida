const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ['admin', 'user'],
        default: 'user'
    },
    anniversaryDate: {
        type: Date
    },
    anniversaryType: {
        type: String,
        enum: ['love', 'celebration', 'special'],
        default: 'love'
    },
    birthday: {
        type: Date
    },
    status: {
        type: String,
        enum: ['active', 'disabled'],
        default: 'active'
    },
    date: {
        type: Date,
        default: Date.now
    }
});

UserSchema.pre('save', async function(next) {
    if (!this.isModified('password')) {
        next();
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

module.exports = mongoose.model('User', UserSchema);
