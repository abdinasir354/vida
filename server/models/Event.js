const mongoose = require('mongoose');

const EventSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    type: { type: String, enum: ['anniversary', 'birthday'], required: true },
    targetDate: { type: Date, required: true },
    category: { type: String, enum: ['love', 'celebration', 'special'], default: 'love' },
    adminMessage: { type: String }, // The message set/approved by Admin
    status: { type: String, enum: ['pending', 'approved'], default: 'pending' },
    isDisplayed: { type: Boolean, default: false }, // Track if the surprise was already shown
    date: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Event', EventSchema);
