const Message = require('../models/Message');
const Conversation = require('../models/Conversation');

const setupChatSocket = (io) => {
    let onlineUsers = new Map();

    io.on('connection', (socket) => {
        socket.on('join', (userId) => {
            onlineUsers.set(userId, socket.id);
            socket.join(userId);
            io.emit('online_status', { userId, status: 'online' });
        });

        // Add rooms for conversations
        socket.on('join_conversation', (conversationId) => {
            socket.join(conversationId);
        });

        socket.on('leave_conversation', (conversationId) => {
            socket.leave(conversationId);
        });

        socket.on('send_message', async (data) => {
            const { conversationId, sender, receiver, content, messageType, imageUrl, audioUrl, replyTo } = data;
            
            try {
                const newMessage = new Message({
                    conversationId,
                    sender,
                    receiver,
                    content,
                    messageType: messageType || 'text',
                    imageUrl: imageUrl || null,
                    audioUrl: audioUrl || null,
                    replyTo: replyTo || null,
                    status: 'sent'
                });

                await newMessage.save();

                await Conversation.findByIdAndUpdate(conversationId, {
                    lastMessage: newMessage._id
                });

                // Populate replyTo if exists
                if (replyTo) {
                    await newMessage.populate('replyTo');
                }

                // Emit to the conversation room
                io.to(conversationId).emit('receive_message', newMessage);

            } catch (error) {
                console.error('Socket error:', error);
            }
        });

        socket.on('add_reaction', async ({ messageId, userId, emoji, conversationId }) => {
            try {
                const message = await Message.findById(messageId);
                if (!message) return;

                // Remove existing reaction from this user if any
                message.reactions = message.reactions.filter(r => r.user.toString() !== userId);
                
                // Add new reaction
                message.reactions.push({ user: userId, emoji });
                await message.save();

                io.to(conversationId).emit('reaction_updated', { messageId, reactions: message.reactions });
            } catch (error) {
                console.error('Reaction error:', error);
            }
        });

        socket.on('typing', ({ conversationId, sender, receiver }) => {
            io.to(conversationId).emit('user_typing', { conversationId, sender });
        });

        socket.on('disconnect', () => {
            let disconnectedUserId;
            for (let [userId, socketId] of onlineUsers.entries()) {
                if (socketId === socket.id) {
                    disconnectedUserId = userId;
                    onlineUsers.delete(userId);
                    break;
                }
            }
            if (disconnectedUserId) {
                io.emit('online_status', { userId: disconnectedUserId, status: 'offline' });
            }
        });
    });
};

module.exports = setupChatSocket;
