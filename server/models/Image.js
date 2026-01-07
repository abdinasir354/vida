const mongoose = require('mongoose');

const ImageSchema = new mongoose.Schema({
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    targetUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // If shared specifically with one user
    imageUrl: { type: String, required: true },
    caption: { type: String },
    sourceType: {
        type: String,
        enum: ['device', 'url'],
        default: 'device'
    },
    visibility: { 
        type: String, 
        enum: ['private', 'shared'], 
        default: 'private' 
    }
}, { timestamps: true });

module.exports = mongoose.model('Image', ImageSchema);
