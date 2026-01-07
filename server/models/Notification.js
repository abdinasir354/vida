const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    type: { 
        type: String, 
        enum: ['post', 'private_message', 'anniversary', 'birthday', 'admin_note'], 
        required: true 
    },
    content: { type: String, required: true },
    link: { type: String }, // frontend route to redirect to
    read: { type: Boolean, default: false },
    date: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Notification', NotificationSchema);
